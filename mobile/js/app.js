import {
    inicializarInventario,
    obtenerInventario,
    calcularTotal,
    configurarApertura,
    agregarSinAsignar,
    retirarSinAsignar,
    asignarACamion
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
    obtenerClientes,
    asignarPendienteInicial,
    obtenerPendientesInicialesSinAsignar,
    asignarPendientesIniciales
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
    obtenerInventarioReporte,
    vendidosPorClienteRango,
    obtenerVentasDetallePorFecha,
    obtenerViajesPlantaPorRango
} from './reportes.js';
import '../css/app.css';
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
        case 'inventario':
            await renderInventario();
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

    const vendidos =
        await vendidosHoy();

    const vaciosDisponibles =
        (inventario.rojo?.vacios || 0) +
        (inventario.blanco?.vacios || 0);


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

        <!-- =========================================
             ENCABEZADO
        ========================================== -->

        <header class="app-header">

            <h1>DISTRIBUIDORA</h1>

            <p>
                Control de cilindros
            </p>

        </header>


        <main class="main-content">


            <!-- =====================================
                 SINCRONIZACIÓN
            ====================================== -->

            ${estadoSync}


            <!-- =====================================
                 RESUMEN DE HOY
            ====================================== -->

            <section class="section">

                <div class="section-header">

                    <div>

                        <div class="section-title">
                            📊 RESUMEN DE HOY
                        </div>

                        <div class="section-subtitle">
                            Resumen de la operación del día
                        </div>

                    </div>

                </div>


                <div class="summary-grid">


                    <div class="summary-card">

                        <span class="label">
                            VENDIDOS HOY
                        </span>

                        <strong class="number">
                            ${vendidos}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span class="label">
                            VACÍOS DISPONIBLES
                        </span>

                        <strong class="number">
                            ${vaciosDisponibles}
                        </strong>

                    </div>


                </div>

            </section>


            <!-- =====================================
                 INVENTARIO ACTUAL
            ====================================== -->

            <section class="card">

                <div class="section-header">

                    <div>

                        <div class="card-title">
                            📦 Inventario actual
                        </div>

                        <div class="section-subtitle">
                            Cilindros actualmente registrados
                        </div>

                    </div>

                </div>


                <div class="inventory-grid">


                    <!-- ROJO LLENOS -->

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Rojo — Llenos
                        </span>

                        <strong class="number">
                            ${inventario.rojo?.llenos || 0}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>


                    <!-- ROJO VACÍOS -->

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Rojo — Vacíos
                        </span>

                        <strong class="number">
                            ${inventario.rojo?.vacios || 0}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>


                    <!-- BLANCO LLENOS -->

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Blanco — Llenos
                        </span>

                        <strong class="number">
                            ${inventario.blanco?.llenos || 0}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>


                    <!-- BLANCO VACÍOS -->

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Blanco — Vacíos
                        </span>

                        <strong class="number">
                            ${inventario.blanco?.vacios || 0}
                        </strong>

                        <span class="sub">
                            disponibles
                        </span>

                    </div>


                    <!-- CLIENTES -->

                    <div
                        class="inventory-item"
                        style="grid-column: span 2;"
                    >

                        <span class="label">
                            👥 Clientes
                        </span>

                        <strong class="number">
                            ${inventario.clientes?.pendientes || 0}
                        </strong>

                        <span class="sub">
                            cilindros pendientes de recuperación
                        </span>

                    </div>


                </div>


                <!-- TOTAL -->

                <div class="inventory-total">

                    <span>
                        TOTAL EMPRESA
                    </span>

                    <strong>
                        ${total}
                    </strong>

                </div>


            </section>


            <!-- =====================================
                 ESTADO DEL INVENTARIO
            ====================================== -->

            <section class="section">

                <div class="status-bar status-success">

                    🟢 INVENTARIO CUADRADO

                </div>

            </section>


            <!-- =====================================
                 ACCIÓN PRINCIPAL
            ====================================== -->

            <section class="section">

                <button
                    class="primary-button"
                    id="btnNuevoMovimiento"
                >
                    ＋ NUEVO MOVIMIENTO
                </button>

            </section>


            <!-- =====================================
                 OPERACIÓN
            ====================================== -->

            <section class="section">

                <div class="section-header">

                    <div>

                        <div class="section-title">
                            OPERACIÓN
                        </div>

                        <div class="section-subtitle">
                            Accesos principales
                        </div>

                    </div>

                </div>


                <div class="quick-actions">


                    <button
                        class="quick-action"
                        data-page="movimientos"
                    >
                        <span class="icon">
                            🚚
                        </span>

                        <span>
                            Movimientos
                        </span>
                    </button>


                    <button
                        class="quick-action"
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
                        class="quick-action"
                        data-page="inventario"
                    >
                        <span class="icon">
                            📦
                        </span>

                        <span>
                            Inventario
                        </span>
                    </button>


                    <button
                        class="quick-action"
                        data-page="reportes"
                    >
                        <span class="icon">
                            📊
                        </span>

                        <span>
                            Reportes
                        </span>
                    </button>


                </div>

            </section>


            <!-- =====================================
                 ADMINISTRACIÓN
            ====================================== -->

            <section class="section">

                <div class="section-header">

                    <div>

                        <div class="section-title">
                            ADMINISTRACIÓN
                        </div>

                        <div class="section-subtitle">
                            Configuración y respaldo
                        </div>

                    </div>

                </div>


                <div class="quick-actions">


                    <button
                        class="quick-action"
                        id="btnApertura"
                    >
                        <span class="icon">
                            ⚙️
                        </span>

                        <span>
                            Apertura
                        </span>
                    </button>


                    <button
                        class="quick-action"
                        data-page="sync"
                    >
                        <span class="icon">
                            🔄
                        </span>

                        <span>
                            Sincronizar
                        </span>
                    </button>


                    <button
                        class="quick-action"
                        id="btnExportarBD"
                    >
                        <span class="icon">
                            📤
                        </span>

                        <span>
                            Exportar BD
                        </span>
                    </button>


                    <button
                        class="quick-action"
                        id="btnImportarBD"
                    >
                        <span class="icon">
                            📥
                        </span>

                        <span>
                            Cargar BD
                        </span>
                    </button>


                </div>


                <input
                    type="file"
                    id="inputImportarBD"
                    accept=".json,application/json"
                    style="display:none"
                >

            </section>


        </main>


        ${renderNav('inicio')}

    `;


    /* =============================================
       BOTÓN APERTURA
    ============================================= */

    document
        .getElementById('btnApertura')
        ?.addEventListener(
            'click',
            mostrarApertura
        );


    /* =============================================
       NUEVO MOVIMIENTO
    ============================================= */

    document
        .getElementById('btnNuevoMovimiento')
        ?.addEventListener(
            'click',
            mostrarTiposMovimiento
        );


    /* =============================================
       EXPORTAR BASE DE DATOS
    ============================================= */

    document
        .getElementById('btnExportarBD')
        ?.addEventListener(
            'click',
            async () => {

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

            }
        );


    /* =============================================
       CARGAR BASE DE DATOS
    ============================================= */

    document
        .getElementById('btnImportarBD')
        ?.addEventListener(
            'click',
            () => {

                document
                    .getElementById('inputImportarBD')
                    ?.click();

            }
        );


    /* =============================================
       PROCESAR ARCHIVO
    ============================================= */

    document
        .getElementById('inputImportarBD')
        ?.addEventListener(
            'change',
            async evento => {

                const archivo =
                    evento.target.files[0];

                if (!archivo) {
                    return;
                }


                const confirmar =
                    confirm(
                        '⚠️ ATENCIÓN\n\n' +
                        'Cargar este respaldo reemplazará los datos actuales.\n\n' +
                        '¿Quieres continuar?'
                    );


                if (!confirmar) {

                    evento.target.value = '';

                    return;

                }


                try {

                    await importarBaseDatos(
                        archivo
                    );


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

            }
        );


    /* =============================================
       NAVEGACIÓN
    ============================================= */

    registrarNavegacion();

}


/* =====================================================
   LISTA DE MOVIMIENTOS
===================================================== */



async function renderMovimientos() {

    const movimientos = await obtenerMovimientos();
    const clientes = await obtenerTodos('clientes');

    const nombresClientes = Object.fromEntries(
        clientes.map(c => [c.id_cliente, c.nombre])
    );

    const escaparHTML = (valor) =>
        String(valor ?? '').replace(/[&<>"']/g, caracter => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[caracter]);

    const obtenerFechaLocal = (fechaHora) => {
        if (!fechaHora) return '';

        return new Date(fechaHora).toLocaleDateString('en-CA', {
            timeZone: 'America/Guayaquil'
        });
    };

    const fechaHoy = new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Guayaquil'
    });

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
                    Buscar movimientos
                </div>

                <div class="form-group">
                    <label for="fechaInicioMovimientos">


<div class="fechas-horizontales">

    <div class="form-group">
        <label for="fechaInicioMovimientos">
            Desde
        </label>

        <input
            type="date"
            id="fechaInicioMovimientos"
            value="${fechaHoy}"
        >
    </div>

    <div class="form-group">
        <label for="fechaFinMovimientos">
            Hasta
        </label>

        <input
            type="date"
            id="fechaFinMovimientos"
            value="${fechaHoy}"
        >
    </div>

</div>

                <div class="form-group">
                    <label for="filtroClienteMovimientos">
                        Cliente
                    </label>

                    <select id="filtroClienteMovimientos">
                        <option value="">Todos</option>

                        ${clientes
                            .slice()
                            .sort((a, b) =>
                                (a.nombre || '').localeCompare(
                                    b.nombre || '',
                                    'es'
                                )
                            )
                            .map(c => `
                                <option value="${escaparHTML(c.id_cliente)}">
                                    ${escaparHTML(c.nombre)}
                                </option>
                            `)
                            .join('')}
                    </select>
                </div>

                <div class="card-title">
                    Resultados
                </div>

                <div id="contadorMovimientos"></div>

            </div>

            <div class="card" id="listaMovimientos"></div>

        </main>

        ${renderNav('movimientos')}
    `;

    const lista =
        document.getElementById('listaMovimientos');

    const fechaInicio =
        document.getElementById('fechaInicioMovimientos');

    const fechaFin =
        document.getElementById('fechaFinMovimientos');

    const filtroCliente =
        document.getElementById('filtroClienteMovimientos');

    const contador =
        document.getElementById('contadorMovimientos');


    function mostrarMovimientos() {

        const inicio = fechaInicio.value;
        const fin = fechaFin.value;
        const clienteSeleccionado = filtroCliente.value;

        if (!inicio || !fin) {
            contador.textContent = '';
            lista.innerHTML = `
                <div class="empty-state">
                    Selecciona las fechas de inicio y fin.
                </div>
            `;
            return;
        }

        if (inicio > fin) {
            contador.textContent = '';
            lista.innerHTML = `
                <div class="empty-state">
                    La fecha de inicio no puede ser posterior
                    a la fecha de fin.
                </div>
            `;
            return;
        }

        const filtrados = movimientos.filter(m => {

            const fechaMovimiento = m.fecha_hora
                ? obtenerFechaLocal(m.fecha_hora)
                : (m.fecha || '');

            const idCliente =
                m.cliente || m.id_cliente || '';

            const coincideFecha =
                fechaMovimiento >= inicio &&
                fechaMovimiento <= fin;

            const coincideCliente =
                !clienteSeleccionado ||
                String(idCliente) === String(clienteSeleccionado);

            return coincideFecha && coincideCliente;
        });

        contador.textContent =
            `${filtrados.length} movimiento${filtrados.length === 1 ? '' : 's'}`;

        if (filtrados.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    No hay movimientos para los filtros seleccionados.
                </div>
            `;
            return;
        }

        lista.innerHTML = `
            <div class="list">

                ${filtrados.map(m => {

                    const cantidad = [
                        Number(m.llenos) > 0
                            ? `Llenos: ${m.llenos}`
                            : '',
                        Number(m.vacios) > 0
                            ? `Vacíos: ${m.vacios}`
                            : ''
                    ]
                        .filter(Boolean)
                        .join(' | ');

                    const fechaTexto = m.fecha_hora
                        ? new Date(m.fecha_hora).toLocaleString('es-EC', {
                            timeZone: 'America/Guayaquil'
                        })
                        : m.fecha || '';

                    const idCliente =
                        m.cliente || m.id_cliente || '';

                    const nombreCliente = idCliente
                        ? nombresClientes[idCliente] || 'Cliente'
                        : '';

                    const detalle = [
                        nombreCliente
                            ? '👤 ' + nombreCliente
                            : '',
                        m.tipo === 'REGRESO DE PLANTA'
                            ? '🏭 PLANTA'
                            : m.camion_origen
                                ? '🚚 ' + m.camion_origen
                                : '',
                        m.camion_destino
                            ? '→ ' + m.camion_destino
                            : '',
                        cantidad
                    ]
                        .filter(Boolean)
                        .join(' | ');

                    return `
                        <div class="list-item">

                            <div class="list-item-top">

                                <span class="list-item-title">
                                    ${escaparHTML(m.tipo || 'Movimiento')}
                                </span>

                                <span class="badge badge-warning">
                                    ${escaparHTML(m.sync_estado || '')}
                                </span>

                            </div>

                            <div class="list-item-sub">
                                ${escaparHTML(fechaTexto)}
                            </div>

                            <div class="list-item-sub">
                                ${escaparHTML(detalle)}
                            </div>

                        </div>
                    `;
                }).join('')}

            </div>
        `;
    }

    fechaInicio.addEventListener('change', mostrarMovimientos);
    fechaFin.addEventListener('change', mostrarMovimientos);
    filtroCliente.addEventListener('change', mostrarMovimientos);

    // Al abrir, muestra todos los movimientos de hoy.
    mostrarMovimientos();

    document
        .getElementById('btnNuevo')
        .addEventListener('click', mostrarTiposMovimiento);

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

                        cantidad:
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
                        <input
                            type="checkbox"
                            name="retiroEspecial"
                            id="retiroEspecial"
                        >

                        Retiro especial — saldo no registrado
                    </label>

                </div>


                <div class="form-group">

                    <label>
                        Observación
                    </label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        id="observacionRetiro"
                        placeholder="Opcional"
                    ></textarea>

                </div>


                ${botonesFormulario()}

            </form>

        </main>
    `;


    conectarCancelar();


    const checkboxEspecial =
        document.getElementById(
            'retiroEspecial'
        );

    const campoObservacion =
        document.getElementById(
            'observacionRetiro'
        );


    checkboxEspecial.addEventListener(
        'change',
        () => {

            if (checkboxEspecial.checked) {

                campoObservacion.required = true;

                campoObservacion.placeholder =
                    'Obligatoria: explica por qué este saldo no estaba registrado.';

            } else {

                campoObservacion.required = false;

                campoObservacion.placeholder =
                    'Opcional';
            }
        }
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

                    await retiroCliente({

                        idCliente:
                            form.get('idCliente'),

                        camion:
                            form.get('camion'),

                        cantidad:
                            form.get('vacios'),

                        observacion:
                            form.get('observacion'),

                        retiroEspecial:
                            form.get('retiroEspecial') === 'on'

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

                        cantidad:
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


                    const tipoCilindro = form.get('tipoCilindro');
                    const cantidad = Number(form.get('cantidad'));

                    await trasladoCamiones({

                        origen: form.get('origen'),

                        destino: form.get('destino'),

                        llenos: tipoCilindro === 'LLENOS' ? cantidad : 0,

                        vacios: tipoCilindro === 'VACIOS' ? cantidad : 0,

                        observacion: form.get('observacion')

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

    const disponibles =
        await obtenerPendientesInicialesSinAsignar();

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


            <button
                class="secondary-button"
                id="btnPendientesIniciales"
            >
                📦 ASIGNAR PENDIENTES INICIALES
            </button>


            <div class="card">

                <div class="card-title">
                    Pendientes iniciales disponibles
                </div>

                <div class="stat-value">
                    ${disponibles}
                </div>

                <div class="list-item-sub">
                    Estos cilindros ya forman parte del inventario
                    de CLIENTES y solo serán distribuidos entre
                    los clientes.
                </div>

            </div>


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


    document
        .getElementById('btnPendientesIniciales')
        .addEventListener(
            'click',
            formularioPendientesIniciales
        );


    registrarNavegacion();
}

async function formularioPendientesIniciales() {

    const clientes =
        await obtenerClientes();

    const disponibles =
        await obtenerPendientesInicialesSinAsignar();


    app.innerHTML = `

        <header class="app-header">

            <h1>PENDIENTES INICIALES</h1>

            <p>
                Distribuye los pendientes que ya existen
                en el inventario de CLIENTES.
            </p>

        </header>


        <main class="main-content">

            <div class="card">

                <div class="card-title">
                    Pendientes disponibles
                </div>

                <div class="stat-value">
                    ${disponibles}
                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Asignar a clientes
                </div>


                <form id="formPendientesIniciales">

                    ${clientes.map(cliente => `

                        <div class="form-group">

                            <label>
                                ${cliente.nombre}
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                class="input-pendiente-inicial"
                                data-id="${cliente.id_cliente}"
                                value="0"
                            >

                        </div>

                    `).join('')}


                    <div class="card">

                        <strong>
                            Total a asignar:
                        </strong>

                        <span id="totalPendientesAsignar">
                            0
                        </span>

                    </div>


                    <button
                        type="submit"
                        class="primary-button"
                    >
                        GUARDAR ASIGNACIONES
                    </button>


                    <button
                        type="button"
                        class="secondary-button"
                        id="btnCancelarPendientesIniciales"
                    >
                        CANCELAR
                    </button>

                </form>

            </div>

        </main>


        ${renderNav('clientes')}
    `;


    const inputs =
        document.querySelectorAll(
            '.input-pendiente-inicial'
        );

    const total =
        document.getElementById(
            'totalPendientesAsignar'
        );


    function actualizarTotal() {

        let suma = 0;

        inputs.forEach(input => {

            const cantidad =
                Number(input.value) || 0;

            suma += cantidad;

        });

        total.textContent = suma;
    }


    inputs.forEach(input => {

        input.addEventListener(
            'input',
            actualizarTotal
        );

    });


    document
        .getElementById(
            'formPendientesIniciales'
        )
        .addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const asignaciones =
                    [];

                inputs.forEach(input => {

                    asignaciones.push({

                        idCliente:
                            input.dataset.id,

                        cantidad:
                            Number(input.value) || 0

                    });

                });


                const totalAsignar =
                    asignaciones.reduce(
                        (suma, item) =>
                            suma +
                            item.cantidad,
                        0
                    );


                if (totalAsignar === 0) {

                    alert(
                        'Debes asignar al menos un pendiente.'
                    );

                    return;
                }


                if (
                    totalAsignar >
                    disponibles
                ) {

                    alert(
                        `No puedes asignar ${totalAsignar}. Solo hay ${disponibles} pendientes iniciales disponibles.`
                    );

                    return;
                }


                try {

                    await asignarPendientesIniciales(
                        asignaciones
                    );


                    alert(
                        'Pendientes iniciales asignados correctamente.'
                    );


                    await renderClientes();

                } catch (error) {

                    alert(
                        error.message
                    );

                }

            }
        );


    document
        .getElementById(
            'btnCancelarPendientesIniciales'
        )
        .addEventListener(
            'click',
            renderClientes
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
                        'CLIENTE REGISTRADO',
                        'clientes'
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


function mostrarExito(mensaje, paginaDestino = 'inicio') {

    app.innerHTML = `
        <main
            class="main-content"
            style="padding-top:50px;"
        >
            <div class="card">
                <div style="
                    text-align:center;
                    font-size:55px;
                    margin-bottom:15px;
                ">
                    ✓
                </div>

                <h2 style="
                    text-align:center;
                    margin-bottom:10px;
                ">
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
        .addEventListener('click', async () => {

            if (paginaDestino === 'clientes') {
                await renderClientes();
                return;
            }

            paginaActual = paginaDestino;
            render();
        });
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

function fechaActualReporte() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
}

async function copiarTextoReporte(texto) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(texto);
        } else {
            const area = document.createElement('textarea');
            area.value = texto;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();

            const copiado = document.execCommand('copy');
            area.remove();

            if (!copiado) {
                throw new Error('No se pudo copiar automáticamente.');
            }
        }

        alert('Reporte copiado. Ya puedes pegarlo en WhatsApp.');
    } catch (error) {
        console.error(error);
        alert('No se pudo copiar automáticamente. Selecciona y copia el texto del reporte.');
    }
}

async function compartirTextoReporte(texto) {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Reporte de la distribuidora',
                text: texto
            });
        } else {
            window.open(
                `https://wa.me/?text=${encodeURIComponent(texto)}`,
                '_blank'
            );
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error(error);
            alert('No se pudo abrir la opción para compartir el reporte.');
        }
    }
}


async function renderReportes() {
    const hoy = fechaActualReporte();
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - 6);

    const inicioPorDefecto = [
        inicioSemana.getFullYear(),
        String(inicioSemana.getMonth() + 1).padStart(2, '0'),
        String(inicioSemana.getDate()).padStart(2, '0')
    ].join('-');

    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="page">
            <header class="page-header">
                <h1>📊 Reportes</h1>
            </header>

            <section class="card">
                <h2>📅 REPORTE DIARIO</h2>

                <label for="fechaReporte">Fecha del reporte</label>
                <input
                    type="date"
                    id="fechaReporte"
                    value="${hoy}"
                >

                <button
                    type="button"
                    class="primary-button"
                    id="btnGenerarDiario"
                >
                    GENERAR REPORTE DIARIO
                </button>

                <div id="resultadoDiario"></div>
            </section>

            <section class="card">
                <h2>📆 REPORTE POR RANGO</h2>
                <p>Consulta las ventas de una semana o cualquier período.</p>

                <label for="fechaInicio">Desde</label>
                <input
                    type="date"
                    id="fechaInicio"
                    value="${inicioPorDefecto}"
                >

                <label for="fechaFin">Hasta</label>
                <input
                    type="date"
                    id="fechaFin"
                    value="${hoy}"
                >

                <button
                    type="button"
                    class="primary-button"
                    id="btnGenerarRango"
                >
                    GENERAR REPORTE POR RANGO
                </button>

                <div id="resultadoRango"></div>
            </section>

            ${renderNav('reportes')}
        </div>
    `;

    function mostrarTextoReporte(contenedorId, texto, prefijo) {
        const contenedor = document.getElementById(contenedorId);

        contenedor.innerHTML = `
            <div class="report-result">
                <h3>Resultado del reporte</h3>

                <pre id="${prefijo}Texto" style="
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                    font-family: inherit;
                "></pre>

                <button
                    type="button"
                    class="primary-button"
                    id="${prefijo}Compartir"
                >
                    📲 COMPARTIR
                </button>

                <button
                    type="button"
                    class="secondary-button"
                    id="${prefijo}Copiar"
                >
                    📋 COPIAR TEXTO
                </button>
            </div>
        `;

        document.getElementById(`${prefijo}Texto`).textContent = texto;

        document
            .getElementById(`${prefijo}Compartir`)
            .addEventListener('click', () => compartirTextoReporte(texto));

        document
            .getElementById(`${prefijo}Copiar`)
            .addEventListener('click', () => copiarTextoReporte(texto));
    }

    document
        .getElementById('btnGenerarDiario')
        .addEventListener('click', async () => {
            const boton = document.getElementById('btnGenerarDiario');
            const fecha = document.getElementById('fechaReporte').value;

            if (!fecha) {
                alert('Selecciona la fecha del reporte.');
                return;
            }

            boton.disabled = true;
            boton.textContent = 'GENERANDO...';

            try {

                const [
                    vendidos,
                    inventario,
                    clientes,
                    ventasClientes,
                    ventasDetalle,
                    viajesPlanta
                ] = await Promise.all([
                    vendidosPorFecha(fecha),
                    obtenerInventarioReporte(),
                    obtenerTodos('clientes'),
                    vendidosPorClienteRango(fecha, fecha),
                    obtenerVentasDetallePorFecha(fecha),
                    obtenerViajesPlantaPorRango(fecha, fecha)
                ]);

                const pendientesOrdenados = clientes
                    .map(cliente => ({
                        nombre: cliente.nombre || 'Cliente sin nombre',
                        cantidad: Number(cliente.pendientes_actuales) || 0
                    }))
                    .filter(cliente => cliente.cantidad > 0)
                    .sort((a, b) => b.cantidad - a.cantidad);

                const fechaTexto = fecha.split('-').reverse().join('/');

                const texto =
                    `📊 REPORTE DIARIO
Distribuidora de cilindros
Fecha: ${fechaTexto}

VENTAS DEL DÍA
Cilindros vendidos: ${vendidos}

INVENTARIO ACTUAL
Camión Rojo 
Llenos: ${inventario.rojoLlenos}
Vacíos: ${inventario.rojoVacios}

Camión Blanco
Llenos: ${inventario.blancoLlenos}
Vacíos: ${inventario.blancoVacios}

Pendientes en clientes: ${inventario.pendientesClientes}
TOTAL GENERAL DE CILINDROS: ${inventario.total}

VENTAS DEL DÍA POR HORA
${ventasDetalle.length
    ? ventasDetalle.map((venta, i) =>
        `${i + 1}. ${venta.hora} — ${venta.cliente}: ${venta.cantidad} cilindros`
    ).join('\n')
    : 'No hay ventas registradas para esta fecha.'}

VIAJES A PLANTA
${viajesPlanta.length
    ? `${viajesPlanta.length} ${viajesPlanta.length === 1 ? 'viaje' : 'viajes'} — ${viajesPlanta.reduce((total, viaje) => total + viaje.cantidad, 0)} cilindros enviados
${viajesPlanta.map((viaje, i) =>
    `${i + 1}. ${viaje.camion} — ${viaje.cantidad} cilindros — ${viaje.hora}`
).join('\n')}`
    : 'No hubo viajes a planta en esta fecha.'}

Todos Los Clientes con Cilindros pendientes:
${pendientesOrdenados.length
                        ? pendientesOrdenados.map((cliente, i) =>
                            `${i + 1}. ${cliente.nombre}: ${cliente.cantidad}`
                        ).join('\n')
                        : 'No hay pendientes asignados a clientes.'}

    
Sin asignar (Nuevos cilindros)
Llenos: ${inventario.sinAsignarLlenos}
Vacíos: ${inventario.sinAsignarVacios}`;

                mostrarTextoReporte('resultadoDiario', texto, 'diario');
            } catch (error) {
                console.error(error);
                alert('No se pudo generar el reporte diario. Revisa la consola para ver el error.');
            } finally {
                boton.disabled = false;
                boton.textContent = 'GENERAR REPORTE DIARIO';
            }
        });

    document
        .getElementById('btnGenerarRango')
        .addEventListener('click', async () => {
            const boton = document.getElementById('btnGenerarRango');
            const inicio = document.getElementById('fechaInicio').value;
            const fin = document.getElementById('fechaFin').value;

            if (!inicio || !fin) {
                alert('Selecciona las dos fechas.');
                return;
            }

            if (inicio > fin) {
                alert('La fecha inicial no puede ser mayor que la final.');
                return;
            }

            boton.disabled = true;
            boton.textContent = 'GENERANDO...';

            try {
        
const [total, clientes, viajesPlanta] = await Promise.all([
    vendidosPorRango(inicio, fin),
    vendidosPorClienteRango(inicio, fin),
    obtenerViajesPlantaPorRango(inicio, fin)
]);

                const fechaInicioTexto = inicio.split('-').reverse().join('/');
                const fechaFinTexto = fin.split('-').reverse().join('/');

                const texto =
                    `📊 REPORTE DE VENTAS POR RANGO
Distribuidora de cilindros
Desde: ${fechaInicioTexto}
Hasta: ${fechaFinTexto}

VIAJES A PLANTA
${viajesPlanta.length
    ? `${viajesPlanta.length} ${viajesPlanta.length === 1 ? 'viaje' : 'viajes'} — ${viajesPlanta.reduce((total, viaje) => total + viaje.cantidad, 0)} cilindros enviados
${viajesPlanta.map((viaje, i) =>
    `${i + 1}. ${viaje.fecha.split('-').reverse().join('/')} — ${viaje.camion} — ${viaje.cantidad} cilindros — ${viaje.hora}`
).join('\n')}`
    : 'No hubo viajes a planta en este período.'}


TOTAL DE CILINDROS VENDIDOS: ${total}

VENTAS POR CLIENTE
${clientes.length
                        ? clientes.map((cliente, i) =>
                            `${i + 1}. ${cliente.nombre}: ${cliente.cantidad} cilindros`
                        ).join('\n')
                        : 'No hay ventas registradas en este período.'}`;

                mostrarTextoReporte('resultadoRango', texto, 'rango');
            } catch (error) {
                console.error(error);
                alert('No se pudo generar el reporte por rango. Revisa la consola para ver el error.');
            } finally {
                boton.disabled = false;
                boton.textContent = 'GENERAR REPORTE POR RANGO';
            }
        });

    registrarNavegacion();
}
document
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
/* =====================================================
INVENTARIO - ADMINISTRACIÓN
===================================================== */

async function renderInventario() {

    const inventario =
        await obtenerInventario();

    const sinAsignar =
        inventario.sinAsignar || {
            llenos: 0,
            vacios: 0
        };

    const total =
        calcularTotal(inventario);

    app.innerHTML = `

        <section class="card">

            <h2>Inventario</h2>

            <p>
                Total de la empresa:
                <strong>${total}</strong>
            </p>

        </section>


        <section class="card">

            <h3>Inventario actual</h3>

            <p>
                🔴 Rojo:
                ${inventario.rojo.llenos || 0} llenos /
                ${inventario.rojo.vacios || 0} vacíos
            </p>

            <p>
                ⚪ Blanco:
                ${inventario.blanco.llenos || 0} llenos /
                ${inventario.blanco.vacios || 0} vacíos
            </p>

            <p>
                👥 Clientes:
                ${inventario.clientes.pendientes || 0}
            </p>

            <p>
                📦 Sin asignar:
                ${sinAsignar.llenos || 0} llenos /
                ${sinAsignar.vacios || 0} vacíos
            </p>

        </section>


        <section class="card">

            <h3>Añadir cilindros</h3>

            <form id="formAgregarSinAsignar">

                <label>
                    Llenos
                    <input
                        type="number"
                        id="agregarLlenos"
                        min="0"
                        step="1"
                        value="0"
                    >
                </label>

                <label>
                    Vacíos
                    <input
                        type="number"
                        id="agregarVacios"
                        min="0"
                        step="1"
                        value="0"
                    >
                </label>

                <label>
                    Observación
                    <input
                        type="text"
                        id="agregarObservacion"
                        placeholder="Ej.: compra de cilindros"
                    >
                </label>

                <button type="submit">
                    AÑADIR
                </button>

            </form>

        </section>


        <section class="card">

            <h3>Retirar cilindros sin asignar</h3>

            <p>
                Solo puedes retirar cilindros que estén
                actualmente en SIN ASIGNAR.
            </p>

            <form id="formRetirarSinAsignar">

                <label>
                    Llenos
                    <input
                        type="number"
                        id="retirarLlenos"
                        min="0"
                        step="1"
                        value="0"
                    >
                </label>

                <label>
                    Vacíos
                    <input
                        type="number"
                        id="retirarVacios"
                        min="0"
                        step="1"
                        value="0"
                    >
                </label>

                <label>
                    Observación
                    <input
                        type="text"
                        id="retirarObservacion"
                        placeholder="Ej.: cilindro dañado"
                    >
                </label>

                <button type="submit">
                    RETIRAR
                </button>

            </form>

        </section>


        <section class="card">

            <h3>Asignar a camión</h3>

            <p>
                Disponible sin asignar:
                ${sinAsignar.llenos || 0} llenos /
                ${sinAsignar.vacios || 0} vacíos
            </p>

            <form id="formAsignarCamion">

                <label>
                    Camión
                    <select id="asignarCamion">
                        <option value="ROJO">ROJO</option>
                        <option value="BLANCO">BLANCO</option>
                    </select>
                </label>

                <label>
                    Llenos
                    <input
                        type="number"
                        id="asignarLlenos"
                        min="0"
                        step="1"
                        value="0"
                    >
                </label>

                <label>
                    Vacíos
                    <input
                        type="number"
                        id="asignarVacios"
                        min="0"
                        step="1"
                        value="0"
                    >
                </label>

                <button type="submit">
                    ASIGNAR
                </button>

            </form>

        </section>


        <section class="card">

            <button
                type="button"
                id="btnVolverInicioInventario"
            >
                ← VOLVER
            </button>

        </section>
    `;


    /* =================================================
       AÑADIR
    ================================================= */

    document
        .getElementById('formAgregarSinAsignar')
        ?.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                try {

                    await agregarSinAsignar({

                        llenos:
                            Number(
                                document
                                    .getElementById('agregarLlenos')
                                    .value
                            ),

                        vacios:
                            Number(
                                document
                                    .getElementById('agregarVacios')
                                    .value
                            ),

                        observacion:
                            document
                                .getElementById('agregarObservacion')
                                .value
                                .trim()

                    });


                    alert(
                        'Cilindros añadidos correctamente.'
                    );


                    await renderInventario();

                } catch (error) {

                    alert(
                        error.message
                    );

                }

            }
        );


    /* =================================================
       RETIRAR
    ================================================= */

    document
        .getElementById('formRetirarSinAsignar')
        ?.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                try {

                    await retirarSinAsignar({

                        llenos:
                            Number(
                                document
                                    .getElementById('retirarLlenos')
                                    .value
                            ),

                        vacios:
                            Number(
                                document
                                    .getElementById('retirarVacios')
                                    .value
                            ),

                        observacion:
                            document
                                .getElementById('retirarObservacion')
                                .value
                                .trim()

                    });


                    alert(
                        'Cilindros retirados correctamente.'
                    );


                    await renderInventario();

                } catch (error) {

                    alert(
                        error.message
                    );

                }

            }
        );


    /* =================================================
       ASIGNAR A CAMIÓN
    ================================================= */

    document
        .getElementById('formAsignarCamion')
        ?.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                try {

                    await asignarACamion({

                        camion:
                            document
                                .getElementById('asignarCamion')
                                .value,

                        llenos:
                            Number(
                                document
                                    .getElementById('asignarLlenos')
                                    .value
                            ),

                        vacios:
                            Number(
                                document
                                    .getElementById('asignarVacios')
                                    .value
                            )

                    });


                    alert(
                        'Cilindros asignados correctamente.'
                    );


                    await renderInventario();

                } catch (error) {

                    alert(
                        error.message
                    );

                }

            }
        );


    /* =================================================
       VOLVER
    ================================================= */

    document
        .getElementById('btnVolverInicioInventario')
        ?.addEventListener(
            'click',
            () => {

                paginaActual =
                    'inicio';

                render();

            }
        );
}