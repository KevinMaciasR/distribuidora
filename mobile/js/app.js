import {
    inicializarInventario,
    obtenerInventario,
    calcularTotal,
    configurarApertura
} from './inventario.js';

import {
    TIPOS_MOVIMIENTO,
    entregaCliente,
    retiroCliente,
    entregaRetiro,
    salidaPlanta,
    regresoPlanta,
    trasladoCamiones,
    obtenerMovimientos,
    obtenerViajesAbiertos
} from './movimientos.js';

import {
    crearCliente,
    obtenerClientes
} from './clientes.js';

import {
    obtenerEstadoSync
} from './sincronizacion.js';

import {
    obtener,
    obtenerTodos,
    exportarBaseDatos,
    importarBaseDatos
} from './db.js';

import {
    vendidosHoy,
    vendidosPorFecha,
    vendidosPorRango,
    vendidosPorCliente
} from './reportes.js';

const app = document.getElementById('app');

let paginaActual = 'inicio';


document.addEventListener(
    'DOMContentLoaded',
    iniciar
);


async function iniciar() {

    await inicializarInventario();

    registrarServiceWorker();

    render();
}


function registrarServiceWorker() {

    if ('serviceWorker' in navigator) {

        navigator.serviceWorker
            .register('/sw.js')
            .catch(error => {
                console.error(
                    'Error Service Worker:',
                    error
                );
            });
    }
}


/* =====================================================
   NAVEGACIÓN PRINCIPAL
===================================================== */

async function render() {

    switch (paginaActual) {

        case 'inicio':
            await renderInicio();
            break;

        case 'movimientos':
            await renderMovimientos();
            break;

        case 'clientes':
            await renderClientes();
            break;

        case 'sync':
            await renderSync();
            break;
        case 'reportes':
            await renderReportes();
            break;
        default:
            await renderInicio();
    }
}


/* =====================================================
   INICIO
===================================================== */
async function renderInicio() {

    const inventario =
        await obtenerInventario();

    const sync =
        await obtenerEstadoSync();

    const total =
        calcularTotal(inventario);

    const estadoSync =
        sync.total === 0
            ? `
                <div class="status-bar status-success">
                    🟢 Datos actualizados
                </div>
              `
            : `
                <div class="status-bar status-warning">
                    🟡 Hay ${sync.total} elemento(s) pendiente(s) de sincronización
                </div>
              `;

    app.innerHTML = `

        <header class="app-header">
            <h1>DISTRIBUIDORA</h1>
            <p>Control de cilindros</p>
        </header>


        <main class="main-content">

            ${estadoSync}


            <!-- INVENTARIO -->
            <section class="card">
<section class="card">
    <h2>📊 RESUMEN DE HOY</h2>

    <div class="dashboard-stats">

        <div class="stat-card">
            <span class="stat-label">VENDIDOS HOY</span>
            <strong class="stat-number">
                ${await vendidosHoy()}
            </strong>
        </div>

        <div class="stat-card">
            <span class="stat-label">VACÍOS DISPONIBLES</span>
            <strong class="stat-number">
                ${(inventario.rojo?.vacios || 0) +
        (inventario.blanco?.vacios || 0)
        }
            </strong>
        </div>

    </div>
</section> 
                <div class="card-title">
                    Inventario actual
                </div>


                <div class="inventory-grid">

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Rojo — Llenos
                        </span>

                        <strong class="number">
                            ${inventario.rojo.llenos}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>


                    <div class="inventory-item">

                        <span class="label">
                            🚚 Rojo — Vacíos
                        </span>

                        <strong class="number">
                            ${inventario.rojo.vacios}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>
<button
    class="quick-action"
    id="btnExportarBD"
>
    <span class="icon">📤</span>
    <span>Exportar BD</span>
</button>

<button
    class="quick-action"
    id="btnImportarBD"
>
    <span class="icon">📥</span>
    <span>Cargar BD</span>
</button>

<input
    type="file"
    id="inputImportarBD"
    accept=".json,application/json"
    style="display:none"
>

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Blanco — Llenos
                        </span>

                        <strong class="number">
                            ${inventario.blanco.llenos}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>


                    <div class="inventory-item">

                        <span class="label">
                            🚚 Blanco — Vacíos
                        </span>

                        <strong class="number">
                            ${inventario.blanco.vacios}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>


                    <div
                        class="inventory-item"
                        style="grid-column: span 2;"
                    >

                        <span class="label">
                            👥 Clientes
                        </span>

                        <strong class="number">
                            ${inventario.clientes.pendientes}
                        </strong>

                        <span class="sub">
                            cilindros pendientes de recuperación
                        </span>

                    </div>

                </div>


                <div class="inventory-total">

                    <span>
                        TOTAL EMPRESA
                    </span>

                    <strong>
                        ${total}
                    </strong>

                </div>


                <div
                    class="status-bar status-success"
                    style="margin-top: 12px; margin-bottom: 0;"
                >
                    🟢 INVENTARIO CUADRADO
                </div>

            </section>


            <!-- NUEVO MOVIMIENTO -->
            <button
                class="primary-button"
                id="btnNuevoMovimiento"
            >
                ＋ NUEVO MOVIMIENTO
            </button>


            <!-- ACCIONES RÁPIDAS -->
            <section class="quick-actions">

                <button
                    class="quick-action"
                    data-page="movimientos"
                >
                    <span class="icon">🚚</span>
                    <span>Movimientos</span>
                </button>


                <button
                    class="quick-action"
                    data-page="clientes"
                >
                    <span class="icon">👥</span>
                    <span>Clientes</span>
                </button>


                <button
                    class="quick-action"
                    data-page="inicio"
                >
                    <span class="icon">📦</span>
                    <span>Inventario</span>
                </button>


                <button
                    class="quick-action"
                    id="btnApertura"
                >
                    <span class="icon">⚙️</span>
                    <span>Apertura</span>
                </button>


                <button
                    class="quick-action"
                    data-page="sync"
                >
                    <span class="icon">🔄</span>
                    <span>Sincronizar</span>
                </button>
               <button
    class="quick-action"
    data-page="reportes"
>
    <span class="icon">📊</span>
    <span>Reportes</span>
</button> 

            </section>

        </main>


        ${renderNav('inicio')}
    `;


    // BOTÓN APERTURA
    document
        .getElementById('btnApertura')
        ?.addEventListener(
            'click',
            mostrarApertura
        );


    // BOTÓN NUEVO MOVIMIENTO
    document
        .getElementById('btnNuevoMovimiento')
        .addEventListener(
            'click',
            mostrarTiposMovimiento
        );

    // EXPORTAR BASE DE DATOS
    document
        .getElementById('btnExportarBD')
        ?.addEventListener('click', async () => {
            try {
                const nombre = await exportarBaseDatos();

                alert(
                    `✅ Respaldo creado correctamente.\n\n${nombre}`
                );
            } catch (error) {
                console.error(error);

                alert(
                    `❌ No se pudo exportar la base de datos.\n\n${error.message}`
                );
            }
        });


    // CARGAR BASE DE DATOS
    document
        .getElementById('btnImportarBD')
        ?.addEventListener('click', () => {
            document
                .getElementById('inputImportarBD')
                ?.click();
        });


    // PROCESAR ARCHIVO DE RESPALDO
    document
        .getElementById('inputImportarBD')
        ?.addEventListener('change', async (evento) => {
            const archivo = evento.target.files[0];

            if (!archivo) return;

            const confirmar = confirm(
                '⚠️ ATENCIÓN\n\n' +
                'Cargar este respaldo reemplazará los datos actuales.\n\n' +
                '¿Quieres continuar?'
            );

            if (!confirmar) {
                evento.target.value = '';
                return;
            }

            try {
                await importarBaseDatos(archivo);

                alert(
                    '✅ Base de datos restaurada correctamente.'
                );

                window.location.reload();

            } catch (error) {
                console.error(error);

                alert(
                    `❌ No se pudo cargar el respaldo.\n\n${error.message}`
                );
            }

            evento.target.value = '';
        });



    // NAVEGACIÓN
    registrarNavegacion();
}

