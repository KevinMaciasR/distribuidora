import {
    guardar,
    obtener,
    obtenerTodos,
    guardarClienteEInventario
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

asignacion_inicial: {
    realizada: false,
    cantidad: 0,
    fecha: null
},

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



/*=====================================================
/* ASIGNAR PENDIENTE INICIAL A CLIENTE */
export async function asignarPendienteInicial(idCliente, cantidad) {

    cantidad = Number(cantidad);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new Error(
            'La cantidad inicial debe ser un número entero mayor que 0.'
        );
    }

    const cliente = await obtenerCliente(idCliente);

    if (!cliente) {
        throw new Error('El cliente no existe.');
    }

    if (cliente.estado !== 'ACTIVO') {
        throw new Error(
            'No puedes asignar pendientes a un cliente inactivo.'
        );
    }

    if (cliente.asignacion_inicial?.realizada) {
        throw new Error(
            'Este cliente ya tiene una asignación inicial registrada.'
        );
    }

    if ((cliente.pendientes_actuales || 0) > 0) {
        throw new Error(
            'Este cliente ya tiene pendientes registrados. Verifica su saldo antes de realizar una asignación inicial.'
        );
    }

    const inventario = await obtenerInventario();

    const clientesActual = inventario.clientes;

    const nuevoPendiente =
        (clientesActual.pendientes || 0) + cantidad;

    cliente.pendientes_actuales = cantidad;

    cliente.asignacion_inicial = {
        realizada: true,
        cantidad,
        fecha: new Date().toISOString()
    };

    cliente.sync_estado = 'PENDIENTE';

    const nuevoInventario = {
        ...clientesActual,
        pendientes: nuevoPendiente
    };

    await guardarClienteEInventario(
        cliente,
        nuevoInventario
    );

    return cliente;
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




    /*
       CLIENTES.pendientes representa el TOTAL de cilindros
       que están actualmente con todos los clientes.

       Por eso debemos sumar TODOS los clientes, no utilizar
       solamente el saldo del cliente que acabamos de modificar.
    */

    const clientes = await obtenerTodos('clientes');

const totalPendientes = clientes
    .filter(c => c.estado === 'ACTIVO')
    .reduce((total, c) => {
        return total + (
            c.id_cliente === idCliente
                ? nuevoPendiente
                : Number(c.pendientes_actuales || 0)
        );
    }, 0);

const inventario = await obtenerInventario();

const nuevoInventario = {
    ...inventario.clientes,
    pendientes: totalPendientes
};

await guardarClienteEInventario(
    cliente,
    nuevoInventario
);


    return cliente;
}