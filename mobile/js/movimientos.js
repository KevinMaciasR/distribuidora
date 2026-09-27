import {
    guardar,
    obtener,
    obtenerTodos
} from './db.js';

import {
    UBICACIONES,
    actualizarInventario
} from './inventario.js';


export const TIPOS_MOVIMIENTO = {

    ENTREGA_CLIENTE: 'ENTREGA A CLIENTE',

    RETIRO_CLIENTE: 'RETIRO DE CLIENTE',

    ENTREGA_RETIRO: 'ENTREGA + RETIRO',

    SALIDA_PLANTA: 'SALIDA A PLANTA',

    REGRESO_PLANTA: 'REGRESO DE PLANTA',

    TRASLADO: 'TRASLADO ENTRE CAMIONES'
};


function uuid() {

    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


function fechaActual() {
    return new Date().toISOString();
}


async function obtenerCamion(nombre) {

    const ubicacion = await obtener(
        'inventario',
        nombre
    );

    if (!ubicacion) {
        throw new Error(
            `No existe el camión ${nombre}.`
        );
    }

    return ubicacion;
}


async function validarCamion(
    camion,
    llenos = 0,
    vacios = 0
) {

    const data = await obtenerCamion(camion);

    if (llenos > data.llenos) {

        throw new Error(
            `El Camión ${camion} solo tiene ${data.llenos} cilindros llenos disponibles.`
        );
    }

    if (vacios > data.vacios) {

        throw new Error(
            `El Camión ${camion} solo tiene ${data.vacios} cilindros vacíos disponibles.`
        );
    }
}


async function validarCliente(
    idCliente,
    cantidad
) {

    const cliente = await obtener(
        'clientes',
        idCliente
    );

    if (!cliente) {
        throw new Error(
            'El cliente no existe.'
        );
    }

    if (cliente.estado !== 'ACTIVO') {
        throw new Error(
            'El cliente está inactivo.'
        );
    }

    if (cantidad > (cliente.pendientes_actuales || 0)) {

        throw new Error(
            `El cliente solo tiene ${cliente.pendientes_actuales || 0} cilindros pendientes.`
        );
    }

    return cliente;
}


async function modificarPendientesCliente(
    idCliente,
    cantidad
) {

    const cliente = await obtener(
        'clientes',
        idCliente
    );

    if (!cliente) {
        throw new Error('Cliente no encontrado.');
    }

    const nuevo = {
        ...cliente,
        pendientes_actuales:
            (cliente.pendientes_actuales || 0) +
            cantidad
    };

    if (nuevo.pendientes_actuales < 0) {
        throw new Error(
            'Los pendientes del cliente no pueden ser negativos.'
        );
    }

    await guardar(
        'clientes',
        nuevo
    );

    await actualizarInventario(
        UBICACIONES.CLIENTES,
        {
            pendientes:
                nuevo.pendientes_actuales
        }
    );
}


async function crearMovimiento(base) {

    const movimiento = {

        id_movimiento: uuid(),

        fecha_hora: fechaActual(),

        ...base,

        estado: 'ACTIVO',

        fecha_creacion: fechaActual(),

        fecha_modificacion: fechaActual(),

        dispositivo_id: 'MOVIL',

        sync_estado: 'PENDIENTE'
    };

    await guardar(
        'movimientos',
        movimiento
    );

    return movimiento;
}


/* =========================
   ENTREGA A CLIENTE
========================= */

export async function entregaCliente({
    idCliente,
    camion,
    llenos,
    observacion = ''
}) {

    llenos = Number(llenos);

    if (llenos <= 0) {
        throw new Error(
            'Indica una cantidad válida de cilindros llenos.'
        );
    }

    await validarCamion(
        camion,
        llenos,
        0
    );

    await validarClienteExistente(idCliente);

    const cam = await obtenerCamion(camion);

    await actualizarInventario(
        camion,
        {
            llenos: cam.llenos - llenos
        }
    );

    await modificarPendientesCliente(
        idCliente,
        llenos
    );

    return crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.ENTREGA_CLIENTE,
        id_cliente: idCliente,
        camion_origen: camion,
        camion_destino: null,
        llenos,
        vacios: 0,
        observacion
    });
}


