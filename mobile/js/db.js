import { Capacitor, registerPlugin } from '@capacitor/core';

const Respaldo = registerPlugin('Respaldo');
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
/* =========================================
   ACTUALIZAR CLIENTE E INVENTARIO
   EN UNA SOLA TRANSACCIÓN
========================================= */

export async function guardarClienteEInventario(cliente, inventario) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            ['clientes', 'inventario'],
            'readwrite'
        );

        transaction.objectStore('clientes').put(cliente);
        transaction.objectStore('inventario').put(inventario);

        transaction.oncomplete = () => {
            resolve({ cliente, inventario });
        };

        transaction.onerror = () => {
            reject(
                transaction.error ||
                new Error('No se pudieron guardar los cambios.')
            );
        };

        transaction.onabort = () => {
            reject(
                transaction.error ||
                new Error('La operación fue cancelada.')
            );
        };
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
export async function guardarInventarioYMovimiento(inventario, movimiento) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            ['inventario', 'movimientos'],
            'readwrite'
        );

        transaction.objectStore('inventario').put(inventario);
        transaction.objectStore('movimientos').put(movimiento);

        transaction.oncomplete = () => {
            resolve({ inventario, movimiento });
        };

        transaction.onerror = () => {
            reject(
                transaction.error ||
                new Error('No se pudo guardar el cambiazo.')
            );
        };

        transaction.onabort = () => {
            reject(
                transaction.error ||
                new Error('La operación fue cancelada.')
            );
        };
    });
}

export async function ejecutarTransaccionAtomica(nombresStores, procesar) {
    if (!Array.isArray(nombresStores) || nombresStores.length === 0) {
        throw new Error('Debes indicar al menos un almacén.');
    }

    if (typeof procesar !== 'function') {
        throw new Error('La función de procesamiento no es válida.');
    }

    const db = await abrirDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(nombresStores, 'readwrite');
        const datos = {};

        let pendientes = nombresStores.length;
        let resultado;
        let errorControlado = null;

        for (const nombre of nombresStores) {
            const solicitud = tx.objectStore(nombre).getAll();

            solicitud.onsuccess = () => {
                datos[nombre] = solicitud.result;
                pendientes--;

                if (pendientes === 0) {
                    try {
                        // Esta función debe ser síncrona.
                        const plan = procesar(datos);

                        if (!plan || typeof plan !== 'object') {
                            throw new Error('El plan de cambios no es válido.');
                        }

                        resultado = plan.resultado;

                        for (const [nombreStore, registros] of Object.entries(plan.puts || {})) {
                            if (!nombresStores.includes(nombreStore)) {
                                throw new Error(`Almacén no incluido en la transacción: ${nombreStore}`);
                            }

                            for (const registro of registros) {
                                tx.objectStore(nombreStore).put(registro);
                            }
                        }

                        for (const [nombreStore, claves] of Object.entries(plan.deletes || {})) {
                            if (!nombresStores.includes(nombreStore)) {
                                throw new Error(`Almacén no incluido en la transacción: ${nombreStore}`);
                            }

                            for (const clave of claves) {
                                tx.objectStore(nombreStore).delete(clave);
                            }
                        }
                    } catch (error) {
                        errorControlado = error;
                        tx.abort();
                    }
                }
            };

            solicitud.onerror = () => {
                errorControlado = solicitud.error;
                tx.abort();
            };
        }

        tx.oncomplete = () => resolve(resultado);

        tx.onabort = () => {
            reject(errorControlado || tx.error || new Error('La transacción fue cancelada.'));
        };

        tx.onerror = () => {
            reject(errorControlado || tx.error || new Error('Error en la transacción.'));
        };
    });
}
/* =========================================
   RESPALDO Y RESTAURACIÓN DE BASE DE DATOS
========================================= */

function obtenerNombreRespaldo() {
    const fecha = new Date();

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minuto = String(fecha.getMinutes()).padStart(2, '0');
    const segundo = String(fecha.getSeconds()).padStart(2, '0');

    return `respaldo_distribuidora_${año}-${mes}-${dia}_${hora}-${minuto}-${segundo}.json`;
}


/* =========================================
   OBTENER UNA COPIA CONSISTENTE DE TODAS
   LAS TABLAS DE INDEXEDDB
========================================= */

async function obtenerDatosCompletos() {
    const db = await abrirDB();

    const stores = Array.from(db.objectStoreNames);

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(stores, 'readonly');

        const datos = {};
        let errorLectura = null;

        for (const nombreStore of stores) {
            const request = transaction
                .objectStore(nombreStore)
                .getAll();

            request.onsuccess = () => {
                datos[nombreStore] = request.result;
            };

            request.onerror = () => {
                errorLectura = request.error;
                transaction.abort();
            };
        }

        transaction.oncomplete = () => {
            resolve({
                stores,
                datos
            });
        };

        transaction.onabort = () => {
            reject(
                errorLectura ||
                transaction.error ||
                new Error('No se pudieron leer todos los datos.')
            );
        };

        transaction.onerror = () => {
            reject(
                transaction.error ||
                new Error('Error al leer la base de datos.')
            );
        };
    });
}