/* =====================================================
   LISTA DE MOVIMIENTOS
===================================================== */

async function renderMovimientos() {

    const movimientos =
        await obtenerMovimientos();

    app.innerHTML = `

        <header class="app-header">

            <h1>MOVIMIENTOS</h1>

            <p>Registro operativo</p>

        </header>


        <main class="main-content">

            <button
                class="primary-button"
                id="btnNuevo"
            >
                ＋ NUEVO MOVIMIENTO
            </button>


            <div class="card">

                <div class="card-title">
                    Movimientos recientes
                </div>


                ${movimientos.length === 0

            ? `
                        <div class="empty-state">

                            <div class="icon">
                                📋
                            </div>

                            No hay movimientos registrados.

                        </div>
                      `

            : `
                        <div class="list">

                            ${movimientos
                .slice(0, 30)
                .map(m => {

                    const cantidad = [
                        m.llenos > 0 ? `Llenos: ${m.llenos}` : '',
                        m.vacios > 0 ? `Vacíos: ${m.vacios}` : ''
                    ]
                        .filter(Boolean)
                        .join(' | ');

                    return `

                                        <div class="list-item">

                                            <div class="list-item-top">

                                                <span class="list-item-title">
                                                    ${m.tipo}
                                                </span>

                                                <span class="badge badge-warning">
                                                    ${m.sync_estado}
                                                </span>

                                            </div>


                                            <div class="list-item-sub">

                                                ${new Date(
                        m.fecha_hora
                    ).toLocaleString('es-EC')}

                                            </div>


                                            <div class="list-item-sub">

                                                ${m.id_cliente
                            ? '👤 Cliente'
                            : ''
                        }

${m.tipo === 'REGRESO DE PLANTA'
                            ? '🏭 PLANTA'
                            : m.camion_origen
                                ? '🚚 ' + m.camion_origen
                                : ''
                        }

${m.camion_destino
                            ? ' → ' + m.camion_destino
                            : ''
                        }

${cantidad
                            ? ' | ' + cantidad
                            : ''
                        }

                                            </div>

                                        </div>

                                    `;
                })
                .join('')}

                        </div>
                      `
        }

            </div>

        </main>


        ${renderNav('movimientos')}
    `;


    document
        .getElementById('btnNuevo')
        .addEventListener(
            'click',
            mostrarTiposMovimiento
        );


    registrarNavegacion();
}


