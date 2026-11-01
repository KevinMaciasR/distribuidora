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
        (
            nombre !== UBICACIONES.ROJO &&
            nombre !== UBICACIONES.BLANCO
        )
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
        camion !== UBICACIONES.ROJO &&
        camion !== UBICACIONES.BLANCO
    ) {
        throw new Error('El camión seleccionado no es válido.');
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

    if (![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(camion)) {
        throw new Error('Selecciona un camión válido.');
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

    if (![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(camion)) {
        throw new Error('Selecciona un camión válido.');
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

    if (
        ![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(origen) ||
        ![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(destino)
    ) {
        throw new Error(
            'El traslado solo puede realizarse entre ROJO y BLANCO.'
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
                    new Date(b.fecha_hora).getTime() -
                    new Date(a.fecha_hora).getTime()
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

                    if (movimiento.estado_origen === 'LLENOS') {
                        ajustar(camion, 'llenos', cantidad);
                        ajustar(camion, 'vacios', -cantidad);
                    } else {
                        ajustar(camion, 'vacios', cantidad);
                        ajustar(camion, 'llenos', -cantidad);
                    }
                    break;
                }

                case TIPOS_MOVIMIENTO.SALIDA_PLANTA: {
                    const camion = buscarCamion(movimiento.camion_origen);
                    ajustar(camion, 'vacios', cantidadVacios);

                    const viaje = viajes.find(
                        v => v.id_viaje === movimiento.id_viaje
                    );

                    if (viaje) {
                        viaje.estado = 'ANULADO';
                    }
                    break;
                }

                case TIPOS_MOVIMIENTO.REGRESO_PLANTA: {
                    const camion = buscarCamion(movimiento.camion_destino);
                    ajustar(camion, 'llenos', -cantidadLlenos);

                    const viaje = viajes.find(
                        v => v.id_viaje === movimiento.id_viaje
                    );

                    if (viaje) {
                        viaje.estado = 'ABIERTO';
                        delete viaje.id_movimiento_regreso;
                    }
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

export async function editarUltimaEntregaCliente({
    idCliente,
    camion,
    cantidad,
    observacion = ''
}) {
    cantidad = Number(cantidad);

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
        throw new Error('La cantidad debe ser un entero mayor que cero.');
    }

    if (![UBICACIONES.ROJO, UBICACIONES.BLANCO].includes(camion)) {
        throw new Error('Selecciona un camión válido.');
    }

    return ejecutarTransaccionAtomica(
        ['inventario', 'clientes', 'movimientos'],
        datos => {
            const activos = datos.movimientos
                .filter(m => m.estado === 'ACTIVO')
                .sort((a, b) =>
                    new Date(b.fecha_hora || b.created_at).getTime() -
                    new Date(a.fecha_hora || a.created_at).getTime()
                );

            const original = activos[0];

            if (!original || original.tipo !== TIPOS_MOVIMIENTO.ENTREGA_CLIENTE) {
                throw new Error('El último movimiento activo no es una entrega a cliente.');
            }

            if (original.sync_estado !== 'PENDIENTE') {
                throw new Error('El movimiento ya fue sincronizado y no puede editarse desde el móvil.');
            }

            const inventario = datos.inventario;
            const clientes = datos.clientes;

            const buscarCamion = nombre => {
                const fila = inventario.find(i => i.ubicacion === nombre);
                if (!fila) throw new Error(`No existe el inventario de ${nombre}.`);
                return fila;
            };

            const clienteAnterior = clientes.find(
                c => c.id_cliente === original.id_cliente
            );

            const clienteNuevo = clientes.find(
                c => c.id_cliente === idCliente && c.estado === 'ACTIVO'
            );

            if (!clienteAnterior) {
                throw new Error('No se encontró el cliente original.');
            }

            if (!clienteNuevo) {
                throw new Error('Selecciona un cliente activo.');
            }

            const camionAnterior = buscarCamion(original.camion_origen);
            const camionNuevo = buscarCamion(camion);

            const cantidadAnterior = Number(original.llenos || 0);

            if (
                !Number.isSafeInteger(cantidadAnterior) ||
                cantidadAnterior <= 0 ||
                Number(clienteAnterior.pendientes_actuales || 0) < cantidadAnterior
            ) {
                throw new Error('No se puede revertir el movimiento original de forma segura.');
            }

            // Revertir la entrega anterior.
            camionAnterior.llenos =
                Number(camionAnterior.llenos || 0) + cantidadAnterior;

            clienteAnterior.pendientes_actuales =
                Number(clienteAnterior.pendientes_actuales || 0) - cantidadAnterior;

            // Validar y aplicar la nueva entrega.
            if (Number(camionNuevo.llenos || 0) < cantidad) {
                throw new Error(
                    `El camión ${camion} no tiene suficientes cilindros llenos.`
                );
            }

            camionNuevo.llenos =
                Number(camionNuevo.llenos || 0) - cantidad;

            clienteNuevo.pendientes_actuales =
                Number(clienteNuevo.pendientes_actuales || 0) + cantidad;

            clienteAnterior.sync_estado = 'PENDIENTE';
            clienteNuevo.sync_estado = 'PENDIENTE';

            const inventarioClientes = inventario.find(
                i => i.ubicacion === UBICACIONES.CLIENTES
            );

            if (inventarioClientes) {
                inventarioClientes.pendientes = clientes
                    .filter(c => c.estado === 'ACTIVO')
                    .reduce(
                        (total, c) => total + Number(c.pendientes_actuales || 0),
                        0
                    );
            }

            const actualizado = {
                ...original,
                id_cliente: idCliente,
                camion_origen: camion,
                llenos: cantidad,
                vacios: 0,
                observacion,
                fecha_hora: new Date().toISOString(),
                modificado_at: new Date().toISOString(),
                sync_estado: 'PENDIENTE'
            };

            return {
                resultado: actualizado,
                puts: {
                    inventario,
                    clientes,
                    movimientos: [actualizado]
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