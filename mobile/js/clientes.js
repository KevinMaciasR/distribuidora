import {
    guardar,
    obtener,
    obtenerTodos
} from './db.js';

import {
    UBICACIONES,
    obtenerInventario,
    actualizarInventario
} from './inventario.js';


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
   CREAR CLIENTE
===================================================== */

export async function crearCliente({
    nombre,
    telefono = '',
    direccion = '',
    sector = '',
    observacion = ''
}) {

    nombre = nombre.trim();


    if (!nombre) {

        throw new Error(
            'El nombre del cliente es obligatorio.'
        );

    }


    const cliente = {

        id_cliente: uuid(),

        nombre,

        telefono,

        direccion,

        sector,

        fecha_registro:
            new Date().toISOString(),

        estado: 'ACTIVO',

        observacion,

        pendientes_actuales: 0,

        sync_estado: 'PENDIENTE'

    };


    await guardar(
        'clientes',
        cliente
    );


    return cliente;
}


/* =====================================================
   OBTENER CLIENTES ACTIVOS
===================================================== */

export async function obtenerClientes() {

    const clientes =
        await obtenerTodos('clientes');


    return clientes

        .filter(
            cliente =>
                cliente.estado === 'ACTIVO'
        )

        .sort(
            (a, b) =>
                a.nombre.localeCompare(
                    b.nombre
                )
        );
}


/* =====================================================
   OBTENER CLIENTE
===================================================== */

export async function obtenerCliente(
    idCliente
) {

    return obtener(
        'clientes',
        idCliente
    );
}


/* =====================================================
   BUSCAR CLIENTES
===================================================== */

export async function buscarClientes(
    texto
) {

    const clientes =
        await obtenerClientes();


    texto =
        texto
            .trim()
            .toLowerCase();


    if (!texto) {
        return clientes;
    }


    return clientes.filter(
        cliente =>
            cliente.nombre
                .toLowerCase()
                .includes(texto)
    );
}


/* =====================================================
   CALCULAR TOTAL DE PENDIENTES ASIGNADOS
===================================================== */

export async function calcularPendientesAsignados() {

    const clientes =
        await obtenerTodos('clientes');


    return clientes

        .filter(
            cliente =>
                cliente.estado === 'ACTIVO'
        )

        .reduce(
            (total, cliente) =>
                total +
                (cliente.pendientes_actuales || 0),
            0
        );
}


/* =====================================================
   OBTENER PENDIENTES INICIALES SIN ASIGNAR
===================================================== */

export async function obtenerPendientesInicialesSinAsignar() {

    const inventario =
        await obtenerInventario();


    const totalClientes =
        inventario.clientes?.pendientes || 0;


    const asignados =
        await calcularPendientesAsignados();


    const disponibles =
        totalClientes - asignados;


    return Math.max(
        0,
        disponibles
    );
}


/* =====================================================
   ASIGNAR PENDIENTE INICIAL A CLIENTE
=====================================================

   IMPORTANTE:

   Esta función NO crea un movimiento.

   NO cuenta como venta.

   NO aumenta el inventario.

   Solamente distribuye una cantidad que ya
   estaba registrada dentro de CLIENTES.pendientes.
===================================================== */

export async function asignarPendienteInicial(
    idCliente,
    cantidad
) {

    cantidad = Number(cantidad);


    if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {

        throw new Error(
            'La cantidad inicial debe ser un número entero mayor que 0.'
        );

    }


    const cliente =
        await obtenerCliente(
            idCliente
        );


    if (!cliente) {

        throw new Error(
            'El cliente no existe.'
        );

    }


    if (
        cliente.estado !== 'ACTIVO'
    ) {

        throw new Error(
            'No puedes asignar pendientes a un cliente inactivo.'
        );

    }


    const disponibles =
        await obtenerPendientesInicialesSinAsignar();


    if (cantidad > disponibles) {

        throw new Error(
            `No hay suficientes pendientes iniciales sin asignar. Disponibles: ${disponibles}.`
        );

    }


    cliente.pendientes_actuales =
        (cliente.pendientes_actuales || 0) +
        cantidad;


    cliente.sync_estado =
        'PENDIENTE';


    await guardar(
        'clientes',
        cliente
    );


    return cliente;
}


