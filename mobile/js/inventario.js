import {
    obtener,
    guardar,
    obtenerTodos
} from './db.js';


export const UBICACIONES = {
    ROJO: 'ROJO',
    BLANCO: 'BLANCO',
    CLIENTES: 'CLIENTES'
};


export async function inicializarInventario() {

    const inventario = await obtenerTodos('inventario');

    if (inventario.length > 0) {
        return;
    }

    await guardar('inventario', {
        ubicacion: UBICACIONES.ROJO,
        llenos: 0,
        vacios: 0
    });

    await guardar('inventario', {
        ubicacion: UBICACIONES.BLANCO,
        llenos: 0,
        vacios: 0
    });

    await guardar('inventario', {
        ubicacion: UBICACIONES.CLIENTES,
        pendientes: 0
    });
}


export async function obtenerInventario() {

    await inicializarInventario();

    const rojo = await obtener('inventario', UBICACIONES.ROJO);
    const blanco = await obtener('inventario', UBICACIONES.BLANCO);
    const clientes = await obtener('inventario', UBICACIONES.CLIENTES);

    return {
        rojo,
        blanco,
        clientes
    };
}


export async function actualizarInventario(
    ubicacion,
    cambios
) {

    const actual = await obtener(
        'inventario',
        ubicacion
    );

    if (!actual) {
        throw new Error(
            `No existe la ubicación ${ubicacion}`
        );
    }

    const nuevo = {
        ...actual,
        ...cambios,
        ubicacion
    };

    validarNoNegativos(nuevo);

    await guardar('inventario', nuevo);

    return nuevo;
}


function validarNoNegativos(inventario) {

    if (
        inventario.llenos !== undefined &&
        inventario.llenos < 0
    ) {
        throw new Error(
            'Los cilindros llenos no pueden quedar negativos.'
        );
    }

    if (
        inventario.vacios !== undefined &&
        inventario.vacios < 0
    ) {
        throw new Error(
            'Los cilindros vacíos no pueden quedar negativos.'
        );
    }

    if (
        inventario.pendientes !== undefined &&
        inventario.pendientes < 0
    ) {
        throw new Error(
            'Los pendientes de clientes no pueden quedar negativos.'
        );
    }
}


export function calcularTotal(inventario) {

    const rojo =
        (inventario.rojo?.llenos || 0) +
        (inventario.rojo?.vacios || 0);

    const blanco =
        (inventario.blanco?.llenos || 0) +
        (inventario.blanco?.vacios || 0);

    const clientes =
        inventario.clientes?.pendientes || 0;

    return rojo + blanco + clientes;
}
export async function configurarApertura({
    rojoLlenos,
    rojoVacios,
    blancoLlenos,
    blancoVacios,
    clientesPendientes
}) {
    const movimientos = await obtenerTodos('movimientos');

    if (movimientos.length > 0) {
        throw new Error(
            'No puedes modificar la apertura después de registrar movimientos.'
        );
    }

    const valores = [
        rojoLlenos,
        rojoVacios,
        blancoLlenos,
        blancoVacios,
        clientesPendientes
    ];

    if (valores.some(valor => !Number.isInteger(valor) || valor < 0)) {
        throw new Error('Todos los valores deben ser números enteros mayores o iguales a 0.');
    }

    await guardar('inventario', {
        ubicacion: UBICACIONES.ROJO,
        llenos: rojoLlenos,
        vacios: rojoVacios
    });

    await guardar('inventario', {
        ubicacion: UBICACIONES.BLANCO,
        llenos: blancoLlenos,
        vacios: blancoVacios
    });

    await guardar('inventario', {
        ubicacion: UBICACIONES.CLIENTES,
        pendientes: clientesPendientes
    });

    return obtenerInventario();
}
export async function contar(storeName) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            storeName,
            'readonly'
        );

        const request = transaction
            .objectStore(storeName)
            .count();

        request.onsuccess = () =>
            resolve(request.result);

        request.onerror = () =>
            reject(request.error);
    });
}


export async function guardarVarios(operaciones) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const stores = [
            ...new Set(
                operaciones.map(
                    operacion => operacion.storeName
                )
            )
        ];

        const transaction = db.transaction(
            stores,
            'readwrite'
        );

        try {

            for (const operacion of operaciones) {

                transaction
                    .objectStore(operacion.storeName)
                    .put(operacion.data);
            }

        } catch (error) {

            transaction.abort();
            reject(error);
            return;
        }

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };

        transaction.onabort = () => {
            reject(
                transaction.error ||
                new Error(
                    'La operación fue cancelada.'
                )
            );
        };
    });
}