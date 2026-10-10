import {
    guardar,
    obtener,
    obtenerTodos
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
        'TRASLADO ENTRE CAMIONES'

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

    cantidad =
        Number(cantidad);

    if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {

        throw new Error(
            'La cantidad entregada debe ser un número entero mayor que 0.'
        );

    }


    const camionActual =
        await obtenerCamion(
            camion
        );


    validarCamion(
        camionActual,
        cantidad,
        0
    );


    await validarCliente(
        idCliente
    );


    /*
       Primero modificamos el camión.
    */

    await actualizarInventario(
        camion,
        {
            llenos:
                (camionActual.llenos || 0) -
                cantidad
        }
    );


    /*
       Después aumentamos el pendiente real del cliente.

       Esta función también actualiza CLIENTES.pendientes
       sumando todos los clientes.
    */

    await modificarPendienteCliente(
        idCliente,
        cantidad
    );


    return crearMovimiento({

        tipo:
            TIPOS_MOVIMIENTO.ENTREGA_CLIENTE,

        id_cliente:
            idCliente,

        camion_origen:
            camion,

        camion_destino:
            null,

        llenos:
            cantidad,

        vacios:
            0,

        observacion

    });
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

    if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {
        throw new Error(
            'La cantidad retirada debe ser un número entero mayor que 0.'
        );
    }

    const camionActual =
        await obtenerCamion(camion);

    const cliente =
        await validarCliente(idCliente);

    const pendienteActual =
        cliente.pendientes_actuales || 0;


    /* =====================================================
       RETIRO ESPECIAL
       Recupera cilindros que no estaban registrados
       previamente en el saldo del cliente.
    ===================================================== */

    if (retiroEspecial) {

        observacion =
            observacion.trim();
        if (!observacion) {
            throw new Error(
                'La observación es obligatoria para un retiro especial.'
            );
        }
        await actualizarInventario(camion,
            {
                vacios:
                    (camionActual.vacios || 0) +
                    cantidad
            });
        return crearMovimiento({
            tipo:
                TIPOS_MOVIMIENTO.RETIRO_CLIENTE,
            id_cliente:
                idCliente,
            camion_origen:
                null,
            camion_destino:
                camion,
            llenos:
                0,
            vacios:
                cantidad,
            observacion:
                `[RETIRO ESPECIAL] ${observacion}`,
            retiro_especial:
                true
        });
    }


    /* =====================================================
       RETIRO NORMAL
    ===================================================== */

    if (
        cantidad >
        pendienteActual
    ) {
        throw new Error(
            `El cliente tiene ${pendienteActual} cilindros pendientes. No puedes retirar ${cantidad}.`
        );
    }

    await modificarPendienteCliente(
        idCliente,
        -cantidad
    );

    await actualizarInventario(
        camion,
        {
            vacios:
                (camionActual.vacios || 0) +
                cantidad
        }
    );

    return crearMovimiento({
        tipo:
            TIPOS_MOVIMIENTO.RETIRO_CLIENTE,
        id_cliente:
            idCliente,
        camion_origen:
            null,
        camion_destino:
            camion,
        llenos:
            0,
        vacios:
            cantidad,
        observacion,
        retiro_especial:
            false
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

    llenos =
        Number(llenos);

    vacios =
        Number(vacios);


    validarCantidad(
        llenos,
        vacios
    );


    if (
        llenos <= 0 &&
        vacios <= 0
    ) {

        throw new Error(
            'Debes entregar o retirar al menos un cilindro.'
        );

    }


    const camionActual =
        await obtenerCamion(
            camion
        );


    validarCamion(
        camionActual,
        llenos,
        0
    );


    const cliente =
        await validarCliente(
            idCliente
        );


    const pendienteActual =
        cliente.pendientes_actuales || 0;


    /*
       La operación puede dejar pendiente igual,
       aumentarlo o reducirlo.

       Ejemplo:
       entrega 8
       retiro 5
       nuevo pendiente = +3
    */

    const nuevoPendiente =
        pendienteActual +
        llenos -
        vacios;


    if (
        nuevoPendiente < 0
    ) {

        throw new Error(
            `El cliente tiene ${pendienteActual} pendientes. No puedes retirar ${vacios} porque recibirías más de lo que debe.`
        );

    }


    /*
       Actualizar camión.
    */

    await actualizarInventario(
        camion,
        {
            llenos:
                (camionActual.llenos || 0) -
                llenos,

            vacios:
                (camionActual.vacios || 0) +
                vacios
        }
    );


    /*
       Actualizar cliente.

       El cambio neto es:
       + entregados
       - recibidos
    */

    await modificarPendienteCliente(
        idCliente,
        llenos - vacios
    );


    return crearMovimiento({

        tipo:
            TIPOS_MOVIMIENTO.ENTREGA_RETIRO,

        id_cliente:
            idCliente,

        camion_origen:
            camion,

        camion_destino:
            camion,

        llenos,

        vacios,

        observacion

    });
}


/* =====================================================
   SALIDA A PLANTA
===================================================== */

export async function salidaPlanta({

    camion,

    cantidad,

    observacion = ''

}) {

    cantidad =
        Number(cantidad);


    if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {

        throw new Error(
            'La cantidad enviada a planta debe ser un número entero mayor que 0.'
        );

    }


    const camionActual =
        await obtenerCamion(
            camion
        );


    validarCamion(
        camionActual,
        0,
        cantidad
    );


    const idViaje =
        uuid();


    /*
       Sacar los vacíos del camión.
    */

    await actualizarInventario(
        camion,
        {
            vacios:
                (camionActual.vacios || 0) -
                cantidad
        }
    );


    /*
       Crear viaje abierto.
    */

    const viaje = {

        id_viaje:
            idViaje,

        camion,

        fecha_salida:
            new Date().toISOString(),

        fecha_regreso:
            null,

        estado:
            'ABIERTO',

        vacios_enviados:
            cantidad,

        llenos_recibidos:
            0,

        id_movimiento_salida:
            null,

        id_movimiento_regreso:
            null

    };


    await guardar(
        'viajes_planta',
        viaje
    );


    const movimiento =
        await crearMovimiento({

            tipo:
                TIPOS_MOVIMIENTO.SALIDA_PLANTA,

            id_cliente:
                null,

            camion_origen:
                camion,

            camion_destino:
                null,

            llenos:
                0,

            vacios:
                cantidad,

            id_viaje:
                idViaje,

            observacion

        });


    /*
       Relacionar el movimiento con el viaje.
    */

    viaje.id_movimiento_salida =
        movimiento.id_movimiento;


    await guardar(
        'viajes_planta',
        viaje
    );


    return movimiento;
}


/* =====================================================
   REGRESO DE PLANTA
===================================================== */

export async function regresoPlanta({

    idViaje,

    llenos,

    observacion = ''

}) {

    llenos =
        Number(llenos);


    if (
        !Number.isInteger(llenos) ||
        llenos <= 0
    ) {

        throw new Error(
            'La cantidad que regresa de planta debe ser un número entero mayor que 0.'
        );

    }


    const viaje =
        await obtener(
            'viajes_planta',
            idViaje
        );


    if (!viaje) {

        throw new Error(
            'El viaje de planta no existe.'
        );

    }


    if (
        viaje.estado !== 'ABIERTO'
    ) {

        throw new Error(
            'Este viaje de planta ya está cerrado.'
        );

    }


    /*
       REGLA IMPORTANTE:

       La cantidad que regresa debe coincidir
       exactamente con la cantidad enviada.

       Si salieron 10 vacíos,
       deben regresar 10 llenos.
    */

    if (
        llenos !==
        viaje.vacios_enviados
    ) {

        throw new Error(
            `El viaje envió ${viaje.vacios_enviados} cilindros. El regreso debe registrar exactamente ${viaje.vacios_enviados}.`
        );

    }


    const camionActual =
        await obtenerCamion(
            viaje.camion
        );


    await actualizarInventario(
        viaje.camion,
        {
            llenos:
                (camionActual.llenos || 0) +
                llenos
        }
    );


    const movimiento =
        await crearMovimiento({

            tipo:
                TIPOS_MOVIMIENTO.REGRESO_PLANTA,

            id_cliente:
                null,

            camion_origen:
                null,

            camion_destino:
                viaje.camion,

            llenos:
                llenos,

            vacios:
                0,

            id_viaje:
                idViaje,

            observacion

        });


    /*
       Cerrar viaje.
    */

    viaje.estado =
        'CERRADO';

    viaje.fecha_regreso =
        new Date().toISOString();

    viaje.llenos_recibidos =
        llenos;

    viaje.id_movimiento_regreso =
        movimiento.id_movimiento;


    await guardar(
        'viajes_planta',
        viaje
    );


    return movimiento;
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

    llenos =
        Number(llenos);

    vacios =
        Number(vacios);
    validarCantidad(
        llenos,
        vacios
    );


    if (
        llenos <= 0 &&
        vacios <= 0
    ) {

        throw new Error(
            'Debes trasladar al menos un cilindro.'
        );

    }


    if (
        origen === destino
    ) {

        throw new Error(
            'El camión de origen y destino deben ser diferentes.'
        );

    }


    if (
        (
            origen !== UBICACIONES.ROJO &&
            origen !== UBICACIONES.BLANCO
        ) ||
        (
            destino !== UBICACIONES.ROJO &&
            destino !== UBICACIONES.BLANCO
        )
    ) {

        throw new Error(
            'El traslado solo puede realizarse entre ROJO y BLANCO.'
        );

    }


    const camionOrigen =
        await obtenerCamion(
            origen
        );


    const camionDestino =
        await obtenerCamion(
            destino
        );


    validarCamion(
        camionOrigen,
        llenos,
        vacios
    );


    /*
       Primero quitamos del origen.
    */

    await actualizarInventario(
        origen,
        {
            llenos:
                (camionOrigen.llenos || 0) -
                llenos,

            vacios:
                (camionOrigen.vacios || 0) -
                vacios
        }
    );


    /*
       Luego agregamos al destino.
    */

    await actualizarInventario(
        destino,
        {
            llenos:
                (camionDestino.llenos || 0) +
                llenos,

            vacios:
                (camionDestino.vacios || 0) +
                vacios
        }
    );


    return crearMovimiento({

        tipo:
            TIPOS_MOVIMIENTO.TRASLADO,

        id_cliente:
            null,

        camion_origen:
            origen,

        camion_destino:
            destino,

        llenos,

        vacios,

        observacion

    });
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