/* =====================================================
   SELECCIÓN DE MOVIMIENTO
===================================================== */

function mostrarTiposMovimiento() {

    app.innerHTML = `

        <header class="app-header">

            <h1>NUEVO MOVIMIENTO</h1>

            <p>Selecciona el tipo</p>

        </header>


        <main class="main-content">

            <div class="movement-grid">

                ${botonMovimiento(
        '🚚',
        'ENTREGA A CLIENTE',
        'Entrega cilindros llenos',
        TIPOS_MOVIMIENTO.ENTREGA_CLIENTE
    )}


                ${botonMovimiento(
        '↩️',
        'RETIRO DE CLIENTE',
        'Retira cilindros vacíos',
        TIPOS_MOVIMIENTO.RETIRO_CLIENTE
    )}


                ${botonMovimiento(
        '⇄',
        'ENTREGA + RETIRO',
        'Entrega llenos y recibe vacíos',
        TIPOS_MOVIMIENTO.ENTREGA_RETIRO
    )}


                ${botonMovimiento(
        '🏭',
        'SALIDA A PLANTA',
        'Envía cilindros vacíos a planta',
        TIPOS_MOVIMIENTO.SALIDA_PLANTA
    )}


                ${botonMovimiento(
        '🏭',
        'REGRESO DE PLANTA',
        'Recibe cilindros llenos',
        TIPOS_MOVIMIENTO.REGRESO_PLANTA
    )}


                ${botonMovimiento(
        '🔄',
        'TRASLADO ENTRE CAMIONES',
        'Mueve cilindros entre camiones',
        TIPOS_MOVIMIENTO.TRASLADO
    )}

            </div>


            <button
                class="secondary-button"
                style="margin-top: 15px;"
                id="btnVolver"
            >
                ← Volver
            </button>

        </main>
    `;


    document
        .querySelectorAll('[data-movement]')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => abrirFormularioMovimiento(
                    button.dataset.movement
                )
            );
        });


    document
        .getElementById('btnVolver')
        .addEventListener(
            'click',
            () => {
                paginaActual = 'movimientos';
                render();
            }
        );
}


function botonMovimiento(
    icon,
    titulo,
    descripcion,
    tipo
) {

    return `

        <button
            class="movement-button"
            data-movement="${tipo}"
        >

            <span class="icon">
                ${icon}
            </span>

            <span>

                <strong>
                    ${titulo}
                </strong>

                <small>
                    ${descripcion}
                </small>

            </span>

        </button>
    `;
}


/* =====================================================
   FORMULARIOS
===================================================== */

async function abrirFormularioMovimiento(tipo) {

    switch (tipo) {

        case TIPOS_MOVIMIENTO.ENTREGA_CLIENTE:

            await formularioEntrega();

            break;


        case TIPOS_MOVIMIENTO.RETIRO_CLIENTE:

            await formularioRetiro();

            break;


        case TIPOS_MOVIMIENTO.ENTREGA_RETIRO:

            await formularioEntregaRetiro();

            break;


        case TIPOS_MOVIMIENTO.SALIDA_PLANTA:

            await formularioSalidaPlanta();

            break;


        case TIPOS_MOVIMIENTO.REGRESO_PLANTA:

            await formularioRegresoPlanta();

            break;


        case TIPOS_MOVIMIENTO.TRASLADO:

            await formularioTraslado();

            break;
    }
}


/* =====================================================
   ENTREGA A CLIENTE
===================================================== */

async function formularioEntrega() {

    const clientes =
        await obtenerClientes();


    app.innerHTML = `

        ${cabeceraFormulario(
        '🚚 ENTREGA A CLIENTE'
    )}


        <main class="main-content">

            <form id="formMovimiento">


                ${selectClientes(clientes)}


                <div class="form-group">

                    <label>
                        Camión
                    </label>

                    <select
                        class="form-control"
                        name="camion"
                        required
                    >

                        <option value="ROJO">
                            Camión Rojo
                        </option>

                        <option value="BLANCO">
                            Camión Blanco
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Cilindros llenos
                    </label>

                    <input
                        class="form-control"
                        type="number"
                        name="llenos"
                        min="1"
                        step="1"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>

                </div>


                ${botonesFormulario()}

            </form>

        </main>
    `;


    conectarCancelar();


    document
        .getElementById('formMovimiento')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const form =
                    new FormData(event.target);

                try {

                    await entregaCliente({

                        idCliente:
                            form.get('idCliente'),

                        camion:
                            form.get('camion'),

                        llenos:
                            form.get('llenos'),

                        observacion:
                            form.get('observacion')

                    });


                    mostrarExito(
                        'ENTREGA REGISTRADA'
                    );

                } catch (error) {

                    mostrarError(
                        error.message
                    );
                }
            }
        );
}


