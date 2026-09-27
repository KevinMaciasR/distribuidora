import {
    guardar,
    obtener,
    obtenerTodos
} from './db.js';


function uuid() {

    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


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
                a.nombre.localeCompare(b.nombre)
        );
}


export async function obtenerCliente(
    idCliente
) {

    return obtener(
        'clientes',
        idCliente
    );
}


export async function buscarClientes(
    texto
) {

    const clientes =
        await obtenerClientes();

    texto = texto
        .trim()
        .toLowerCase();

    if (!texto) {
        return clientes;
    }

    return clientes.filter(cliente =>
        cliente.nombre
            .toLowerCase()
            .includes(texto)
    );
}