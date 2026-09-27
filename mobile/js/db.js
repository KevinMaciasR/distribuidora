const DB_NAME = 'distribuidora_mobile';
const DB_VERSION = 1;

let dbPromise = null;

export function abrirDB() {

    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {

            const db = event.target.result;

            if (!db.objectStoreNames.contains('configuracion')) {
                db.createObjectStore('configuracion', {
                    keyPath: 'id'
                });
            }

            if (!db.objectStoreNames.contains('clientes')) {
                const store = db.createObjectStore('clientes', {
                    keyPath: 'id_cliente'
                });

                store.createIndex('estado', 'estado', {
                    unique: false
                });

                store.createIndex('nombre', 'nombre', {
                    unique: false
                });
            }

            if (!db.objectStoreNames.contains('inventario')) {
                db.createObjectStore('inventario', {
                    keyPath: 'ubicacion'
                });
            }

            if (!db.objectStoreNames.contains('movimientos')) {

                const store = db.createObjectStore('movimientos', {
                    keyPath: 'id_movimiento'
                });

                store.createIndex('fecha_hora', 'fecha_hora', {
                    unique: false
                });

                store.createIndex('tipo', 'tipo', {
                    unique: false
                });

                store.createIndex('sync_estado', 'sync_estado', {
                    unique: false
                });

                store.createIndex('estado', 'estado', {
                    unique: false
                });
            }

            if (!db.objectStoreNames.contains('viajes_planta')) {

                const store = db.createObjectStore('viajes_planta', {
                    keyPath: 'id_viaje'
                });

                store.createIndex('estado', 'estado', {
                    unique: false
                });
            }

            if (!db.objectStoreNames.contains('sincronizacion')) {
                db.createObjectStore('sincronizacion', {
                    keyPath: 'id'
                });
            }
        };

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });

    return dbPromise;
}


export async function guardar(storeName, data) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(storeName, 'readwrite');

        transaction.objectStore(storeName).put(data);

        transaction.oncomplete = () => resolve(data);
        transaction.onerror = () => reject(transaction.error);
    });
}


export async function obtener(storeName, key) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(storeName, 'readonly');

        const request = transaction
            .objectStore(storeName)
            .get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


export async function obtenerTodos(storeName) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(storeName, 'readonly');

        const request = transaction
            .objectStore(storeName)
            .getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


export async function eliminar(storeName, key) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(storeName, 'readwrite');

        transaction.objectStore(storeName).delete(key);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}


export async function contar(storeName) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(storeName, 'readonly');

        const request = transaction
            .objectStore(storeName)
            .count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
// ================================
// RESPALDO DE BASE DE DATOS
// ================================

export async function exportarBaseDatos() {
    const stores = [
        'configuracion',
        'clientes',
        'inventario',
        'movimientos',
        'viajes_planta',
        'sincronizacion'
    ];

    const respaldo = {
        version: 1,
        fecha_exportacion: new Date().toISOString(),
        base_datos: DB_NAME,
        datos: {}
    };

    for (const store of stores) {
        respaldo.datos[store] = await obtenerTodos(store);
    }

    const contenido = JSON.stringify(
        respaldo,
        null,
        2
    );

    const blob = new Blob(
        [contenido],
        {
            type: 'application/json'
        }
    );

    const url = URL.createObjectURL(blob);

    const fecha = new Date();

    const nombre =
        `respaldo_distribuidora_${fecha.getFullYear()}-` +
        `${String(fecha.getMonth() + 1).padStart(2, '0')}-` +
        `${String(fecha.getDate()).padStart(2, '0')}_` +
        `${String(fecha.getHours()).padStart(2, '0')}-` +
        `${String(fecha.getMinutes()).padStart(2, '0')}.json`;

    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombre;

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

    return nombre;
}


export async function importarBaseDatos(archivo) {
    if (!archivo) {
        throw new Error('No se seleccionó ningún archivo.');
    }

    if (
        archivo.type !== 'application/json' &&
        !archivo.name.toLowerCase().endsWith('.json')
    ) {
        throw new Error(
            'El archivo seleccionado no es un respaldo JSON válido.'
        );
    }

    const texto = await archivo.text();

    let respaldo;

    try {
        respaldo = JSON.parse(texto);
    } catch (error) {
        throw new Error(
            'El archivo de respaldo no contiene un JSON válido.'
        );
    }

    if (
        !respaldo ||
        !respaldo.datos ||
        typeof respaldo.datos !== 'object'
    ) {
        throw new Error(
            'El archivo no tiene una estructura de respaldo válida.'
        );
    }

    const stores = [
        'configuracion',
        'clientes',
        'inventario',
        'movimientos',
        'viajes_planta',
        'sincronizacion'
    ];

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            stores,
            'readwrite'
        );

        transaction.oncomplete = () => {
            resolve(true);
        };

        transaction.onerror = () => {
            reject(
                new Error(
                    'No se pudo restaurar la base de datos.'
                )
            );
        };

        transaction.onabort = () => {
            reject(
                new Error(
                    'La restauración de la base de datos fue cancelada.'
                )
            );
        };

        try {

            for (const store of stores) {

                const objectStore =
                    transaction.objectStore(store);

                objectStore.clear();

                const registros =
                    respaldo.datos[store];

                if (!Array.isArray(registros)) {
                    continue;
                }

                for (const registro of registros) {
                    objectStore.put(registro);
                }
            }

        } catch (error) {

            transaction.abort();

            reject(error);
        }
    });
}