/* =====================================================
   RETIRO
===================================================== */

async function formularioRetiro() {

    const clientes =
        await obtenerClientes();


    app.innerHTML = `

        ${cabeceraFormulario(
        '↩️ RETIRO DE CLIENTE'
    )}


        <main class="main-content">

            <form id="formMovimiento">


                ${selectClientes(clientes)}


                <div class="form-group">

                    <label>
                        Camión que recibe
                    </label>

                    <select
                        class="form-control"
                        name="camion"
                        required
                    >

                        <option value="ROJO">
                            Camión Rojo
                        </option>

                        <option value="BLANCO">
                            Camión Blanco
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Cilindros vacíos retirados
                    </label>

                    <input
                        class="form-control"
                        type="number"
                        name="vacios"
                        min="1"
                        step="1"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>

                </div>


                ${botonesFormulario()}

            </form>

        </main>
    `;


    conectarCancelar();


    document
        .getElementById('formMovimiento')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const form =
                    new FormData(event.target);

                try {

                    await retiroCliente({

                        idCliente:
                            form.get('idCliente'),

                        camion:
                            form.get('camion'),

                        vacios:
                            form.get('vacios'),

                        observacion:
                            form.get('observacion')

                    });


                    mostrarExito(
                        'RETIRO REGISTRADO'
                    );

                } catch (error) {

                    mostrarError(
                        error.message
                    );
                }
            }
        );
}


/* =====================================================
   ENTREGA + RETIRO
===================================================== */

async function formularioEntregaRetiro() {

    const clientes =
        await obtenerClientes();


    app.innerHTML = `

        ${cabeceraFormulario(
        '⇄ ENTREGA + RETIRO'
    )}


        <main class="main-content">

            <form id="formMovimiento">


                ${selectClientes(clientes)}


                <div class="form-group">

                    <label>
                        Camión
                    </label>

                    <select
                        class="form-control"
                        name="camion"
                        required
                    >

                        <option value="ROJO">
                            Camión Rojo
                        </option>

                        <option value="BLANCO">
                            Camión Blanco
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Cilindros llenos entregados
                    </label>

                    <input
                        class="form-control"
                        type="number"
                        name="llenos"
                        min="0"
                        step="1"
                        value="0"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Cilindros vacíos recibidos
                    </label>

                    <input
                        class="form-control"
                        type="number"
                        name="vacios"
                        min="0"
                        step="1"
                        value="0"
                        required
                    >

                </div>


                <div
                    class="status-bar status-info"
                    id="previewPendiente"
                >
                    Pendientes del cliente: — 
                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>

                </div>


                ${botonesFormulario()}

            </form>

        </main>
    `;


    conectarCancelar();


    const selectCliente =
        document.querySelector(
            '[name="idCliente"]'
        );

    const inputLlenos =
        document.querySelector(
            '[name="llenos"]'
        );

    const inputVacios =
        document.querySelector(
            '[name="vacios"]'
        );

    async function actualizarPreview() {

        const cliente =
            await obtener(
                'clientes',
                selectCliente.value
            );

        if (!cliente) {
            return;
        }

        const llenos =
            Number(inputLlenos.value) || 0;

        const vacios =
            Number(inputVacios.value) || 0;

        const resultado =
            (cliente.pendientes_actuales || 0)
            + llenos
            - vacios;

        document
            .getElementById(
                'previewPendiente'
            )
            .textContent =
            `Pendientes después: ${resultado}`;
    }


    selectCliente.addEventListener(
        'change',
        actualizarPreview
    );

    inputLlenos.addEventListener(
        'input',
        actualizarPreview
    );

    inputVacios.addEventListener(
        'input',
        actualizarPreview
    );


    document
        .getElementById('formMovimiento')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const form =
                    new FormData(event.target);

                try {

                    await entregaRetiro({

                        idCliente:
                            form.get('idCliente'),

                        camion:
                            form.get('camion'),

                        llenos:
                            form.get('llenos'),

                        vacios:
                            form.get('vacios'),

                        observacion:
                            form.get('observacion')

                    });


                    mostrarExito(
                        'ENTREGA + RETIRO REGISTRADO'
                    );

                } catch (error) {

                    mostrarError(
                        error.message
                    );
                }
            }
        );
}


/* =====================================================
   SALIDA A PLANTA
===================================================== */

