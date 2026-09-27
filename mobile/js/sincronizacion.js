import {
    obtenerTodos,
    guardar
} from './db.js';


export async function obtenerPendientesSync() {

    const movimientos =
        await obtenerTodos('movimientos');

    const clientes =
        await obtenerTodos('clientes');

    return {

        movimientos:
            movimientos.filter(
                item =>
                    item.sync_estado === 'PENDIENTE' ||
                    item.sync_estado === 'ERROR'
            ),

        clientes:
            clientes.filter(
                item =>
                    item.sync_estado === 'PENDIENTE' ||
                    item.sync_estado === 'ERROR'
            )
    };
}


export async function obtenerEstadoSync() {

    const pendientes =
        await obtenerPendientesSync();

    return {

        movimientos:
            pendientes.movimientos.length,

        clientes:
            pendientes.clientes.length,

        total:
            pendientes.movimientos.length +
            pendientes.clientes.length
    };
}


export async function guardarEstadoSync(
    datos
) {

    await guardar(
        'sincronizacion',
        {
            id: 'estado',
            ...datos
        }
    );
}


export async function obtenerUltimaSync() {

    const estados =
        await obtenerTodos(
            'sincronizacion'
        );

    return estados.find(
        item => item.id === 'estado'
    );
}