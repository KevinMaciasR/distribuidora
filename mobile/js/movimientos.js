import {
    guardar,
    obtener,
    obtenerTodos,
    guardarInventarioYMovimiento,
    ejecutarTransaccionAtomica
} from './db.js';

import {
    UBICACIONES,
    actualizarInventario
} from './inventario.js';

import {
    obtenerCliente,
    modificarPendienteCliente
} from './clientes.js';


/* =====================================================
   TIPOS DE MOVIMIENTO
===================================================== */

export const TIPOS_MOVIMIENTO = {

    ENTREGA_CLIENTE:
        'ENTREGA A CLIENTE',

    RETIRO_CLIENTE:
        'RETIRO DE CLIENTE',

    ENTREGA_RETIRO:
        'ENTREGA + RETIRO',

    SALIDA_PLANTA:
        'SALIDA A PLANTA',

    REGRESO_PLANTA:
        'REGRESO DE PLANTA',

    TRASLADO:
        'TRASLADO ENTRE CAMIONES',
    CAMBIAZO:
        'CAMBIAZO'

};


/* =====================================================
   UUID
===================================================== */

function uuid() {

    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


/* =====================================================
   OBTENER CAMIÓN
===================================================== */

async function obtenerCamion(nombre) {

    const camion =
        await obtener(
            'inventario',
            nombre
        );


    if (
        !camion ||
        ![
            UBICACIONES.ROJO,
            UBICACIONES.BLANCO,
            UBICACIONES.CASA
        ].includes(nombre)
    ) {

        throw new Error(
            `No existe el camión ${nombre}.`
        );

    }


    return camion;
}


/* =====================================================
   VALIDAR CANTIDADES
===================================================== */

function validarCantidad(
    llenos,
    vacios
) {

    if (
        !Number.isInteger(llenos) ||
        !Number.isInteger(vacios) ||
        llenos < 0 ||
        vacios < 0
    ) {

        throw new Error(
            'Las cantidades deben ser números enteros mayores o iguales a 0.'
        );

    }

}


/* =====================================================
   VALIDAR EXISTENCIA EN CAMIÓN
===================================================== */

function validarCamion(
    camion,
    llenos = 0,
    vacios = 0
) {

    if (
        llenos >
        (camion.llenos || 0)
    ) {

        throw new Error(
            `El camión no tiene suficientes cilindros llenos. Disponibles: ${camion.llenos || 0}.`
        );

    }


    if (
        vacios >
        (camion.vacios || 0)
    ) {

        throw new Error(
            `El camión no tiene suficientes cilindros vacíos. Disponibles: ${camion.vacios || 0}.`
        );

    }

}

/* =====================================================
   VALIDAR CLIENTE
===================================================== */

async function validarCliente(
    idCliente
) {

    const cliente =
        await obtenerCliente(
            idCliente
        );


    if (!cliente) {

        throw new Error(
            'El cliente seleccionado no existe.'
        );

    }


    if (
        cliente.estado !== 'ACTIVO'
    ) {

        throw new Error(
            'El cliente seleccionado está inactivo.'
        );

    }


    return cliente;
}

/* =====================================================
   VALIDAR PENDIENTE DEL CLIENTE
===================================================== */

async function validarPendienteCliente(
    idCliente,
    cantidad
) {

    const cliente =
        await validarCliente(
            idCliente
        );


    const pendiente =
        cliente.pendientes_actuales || 0;


    if (
        cantidad >
        pendiente
    ) {

        throw new Error(
            `El cliente tiene ${pendiente} cilindros pendientes. No puedes retirar ${cantidad}.`
        );

    }


    return cliente;
}

/* =====================================================
   CREAR MOVIMIENTO
===================================================== */

async function crearMovimiento(base) {

    const movimiento = {

        id_movimiento:
            uuid(),

        fecha_hora:
            new Date().toISOString(),

        estado:
            'ACTIVO',

        created_at:
            new Date().toISOString(),

        dispositivo:
            'MOVIL',

        sync_estado:
            'PENDIENTE',

        ...base

    };


    await guardar(
        'movimientos',
        movimiento
    );


    return movimiento;
}

/* =====================================================
   ENTREGA A CLIENTE
===================================================== */

export async function entregaCliente({
    idCliente,
    camion,
    cantidad,
    observacion = ''
}) {
    cantidad = Number(cantidad);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new Error(
            'La cantidad entregada debe ser un número entero mayor que 0.'
        );
    }

    if (
        ![
            UBICACIONES.ROJO,
            UBICACIONES.BLANCO,
            UBICACIONES.CASA
        ].includes(camion)
    ) {
        throw new Error('Selecciona una ubicación válida.');
    }

    const movimiento = {
        id_movimiento: uuid(),
        fecha_hora: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tipo: TIPOS_MOVIMIENTO.ENTREGA_CLIENTE,
        estado: 'ACTIVO',
        dispositivo: 'MOVIL',
        sync_estado: 'PENDIENTE',
        id_cliente: idCliente,
        camion_origen: camion,
        camion_destino: null,
        llenos: cantidad,
        vacios: 0,
        observacion
    };

    return ejecutarTransaccionAtomica(
        ['inventario', 'clientes', 'movimientos'],
        (datos) => {
            const camionActual = datos.inventario.find(
                item => item.ubicacion === camion
            );

            if (!camionActual) {
                throw new Error(`No existe el camión ${camion}.`);
            }

            const cliente = datos.clientes.find(
                item =>
                    item.id_cliente === idCliente &&
                    item.estado === 'ACTIVO'
            );

            if (!cliente) {
                throw new Error('El cliente no existe o está inactivo.');
            }

            if ((camionActual.llenos || 0) < cantidad) {
                throw new Error(
                    `El camión ${camion} no tiene suficientes cilindros llenos.`
                );
            }

            const inventarioClientes = datos.inventario.find(
                item => item.ubicacion === UBICACIONES.CLIENTES
            );

            if (!inventarioClientes) {
                throw new Error(
                    'No existe el registro de inventario de clientes.'
                );
            }

            const clienteActualizado = {
                ...cliente,
                pendientes_actuales:
                    Number(cliente.pendientes_actuales || 0) + cantidad,
                sync_estado: 'PENDIENTE'
            };

            const otrosPendientes = datos.clientes
                .filter(c =>
                    c.estado === 'ACTIVO' &&
                    c.id_cliente !== idCliente
                )
                .reduce(
                    (total, c) =>
                        total + Number(c.pendientes_actuales || 0),
                    0
                );

            const nuevoTotalPendientes =
                otrosPendientes +
                clienteActualizado.pendientes_actuales;

            const camionActualizado = {
                ...camionActual,
                llenos: (camionActual.llenos || 0) - cantidad
            };

            const inventarioClientesActualizado = {
                ...inventarioClientes,
                pendientes: nuevoTotalPendientes
            };

            return {
                resultado: movimiento,
                puts: {
                    inventario: [
                        camionActualizado,
                        inventarioClientesActualizado
                    ],
                    clientes: [clienteActualizado],
                    movimientos: [movimiento]
                }
            };
        }
    );
}