async function formularioSalidaPlanta() {

    app.innerHTML = `

        ${cabeceraFormulario(
        '🏭 SALIDA A PLANTA'
    )}


        <main class="main-content">

            <form id="formMovimiento">


                <div class="form-group">

                    <label>
                        Camión
                    </label>

                    <select
                        class="form-control"
                        name="camion"
                        required
                    >

                        <option value="ROJO">
                            Camión Rojo
                        </option>

                        <option value="BLANCO">
                            Camión Blanco
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Cilindros vacíos enviados
                    </label>

                    <input
                        class="form-control"
                        type="number"
                        name="vacios"
                        min="1"
                        step="1"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>

                </div>


                ${botonesFormulario()}

            </form>

        </main>
    `;


    conectarCancelar();


    document
        .getElementById('formMovimiento')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const form =
                    new FormData(event.target);

                try {

                    await salidaPlanta({

                        camion:
                            form.get('camion'),

                        vacios:
                            form.get('vacios'),

                        observacion:
                            form.get('observacion')

                    });


                    mostrarExito(
                        'SALIDA A PLANTA REGISTRADA'
                    );

                } catch (error) {

                    mostrarError(
                        error.message
                    );
                }
            }
        );
}


/* =====================================================
   REGRESO DE PLANTA
===================================================== */

async function formularioRegresoPlanta() {

    const viajes =
        await obtenerViajesAbiertos();


    app.innerHTML = `

        ${cabeceraFormulario(
        '🏭 REGRESO DE PLANTA'
    )}


        <main class="main-content">

            <form id="formMovimiento">


                <div class="form-group">

                    <label>
                        Viaje abierto
                    </label>

                    <select
                        class="form-control"
                        name="idViaje"
                        required
                    >

                        <option value="">
                            Selecciona el viaje
                        </option>

                        ${viajes
            .map(viaje => `
                                    <option
                                        value="${viaje.id_viaje}"
                                    >
                                        ${viaje.camion}
                                        — enviados:
                                        ${viaje.vacios_enviados}
                                        — ${new Date(
                viaje.fecha_salida
            ).toLocaleString('es-EC')}
                                    </option>
                                `)
            .join('')
        }

                    </select>

                </div>


                ${viajes.length === 0

            ? `
                        <div class="status-bar status-warning">
                            🟡 No hay viajes a planta abiertos.
                        </div>
                      `
            : ''
        }


                <div class="form-group">

                    <label>
                        Cilindros llenos recibidos
                    </label>

                    <input
                        class="form-control"
                        type="number"
                        name="llenos"
                        min="1"
                        step="1"
                        required
                        ${viajes.length === 0 ? 'disabled' : ''}
                    >

                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>

                </div>


                ${botonesFormulario()}

            </form>

        </main>
    `;


    conectarCancelar();


    document
        .getElementById('formMovimiento')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const form =
                    new FormData(event.target);

                try {

                    await regresoPlanta({

                        idViaje:
                            form.get('idViaje'),

                        llenos:
                            form.get('llenos'),

                        observacion:
                            form.get('observacion')

                    });


                    mostrarExito(
                        'REGRESO DE PLANTA REGISTRADO'
                    );

                } catch (error) {

                    mostrarError(
                        error.message
                    );
                }
            }
        );
}


/* =====================================================
   TRASLADO
===================================================== */

async function formularioTraslado() {

    app.innerHTML = `

        ${cabeceraFormulario(
        '🔄 TRASLADO ENTRE CAMIONES'
    )}


        <main class="main-content">

            <form id="formMovimiento">


                <div class="form-group">

                    <label>
                        Camión origen
                    </label>

                    <select
                        class="form-control"
                        name="origen"
                        required
                    >

                        <option value="ROJO">
                            Camión Rojo
                        </option>

                        <option value="BLANCO">
                            Camión Blanco
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Camión destino
                    </label>

                    <select
                        class="form-control"
                        name="destino"
                        required
                    >

                        <option value="BLANCO">
                            Camión Blanco
                        </option>

                        <option value="ROJO">
                            Camión Rojo
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Tipo de cilindro
                    </label>

                    <select
                        class="form-control"
                        name="tipoCilindro"
                        required
                    >

                        <option value="LLENOS">
                            Llenos
                        </option>

                        <option value="VACIOS">
                            Vacíos
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Cantidad
                    </label>

                    <input
                        class="form-control"
                        type="number"
                        name="cantidad"
                        min="1"
                        step="1"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>

                </div>


                ${botonesFormulario()}

            </form>

        </main>
    `;


    conectarCancelar();


    document
        .getElementById('formMovimiento')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const form =
                    new FormData(event.target);

                try {

                    await trasladoCamiones({

                        origen:
                            form.get('origen'),

                        destino:
                            form.get('destino'),

                        tipoCilindro:
                            form.get('tipoCilindro'),

                        cantidad:
                            form.get('cantidad'),

                        observacion:
                            form.get('observacion')

                    });


                    mostrarExito(
                        'TRASLADO REGISTRADO'
                    );

                } catch (error) {

                    mostrarError(
                        error.message
                    );
                }
            }
        );
}


/* =====================================================
   CLIENTES
===================================================== */