/* =========================================
   EXPORTAR BASE DE DATOS
========================================= */

export async function exportarBaseDatos() {

    const copia = await obtenerDatosCompletos();

    const respaldo = {
        formato: 'RESPALDO_DISTRIBUIDORA',
        version: 2,
        fecha_exportacion: new Date().toISOString(),
        base_datos: DB_NAME,
        stores: copia.stores,
        datos: copia.datos
    };

    const contenido = JSON.stringify(respaldo, null, 2);
    const nombre = obtenerNombreRespaldo();

    // ANDROID / CAPACITOR
    if (Capacitor.isNativePlatform()) {

        await Respaldo.guardarArchivo({
            nombre,
            contenido
        });

        return nombre;
    }

    // NAVEGADOR
    const blob = new Blob(
        [contenido],
        { type: 'application/json;charset=utf-8' }
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombre;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    // No revocar inmediatamente: algunos navegadores
    // todavía necesitan la URL para completar la descarga.
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 60000);

    return nombre;
}


/* =========================================
   VALIDAR RESPALDO ANTES DE RESTAURAR
========================================= */

function validarRespaldo(respaldo, storesActuales) {

    if (!respaldo || typeof respaldo !== 'object') {
        throw new Error('El respaldo está vacío o no es válido.');
    }

    if (![1, 2].includes(respaldo.version)) {
        throw new Error('Versión de respaldo no compatible.');
    }

    if (respaldo.base_datos !== DB_NAME) {
        throw new Error(
            'El respaldo pertenece a otra base de datos.'
        );
    }

    if (
        !respaldo.datos ||
        typeof respaldo.datos !== 'object' ||
        Array.isArray(respaldo.datos)
    ) {
        throw new Error('La estructura de datos no es válida.');
    }

    // No restaurar si faltan tablas actuales.
    for (const nombreStore of storesActuales) {

        if (!Array.isArray(respaldo.datos[nombreStore])) {
            throw new Error(
                `El respaldo está incompleto. Falta la tabla: ${nombreStore}`
            );
        }
    }

    // No aceptar tablas desconocidas.
    for (const nombreStore of Object.keys(respaldo.datos)) {

        if (!storesActuales.includes(nombreStore)) {
            throw new Error(
                `El respaldo contiene una tabla desconocida: ${nombreStore}`
            );
        }
    }

    // Si el respaldo declara sus tablas, deben coincidir.
    if (Array.isArray(respaldo.stores)) {

        const declaradas = [...respaldo.stores].sort();
        const actuales = [...storesActuales].sort();

        if (JSON.stringify(declaradas) !== JSON.stringify(actuales)) {
            throw new Error(
                'La estructura del respaldo no coincide con la aplicación.'
            );
        }
    }

    // Comprobar que todos los registros sean objetos.
    for (const nombreStore of storesActuales) {

        for (const registro of respaldo.datos[nombreStore]) {

            if (
                !registro ||
                typeof registro !== 'object' ||
                Array.isArray(registro)
            ) {
                throw new Error(
                    `Hay un registro inválido en ${nombreStore}.`
                );
            }
        }
    }
}


/* =========================================
   IMPORTAR / RESTAURAR BASE DE DATOS
========================================= */

export async function importarBaseDatos(archivo) {

    if (!archivo) {
        throw new Error('No se seleccionó ningún archivo.');
    }

    if (
        !archivo.name ||
        !archivo.name.toLowerCase().endsWith('.json')
    ) {
        throw new Error('Selecciona un archivo JSON.');
    }

    const texto = await archivo.text();

    let respaldo;

    try {
        respaldo = JSON.parse(texto);
    } catch {
        throw new Error('El archivo no contiene un JSON válido.');
    }

    const db = await abrirDB();

    const stores = Array.from(db.objectStoreNames);

    // Validar todo antes de borrar o modificar datos.
    validarRespaldo(respaldo, stores);

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            stores,
            'readwrite'
        );

        let errorRestauracion = null;

        transaction.oncomplete = () => {
            resolve(true);
        };

        transaction.onerror = () => {
            reject(
                errorRestauracion ||
                transaction.error ||
                new Error('Error durante la restauración.')
            );
        };

        transaction.onabort = () => {
            reject(
                errorRestauracion ||
                transaction.error ||
                new Error('La restauración fue cancelada.')
            );
        };

        try {

            for (const nombreStore of stores) {

                const objectStore =
                    transaction.objectStore(nombreStore);

                objectStore.clear();

                for (const registro of respaldo.datos[nombreStore]) {
                    objectStore.put(registro);
                }
            }

        } catch (error) {

            errorRestauracion = error;

            try {
                transaction.abort();
            } catch {
                reject(error);
            }
        }
    });
}
export async function registrarOperacionInventario(tipo, datos = {}) {
    const db = await abrirDB();

    const movimiento = {
        id_movimiento: crypto.randomUUID(),
        fecha_hora: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tipo,
        estado: 'ACTIVO',
        sync_estado: 'PENDIENTE',
        dispositivo: 'MOVIL',
        ...datos
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction('movimientos', 'readwrite');
        tx.objectStore('movimientos').put(movimiento);

        tx.oncomplete = () => resolve(movimiento);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}