/* =====================================================
   RETIRO DE CLIENTE
===================================================== */
export async function retiroCliente({
    idCliente,
    camion,
    cantidad,
    observacion = '',
    retiroEspecial = false
}) {
    cantidad = Number(cantidad);

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
        throw new Error(
            'La cantidad retirada debe ser un entero mayor que 0.'
        );
    }

    if (
        ![
            UBICACIONES.ROJO,
            UBICACIONES.BLANCO,
            UBICACIONES.CASA
        ].includes(camion)
    ) {
        throw new Error('Selecciona una ubicación válida.');
    }

    if (typeof observacion !== 'string') {
        throw new Error('La observación no es válida.');
    }

    if (retiroEspecial && !observacion.trim()) {
        throw new Error(
            'La observación es obligatoria para un retiro especial.'
        );
    }

    const movimiento = {
        id_movimiento: uuid(),
        fecha_hora: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tipo: TIPOS_MOVIMIENTO.RETIRO_CLIENTE,
        estado: 'ACTIVO',
        dispositivo: 'MOVIL',
        sync_estado: 'PENDIENTE',
        id_cliente: idCliente,
        camion_origen: null,
        camion_destino: camion,
        llenos: 0,
        vacios: cantidad,
        observacion: retiroEspecial
            ? `[RETIRO ESPECIAL] ${observacion.trim()}`
            : observacion.trim(),
        retiro_especial: Boolean(retiroEspecial)
    };

    const stores = retiroEspecial
        ? ['inventario', 'clientes', 'movimientos']
        : ['inventario', 'clientes', 'movimientos'];

    return ejecutarTransaccionAtomica(stores, datos => {
        const camionActual = datos.inventario.find(
            item => item.ubicacion === camion
        );

        if (!camionActual) {
            throw new Error(`No existe el camión ${camion}.`);
        }

        const cliente = datos.clientes.find(
            item =>
                item.id_cliente === idCliente &&
                item.estado === 'ACTIVO'
        );

        if (!cliente) {
            throw new Error('El cliente no existe o está inactivo.');
        }

        const camionActualizado = {
            ...camionActual,
            vacios: Number(camionActual.vacios || 0) + cantidad
        };

        const puts = {
            inventario: [camionActualizado],
            movimientos: [movimiento]
        };

        if (!retiroEspecial) {
            const pendiente = Number(cliente.pendientes_actuales || 0);

            if (cantidad > pendiente) {
                throw new Error(
                    `El cliente tiene ${pendiente} cilindros pendientes. No puedes retirar ${cantidad}.`
                );
            }

            const clienteActualizado = {
                ...cliente,
                pendientes_actuales: pendiente - cantidad,
                sync_estado: 'PENDIENTE'
            };

            const totalPendientes = datos.clientes
                .filter(c => c.estado === 'ACTIVO')
                .reduce((total, c) => {
                    return total + (
                        c.id_cliente === idCliente
                            ? clienteActualizado.pendientes_actuales
                            : Number(c.pendientes_actuales || 0)
                    );
                }, 0);

            const inventarioClientes = datos.inventario.find(
                item => item.ubicacion === UBICACIONES.CLIENTES
            );

            if (!inventarioClientes) {
                throw new Error(
                    'No existe el inventario agregado de clientes.'
                );
            }

            puts.clientes = [clienteActualizado];
            puts.inventario.push({
                ...inventarioClientes,
                pendientes: totalPendientes
            });
        }

        return {
            resultado: movimiento,
            puts
        };
    });
}

/* =====================================================
   ENTREGA + RETIRO
===================================================== */
export async function entregaRetiro({
    idCliente,
    camion,
    llenos,
    vacios,
    observacion = ''
}) {
    llenos = Number(llenos);
    vacios = Number(vacios);

    validarCantidad(llenos, vacios);

    if (llenos <= 0 && vacios <= 0) {
        throw new Error(
            'Debes entregar o retirar al menos un cilindro.'
        );
    }

    if (
        ![
            UBICACIONES.ROJO,
            UBICACIONES.BLANCO,
            UBICACIONES.CASA
        ].includes(camion)
    ) {
        throw new Error('Selecciona una ubicación válida.');
    }

    const movimiento = {
        id_movimiento: uuid(),
        fecha_hora: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tipo: TIPOS_MOVIMIENTO.ENTREGA_RETIRO,
        estado: 'ACTIVO',
        dispositivo: 'MOVIL',
        sync_estado: 'PENDIENTE',
        id_cliente: idCliente,
        camion_origen: camion,
        camion_destino: camion,
        llenos,
        vacios,
        observacion
    };

    return ejecutarTransaccionAtomica(
        ['inventario', 'clientes', 'movimientos'],
        datos => {
            const camionActual = datos.inventario.find(
                item => item.ubicacion === camion
            );

            const cliente = datos.clientes.find(
                item =>
                    item.id_cliente === idCliente &&
                    item.estado === 'ACTIVO'
            );

            if (!camionActual) {
                throw new Error(`No existe el camión ${camion}.`);
            }

            if (!cliente) {
                throw new Error('El cliente no existe o está inactivo.');
            }

            if (llenos > Number(camionActual.llenos || 0)) {
                throw new Error(
                    `El camión no tiene suficientes llenos. Disponibles: ${camionActual.llenos || 0}.`
                );
            }

            const pendienteActual = Number(
                cliente.pendientes_actuales || 0
            );

            const nuevoPendiente =
                pendienteActual + llenos - vacios;

            if (nuevoPendiente < 0) {
                throw new Error(
                    `El cliente tiene ${pendienteActual} pendientes. No puedes retirar ${vacios}.`
                );
            }

            const clienteActualizado = {
                ...cliente,
                pendientes_actuales: nuevoPendiente,
                sync_estado: 'PENDIENTE'
            };

            const camionActualizado = {
                ...camionActual,
                llenos: Number(camionActual.llenos || 0) - llenos,
                vacios: Number(camionActual.vacios || 0) + vacios
            };

            const inventarioClientes = datos.inventario.find(
                item => item.ubicacion === UBICACIONES.CLIENTES
            );

            if (!inventarioClientes) {
                throw new Error(
                    'No existe el inventario agregado de clientes.'
                );
            }

            const totalPendientes = datos.clientes
                .filter(c => c.estado === 'ACTIVO')
                .reduce((total, c) => {
                    return total + (
                        c.id_cliente === idCliente
                            ? nuevoPendiente
                            : Number(c.pendientes_actuales || 0)
                    );
                }, 0);

            return {
                resultado: movimiento,
                puts: {
                    inventario: [
                        camionActualizado,
                        {
                            ...inventarioClientes,
                            pendientes: totalPendientes
                        }
                    ],
                    clientes: [clienteActualizado],
                    movimientos: [movimiento]
                }
            };
        }
    );
}