async function renderClientes() {

    const clientes =
        await obtenerClientes();

    app.innerHTML = `

        <header class="app-header">

            <h1>CLIENTES</h1>

            <p>Clientes activos</p>

        </header>


        <main class="main-content">

            <button
                class="primary-button"
                id="btnNuevoCliente"
            >
                ＋ NUEVO CLIENTE
            </button>


            <div class="card">

                <div class="card-title">
                    Clientes registrados
                </div>


                ${clientes.length === 0

            ? `
                        <div class="empty-state">

                            <div class="icon">
                                👥
                            </div>

                            Todavía no hay clientes.

                        </div>
                      `

            : `
                        <div class="list">

                            ${clientes
                .map(cliente => `

                                    <div class="list-item">

                                        <div class="list-item-top">

                                            <span class="list-item-title">
                                                ${cliente.nombre}
                                            </span>

                                            <span class="badge badge-success">
                                                ${cliente.pendientes_actuales}
                                            </span>

                                        </div>

                                        <div class="list-item-sub">
                                            📦 ${cliente.pendientes_actuales}
                                            pendientes
                                        </div>

                                        ${cliente.telefono
                        ? `
                                                    <div class="list-item-sub">
                                                        📞 ${cliente.telefono}
                                                    </div>
                                                  `
                        : ''
                    }

                                    </div>

                                `)
                .join('')}

                        </div>
                      `
        }

            </div>

        </main>


        ${renderNav('clientes')}
    `;


    document
        .getElementById('btnNuevoCliente')
        .addEventListener(
            'click',
            formularioCliente
        );


    registrarNavegacion();
}


/* =====================================================
   NUEVO CLIENTE
===================================================== */

function formularioCliente() {

    app.innerHTML = `

        ${cabeceraFormulario(
        '👤 NUEVO CLIENTE'
    )}


        <main class="main-content">

            <form id="formCliente">


                <div class="form-group">

                    <label>
                        Nombre *
                    </label>

                    <input
                        class="form-control"
                        name="nombre"
                        required
                        autofocus
                    >

                </div>


                <div class="form-group">

                    <label>
                        Teléfono
                    </label>

                    <input
                        class="form-control"
                        name="telefono"
                        type="tel"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Dirección
                    </label>

                    <input
                        class="form-control"
                        name="direccion"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Sector
                    </label>

                    <input
                        class="form-control"
                        name="sector"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                    ></textarea>

                </div>


                <button
                    class="primary-button"
                    type="submit"
                >
                    GUARDAR CLIENTE
                </button>


                <button
                    class="secondary-button"
                    type="button"
                    id="btnCancelar"
                >
                    Cancelar
                </button>

            </form>

        </main>
    `;


    conectarCancelar();


    document
        .getElementById('formCliente')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const form =
                    new FormData(event.target);

                try {

                    await crearCliente({

                        nombre:
                            form.get('nombre'),

                        telefono:
                            form.get('telefono'),

                        direccion:
                            form.get('direccion'),

                        sector:
                            form.get('sector'),

                        observacion:
                            form.get('observacion')
                    });


                    mostrarExito(
                        'CLIENTE REGISTRADO'
                    );

                } catch (error) {

                    mostrarError(
                        error.message
                    );
                }
            }
        );
}


/* =====================================================
   SINCRONIZACIÓN
===================================================== */

async function renderSync() {

    const estado =
        await obtenerEstadoSync();

    app.innerHTML = `

        <header class="app-header">

            <h1>SINCRONIZACIÓN</h1>

            <p>
                Conexión con el PC
            </p>

        </header>


        <main class="main-content">

            <div class="card">

                <div class="card-title">
                    Estado
                </div>


                ${estado.total === 0

            ? `
                        <div class="status-bar status-success">
                            🟢 No hay elementos pendientes
                        </div>
                      `

            : `
                        <div class="status-bar status-warning">
                            🟡 ${estado.total} elemento(s) pendiente(s)
                        </div>
                      `
        }


                <div class="inventory-grid">

                    <div class="inventory-item">

                        <span class="label">
                            Movimientos
                        </span>

                        <strong class="number">
                            ${estado.movimientos}
                        </strong>

                    </div>


                    <div class="inventory-item">

                        <span class="label">
                            Clientes
                        </span>

                        <strong class="number">
                            ${estado.clientes}
                        </strong>

                    </div>

                </div>

            </div>


            <button
                class="primary-button"
                id="btnSync"
            >
                🔄 SINCRONIZAR
            </button>


            <button
                class="secondary-button"
                id="btnActualizar"
            >
                ⬇️ ACTUALIZAR DATOS
            </button>

        </main>


        ${renderNav('sync')}
    `;


    document
        .getElementById('btnSync')
        .addEventListener(
            'click',
            () => alert(
                'La conexión con el PC se implementará después de terminar el motor local.'
            )
        );


    document
        .getElementById('btnActualizar')
        .addEventListener(
            'click',
            () => alert(
                'La actualización PC → móvil se implementará después de la sincronización.'
            )
        );


    registrarNavegacion();
}


/* =====================================================
   ELEMENTOS DE FORMULARIO
===================================================== */

function cabeceraFormulario(titulo) {

    return `

        <header class="app-header">

            <h1>${titulo}</h1>

            <p>
                Registro de operación
            </p>

        </header>
    `;
}