/* =========================
   RETIRO DE CLIENTE
========================= */

export async function retiroCliente({
    idCliente,
    camion,
    vacios,
    observacion = ''
}) {

    vacios = Number(vacios);

    if (vacios <= 0) {
        throw new Error(
            'Indica una cantidad válida de cilindros vacíos.'
        );
    }

    const cliente = await validarCliente(
        idCliente,
        vacios
    );

    const cam = await obtenerCamion(camion);

    await modificarPendientesCliente(
        idCliente,
        -vacios
    );

    await actualizarInventario(
        camion,
        {
            vacios: cam.vacios + vacios
        }
    );

    return crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.RETIRO_CLIENTE,
        id_cliente: idCliente,
        camion_origen: camion,
        camion_destino: null,
        llenos: 0,
        vacios,
        observacion
    });
}


/* =========================
   ENTREGA + RETIRO
========================= */

export async function entregaRetiro({
    idCliente,
    camion,
    llenos,
    vacios,
    observacion = ''
}) {

    llenos = Number(llenos);
    vacios = Number(vacios);

    if (llenos < 0 || vacios < 0) {
        throw new Error(
            'Las cantidades no pueden ser negativas.'
        );
    }

    if (llenos === 0 && vacios === 0) {
        throw new Error(
            'Debes registrar al menos una cantidad.'
        );
    }

    const diferencia = llenos - vacios;

    const cliente = await obtener(
        'clientes',
        idCliente
    );

    if (!cliente || cliente.estado !== 'ACTIVO') {
        throw new Error(
            'El cliente no existe o está inactivo.'
        );
    }

    await validarCamion(
        camion,
        llenos,
        0
    );

    if (
        diferencia < 0 &&
        Math.abs(diferencia) >
        (cliente.pendientes_actuales || 0)
    ) {

        throw new Error(
            'El retiro supera los cilindros pendientes del cliente.'
        );
    }

    const cam = await obtenerCamion(camion);

    await actualizarInventario(
        camion,
        {
            llenos: cam.llenos - llenos,
            vacios: cam.vacios + vacios
        }
    );

    await modificarPendientesCliente(
        idCliente,
        diferencia
    );

    return crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.ENTREGA_RETIRO,
        id_cliente: idCliente,
        camion_origen: camion,
        camion_destino: null,
        llenos,
        vacios,
        observacion
    });
}


/* =========================
   SALIDA A PLANTA
========================= */

export async function salidaPlanta({
    camion,
    vacios,
    observacion = ''
}) {

    vacios = Number(vacios);

    if (vacios <= 0) {
        throw new Error(
            'Indica una cantidad válida.'
        );
    }

    await validarCamion(
        camion,
        0,
        vacios
    );

    const cam = await obtenerCamion(camion);

    await actualizarInventario(
        camion,
        {
            vacios: cam.vacios - vacios
        }
    );

    const idViaje = uuid();

    await guardar(
        'viajes_planta',
        {
            id_viaje: idViaje,
            camion,
            fecha_salida: fechaActual(),
            fecha_regreso: null,
            movimiento_salida_id: null,
            movimiento_regreso_id: null,
            vacios_enviados: vacios,
            llenos_recibidos: 0,
            estado: 'ABIERTO',
            observacion
        }
    );

    const movimiento = await crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.SALIDA_PLANTA,
        camion_origen: camion,
        camion_destino: null,
        llenos: 0,
        vacios,
        id_viaje_planta: idViaje,
        observacion
    });

    const viaje = await obtener(
        'viajes_planta',
        idViaje
    );

    await guardar(
        'viajes_planta',
        {
            ...viaje,
            movimiento_salida_id:
                movimiento.id_movimiento
        }
    );

    return movimiento;
}


/* =========================
   REGRESO DE PLANTA
========================= */