/* =====================================================
   SALIDA A PLANTA
===================================================== */

export async function salidaPlanta({
    camion,
    cantidad,
    observacion = ''
}) {
    cantidad = Number(cantidad);

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
        throw new Error(
            'La cantidad enviada a planta debe ser un entero mayor que 0.'
        );
    }

    if (![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(camion)) {
        throw new Error('Selecciona un camión válido.');
    }

    const idViaje = uuid();
    const idMovimiento = uuid();
    const ahora = new Date().toISOString();

    const movimiento = {
        id_movimiento: idMovimiento,
        fecha_hora: ahora,
        created_at: ahora,
        tipo: TIPOS_MOVIMIENTO.SALIDA_PLANTA,
        estado: 'ACTIVO',
        dispositivo: 'MOVIL',
        sync_estado: 'PENDIENTE',
        id_cliente: null,
        camion_origen: camion,
        camion_destino: null,
        llenos: 0,
        vacios: cantidad,
        id_viaje: idViaje,
        observacion
    };

    const viaje = {
        id_viaje: idViaje,
        camion,
        fecha_salida: ahora,
        fecha_regreso: null,
        estado: 'ABIERTO',
        vacios_enviados: cantidad,
        llenos_recibidos: 0,
        id_movimiento_salida: idMovimiento,
        id_movimiento_regreso: null
    };

    return ejecutarTransaccionAtomica(
        ['inventario', 'movimientos', 'viajes_planta'],
        datos => {
            const camionActual = datos.inventario.find(
                item => item.ubicacion === camion
            );

            if (!camionActual) {
                throw new Error(`No existe el camión ${camion}.`);
            }

            if (cantidad > Number(camionActual.vacios || 0)) {
                throw new Error(
                    `El camión no tiene suficientes vacíos. Disponibles: ${camionActual.vacios || 0}.`
                );
            }

            const camionActualizado = {
                ...camionActual,
                vacios: Number(camionActual.vacios || 0) - cantidad
            };

            return {
                resultado: movimiento,
                puts: {
                    inventario: [camionActualizado],
                    movimientos: [movimiento],
                    viajes_planta: [viaje]
                }
            };
        }
    );
}

/* =====================================================
   REGRESO DE PLANTA
===================================================== */

export async function regresoPlanta({
    idViaje,
    llenos,
    observacion = ''
}) {
    llenos = Number(llenos);

    if (!Number.isSafeInteger(llenos) || llenos <= 0) {
        throw new Error(
            'La cantidad que regresa de planta debe ser un entero mayor que 0.'
        );
    }

    const idMovimiento = uuid();
    const ahora = new Date().toISOString();

    const movimiento = {
        id_movimiento: idMovimiento,
        fecha_hora: ahora,
        created_at: ahora,
        tipo: TIPOS_MOVIMIENTO.REGRESO_PLANTA,
        estado: 'ACTIVO',
        dispositivo: 'MOVIL',
        sync_estado: 'PENDIENTE',
        id_cliente: null,
        camion_origen: null,
        camion_destino: null,
        llenos,
        vacios: 0,
        id_viaje: idViaje,
        observacion
    };

    return ejecutarTransaccionAtomica(
        ['inventario', 'movimientos', 'viajes_planta'],
        datos => {
            const viaje = datos.viajes_planta.find(
                v => v.id_viaje === idViaje
            );

            if (!viaje) {
                throw new Error('El viaje de planta no existe.');
            }

            if (viaje.estado !== 'ABIERTO') {
                throw new Error('Este viaje de planta ya está cerrado.');
            }

            if (llenos !== Number(viaje.vacios_enviados)) {
                throw new Error(
                    `El viaje envió ${viaje.vacios_enviados} cilindros. El regreso debe registrar exactamente esa cantidad.`
                );
            }

            const camion = datos.inventario.find(
                item => item.ubicacion === viaje.camion
            );

            if (!camion) {
                throw new Error(
                    `No existe el camión ${viaje.camion}.`
                );
            }

            const camionActualizado = {
                ...camion,
                llenos: Number(camion.llenos || 0) + llenos
            };

            const viajeActualizado = {
                ...viaje,
                estado: 'CERRADO',
                fecha_regreso: ahora,
                llenos_recibidos: llenos,
                id_movimiento_regreso: idMovimiento
            };

            movimiento.camion_destino = viaje.camion;

            return {
                resultado: movimiento,
                puts: {
                    inventario: [camionActualizado],
                    movimientos: [movimiento],
                    viajes_planta: [viajeActualizado]
                }
            };
        }
    );
}

/* =====================================================
   TRASLADO ENTRE CAMIONES
===================================================== */

export async function trasladoCamiones({
    origen,
    destino,
    llenos = 0,
    vacios = 0,
    observacion = ''
}) {
    llenos = Number(llenos);
    vacios = Number(vacios);

    validarCantidad(llenos, vacios);

    if (llenos <= 0 && vacios <= 0) {
        throw new Error(
            'Debes trasladar al menos un cilindro.'
        );
    }

    const ubicacionesPermitidas = [
        UBICACIONES.ROJO,
        UBICACIONES.BLANCO,
        UBICACIONES.CASA
    ];

    if (
        !ubicacionesPermitidas.includes(origen) ||
        !ubicacionesPermitidas.includes(destino)
    ) {
        throw new Error(
            'Selecciona ubicaciones válidas para realizar el traslado.'
        );
    }

    if (origen === destino) {
        throw new Error(
            'El camión de origen y destino deben ser diferentes.'
        );
    }

    const movimiento = {
        id_movimiento: uuid(),
        fecha_hora: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tipo: TIPOS_MOVIMIENTO.TRASLADO,
        estado: 'ACTIVO',
        dispositivo: 'MOVIL',
        sync_estado: 'PENDIENTE',
        id_cliente: null,
        camion_origen: origen,
        camion_destino: destino,
        llenos,
        vacios,
        observacion
    };

    return ejecutarTransaccionAtomica(
        ['inventario', 'movimientos'],
        datos => {
            const camionOrigen = datos.inventario.find(
                item => item.ubicacion === origen
            );

            const camionDestino = datos.inventario.find(
                item => item.ubicacion === destino
            );

            if (!camionOrigen || !camionDestino) {
                throw new Error(
                    'No se encontró el inventario de ambos camiones.'
                );
            }

            if (
                llenos > Number(camionOrigen.llenos || 0) ||
                vacios > Number(camionOrigen.vacios || 0)
            ) {
                throw new Error(
                    'El camión de origen no tiene suficientes cilindros.'
                );
            }

            const origenActualizado = {
                ...camionOrigen,
                llenos: Number(camionOrigen.llenos || 0) - llenos,
                vacios: Number(camionOrigen.vacios || 0) - vacios
            };

            const destinoActualizado = {
                ...camionDestino,
                llenos: Number(camionDestino.llenos || 0) + llenos,
                vacios: Number(camionDestino.vacios || 0) + vacios
            };

            return {
                resultado: movimiento,
                puts: {
                    inventario: [
                        origenActualizado,
                        destinoActualizado
                    ],
                    movimientos: [movimiento]
                }
            };
        }
    );
}