function botonesFormulario() {

    return `

        <button
            class="primary-button"
            type="submit"
        >
            ✓ REGISTRAR MOVIMIENTO
        </button>


        <button
            class="secondary-button"
            type="button"
            id="btnCancelar"
        >
            Cancelar
        </button>
    `;
}


function selectClientes(clientes) {

    return `

        <div class="form-group">

            <label>
                Cliente
            </label>

            <select
                class="form-control"
                name="idCliente"
                required
            >

                <option value="">
                    Selecciona un cliente
                </option>

                ${clientes
            .map(cliente => `
                            <option
                                value="${cliente.id_cliente}"
                            >
                                ${cliente.nombre}
                                — pendientes:
                                ${cliente.pendientes_actuales}
                            </option>
                        `)
            .join('')
        }

            </select>

            ${clientes.length === 0

            ? `
                    <small
                        style="
                            display:block;
                            margin-top:7px;
                            color:#b91c1c;
                        "
                    >
                        Primero debes registrar un cliente.
                    </small>
                  `
            : ''
        }

        </div>
    `;
}


function conectarCancelar() {

    const boton =
        document.getElementById(
            'btnCancelar'
        );

    if (!boton) {
        return;
    }

    boton.addEventListener(
        'click',
        () => {
            mostrarTiposMovimiento();
        }
    );
}


/* =====================================================
   RESULTADOS
===================================================== */

function mostrarExito(mensaje) {

    app.innerHTML = `

        <main
            class="main-content"
            style="padding-top:50px;"
        >

            <div class="card">

                <div
                    style="
                        text-align:center;
                        font-size:55px;
                        margin-bottom:15px;
                    "
                >
                    ✓
                </div>


                <h2
                    style="
                        text-align:center;
                        margin-bottom:10px;
                    "
                >
                    ${mensaje}
                </h2>


                <div
                    class="status-bar status-warning"
                    style="
                        text-align:center;
                        margin-top:15px;
                    "
                >
                    ⏳ Pendiente de sincronización
                </div>


                <button
                    class="primary-button"
                    id="btnContinuar"
                    style="margin-top:10px;"
                >
                    CONTINUAR
                </button>

            </div>

        </main>
    `;


    document
        .getElementById('btnContinuar')
        .addEventListener(
            'click',
            () => {

                paginaActual =
                    'inicio';

                render();
            }
        );
}


function mostrarError(mensaje) {

    alert(
        `⚠️ No se puede registrar\n\n${mensaje}`
    );
}


/* =====================================================
   NAVEGACIÓN INFERIOR
===================================================== */

function renderNav(activo) {

    return `

        <nav class="bottom-nav">

            <button
                class="${activo === 'inicio' ? 'active' : ''}"
                data-page="inicio"
            >

                <span class="icon">
                    🏠
                </span>

                <span>
                    Inicio
                </span>

            </button>


            <button
                class="${activo === 'movimientos' ? 'active' : ''}"
                data-page="movimientos"
            >

                <span class="icon">
                    🚚
                </span>

                <span>
                    Movim.
                </span>

            </button>


            <button
                class="${activo === 'clientes' ? 'active' : ''}"
                data-page="clientes"
            >

                <span class="icon">
                    👥
                </span>

                <span>
                    Clientes
                </span>

            </button>


            <button
                class="${activo === 'sync' ? 'active' : ''}"
                data-page="sync"
            >

                <span class="icon">
                    🔄
                </span>

                <span>
                    Sync
                </span>

            </button>

        </nav>
    `;
}


function registrarNavegacion() {

    document
        .querySelectorAll('[data-page]')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    paginaActual =
                        button.dataset.page;

                    render();
                }
            );
        });
}
async function mostrarApertura() {

    app.innerHTML = `

        <header class="app-header">

            <h1>APERTURA</h1>

            <p>Inventario inicial</p>

        </header>


        <main class="main-content">

            <div class="card">

                <p class="form-help">
                    Esta opción establece el inventario inicial.
                    Solo puede hacerse antes de registrar movimientos.
                </p>


                <form id="formApertura">


                    <h3>🔴 Camión Rojo</h3>


                    <div class="form-group">

                        <label>Llenos</label>

                        <input
                            type="number"
                            id="rojoLlenos"
                            min="0"
                            value="150"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>Vacíos</label>

                        <input
                            type="number"
                            id="rojoVacios"
                            min="0"
                            value="30"
                            required
                        >

                    </div>


                    <h3>⚪ Camión Blanco</h3>


                    <div class="form-group">

                        <label>Llenos</label>

                        <input
                            type="number"
                            id="blancoLlenos"
                            min="0"
                            value="100"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>Vacíos</label>

                        <input
                            type="number"
                            id="blancoVacios"
                            min="0"
                            value="50"
                            required
                        >

                    </div>


                    <h3>👥 Clientes</h3>


                    <div class="form-group">

                        <label>Pendientes</label>

                        <input
                            type="number"
                            id="clientesPendientes"
                            min="0"
                            value="0"
                            required
                        >

                    </div>


                    <button
                        class="primary-button"
                        type="submit"
                    >
                        GUARDAR APERTURA
                    </button>


                    <button
                        class="secondary-button"
                        type="button"
                        id="btnCancelarApertura"
                    >
                        CANCELAR
                    </button>


                </form>

            </div>

        </main>


        ${renderNav('inicio')}

    `;


    document
        .getElementById('formApertura')
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();


                try {

                    await configurarApertura({

                        rojoLlenos:
                            Number(
                                document.getElementById(
                                    'rojoLlenos'
                                ).value
                            ),

                        rojoVacios:
                            Number(
                                document.getElementById(
                                    'rojoVacios'
                                ).value
                            ),

                        blancoLlenos:
                            Number(
                                document.getElementById(
                                    'blancoLlenos'
                                ).value
                            ),

                        blancoVacios:
                            Number(
                                document.getElementById(
                                    'blancoVacios'
                                ).value
                            ),

                        clientesPendientes:
                            Number(
                                document.getElementById(
                                    'clientesPendientes'
                                ).value
                            )

                    });


                    alert(
                        'Apertura configurada correctamente.'
                    );


                    await renderInicio();


                } catch (error) {

                    alert(error.message);

                }

            }
        );


    document
        .getElementById('btnCancelarApertura')
        ?.addEventListener(
            'click',
            renderInicio
        );


    registrarNavegacion();
}
/* =====================================================
   REPORTES
===================================================== */