export async function regresoPlanta({
    idViaje,
    llenos,
    observacion = ''
}) {

    llenos = Number(llenos);

    if (llenos <= 0) {
        throw new Error(
            'Indica una cantidad válida.'
        );
    }

    const viaje = await obtener(
        'viajes_planta',
        idViaje
    );

    if (!viaje) {
        throw new Error(
            'El viaje a planta no existe.'
        );
    }

    if (viaje.estado !== 'ABIERTO') {
        throw new Error(
            'Este viaje ya está cerrado.'
        );
    }

    const cam = await obtenerCamion(
        viaje.camion
    );

    await actualizarInventario(
        viaje.camion,
        {
            llenos: cam.llenos + llenos
        }
    );

    const movimiento = await crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.REGRESO_PLANTA,
        camion_origen: null,
        camion_destino: viaje.camion,
        llenos,
        vacios: 0,
        id_viaje_planta: idViaje,
        observacion
    });

    await guardar(
        'viajes_planta',
        {
            ...viaje,
            fecha_regreso: fechaActual(),
            movimiento_regreso_id:
                movimiento.id_movimiento,
            llenos_recibidos: llenos,
            estado: 'CERRADO'
        }
    );

    return movimiento;
}


/* =========================
   TRASLADO
========================= */

export async function trasladoCamiones({
    origen,
    destino,
    tipoCilindro,
    cantidad,
    observacion = ''
}) {

    cantidad = Number(cantidad);

    if (origen === destino) {
        throw new Error(
            'El camión origen y destino deben ser diferentes.'
        );
    }

    if (cantidad <= 0) {
        throw new Error(
            'Indica una cantidad válida.'
        );
    }

    const camOrigen = await obtenerCamion(
        origen
    );

    const camDestino = await obtenerCamion(
        destino
    );

    if (tipoCilindro === 'LLENOS') {

        if (cantidad > camOrigen.llenos) {
            throw new Error(
                `El Camión ${origen} no tiene suficientes llenos.`
            );
        }

        await actualizarInventario(
            origen,
            {
                llenos:
                    camOrigen.llenos - cantidad
            }
        );

        await actualizarInventario(
            destino,
            {
                llenos:
                    camDestino.llenos + cantidad
            }
        );

    } else if (tipoCilindro === 'VACIOS') {

        if (cantidad > camOrigen.vacios) {
            throw new Error(
                `El Camión ${origen} no tiene suficientes vacíos.`
            );
        }

        await actualizarInventario(
            origen,
            {
                vacios:
                    camOrigen.vacios - cantidad
            }
        );

        await actualizarInventario(
            destino,
            {
                vacios:
                    camDestino.vacios + cantidad
            }
        );

    } else {

        throw new Error(
            'Tipo de cilindro inválido.'
        );
    }

    return crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.TRASLADO,
        camion_origen: origen,
        camion_destino: destino,
        llenos:
            tipoCilindro === 'LLENOS'
                ? cantidad
                : 0,
        vacios:
            tipoCilindro === 'VACIOS'
                ? cantidad
                : 0,
        observacion
    });
}


async function validarClienteExistente(idCliente) {

    const cliente = await obtener(
        'clientes',
        idCliente
    );

    if (!cliente) {
        throw new Error(
            'El cliente no existe.'
        );
    }

    if (cliente.estado !== 'ACTIVO') {
        throw new Error(
            'El cliente está inactivo.'
        );
    }

    return cliente;
}


export async function obtenerMovimientos() {

    const movimientos =
        await obtenerTodos('movimientos');

    return movimientos.sort(
        (a, b) =>
            new Date(b.fecha_hora) -
            new Date(a.fecha_hora)
    );
}
export async function obtenerViajesAbiertos() {

    const viajes = await obtenerTodos('viajes_planta');

    return viajes
        .filter(viaje => viaje.estado === 'ABIERTO')
        .sort(
            (a, b) =>
                new Date(b.fecha_salida) -
                new Date(a.fecha_salida)
        );
}