/* =====================================================
   ASIGNAR VARIOS PENDIENTES INICIALES
===================================================== */

export async function asignarPendientesIniciales(
    asignaciones
) {

    if (!Array.isArray(asignaciones)) {

        throw new Error(
            'Las asignaciones deben ser un arreglo.'
        );

    }


    const inventario =
        await obtenerInventario();


    const totalClientes =
        inventario.clientes?.pendientes || 0;


    const clientes =
        await obtenerTodos('clientes');


    const activos =
        clientes.filter(
            cliente =>
                cliente.estado === 'ACTIVO'
        );


    const mapa =
        new Map(
            activos.map(
                cliente => [
                    cliente.id_cliente,
                    cliente
                ]
            )
        );


    let cantidadAsignar = 0;


    for (
        const asignacion
        of asignaciones
    ) {

        const cantidad =
            Number(
                asignacion.cantidad
            );


        if (
            !Number.isInteger(cantidad) ||
            cantidad < 0
        ) {

            throw new Error(
                'Las cantidades iniciales deben ser números enteros mayores o iguales a 0.'
            );

        }


        if (cantidad === 0) {
            continue;
        }


        const cliente =
            mapa.get(
                asignacion.idCliente
            );


        if (!cliente) {

            throw new Error(
                'Uno de los clientes seleccionados no existe o está inactivo.'
            );

        }


        cantidadAsignar +=
            cantidad;

    }


    const yaAsignados =
        activos.reduce(
            (total, cliente) =>
                total +
                (cliente.pendientes_actuales || 0),
            0
        );


    const disponibles =
        totalClientes -
        yaAsignados;


    if (
        cantidadAsignar >
        disponibles
    ) {

        throw new Error(
            `No hay suficientes pendientes iniciales. Disponibles: ${disponibles}.`
        );

    }


    /*
       Aplicamos las asignaciones únicamente después
       de validar que TODAS caben dentro del saldo disponible.
    */

    for (
        const asignacion
        of asignaciones
    ) {

        const cantidad =
            Number(
                asignacion.cantidad
            );


        if (cantidad === 0) {
            continue;
        }


        const cliente =
            mapa.get(
                asignacion.idCliente
            );


        cliente.pendientes_actuales =
            (cliente.pendientes_actuales || 0) +
            cantidad;


        cliente.sync_estado =
            'PENDIENTE';


        await guardar(
            'clientes',
            cliente
        );

    }


    return {
        asignados: cantidadAsignar,
        disponibles:
            disponibles -
            cantidadAsignar
    };
}


/* =====================================================
   MODIFICAR PENDIENTE DEL CLIENTE
=====================================================

   Esta función sí se utilizará para movimientos normales.

   A diferencia de la asignación inicial, aquí sí estamos
   modificando el saldo real del cliente.
===================================================== */

export async function modificarPendienteCliente(
    idCliente,
    cambio
) {

    cambio = Number(cambio);


    if (
        !Number.isInteger(cambio)
    ) {

        throw new Error(
            'La cantidad debe ser un número entero.'
        );

    }


    const cliente =
        await obtenerCliente(
            idCliente
        );


    if (!cliente) {

        throw new Error(
            'El cliente no existe.'
        );

    }


    const nuevoPendiente =
        (cliente.pendientes_actuales || 0) +
        cambio;


    if (nuevoPendiente < 0) {

        throw new Error(
            'El pendiente del cliente no puede quedar negativo.'
        );

    }


    cliente.pendientes_actuales =
        nuevoPendiente;


    cliente.sync_estado =
        'PENDIENTE';


    await guardar(
        'clientes',
        cliente
    );


    /*
       CLIENTES.pendientes representa el TOTAL de cilindros
       que están actualmente con todos los clientes.

       Por eso debemos sumar TODOS los clientes, no utilizar
       solamente el saldo del cliente que acabamos de modificar.
    */

    const totalPendientes =
        await calcularPendientesAsignados();


    await actualizarInventario(
        UBICACIONES.CLIENTES,
        {
            pendientes: totalPendientes
        }
    );


    return cliente;
}