async function renderReportes() {
    const vendidos = await vendidosHoy();
    const clientes = await vendidosPorCliente();
    const listaClientes = await obtenerTodos('clientes');

    const nombresClientes = Object.fromEntries(
        listaClientes.map(cliente => [
            cliente.id_cliente,
            cliente.nombre
        ])
    );

    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="page">

            <header class="page-header">
                <h1>📊 Reportes</h1>
                <p>Control de cilindros vendidos</p>
            </header>

            <section class="card">
                <h2>VENDIDOS HOY</h2>

                <div class="report-number">
                    ${vendidos}
                </div>

                <p>cilindros entregados</p>
            </section>

            <section class="card">
                <h2>VENDIDOS POR FECHA</h2>

                <input
                    type="date"
                    id="fechaReporte"
                >

                <button
                    class="primary-button"
                    id="btnFechaReporte"
                >
                    Consultar
                </button>

                <div id="resultadoFecha"></div>
            </section>

            <section class="card">
                <h2>VENDIDOS POR RANGO</h2>

                <label>Desde</label>

                <input
                    type="date"
                    id="fechaInicio"
                >

                <label>Hasta</label>

                <input
                    type="date"
                    id="fechaFin"
                >

                <button
                    class="primary-button"
                    id="btnRangoReporte"
                >
                    Consultar rango
                </button>

                <div id="resultadoRango"></div>
            </section>

            <section class="card">

                <h2>VENDIDOS POR CLIENTE</h2>

                ${
                    Object.keys(clientes).length === 0
                        ? '<p>No hay ventas registradas.</p>'
                        : `
                            <div class="report-list">

                                ${
                                    Object.entries(clientes)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([idCliente, cantidad]) => `
                                            <div class="report-row">

                                                <span>
                                                    ${
                                                        nombresClientes[idCliente]
                                                        || idCliente
                                                    }
                                                </span>

                                                <strong>
                                                    ${cantidad}
                                                </strong>

                                            </div>
                                        `)
                                        .join('')
                                }

                            </div>
                        `
                }

            </section>

            ${renderNav('reportes')}

        </div>
    `;

    document
        .getElementById('btnFechaReporte')
        .addEventListener('click', async () => {

            const fecha =
                document.getElementById('fechaReporte').value;

            if (!fecha) {
                alert('Selecciona una fecha.');
                return;
            }

            const cantidad =
                await vendidosPorFecha(fecha);

            document.getElementById(
                'resultadoFecha'
            ).innerHTML = `
                <div class="report-result">
                    ${cantidad} cilindros vendidos
                </div>
            `;
        });

    document
        .getElementById('btnRangoReporte')
        .addEventListener('click', async () => {

            const inicio =
                document.getElementById('fechaInicio').value;

            const fin =
                document.getElementById('fechaFin').value;

            if (!inicio || !fin) {
                alert('Selecciona las dos fechas.');
                return;
            }

            if (inicio > fin) {
                alert(
                    'La fecha inicial no puede ser mayor que la final.'
                );
                return;
            }

            const cantidad =
                await vendidosPorRango(inicio, fin);

            document.getElementById(
                'resultadoRango'
            ).innerHTML = `
                <div class="report-result">
                    ${cantidad} cilindros vendidos
                </div>
            `;
        });

    registrarNavegacion();
}document
    .getElementById('btnExportarBD')
    ?.addEventListener('click', async () => {

        try {

            const nombre =
                await exportarBaseDatos();

            alert(
                `✅ Respaldo creado correctamente.\n\n${nombre}`
            );

        } catch (error) {

            console.error(error);

            alert(
                `❌ No se pudo exportar la base de datos.\n\n${error.message}`
            );
        }
    });