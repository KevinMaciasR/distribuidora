var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function n(){return u||(u=new Promise((e,t)=>{let n=indexedDB.open(c,l);n.onupgradeneeded=e=>{let t=e.target.result;if(t.objectStoreNames.contains(`configuracion`)||t.createObjectStore(`configuracion`,{keyPath:`id`}),!t.objectStoreNames.contains(`clientes`)){let e=t.createObjectStore(`clientes`,{keyPath:`id_cliente`});e.createIndex(`estado`,`estado`,{unique:!1}),e.createIndex(`nombre`,`nombre`,{unique:!1})}if(t.objectStoreNames.contains(`inventario`)||t.createObjectStore(`inventario`,{keyPath:`ubicacion`}),!t.objectStoreNames.contains(`movimientos`)){let e=t.createObjectStore(`movimientos`,{keyPath:`id_movimiento`});e.createIndex(`fecha_hora`,`fecha_hora`,{unique:!1}),e.createIndex(`tipo`,`tipo`,{unique:!1}),e.createIndex(`sync_estado`,`sync_estado`,{unique:!1}),e.createIndex(`estado`,`estado`,{unique:!1})}t.objectStoreNames.contains(`viajes_planta`)||t.createObjectStore(`viajes_planta`,{keyPath:`id_viaje`}).createIndex(`estado`,`estado`,{unique:!1}),t.objectStoreNames.contains(`sincronizacion`)||t.createObjectStore(`sincronizacion`,{keyPath:`id`})},n.onsuccess=t=>{e(t.target.result)},n.onerror=()=>{t(n.error)}}),u)}async function r(e,t){let r=await n();return new Promise((n,i)=>{let a=r.transaction(e,`readwrite`);a.objectStore(e).put(t),a.oncomplete=()=>n(t),a.onerror=()=>i(a.error)})}async function i(e,t){let r=await n();return new Promise((n,i)=>{let a=r.transaction(e,`readonly`).objectStore(e).get(t);a.onsuccess=()=>n(a.result),a.onerror=()=>i(a.error)})}async function a(e){let t=await n();return new Promise((n,r)=>{let i=t.transaction(e,`readonly`).objectStore(e).getAll();i.onsuccess=()=>n(i.result),i.onerror=()=>r(i.error)})}async function o(){let e=[`configuracion`,`clientes`,`inventario`,`movimientos`,`viajes_planta`,`sincronizacion`],t={version:1,fecha_exportacion:new Date().toISOString(),base_datos:c,datos:{}};for(let n of e)t.datos[n]=await a(n);let n=JSON.stringify(t,null,2),r=new Blob([n],{type:`application/json`}),i=URL.createObjectURL(r),o=new Date,s=`respaldo_distribuidora_${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,`0`)}-${String(o.getDate()).padStart(2,`0`)}_${String(o.getHours()).padStart(2,`0`)}-${String(o.getMinutes()).padStart(2,`0`)}.json`,l=document.createElement(`a`);return l.href=i,l.download=s,document.body.appendChild(l),l.click(),l.remove(),URL.revokeObjectURL(i),s}async function s(e){if(!e)throw Error(`No se seleccionó ningún archivo.`);if(e.type!==`application/json`&&!e.name.toLowerCase().endsWith(`.json`))throw Error(`El archivo seleccionado no es un respaldo JSON válido.`);let t=await e.text(),r;try{r=JSON.parse(t)}catch{throw Error(`El archivo de respaldo no contiene un JSON válido.`)}if(!r||!r.datos||typeof r.datos!=`object`)throw Error(`El archivo no tiene una estructura de respaldo válida.`);let i=[`configuracion`,`clientes`,`inventario`,`movimientos`,`viajes_planta`,`sincronizacion`],a=await n();return new Promise((e,t)=>{let n=a.transaction(i,`readwrite`);n.oncomplete=()=>{e(!0)},n.onerror=()=>{t(Error(`No se pudo restaurar la base de datos.`))},n.onabort=()=>{t(Error(`La restauración de la base de datos fue cancelada.`))};try{for(let e of i){let t=n.objectStore(e);t.clear();let i=r.datos[e];if(Array.isArray(i))for(let e of i)t.put(e)}}catch(e){n.abort(),t(e)}})}var c,l,u,d=e((()=>{c=`distribuidora_mobile`,l=1,u=null}));async function f(){(await a(`inventario`)).length>0||(await r(`inventario`,{ubicacion:v.ROJO,llenos:0,vacios:0}),await r(`inventario`,{ubicacion:v.BLANCO,llenos:0,vacios:0}),await r(`inventario`,{ubicacion:v.CLIENTES,pendientes:0}))}async function p(){return await f(),{rojo:await i(`inventario`,v.ROJO),blanco:await i(`inventario`,v.BLANCO),clientes:await i(`inventario`,v.CLIENTES)}}async function m(e,t){let n=await i(`inventario`,e);if(!n)throw Error(`No existe la ubicación ${e}`);let a={...n,...t,ubicacion:e};return h(a),await r(`inventario`,a),a}function h(e){if(e.llenos!==void 0&&e.llenos<0)throw Error(`Los cilindros llenos no pueden quedar negativos.`);if(e.vacios!==void 0&&e.vacios<0)throw Error(`Los cilindros vacíos no pueden quedar negativos.`);if(e.pendientes!==void 0&&e.pendientes<0)throw Error(`Los pendientes de clientes no pueden quedar negativos.`)}function g(e){let t=(e.rojo?.llenos||0)+(e.rojo?.vacios||0),n=(e.blanco?.llenos||0)+(e.blanco?.vacios||0),r=e.clientes?.pendientes||0;return t+n+r}async function _({rojoLlenos:e,rojoVacios:t,blancoLlenos:n,blancoVacios:i,clientesPendientes:o}){if((await a(`movimientos`)).length>0)throw Error(`No puedes modificar la apertura después de registrar movimientos.`);if([e,t,n,i,o].some(e=>!Number.isInteger(e)||e<0))throw Error(`Todos los valores deben ser números enteros mayores o iguales a 0.`);return await r(`inventario`,{ubicacion:v.ROJO,llenos:e,vacios:t}),await r(`inventario`,{ubicacion:v.BLANCO,llenos:n,vacios:i}),await r(`inventario`,{ubicacion:v.CLIENTES,pendientes:o}),p()}var v,y=e((()=>{d(),v={ROJO:`ROJO`,BLANCO:`BLANCO`,CLIENTES:`CLIENTES`}}));function b(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}function x(){return new Date().toISOString()}async function S(e){let t=await i(`inventario`,e);if(!t)throw Error(`No existe el camión ${e}.`);return t}async function C(e,t=0,n=0){let r=await S(e);if(t>r.llenos)throw Error(`El Camión ${e} solo tiene ${r.llenos} cilindros llenos disponibles.`);if(n>r.vacios)throw Error(`El Camión ${e} solo tiene ${r.vacios} cilindros vacíos disponibles.`)}async function w(e,t){let n=await i(`clientes`,e);if(!n)throw Error(`El cliente no existe.`);if(n.estado!==`ACTIVO`)throw Error(`El cliente está inactivo.`);if(t>(n.pendientes_actuales||0))throw Error(`El cliente solo tiene ${n.pendientes_actuales||0} cilindros pendientes.`);return n}async function T(e,t){let n=await i(`clientes`,e);if(!n)throw Error(`Cliente no encontrado.`);let a={...n,pendientes_actuales:(n.pendientes_actuales||0)+t};if(a.pendientes_actuales<0)throw Error(`Los pendientes del cliente no pueden ser negativos.`);await r(`clientes`,a),await m(v.CLIENTES,{pendientes:a.pendientes_actuales})}async function E(e){let t={id_movimiento:b(),fecha_hora:x(),...e,estado:`ACTIVO`,fecha_creacion:x(),fecha_modificacion:x(),dispositivo_id:`MOVIL`,sync_estado:`PENDIENTE`};return await r(`movimientos`,t),t}async function ee({idCliente:e,camion:t,llenos:n,observacion:r=``}){if(n=Number(n),n<=0)throw Error(`Indica una cantidad válida de cilindros llenos.`);return await C(t,n,0),await M(e),await m(t,{llenos:(await S(t)).llenos-n}),await T(e,n),E({tipo:F.ENTREGA_CLIENTE,id_cliente:e,camion_origen:t,camion_destino:null,llenos:n,vacios:0,observacion:r})}async function D({idCliente:e,camion:t,vacios:n,observacion:r=``}){if(n=Number(n),n<=0)throw Error(`Indica una cantidad válida de cilindros vacíos.`);await w(e,n);let i=await S(t);return await T(e,-n),await m(t,{vacios:i.vacios+n}),E({tipo:F.RETIRO_CLIENTE,id_cliente:e,camion_origen:t,camion_destino:null,llenos:0,vacios:n,observacion:r})}async function O({idCliente:e,camion:t,llenos:n,vacios:r,observacion:a=``}){if(n=Number(n),r=Number(r),n<0||r<0)throw Error(`Las cantidades no pueden ser negativas.`);if(n===0&&r===0)throw Error(`Debes registrar al menos una cantidad.`);let o=n-r,s=await i(`clientes`,e);if(!s||s.estado!==`ACTIVO`)throw Error(`El cliente no existe o está inactivo.`);if(await C(t,n,0),o<0&&Math.abs(o)>(s.pendientes_actuales||0))throw Error(`El retiro supera los cilindros pendientes del cliente.`);let c=await S(t);return await m(t,{llenos:c.llenos-n,vacios:c.vacios+r}),await T(e,o),E({tipo:F.ENTREGA_RETIRO,id_cliente:e,camion_origen:t,camion_destino:null,llenos:n,vacios:r,observacion:a})}async function k({camion:e,vacios:t,observacion:n=``}){if(t=Number(t),t<=0)throw Error(`Indica una cantidad válida.`);await C(e,0,t),await m(e,{vacios:(await S(e)).vacios-t});let a=b();await r(`viajes_planta`,{id_viaje:a,camion:e,fecha_salida:x(),fecha_regreso:null,movimiento_salida_id:null,movimiento_regreso_id:null,vacios_enviados:t,llenos_recibidos:0,estado:`ABIERTO`,observacion:n});let o=await E({tipo:F.SALIDA_PLANTA,camion_origen:e,camion_destino:null,llenos:0,vacios:t,id_viaje_planta:a,observacion:n});return await r(`viajes_planta`,{...await i(`viajes_planta`,a),movimiento_salida_id:o.id_movimiento}),o}async function A({idViaje:e,llenos:t,observacion:n=``}){if(t=Number(t),t<=0)throw Error(`Indica una cantidad válida.`);let a=await i(`viajes_planta`,e);if(!a)throw Error(`El viaje a planta no existe.`);if(a.estado!==`ABIERTO`)throw Error(`Este viaje ya está cerrado.`);let o=await S(a.camion);await m(a.camion,{llenos:o.llenos+t});let s=await E({tipo:F.REGRESO_PLANTA,camion_origen:null,camion_destino:a.camion,llenos:t,vacios:0,id_viaje_planta:e,observacion:n});return await r(`viajes_planta`,{...a,fecha_regreso:x(),movimiento_regreso_id:s.id_movimiento,llenos_recibidos:t,estado:`CERRADO`}),s}async function j({origen:e,destino:t,tipoCilindro:n,cantidad:r,observacion:i=``}){if(r=Number(r),e===t)throw Error(`El camión origen y destino deben ser diferentes.`);if(r<=0)throw Error(`Indica una cantidad válida.`);let a=await S(e),o=await S(t);if(n===`LLENOS`){if(r>a.llenos)throw Error(`El Camión ${e} no tiene suficientes llenos.`);await m(e,{llenos:a.llenos-r}),await m(t,{llenos:o.llenos+r})}else if(n===`VACIOS`){if(r>a.vacios)throw Error(`El Camión ${e} no tiene suficientes vacíos.`);await m(e,{vacios:a.vacios-r}),await m(t,{vacios:o.vacios+r})}else throw Error(`Tipo de cilindro inválido.`);return E({tipo:F.TRASLADO,camion_origen:e,camion_destino:t,llenos:n===`LLENOS`?r:0,vacios:n===`VACIOS`?r:0,observacion:i})}async function M(e){let t=await i(`clientes`,e);if(!t)throw Error(`El cliente no existe.`);if(t.estado!==`ACTIVO`)throw Error(`El cliente está inactivo.`);return t}async function N(){return(await a(`movimientos`)).sort((e,t)=>new Date(t.fecha_hora)-new Date(e.fecha_hora))}async function P(){return(await a(`viajes_planta`)).filter(e=>e.estado===`ABIERTO`).sort((e,t)=>new Date(t.fecha_salida)-new Date(e.fecha_salida))}var F,te=e((()=>{d(),y(),F={ENTREGA_CLIENTE:`ENTREGA A CLIENTE`,RETIRO_CLIENTE:`RETIRO DE CLIENTE`,ENTREGA_RETIRO:`ENTREGA + RETIRO`,SALIDA_PLANTA:`SALIDA A PLANTA`,REGRESO_PLANTA:`REGRESO DE PLANTA`,TRASLADO:`TRASLADO ENTRE CAMIONES`}}));function I(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}async function ne({nombre:e,telefono:t=``,direccion:n=``,sector:i=``,observacion:a=``}){if(e=e.trim(),!e)throw Error(`El nombre del cliente es obligatorio.`);let o={id_cliente:I(),nombre:e,telefono:t,direccion:n,sector:i,fecha_registro:new Date().toISOString(),estado:`ACTIVO`,observacion:a,pendientes_actuales:0,sync_estado:`PENDIENTE`};return await r(`clientes`,o),o}async function L(){return(await a(`clientes`)).filter(e=>e.estado===`ACTIVO`).sort((e,t)=>e.nombre.localeCompare(t.nombre))}var R=e((()=>{d()}));async function z(){let e=await a(`movimientos`),t=await a(`clientes`);return{movimientos:e.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`),clientes:t.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`)}}async function B(){let e=await z();return{movimientos:e.movimientos.length,clientes:e.clientes.length,total:e.movimientos.length+e.clientes.length}}var V=e((()=>{d()}));function H(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}async function U(){let e=await a(`movimientos`),t=H();return e.filter(e=>e.estado===`ACTIVO`&&e.fecha_hora?.slice(0,10)===t&&(e.tipo===`ENTREGA A CLIENTE`||e.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(t.llenos||0),0)}async function W(e){return(await a(`movimientos`)).filter(t=>t.estado===`ACTIVO`&&t.fecha_hora?.slice(0,10)===e&&(t.tipo===`ENTREGA A CLIENTE`||t.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(t.llenos||0),0)}async function G(e,t){return(await a(`movimientos`)).filter(n=>{if(n.estado!==`ACTIVO`)return!1;let r=n.fecha_hora?.slice(0,10);return r>=e&&r<=t&&(n.tipo===`ENTREGA A CLIENTE`||n.tipo===`ENTREGA + RETIRO`)}).reduce((e,t)=>e+(t.llenos||0),0)}async function K(){let e=await a(`movimientos`),t={};return e.filter(e=>e.estado===`ACTIVO`&&(e.tipo===`ENTREGA A CLIENTE`||e.tipo===`ENTREGA + RETIRO`)).forEach(e=>{let n=e.id_cliente||`SIN CLIENTE`;t[n]||(t[n]=0),t[n]+=e.llenos||0}),t}var q=e((()=>{d()}));t((()=>{y(),te(),R(),V(),d(),q();var e=document.getElementById(`app`),t=`inicio`;document.addEventListener(`DOMContentLoaded`,n);async function n(){await f(),r(),c()}function r(){`serviceWorker`in navigator&&navigator.serviceWorker.register(`/sw.js`).catch(e=>{console.error(`Error Service Worker:`,e)})}async function c(){switch(t){case`inicio`:await l();break;case`movimientos`:await u();break;case`clientes`:await E();break;case`sync`:await I();break;case`reportes`:await ie();break;default:await l()}}async function l(){let t=await p(),n=await B(),r=g(t);e.innerHTML=`

        <header class="app-header">
            <h1>DISTRIBUIDORA</h1>
            <p>Control de cilindros</p>
        </header>


        <main class="main-content">

            ${n.total===0?`
                <div class="status-bar status-success">
                    🟢 Datos actualizados
                </div>
              `:`
                <div class="status-bar status-warning">
                    🟡 Hay ${n.total} elemento(s) pendiente(s) de sincronización
                </div>
              `}


            <!-- INVENTARIO -->
            <section class="card">
<section class="card">
    <h2>📊 RESUMEN DE HOY</h2>

    <div class="dashboard-stats">

        <div class="stat-card">
            <span class="stat-label">VENDIDOS HOY</span>
            <strong class="stat-number">
                ${await U()}
            </strong>
        </div>

        <div class="stat-card">
            <span class="stat-label">VACÍOS DISPONIBLES</span>
            <strong class="stat-number">
                ${(t.rojo?.vacios||0)+(t.blanco?.vacios||0)}
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
                            ${t.rojo.llenos}
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
                            ${t.rojo.vacios}
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
                            ${t.blanco.llenos}
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
                            ${t.blanco.vacios}
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
                            ${t.clientes.pendientes}
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
                        ${r}
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


        ${Q(`inicio`)}
    `,document.getElementById(`btnApertura`)?.addEventListener(`click`,re),document.getElementById(`btnNuevoMovimiento`).addEventListener(`click`,m),document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{try{let e=await o();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}}),document.getElementById(`btnImportarBD`)?.addEventListener(`click`,()=>{document.getElementById(`inputImportarBD`)?.click()}),document.getElementById(`inputImportarBD`)?.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){if(!confirm(`⚠️ ATENCIÓN

Cargar este respaldo reemplazará los datos actuales.

¿Quieres continuar?`)){e.target.value=``;return}try{await s(t),alert(`✅ Base de datos restaurada correctamente.`),window.location.reload()}catch(e){console.error(e),alert(`❌ No se pudo cargar el respaldo.\n\n${e.message}`)}e.target.value=``}}),$()}async function u(){let t=await N();e.innerHTML=`

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


                ${t.length===0?`
                        <div class="empty-state">

                            <div class="icon">
                                📋
                            </div>

                            No hay movimientos registrados.

                        </div>
                      `:`
                        <div class="list">

                            ${t.slice(0,30).map(e=>{let t=[e.llenos>0?`Llenos: ${e.llenos}`:``,e.vacios>0?`Vacíos: ${e.vacios}`:``].filter(Boolean).join(` | `);return`

                                        <div class="list-item">

                                            <div class="list-item-top">

                                                <span class="list-item-title">
                                                    ${e.tipo}
                                                </span>

                                                <span class="badge badge-warning">
                                                    ${e.sync_estado}
                                                </span>

                                            </div>


                                            <div class="list-item-sub">

                                                ${new Date(e.fecha_hora).toLocaleString(`es-EC`)}

                                            </div>


                                            <div class="list-item-sub">

                                                ${e.id_cliente?`👤 Cliente`:``}

${e.tipo===`REGRESO DE PLANTA`?`🏭 PLANTA`:e.camion_origen?`🚚 `+e.camion_origen:``}

${e.camion_destino?` → `+e.camion_destino:``}

${t?` | `+t:``}

                                            </div>

                                        </div>

                                    `}).join(``)}

                        </div>
                      `}

            </div>

        </main>


        ${Q(`movimientos`)}
    `,document.getElementById(`btnNuevo`).addEventListener(`click`,m),$()}function m(){e.innerHTML=`

        <header class="app-header">

            <h1>NUEVO MOVIMIENTO</h1>

            <p>Selecciona el tipo</p>

        </header>


        <main class="main-content">

            <div class="movement-grid">

                ${h(`🚚`,`ENTREGA A CLIENTE`,`Entrega cilindros llenos`,F.ENTREGA_CLIENTE)}


                ${h(`↩️`,`RETIRO DE CLIENTE`,`Retira cilindros vacíos`,F.RETIRO_CLIENTE)}


                ${h(`⇄`,`ENTREGA + RETIRO`,`Entrega llenos y recibe vacíos`,F.ENTREGA_RETIRO)}


                ${h(`🏭`,`SALIDA A PLANTA`,`Envía cilindros vacíos a planta`,F.SALIDA_PLANTA)}


                ${h(`🏭`,`REGRESO DE PLANTA`,`Recibe cilindros llenos`,F.REGRESO_PLANTA)}


                ${h(`🔄`,`TRASLADO ENTRE CAMIONES`,`Mueve cilindros entre camiones`,F.TRASLADO)}

            </div>


            <button
                class="secondary-button"
                style="margin-top: 15px;"
                id="btnVolver"
            >
                ← Volver
            </button>

        </main>
    `,document.querySelectorAll(`[data-movement]`).forEach(e=>{e.addEventListener(`click`,()=>v(e.dataset.movement))}),document.getElementById(`btnVolver`).addEventListener(`click`,()=>{t=`movimientos`,c()})}function h(e,t,n,r){return`

        <button
            class="movement-button"
            data-movement="${r}"
        >

            <span class="icon">
                ${e}
            </span>

            <span>

                <strong>
                    ${t}
                </strong>

                <small>
                    ${n}
                </small>

            </span>

        </button>
    `}async function v(e){switch(e){case F.ENTREGA_CLIENTE:await b();break;case F.RETIRO_CLIENTE:await x();break;case F.ENTREGA_RETIRO:await S();break;case F.SALIDA_PLANTA:await C();break;case F.REGRESO_PLANTA:await w();break;case F.TRASLADO:await T()}}async function b(){let t=await L();e.innerHTML=`

        ${z(`🚚 ENTREGA A CLIENTE`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${J(t)}


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


                ${H()}

            </form>

        </main>
    `,Y(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ee({idCliente:t.get(`idCliente`),camion:t.get(`camion`),llenos:t.get(`llenos`),observacion:t.get(`observacion`)}),X(`ENTREGA REGISTRADA`)}catch(e){Z(e.message)}})}async function x(){let t=await L();e.innerHTML=`

        ${z(`↩️ RETIRO DE CLIENTE`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${J(t)}


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


                ${H()}

            </form>

        </main>
    `,Y(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await D({idCliente:t.get(`idCliente`),camion:t.get(`camion`),vacios:t.get(`vacios`),observacion:t.get(`observacion`)}),X(`RETIRO REGISTRADO`)}catch(e){Z(e.message)}})}async function S(){let t=await L();e.innerHTML=`

        ${z(`⇄ ENTREGA + RETIRO`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${J(t)}


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


                ${H()}

            </form>

        </main>
    `,Y();let n=document.querySelector(`[name="idCliente"]`),r=document.querySelector(`[name="llenos"]`),a=document.querySelector(`[name="vacios"]`);async function o(){let e=await i(`clientes`,n.value);if(!e)return;let t=Number(r.value)||0,o=Number(a.value)||0,s=(e.pendientes_actuales||0)+t-o;document.getElementById(`previewPendiente`).textContent=`Pendientes después: ${s}`}n.addEventListener(`change`,o),r.addEventListener(`input`,o),a.addEventListener(`input`,o),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await O({idCliente:t.get(`idCliente`),camion:t.get(`camion`),llenos:t.get(`llenos`),vacios:t.get(`vacios`),observacion:t.get(`observacion`)}),X(`ENTREGA + RETIRO REGISTRADO`)}catch(e){Z(e.message)}})}async function C(){e.innerHTML=`

        ${z(`🏭 SALIDA A PLANTA`)}


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


                ${H()}

            </form>

        </main>
    `,Y(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await k({camion:t.get(`camion`),vacios:t.get(`vacios`),observacion:t.get(`observacion`)}),X(`SALIDA A PLANTA REGISTRADA`)}catch(e){Z(e.message)}})}async function w(){let t=await P();e.innerHTML=`

        ${z(`🏭 REGRESO DE PLANTA`)}


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

                        ${t.map(e=>`
                                    <option
                                        value="${e.id_viaje}"
                                    >
                                        ${e.camion}
                                        — enviados:
                                        ${e.vacios_enviados}
                                        — ${new Date(e.fecha_salida).toLocaleString(`es-EC`)}
                                    </option>
                                `).join(``)}

                    </select>

                </div>


                ${t.length===0?`
                        <div class="status-bar status-warning">
                            🟡 No hay viajes a planta abiertos.
                        </div>
                      `:``}


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
                        ${t.length===0?`disabled`:``}
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


                ${H()}

            </form>

        </main>
    `,Y(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await A({idViaje:t.get(`idViaje`),llenos:t.get(`llenos`),observacion:t.get(`observacion`)}),X(`REGRESO DE PLANTA REGISTRADO`)}catch(e){Z(e.message)}})}async function T(){e.innerHTML=`

        ${z(`🔄 TRASLADO ENTRE CAMIONES`)}


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


                ${H()}

            </form>

        </main>
    `,Y(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await j({origen:t.get(`origen`),destino:t.get(`destino`),tipoCilindro:t.get(`tipoCilindro`),cantidad:t.get(`cantidad`),observacion:t.get(`observacion`)}),X(`TRASLADO REGISTRADO`)}catch(e){Z(e.message)}})}async function E(){let t=await L();e.innerHTML=`

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


                ${t.length===0?`
                        <div class="empty-state">

                            <div class="icon">
                                👥
                            </div>

                            Todavía no hay clientes.

                        </div>
                      `:`
                        <div class="list">

                            ${t.map(e=>`

                                    <div class="list-item">

                                        <div class="list-item-top">

                                            <span class="list-item-title">
                                                ${e.nombre}
                                            </span>

                                            <span class="badge badge-success">
                                                ${e.pendientes_actuales}
                                            </span>

                                        </div>

                                        <div class="list-item-sub">
                                            📦 ${e.pendientes_actuales}
                                            pendientes
                                        </div>

                                        ${e.telefono?`
                                                    <div class="list-item-sub">
                                                        📞 ${e.telefono}
                                                    </div>
                                                  `:``}

                                    </div>

                                `).join(``)}

                        </div>
                      `}

            </div>

        </main>


        ${Q(`clientes`)}
    `,document.getElementById(`btnNuevoCliente`).addEventListener(`click`,M),$()}function M(){e.innerHTML=`

        ${z(`👤 NUEVO CLIENTE`)}


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
    `,Y(),document.getElementById(`formCliente`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ne({nombre:t.get(`nombre`),telefono:t.get(`telefono`),direccion:t.get(`direccion`),sector:t.get(`sector`),observacion:t.get(`observacion`)}),X(`CLIENTE REGISTRADO`)}catch(e){Z(e.message)}})}async function I(){let t=await B();e.innerHTML=`

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


                ${t.total===0?`
                        <div class="status-bar status-success">
                            🟢 No hay elementos pendientes
                        </div>
                      `:`
                        <div class="status-bar status-warning">
                            🟡 ${t.total} elemento(s) pendiente(s)
                        </div>
                      `}


                <div class="inventory-grid">

                    <div class="inventory-item">

                        <span class="label">
                            Movimientos
                        </span>

                        <strong class="number">
                            ${t.movimientos}
                        </strong>

                    </div>


                    <div class="inventory-item">

                        <span class="label">
                            Clientes
                        </span>

                        <strong class="number">
                            ${t.clientes}
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


        ${Q(`sync`)}
    `,document.getElementById(`btnSync`).addEventListener(`click`,()=>alert(`La conexión con el PC se implementará después de terminar el motor local.`)),document.getElementById(`btnActualizar`).addEventListener(`click`,()=>alert(`La actualización PC → móvil se implementará después de la sincronización.`)),$()}function z(e){return`

        <header class="app-header">

            <h1>${e}</h1>

            <p>
                Registro de operación
            </p>

        </header>
    `}function H(){return`

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
    `}function J(e){return`

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

                ${e.map(e=>`
                            <option
                                value="${e.id_cliente}"
                            >
                                ${e.nombre}
                                — pendientes:
                                ${e.pendientes_actuales}
                            </option>
                        `).join(``)}

            </select>

            ${e.length===0?`
                    <small
                        style="
                            display:block;
                            margin-top:7px;
                            color:#b91c1c;
                        "
                    >
                        Primero debes registrar un cliente.
                    </small>
                  `:``}

        </div>
    `}function Y(){let e=document.getElementById(`btnCancelar`);e&&e.addEventListener(`click`,()=>{m()})}function X(n){e.innerHTML=`

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
                    ${n}
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
    `,document.getElementById(`btnContinuar`).addEventListener(`click`,()=>{t=`inicio`,c()})}function Z(e){alert(`⚠️ No se puede registrar\n\n${e}`)}function Q(e){return`

        <nav class="bottom-nav">

            <button
                class="${e===`inicio`?`active`:``}"
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
                class="${e===`movimientos`?`active`:``}"
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
                class="${e===`clientes`?`active`:``}"
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
                class="${e===`sync`?`active`:``}"
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
    `}function $(){document.querySelectorAll(`[data-page]`).forEach(e=>{e.addEventListener(`click`,()=>{t=e.dataset.page,c()})})}async function re(){e.innerHTML=`

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


        ${Q(`inicio`)}

    `,document.getElementById(`formApertura`).addEventListener(`submit`,async e=>{e.preventDefault();try{await _({rojoLlenos:Number(document.getElementById(`rojoLlenos`).value),rojoVacios:Number(document.getElementById(`rojoVacios`).value),blancoLlenos:Number(document.getElementById(`blancoLlenos`).value),blancoVacios:Number(document.getElementById(`blancoVacios`).value),clientesPendientes:Number(document.getElementById(`clientesPendientes`).value)}),alert(`Apertura configurada correctamente.`),await l()}catch(e){alert(e.message)}}),document.getElementById(`btnCancelarApertura`)?.addEventListener(`click`,l),$()}async function ie(){let e=await U(),t=await K(),n=await a(`clientes`),r=Object.fromEntries(n.map(e=>[e.id_cliente,e.nombre])),i=document.getElementById(`app`);i.innerHTML=`
        <div class="page">

            <header class="page-header">
                <h1>📊 Reportes</h1>
                <p>Control de cilindros vendidos</p>
            </header>

            <section class="card">
                <h2>VENDIDOS HOY</h2>

                <div class="report-number">
                    ${e}
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

                ${Object.keys(t).length===0?`<p>No hay ventas registradas.</p>`:`
                            <div class="report-list">

                                ${Object.entries(t).sort((e,t)=>t[1]-e[1]).map(([e,t])=>`
                                            <div class="report-row">

                                                <span>
                                                    ${r[e]||e}
                                                </span>

                                                <strong>
                                                    ${t}
                                                </strong>

                                            </div>
                                        `).join(``)}

                            </div>
                        `}

            </section>

            ${Q(`reportes`)}

        </div>
    `,document.getElementById(`btnFechaReporte`).addEventListener(`click`,async()=>{let e=document.getElementById(`fechaReporte`).value;if(!e){alert(`Selecciona una fecha.`);return}let t=await W(e);document.getElementById(`resultadoFecha`).innerHTML=`
                <div class="report-result">
                    ${t} cilindros vendidos
                </div>
            `}),document.getElementById(`btnRangoReporte`).addEventListener(`click`,async()=>{let e=document.getElementById(`fechaInicio`).value,t=document.getElementById(`fechaFin`).value;if(!e||!t){alert(`Selecciona las dos fechas.`);return}if(e>t){alert(`La fecha inicial no puede ser mayor que la final.`);return}let n=await G(e,t);document.getElementById(`resultadoRango`).innerHTML=`
                <div class="report-result">
                    ${n} cilindros vendidos
                </div>
            `}),$()}document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{try{let e=await o();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}})}))();