/* =====================================================
   VALIDAR CLIENTE EXISTENTE
===================================================== */

export async function validarClienteExistente(
    idCliente
) {

    return validarCliente(
        idCliente
    );
}

/* =====================================================
   OBTENER MOVIMIENTOS
===================================================== */

export async function obtenerMovimientos() {

    const movimientos =
        await obtenerTodos('movimientos');

    return movimientos.sort((a, b) => {
        const fechaA = new Date(a.fecha_hora || 0);
        const fechaB = new Date(b.fecha_hora || 0);

        return fechaB - fechaA;
    });
}
export async function obtenerUltimoMovimientoEditable() {
    const movimientos = await obtenerTodos('movimientos');

    const activos = movimientos
        .filter(m => m.estado === 'ACTIVO')
        .sort((a, b) => {
            const fechaA = new Date(a.fecha_hora).getTime();
            const fechaB = new Date(b.fecha_hora).getTime();
            return fechaB - fechaA;
        });

    if (activos.length === 0) return null;

    const ultimo = activos[0];

    return {
        ...ultimo,
        puedeEditar: ultimo.sync_estado === 'PENDIENTE'
    };
}

export async function anularUltimoMovimiento() {
    return ejecutarTransaccionAtomica(
        ['inventario', 'clientes', 'movimientos', 'viajes_planta'],
        (datos) => {
            const movimientos = datos.movimientos || [];
            const operacionesNoRegistradas = [
                'AGREGAR SIN ASIGNAR',
                'RETIRAR SIN ASIGNAR',
                'ASIGNAR A CAMIÓN'
            ];
            const activos = movimientos
                .filter(m => m.estado === 'ACTIVO')
                .sort((a, b) =>
    new Date(b.fecha_hora || b.created_at || 0).getTime() -
    new Date(a.fecha_hora || a.created_at || 0).getTime()
);

            const movimiento = activos[0];

            if (!movimiento) {
                throw new Error('No hay movimientos activos para anular.');
            }

            if (movimiento.sync_estado !== 'PENDIENTE') {
                throw new Error('Este movimiento ya fue sincronizado. Debe anularse desde el PC.');
            }

            const inventario = datos.inventario;
            const clientes = datos.clientes;
            const viajes = datos.viajes_planta;

            const buscarCamion = (nombre) => {
                const ubicacion = inventario.find(i => i.ubicacion === nombre);

                if (!ubicacion) {
                    throw new Error(`No se encontró el inventario de ${nombre}.`);
                }

                return ubicacion;
            };

            const ajustar = (camion, campo, cambio) => {
                const nuevoValor = Number(camion[campo] || 0) + cambio;

                if (!Number.isInteger(nuevoValor) || nuevoValor < 0) {
                    throw new Error(
                        `No hay existencias suficientes para revertir ${campo} en ${camion.ubicacion}.`
                    );
                }

                camion[campo] = nuevoValor;
            };

            const buscarCliente = () => {
                const cliente = clientes.find(
                    c => c.id_cliente === movimiento.id_cliente
                );

                if (!cliente) {
                    throw new Error('No se encontró el cliente del movimiento.');
                }

                return cliente;
            };

            const ajustarPendienteCliente = (cambio) => {
                const cliente = buscarCliente();
                const nuevoValor =
                    Number(cliente.pendientes_actuales || 0) + cambio;

                if (!Number.isInteger(nuevoValor) || nuevoValor < 0) {
                    throw new Error(
                        'No se puede revertir: los pendientes del cliente no cuadran.'
                    );
                }

                cliente.pendientes_actuales = nuevoValor;
                cliente.sync_estado = 'PENDIENTE';
            };

            const cantidadLlenos = Number(movimiento.llenos || 0);
            const cantidadVacios = Number(movimiento.vacios || 0);

            switch (movimiento.tipo) {
                case TIPOS_MOVIMIENTO.ENTREGA_CLIENTE: {
                    const camion = buscarCamion(movimiento.camion_origen);
                    ajustar(camion, 'llenos', cantidadLlenos);
                    ajustarPendienteCliente(-cantidadLlenos);
                    break;
                }

                case TIPOS_MOVIMIENTO.RETIRO_CLIENTE: {
                    const camion = buscarCamion(movimiento.camion_destino);

                    ajustar(camion, 'vacios', -cantidadVacios);

                    if (!movimiento.retiro_especial) {
                        ajustarPendienteCliente(cantidadVacios);
                    }
                    break;
                }

                case TIPOS_MOVIMIENTO.ENTREGA_RETIRO: {
                    const camion = buscarCamion(movimiento.camion_origen);

                    ajustar(camion, 'llenos', cantidadLlenos);
                    ajustar(camion, 'vacios', -cantidadVacios);

                    ajustarPendienteCliente(
                        -cantidadLlenos + cantidadVacios
                    );
                    break;
                }

                case TIPOS_MOVIMIENTO.TRASLADO: {
                    const origen = buscarCamion(movimiento.camion_origen);
                    const destino = buscarCamion(movimiento.camion_destino);

                    ajustar(origen, 'llenos', cantidadLlenos);
                    ajustar(origen, 'vacios', cantidadVacios);

                    ajustar(destino, 'llenos', -cantidadLlenos);
                    ajustar(destino, 'vacios', -cantidadVacios);
                    break;
                }

                case TIPOS_MOVIMIENTO.CAMBIAZO: {
                    const camion = buscarCamion(movimiento.camion_origen);
                    const cantidad = Number(movimiento.cantidad || 0);
                    const estadoOrigen =
                        String(movimiento.estado_origen || '').toLowerCase();

                    const estadoNuevo =
                        String(movimiento.estado_nuevo || '').toLowerCase();

                    if (
                        !['llenos', 'vacios'].includes(estadoOrigen) ||
                        !['llenos', 'vacios'].includes(estadoNuevo) ||
                        estadoOrigen === estadoNuevo
                    ) {
                        throw new Error(
                            'El cambiazo original tiene estados inválidos.'
                        );
                    }

                    ajustar(camion, estadoOrigen, cantidad);
                    ajustar(camion, estadoNuevo, -cantidad);

                    break;
                }
                case TIPOS_MOVIMIENTO.SALIDA_PLANTA: {
                    const camion = buscarCamion(movimiento.camion_origen);

                    const viaje = viajes.find(
                        v => v.id_viaje === movimiento.id_viaje
                    );

                    if (!viaje) {
                        throw new Error(
                            'No se encontró el viaje asociado a esta salida.'
                        );
                    }

                    if (viaje.estado !== 'ABIERTO') {
                        throw new Error(
                            'El viaje ya no está abierto. No se puede anular esta salida.'
                        );
                    }

                    ajustar(camion, 'vacios', cantidadVacios);

                    viaje.estado = 'ANULADO';

                    break;
                }
                case TIPOS_MOVIMIENTO.REGRESO_PLANTA: {
                    const camion = buscarCamion(movimiento.camion_destino);

                    const viaje = viajes.find(
                        v => v.id_viaje === movimiento.id_viaje
                    );

                    if (!viaje) {
                        throw new Error(
                            'No se encontró el viaje asociado a este regreso.'
                        );
                    }

                    if (
                        viaje.estado !== 'CERRADO' ||
                        viaje.id_movimiento_regreso !== movimiento.id_movimiento
                    ) {
                        throw new Error(
                            'El viaje no coincide con el regreso que intentas anular.'
                        );
                    }

                    ajustar(camion, 'llenos', -cantidadLlenos);

                    viaje.estado = 'ABIERTO';

                    delete viaje.id_movimiento_regreso;
                    delete viaje.fecha_regreso;
                    delete viaje.llenos_recibidos;

                    break;
                }

                case 'AGREGAR SIN ASIGNAR': {
                    const ubicacion = buscarCamion(UBICACIONES.SIN_ASIGNAR);

                    ajustar(ubicacion, 'llenos', -cantidadLlenos);
                    ajustar(ubicacion, 'vacios', -cantidadVacios);
                    break;
                }

                case 'RETIRAR SIN ASIGNAR': {
                    const ubicacion = buscarCamion(UBICACIONES.SIN_ASIGNAR);

                    ajustar(ubicacion, 'llenos', cantidadLlenos);
                    ajustar(ubicacion, 'vacios', cantidadVacios);
                    break;
                }

                case 'ASIGNAR A CAMION': {
                    const origen = buscarCamion(UBICACIONES.SIN_ASIGNAR);
                    const destino = buscarCamion(movimiento.camion_destino);

                    ajustar(origen, 'llenos', cantidadLlenos);
                    ajustar(origen, 'vacios', cantidadVacios);

                    ajustar(destino, 'llenos', -cantidadLlenos);
                    ajustar(destino, 'vacios', -cantidadVacios);
                    break;
                }
                default:
                    throw new Error(
                        `No se puede anular este tipo de movimiento: ${movimiento.tipo}`
                    );
            }

            // Recalcular el total de pendientes de todos los clientes.
            const totalPendientes = clientes
                .filter(c => c.estado === 'ACTIVO')
                .reduce(
                    (total, c) => total + Number(c.pendientes_actuales || 0),
                    0
                );

            const inventarioClientes = inventario.find(
                i => i.ubicacion === UBICACIONES.CLIENTES
            );

            if (inventarioClientes) {
                inventarioClientes.pendientes = totalPendientes;
            }

            movimiento.estado = 'ANULADO';
            movimiento.anulado_at = new Date().toISOString();
            movimiento.sync_estado = 'PENDIENTE';

            return {
                resultado: movimiento,
                puts: {
                    inventario,
                    clientes,
                    movimientos: [movimiento],
                    viajes_planta: viajes
                }
            };
        }
    );
}




export async function editarUltimoMovimiento(datosNuevos) {

    const {
        tipo,
        idCliente,
        camion,
        origen,
        destino,
        cantidad,
        llenos,
        vacios,
        observacion = '',
        retiroEspecial = false,
        ubicacion,
        estadoActual,
        estadoNuevo
    } = datosNuevos;

    return ejecutarTransaccionAtomica(
        ['inventario', 'clientes', 'movimientos', 'viajes_planta'],
        datos => {

            const inventario = datos.inventario || [];
            const clientes = datos.clientes || [];
            const movimientos = datos.movimientos || [];
            const viajes = datos.viajes_planta || [];

            // =========================================
            // 1. IDENTIFICAR EL ÚLTIMO MOVIMIENTO ACTIVO
            // =========================================

            const activos = movimientos
                .filter(m => m.estado === 'ACTIVO')
                .sort((a, b) =>
    new Date(b.fecha_hora || b.created_at || 0).getTime() -
    new Date(a.fecha_hora || a.created_at || 0).getTime()
);

            const original = activos[0];

            if (!original) {
                throw new Error(
                    'No hay movimientos activos para editar.'
                );
            }
            if (
                original.tipo === TIPOS_MOVIMIENTO.REGRESO_PLANTA &&
                datosNuevos.idViaje &&
                datosNuevos.idViaje !== original.id_viaje
            ) {
                throw new Error(
                    'No puedes cambiar el viaje asociado al regreso original.'
                );
            }
            if (original.sync_estado !== 'PENDIENTE') {
                throw new Error(
                    'Este movimiento ya fue sincronizado y no puede editarse desde el móvil.'
                );
            }

            if (tipo && original.tipo !== tipo) {
                throw new Error(
                    'El tipo de movimiento no coincide con el registro original.'
                );
            }

            if (
    !datosNuevos.idMovimiento ||
    datosNuevos.idMovimiento !== original.id_movimiento
) {
    throw new Error(
        'El movimiento seleccionado ya no es el último movimiento activo.'
    );
}

            // =========================================
            // 2. FUNCIONES AUXILIARES
            // =========================================

            const buscarUbicacion = nombre => {

                const fila = inventario.find(
                    i => i.ubicacion === nombre
                );

                if (!fila) {
                    throw new Error(
                        `No existe el inventario de ${nombre}.`
                    );
                }

                return fila;
            };

            const buscarCliente = id => {

                const cliente = clientes.find(
                    c => c.id_cliente === id
                );

                if (!cliente) {
                    throw new Error(
                        'No se encontró el cliente del movimiento.'
                    );
                }

                return cliente;
            };

            const buscarClienteActivo = id => {

                const cliente = clientes.find(
                    c =>
                        c.id_cliente === id &&
                        c.estado === 'ACTIVO'
                );

                if (!cliente) {
                    throw new Error(
                        'Selecciona un cliente activo.'
                    );
                }

                return cliente;
            };

            const ajustar = (fila, campo, cambio) => {

                const nuevoValor =
                    Number(fila[campo] || 0) + cambio;

                if (
                    !Number.isSafeInteger(nuevoValor) ||
                    nuevoValor < 0
                ) {
                    throw new Error(
                        `No hay existencias suficientes para modificar ${campo} en ${fila.ubicacion}.`
                    );
                }

                fila[campo] = nuevoValor;
            };

            const ajustarPendiente = (cliente, cambio) => {

                const nuevoValor =
                    Number(cliente.pendientes_actuales || 0) + cambio;

                if (
                    !Number.isSafeInteger(nuevoValor) ||
                    nuevoValor < 0
                ) {
                    throw new Error(
                        `El cliente ${cliente.nombre || ''} no tiene pendientes suficientes para realizar esta modificación.`
                    );
                }

                cliente.pendientes_actuales = nuevoValor;
                cliente.sync_estado = 'PENDIENTE';
            };

            const obtenerCantidad = valor => {

                const numero = Number(valor);

                if (
                    !Number.isSafeInteger(numero) ||
                    numero <= 0
                ) {
                    throw new Error(
                        'La cantidad debe ser un número entero mayor que cero.'
                    );
                }

                return numero;
            };

            const obtenerCantidades = (nuevosLlenos, nuevosVacios) => {

                const l = Number(nuevosLlenos);
                const v = Number(nuevosVacios);

                validarCantidad(l, v);

                if (l <= 0 && v <= 0) {
                    throw new Error(
                        'Debes registrar al menos un cilindro.'
                    );
                }

                return {
                    llenos: l,
                    vacios: v
                };
            };

            const ubicacionesCliente = [
                UBICACIONES.ROJO,
                UBICACIONES.BLANCO,
                UBICACIONES.CASA
            ];

            const ubicacionesTraslado = [
                UBICACIONES.ROJO,
                UBICACIONES.BLANCO,
                UBICACIONES.CASA
            ];

            const normalizarEstado = valor =>
                String(valor || '').toLowerCase();

            const fechaModificacion =
                new Date().toISOString();

            const cantidadLlenosOriginal =
                Number(original.llenos || 0);

            const cantidadVaciosOriginal =
                Number(original.vacios || 0);

            // =========================================
            // 3. REVERTIR EL MOVIMIENTO ORIGINAL
            // =========================================

            switch (original.tipo) {

                case TIPOS_MOVIMIENTO.ENTREGA_CLIENTE: {

                    const camionAnterior =
                        buscarUbicacion(original.camion_origen);

                    const clienteAnterior =
                        buscarCliente(original.id_cliente);

                    ajustar(
                        camionAnterior,
                        'llenos',
                        cantidadLlenosOriginal
                    );

                    ajustarPendiente(
                        clienteAnterior,
                        -cantidadLlenosOriginal
                    );

                    break;
                }

                case TIPOS_MOVIMIENTO.RETIRO_CLIENTE: {

                    const camionAnterior =
                        buscarUbicacion(original.camion_destino);

                    ajustar(
                        camionAnterior,
                        'vacios',
                        -cantidadVaciosOriginal
                    );

                    if (!original.retiro_especial) {

                        const clienteAnterior =
                            buscarCliente(original.id_cliente);

                        ajustarPendiente(
                            clienteAnterior,
                            cantidadVaciosOriginal
                        );
                    }

                    break;
                }

                case TIPOS_MOVIMIENTO.ENTREGA_RETIRO: {

                    const camionAnterior =
                        buscarUbicacion(original.camion_origen);

                    const clienteAnterior =
                        buscarCliente(original.id_cliente);

                    ajustar(
                        camionAnterior,
                        'llenos',
                        cantidadLlenosOriginal
                    );

                    ajustar(
                        camionAnterior,
                        'vacios',
                        -cantidadVaciosOriginal
                    );

                    ajustarPendiente(
                        clienteAnterior,
                        -cantidadLlenosOriginal + cantidadVaciosOriginal
                    );

                    break;
                }

                case TIPOS_MOVIMIENTO.TRASLADO: {

                    const anteriorOrigen =
                        buscarUbicacion(original.camion_origen);

                    const anteriorDestino =
                        buscarUbicacion(original.camion_destino);

                    ajustar(
                        anteriorOrigen,
                        'llenos',
                        cantidadLlenosOriginal
                    );

                    ajustar(
                        anteriorOrigen,
                        'vacios',
                        cantidadVaciosOriginal
                    );

                    ajustar(
                        anteriorDestino,
                        'llenos',
                        -cantidadLlenosOriginal
                    );

                    ajustar(
                        anteriorDestino,
                        'vacios',
                        -cantidadVaciosOriginal
                    );

                    break;
                }

                case TIPOS_MOVIMIENTO.CAMBIAZO: {

                    const camionAnterior =
                        buscarUbicacion(original.camion_origen);

                    const cantidadAnterior =
                        obtenerCantidad(original.cantidad);

                    const estadoAnterior =
                        normalizarEstado(original.estado_origen);

                    const estadoNuevoAnterior =
                        normalizarEstado(original.estado_nuevo);

                    if (
                        !['llenos', 'vacios'].includes(estadoAnterior) ||
                        !['llenos', 'vacios'].includes(estadoNuevoAnterior) ||
                        estadoAnterior === estadoNuevoAnterior
                    ) {
                        throw new Error(
                            'El cambiazo original tiene estados inválidos.'
                        );
                    }

                    ajustar(
                        camionAnterior,
                        estadoAnterior,
                        cantidadAnterior
                    );

                    ajustar(
                        camionAnterior,
                        estadoNuevoAnterior,
                        -cantidadAnterior
                    );

                    break;
                }

                case TIPOS_MOVIMIENTO.SALIDA_PLANTA: {

                    const camionAnterior =
                        buscarUbicacion(original.camion_origen);

                    const viaje = viajes.find(
                        v => v.id_viaje === original.id_viaje
                    );

                    if (
                        !viaje ||
                        viaje.estado !== 'ABIERTO' ||
                        viaje.id_movimiento_salida !== original.id_movimiento
                    ) {
                        throw new Error(
                            'La salida original no coincide con un viaje abierto válido.'
                        );
                    }

                    ajustar(
                        camionAnterior,
                        'vacios',
                        cantidadVaciosOriginal
                    );

                    viaje.estado = 'ANULADO';
                    viaje.fecha_regreso = null;
                    viaje.llenos_recibidos = 0;
                    viaje.id_movimiento_regreso = null;

                    break;
                }

                case TIPOS_MOVIMIENTO.REGRESO_PLANTA: {

                    const camionAnterior =
                        buscarUbicacion(original.camion_destino);

                    const viaje = viajes.find(
                        v => v.id_viaje === original.id_viaje
                    );

                    if (
                        !viaje ||
                        viaje.estado !== 'CERRADO' ||
                        viaje.id_movimiento_regreso !== original.id_movimiento
                    ) {
                        throw new Error(
                            'El regreso original no coincide con el viaje registrado.'
                        );
                    }

                    ajustar(
                        camionAnterior,
                        'llenos',
                        -cantidadLlenosOriginal
                    );

                    viaje.estado = 'ABIERTO';
                    viaje.fecha_regreso = null;
                    viaje.llenos_recibidos = 0;
                    viaje.id_movimiento_regreso = null;

                    break;
                }

                default:

                    throw new Error(
                        `No se puede editar este tipo de movimiento: ${original.tipo}`
                    );
            }

            // =========================================
            // 4. PREPARAR EL MISMO MOVIMIENTO
            // =========================================

            const actualizado = {
                ...original,
                observacion: String(observacion || '').trim(),
                modificado_at: fechaModificacion,
                sync_estado: 'PENDIENTE',
                estado: 'ACTIVO'
            };

            // =========================================
            // 5. APLICAR LOS NUEVOS DATOS
            // =========================================

            switch (original.tipo) {

                case TIPOS_MOVIMIENTO.ENTREGA_CLIENTE: {

                    const nuevaCantidad =
                        obtenerCantidad(cantidad);

                    if (!ubicacionesCliente.includes(camion)) {
                        throw new Error(
                            'Selecciona una ubicación válida.'
                        );
                    }

                    const nuevoCliente =
                        buscarClienteActivo(idCliente);

                    const nuevoCamion =
                        buscarUbicacion(camion);

                    ajustar(
                        nuevoCamion,
                        'llenos',
                        -nuevaCantidad
                    );

                    ajustarPendiente(
                        nuevoCliente,
                        nuevaCantidad
                    );

                    actualizado.id_cliente = idCliente;
                    actualizado.camion_origen = camion;
                    actualizado.camion_destino = null;
                    actualizado.llenos = nuevaCantidad;
                    actualizado.vacios = 0;

                    break;
                }

                case TIPOS_MOVIMIENTO.RETIRO_CLIENTE: {

                    const nuevaCantidad =
                        obtenerCantidad(cantidad);

                    if (!ubicacionesCliente.includes(camion)) {
                        throw new Error(
                            'Selecciona una ubicación válida.'
                        );
                    }

                    const nuevoCliente =
                        buscarClienteActivo(idCliente);

                    const especial =
                        Boolean(retiroEspecial);

                    const nuevaObservacion =
                        String(observacion || '').trim();

                    if (especial && !nuevaObservacion) {
                        throw new Error(
                            'La observación es obligatoria para un retiro especial.'
                        );
                    }

                    const nuevoCamion =
                        buscarUbicacion(camion);

                    ajustar(
                        nuevoCamion,
                        'vacios',
                        nuevaCantidad
                    );

                    if (!especial) {
                        ajustarPendiente(
                            nuevoCliente,
                            -nuevaCantidad
                        );
                    }

                    actualizado.id_cliente = idCliente;
                    actualizado.camion_origen = null;
                    actualizado.camion_destino = camion;
                    actualizado.llenos = 0;
                    actualizado.vacios = nuevaCantidad;
                    actualizado.retiro_especial = especial;

                    actualizado.observacion = especial
                        ? `[RETIRO ESPECIAL] ${nuevaObservacion}`
                        : nuevaObservacion;

                    break;
                }

                case TIPOS_MOVIMIENTO.ENTREGA_RETIRO: {

                    const cantidades =
                        obtenerCantidades(llenos, vacios);

                    if (!ubicacionesCliente.includes(camion)) {
                        throw new Error(
                            'Selecciona una ubicación válida.'
                        );
                    }

                    const nuevoCliente =
                        buscarClienteActivo(idCliente);

                    const nuevoCamion =
                        buscarUbicacion(camion);

                    ajustar(
                        nuevoCamion,
                        'llenos',
                        -cantidades.llenos
                    );

                    ajustar(
                        nuevoCamion,
                        'vacios',
                        cantidades.vacios
                    );

                    ajustarPendiente(
                        nuevoCliente,
                        cantidades.llenos - cantidades.vacios
                    );

                    actualizado.id_cliente = idCliente;
                    actualizado.camion_origen = camion;
                    actualizado.camion_destino = camion;
                    actualizado.llenos = cantidades.llenos;
                    actualizado.vacios = cantidades.vacios;

                    break;
                }

                case TIPOS_MOVIMIENTO.TRASLADO: {

                    const cantidades =
                        obtenerCantidades(llenos, vacios);

                    if (
                        !ubicacionesTraslado.includes(origen) ||
                        !ubicacionesTraslado.includes(destino) ||
                        origen === destino
                    ) {
                        throw new Error(
                            'Selecciona dos ubicaciones diferentes y válidas.'
                        );
                    }

                    const nuevoOrigen =
                        buscarUbicacion(origen);

                    const nuevoDestino =
                        buscarUbicacion(destino);

                    ajustar(
                        nuevoOrigen,
                        'llenos',
                        -cantidades.llenos
                    );

                    ajustar(
                        nuevoOrigen,
                        'vacios',
                        -cantidades.vacios
                    );

                    ajustar(
                        nuevoDestino,
                        'llenos',
                        cantidades.llenos
                    );

                    ajustar(
                        nuevoDestino,
                        'vacios',
                        cantidades.vacios
                    );

                    actualizado.camion_origen = origen;
                    actualizado.camion_destino = destino;
                    actualizado.llenos = cantidades.llenos;
                    actualizado.vacios = cantidades.vacios;

                    break;
                }

                case TIPOS_MOVIMIENTO.CAMBIAZO: {

                    const nuevaCantidad =
                        obtenerCantidad(cantidad);

                    const nuevoEstadoActual =
                        normalizarEstado(estadoActual);

                    const nuevoEstadoFinal =
                        normalizarEstado(estadoNuevo);

                    if (
                        ![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(ubicacion)
                    ) {
                        throw new Error(
                            'El cambiazo solo se permite en ROJO o BLANCO.'
                        );
                    }

                    if (
                        !['llenos', 'vacios'].includes(nuevoEstadoActual) ||
                        !['llenos', 'vacios'].includes(nuevoEstadoFinal) ||
                        nuevoEstadoActual === nuevoEstadoFinal
                    ) {
                        throw new Error(
                            'Selecciona estados de cilindro diferentes.'
                        );
                    }

                    const nuevaObservacion =
                        String(observacion || '').trim();

                    if (!nuevaObservacion) {
                        throw new Error(
                            'Debes ingresar el motivo del cambiazo.'
                        );
                    }

                    const camionNuevo =
                        buscarUbicacion(ubicacion);

                    ajustar(
                        camionNuevo,
                        nuevoEstadoActual,
                        -nuevaCantidad
                    );

                    ajustar(
                        camionNuevo,
                        nuevoEstadoFinal,
                        nuevaCantidad
                    );

                    actualizado.camion_origen = ubicacion;
                    actualizado.camion_destino = ubicacion;
                    actualizado.estado_origen = nuevoEstadoActual;
                    actualizado.estado_nuevo = nuevoEstadoFinal;
                    actualizado.cantidad = nuevaCantidad;

                    break;
                }

                case TIPOS_MOVIMIENTO.SALIDA_PLANTA: {

                    const nuevaCantidad =
                        obtenerCantidad(cantidad);

                    if (
                        ![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(camion)
                    ) {
                        throw new Error(
                            'Selecciona ROJO o BLANCO.'
                        );
                    }

                    const camionNuevo =
                        buscarUbicacion(camion);

                    const viaje = viajes.find(
                        v => v.id_viaje === original.id_viaje
                    );

                    if (!viaje) {
                        throw new Error(
                            'No se encontró el viaje original de planta.'
                        );
                    }

                    ajustar(
                        camionNuevo,
                        'vacios',
                        -nuevaCantidad
                    );

                    viaje.camion = camion;
                    viaje.fecha_salida = original.fecha_hora;
                    viaje.fecha_regreso = null;
                    viaje.estado = 'ABIERTO';
                    viaje.vacios_enviados = nuevaCantidad;
                    viaje.llenos_recibidos = 0;
                    viaje.id_movimiento_salida = original.id_movimiento;
                    viaje.id_movimiento_regreso = null;

                    actualizado.camion_origen = camion;
                    actualizado.camion_destino = null;
                    actualizado.llenos = 0;
                    actualizado.vacios = nuevaCantidad;

                    break;
                }

                case TIPOS_MOVIMIENTO.REGRESO_PLANTA: {

                    const viaje = viajes.find(
                        v => v.id_viaje === original.id_viaje
                    );

                    if (
                        !viaje ||
                        viaje.estado !== 'ABIERTO' ||
                        viaje.id_movimiento_salida == null
                    ) {
                        throw new Error(
                            'No se puede modificar el viaje de planta.'
                        );
                    }

                    const nuevaCantidad =
                        obtenerCantidad(cantidad ?? llenos);

                    if (
                        nuevaCantidad !== Number(viaje.vacios_enviados)
                    ) {
                        throw new Error(
                            `El regreso debe coincidir con los ${viaje.vacios_enviados} cilindros enviados.`
                        );
                    }

                    const camionNuevo =
                        buscarUbicacion(viaje.camion);

                    ajustar(
                        camionNuevo,
                        'llenos',
                        nuevaCantidad
                    );

                    viaje.estado = 'CERRADO';
                    viaje.fecha_regreso = fechaModificacion;
                    viaje.llenos_recibidos = nuevaCantidad;
                    viaje.id_movimiento_regreso = original.id_movimiento;

                    actualizado.camion_origen = null;
                    actualizado.camion_destino = viaje.camion;
                    actualizado.llenos = nuevaCantidad;
                    actualizado.vacios = 0;

                    break;
                }
            }

            // =========================================
            // 6. ACTUALIZAR PENDIENTES GENERALES
            // =========================================

            const inventarioClientes = inventario.find(
                i => i.ubicacion === UBICACIONES.CLIENTES
            );

            if (
                original.tipo === TIPOS_MOVIMIENTO.ENTREGA_CLIENTE ||
                original.tipo === TIPOS_MOVIMIENTO.RETIRO_CLIENTE ||
                original.tipo === TIPOS_MOVIMIENTO.ENTREGA_RETIRO
            ) {

                if (!inventarioClientes) {
                    throw new Error(
                        'No existe el inventario agregado de clientes.'
                    );
                }
            }

            if (inventarioClientes) {

                inventarioClientes.pendientes = clientes
                    .filter(c => c.estado === 'ACTIVO')
                    .reduce(
                        (total, c) =>
                            total + Number(c.pendientes_actuales || 0),
                        0
                    );
            }

            // =========================================
            // 7. GUARDAR EL MISMO MOVIMIENTO
            // =========================================

            return {
                resultado: actualizado,

                puts: {
                    inventario,
                    clientes,
                    movimientos: [actualizado],
                    viajes_planta: viajes
                }
            };
        }
    );
}


/* =====================================================
   OBTENER VIAJES ABIERTOS
===================================================== */

export async function obtenerViajesAbiertos() {

    const viajes =
        await obtenerTodos(
            'viajes_planta'
        );


    return viajes

        .filter(
            viaje =>
                viaje.estado === 'ABIERTO'
        )

        .sort(
            (a, b) =>
                new Date(b.fecha_salida) -
                new Date(a.fecha_salida)
        );
}

export async function cambiazo({
    ubicacion,
    estadoActual,
    estadoNuevo,
    cantidad,
    observacion
}) {
    if (![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(ubicacion)) {
        throw new Error(
            'El cambiazo solo se permite en ROJO o BLANCO.'
        );
    }

    if (
        !['llenos', 'vacios'].includes(estadoActual) ||
        !['llenos', 'vacios'].includes(estadoNuevo)
    ) {
        throw new Error('Estado de cilindro no válido.');
    }

    if (estadoActual === estadoNuevo) {
        throw new Error(
            'Debes seleccionar estados diferentes.'
        );
    }

    cantidad = Number(cantidad);

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
        throw new Error(
            'La cantidad debe ser un entero positivo.'
        );
    }

    if (
        typeof observacion !== 'string' ||
        !observacion.trim()
    ) {
        throw new Error(
            'Debes ingresar el motivo del cambiazo.'
        );
    }

    const movimiento = {
        id_movimiento: uuid(),
        fecha_hora: new Date().toISOString(),
        created_at: new Date().toISOString(),
        estado: 'ACTIVO',
        dispositivo: 'MOVIL',
        sync_estado: 'PENDIENTE',
        tipo: TIPOS_MOVIMIENTO.CAMBIAZO,
        camion_origen: ubicacion,
        camion_destino: ubicacion,
        estado_origen: estadoActual,
        estado_nuevo: estadoNuevo,
        cantidad,
        llenos: 0,
        vacios: 0,
        observacion: observacion.trim()
    };

    return ejecutarTransaccionAtomica(
        ['inventario', 'movimientos'],
        datos => {
            const camion = datos.inventario.find(
                item => item.ubicacion === ubicacion
            );

            if (!camion) {
                throw new Error(
                    `No existe el inventario de ${ubicacion}.`
                );
            }

            const disponibles = Number(camion[estadoActual] || 0);

            if (cantidad > disponibles) {
                throw new Error(
                    `No hay suficientes ${estadoActual}. Disponibles: ${disponibles}.`
                );
            }

            const camionActualizado = {
                ...camion,
                [estadoActual]: disponibles - cantidad,
                [estadoNuevo]: Number(camion[estadoNuevo] || 0) + cantidad
            };

            return {
                resultado: movimiento,
                puts: {
                    inventario: [camionActualizado],
                    movimientos: [movimiento]
                }
            };
        }
    );
}