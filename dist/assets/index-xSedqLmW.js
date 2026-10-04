var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function n(){return u||(u=new Promise((e,t)=>{let n=indexedDB.open(c,l);n.onupgradeneeded=e=>{let t=e.target.result;if(t.objectStoreNames.contains(`configuracion`)||t.createObjectStore(`configuracion`,{keyPath:`id`}),!t.objectStoreNames.contains(`clientes`)){let e=t.createObjectStore(`clientes`,{keyPath:`id_cliente`});e.createIndex(`estado`,`estado`,{unique:!1}),e.createIndex(`nombre`,`nombre`,{unique:!1})}if(t.objectStoreNames.contains(`inventario`)||t.createObjectStore(`inventario`,{keyPath:`ubicacion`}),!t.objectStoreNames.contains(`movimientos`)){let e=t.createObjectStore(`movimientos`,{keyPath:`id_movimiento`});e.createIndex(`fecha_hora`,`fecha_hora`,{unique:!1}),e.createIndex(`tipo`,`tipo`,{unique:!1}),e.createIndex(`sync_estado`,`sync_estado`,{unique:!1}),e.createIndex(`estado`,`estado`,{unique:!1})}t.objectStoreNames.contains(`viajes_planta`)||t.createObjectStore(`viajes_planta`,{keyPath:`id_viaje`}).createIndex(`estado`,`estado`,{unique:!1}),t.objectStoreNames.contains(`sincronizacion`)||t.createObjectStore(`sincronizacion`,{keyPath:`id`})},n.onsuccess=t=>{e(t.target.result)},n.onerror=()=>{t(n.error)}}),u)}async function r(e,t){let r=await n();return new Promise((n,i)=>{let a=r.transaction(e,`readwrite`);a.objectStore(e).put(t),a.oncomplete=()=>n(t),a.onerror=()=>i(a.error)})}async function i(e,t){let r=await n();return new Promise((n,i)=>{let a=r.transaction(e,`readonly`).objectStore(e).get(t);a.onsuccess=()=>n(a.result),a.onerror=()=>i(a.error)})}async function a(e){let t=await n();return new Promise((n,r)=>{let i=t.transaction(e,`readonly`).objectStore(e).getAll();i.onsuccess=()=>n(i.result),i.onerror=()=>r(i.error)})}async function o(){let e=[`configuracion`,`clientes`,`inventario`,`movimientos`,`viajes_planta`,`sincronizacion`],t={version:1,fecha_exportacion:new Date().toISOString(),base_datos:c,datos:{}};for(let n of e)t.datos[n]=await a(n);let n=JSON.stringify(t,null,2),r=new Blob([n],{type:`application/json`}),i=URL.createObjectURL(r),o=new Date,s=`respaldo_distribuidora_${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,`0`)}-${String(o.getDate()).padStart(2,`0`)}_${String(o.getHours()).padStart(2,`0`)}-${String(o.getMinutes()).padStart(2,`0`)}.json`,l=document.createElement(`a`);return l.href=i,l.download=s,document.body.appendChild(l),l.click(),l.remove(),URL.revokeObjectURL(i),s}async function s(e){if(!e)throw Error(`No se seleccionó ningún archivo.`);if(e.type!==`application/json`&&!e.name.toLowerCase().endsWith(`.json`))throw Error(`El archivo seleccionado no es un respaldo JSON válido.`);let t=await e.text(),r;try{r=JSON.parse(t)}catch{throw Error(`El archivo de respaldo no contiene un JSON válido.`)}if(!r||!r.datos||typeof r.datos!=`object`)throw Error(`El archivo no tiene una estructura de respaldo válida.`);let i=[`configuracion`,`clientes`,`inventario`,`movimientos`,`viajes_planta`,`sincronizacion`],a=await n();return new Promise((e,t)=>{let n=a.transaction(i,`readwrite`);n.oncomplete=()=>{e(!0)},n.onerror=()=>{t(Error(`No se pudo restaurar la base de datos.`))},n.onabort=()=>{t(Error(`La restauración de la base de datos fue cancelada.`))};try{for(let e of i){let t=n.objectStore(e);t.clear();let i=r.datos[e];if(Array.isArray(i))for(let e of i)t.put(e)}}catch(e){n.abort(),t(e)}})}var c,l,u,d=e((()=>{c=`distribuidora_mobile`,l=1,u=null}));async function f(){let e=await a(`inventario`);e.find(e=>e.ubicacion===S.ROJO)||await r(`inventario`,{ubicacion:S.ROJO,llenos:0,vacios:0}),e.find(e=>e.ubicacion===S.BLANCO)||await r(`inventario`,{ubicacion:S.BLANCO,llenos:0,vacios:0}),e.find(e=>e.ubicacion===S.CLIENTES)||await r(`inventario`,{ubicacion:S.CLIENTES,pendientes:0}),e.find(e=>e.ubicacion===S.SIN_ASIGNAR)||await r(`inventario`,{ubicacion:S.SIN_ASIGNAR,llenos:0,vacios:0})}async function p(){return await f(),{rojo:await i(`inventario`,S.ROJO),blanco:await i(`inventario`,S.BLANCO),clientes:await i(`inventario`,S.CLIENTES),sinAsignar:await i(`inventario`,S.SIN_ASIGNAR)}}async function m(e,t){let n=await i(`inventario`,e);if(!n)throw Error(`No existe la ubicación ${e}.`);let a={...n,...t,ubicacion:e};return h(a),await r(`inventario`,a),a}function h(e){if(e.llenos!==void 0&&(!Number.isInteger(e.llenos)||e.llenos<0))throw Error(`Los cilindros llenos deben ser un número entero mayor o igual a 0.`);if(e.vacios!==void 0&&(!Number.isInteger(e.vacios)||e.vacios<0))throw Error(`Los cilindros vacíos deben ser un número entero mayor o igual a 0.`);if(e.pendientes!==void 0&&(!Number.isInteger(e.pendientes)||e.pendientes<0))throw Error(`Los pendientes de clientes deben ser un número entero mayor o igual a 0.`)}function g(e){let t=(e.rojo?.llenos||0)+(e.rojo?.vacios||0),n=(e.blanco?.llenos||0)+(e.blanco?.vacios||0),r=e.clientes?.pendientes||0,i=(e.sinAsignar?.llenos||0)+(e.sinAsignar?.vacios||0);return t+n+r+i}async function _({rojoLlenos:e,rojoVacios:t,blancoLlenos:n,blancoVacios:i,clientesPendientes:o}){if((await a(`movimientos`)).length>0)throw Error(`No puedes modificar la apertura después de registrar movimientos.`);if([e,t,n,i,o].some(e=>!Number.isInteger(e)||e<0))throw Error(`Todos los valores deben ser números enteros mayores o iguales a 0.`);return await r(`inventario`,{ubicacion:S.ROJO,llenos:e,vacios:t}),await r(`inventario`,{ubicacion:S.BLANCO,llenos:n,vacios:i}),await r(`inventario`,{ubicacion:S.CLIENTES,pendientes:o}),await r(`inventario`,{ubicacion:S.SIN_ASIGNAR,llenos:0,vacios:0}),p()}async function v({llenos:e=0,vacios:t=0,observacion:n=``}){if(e=Number(e),t=Number(t),x(e,t),e===0&&t===0)throw Error(`Debes agregar al menos un cilindro.`);let a=await i(`inventario`,S.SIN_ASIGNAR);if(!a)throw Error(`No existe la ubicación SIN ASIGNAR.`);return await r(`inventario`,{...a,llenos:(a.llenos||0)+e,vacios:(a.vacios||0)+t}),{llenos:e,vacios:t,observacion:n}}async function y({llenos:e=0,vacios:t=0,observacion:n=``}){if(e=Number(e),t=Number(t),x(e,t),e===0&&t===0)throw Error(`Debes retirar al menos un cilindro.`);let a=await i(`inventario`,S.SIN_ASIGNAR);if(!a)throw Error(`No existe la ubicación SIN ASIGNAR.`);if(e>(a.llenos||0))throw Error(`No puedes retirar ${e} llenos. Solo hay ${a.llenos||0} sin asignar.`);if(t>(a.vacios||0))throw Error(`No puedes retirar ${t} vacíos. Solo hay ${a.vacios||0} sin asignar.`);return await r(`inventario`,{...a,llenos:(a.llenos||0)-e,vacios:(a.vacios||0)-t}),{llenos:e,vacios:t,observacion:n}}async function b({camion:e,llenos:t=0,vacios:n=0}){if(e!==S.ROJO&&e!==S.BLANCO)throw Error(`El destino debe ser ROJO o BLANCO.`);if(t=Number(t),n=Number(n),x(t,n),t===0&&n===0)throw Error(`Debes asignar al menos un cilindro.`);let a=await i(`inventario`,S.SIN_ASIGNAR),o=await i(`inventario`,e);if(!a||!o)throw Error(`No se encontró el inventario necesario.`);if(t>(a.llenos||0))throw Error(`No hay suficientes cilindros llenos sin asignar. Disponibles: ${a.llenos||0}.`);if(n>(a.vacios||0))throw Error(`No hay suficientes cilindros vacíos sin asignar. Disponibles: ${a.vacios||0}.`);return await r(`inventario`,{...a,llenos:(a.llenos||0)-t,vacios:(a.vacios||0)-n}),await r(`inventario`,{...o,llenos:(o.llenos||0)+t,vacios:(o.vacios||0)+n}),p()}function x(e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<0||t<0)throw Error(`Las cantidades deben ser números enteros mayores o iguales a 0.`)}var S,C=e((()=>{d(),S={ROJO:`ROJO`,BLANCO:`BLANCO`,CLIENTES:`CLIENTES`,SIN_ASIGNAR:`SIN ASIGNAR`}}));function w(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}async function T({nombre:e,telefono:t=``,direccion:n=``,sector:i=``,observacion:a=``}){if(e=e.trim(),!e)throw Error(`El nombre del cliente es obligatorio.`);let o={id_cliente:w(),nombre:e,telefono:t,direccion:n,sector:i,fecha_registro:new Date().toISOString(),estado:`ACTIVO`,observacion:a,pendientes_actuales:0,sync_estado:`PENDIENTE`};return await r(`clientes`,o),o}async function E(){return(await a(`clientes`)).filter(e=>e.estado===`ACTIVO`).sort((e,t)=>e.nombre.localeCompare(t.nombre))}async function D(e){return i(`clientes`,e)}async function O(){return(await a(`clientes`)).filter(e=>e.estado===`ACTIVO`).reduce((e,t)=>e+(t.pendientes_actuales||0),0)}async function k(){let e=((await p()).clientes?.pendientes||0)-await O();return Math.max(0,e)}async function A(e){if(!Array.isArray(e))throw Error(`Las asignaciones deben ser un arreglo.`);let t=(await p()).clientes?.pendientes||0,n=(await a(`clientes`)).filter(e=>e.estado===`ACTIVO`),i=new Map(n.map(e=>[e.id_cliente,e])),o=0;for(let t of e){let e=Number(t.cantidad);if(!Number.isInteger(e)||e<0)throw Error(`Las cantidades iniciales deben ser números enteros mayores o iguales a 0.`);if(e!==0){if(!i.get(t.idCliente))throw Error(`Uno de los clientes seleccionados no existe o está inactivo.`);o+=e}}let s=t-n.reduce((e,t)=>e+(t.pendientes_actuales||0),0);if(o>s)throw Error(`No hay suficientes pendientes iniciales. Disponibles: ${s}.`);for(let t of e){let e=Number(t.cantidad);if(e===0)continue;let n=i.get(t.idCliente);n.pendientes_actuales=(n.pendientes_actuales||0)+e,n.sync_estado=`PENDIENTE`,await r(`clientes`,n)}return{asignados:o,disponibles:s-o}}async function j(e,t){if(t=Number(t),!Number.isInteger(t))throw Error(`La cantidad debe ser un número entero.`);let n=await D(e);if(!n)throw Error(`El cliente no existe.`);let i=(n.pendientes_actuales||0)+t;if(i<0)throw Error(`El pendiente del cliente no puede quedar negativo.`);n.pendientes_actuales=i,n.sync_estado=`PENDIENTE`,await r(`clientes`,n);let a=await O();return await m(S.CLIENTES,{pendientes:a}),n}var M=e((()=>{d(),C()}));function N(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}async function P(e){let t=await i(`inventario`,e);if(!t||e!==S.ROJO&&e!==S.BLANCO)throw Error(`No existe el camión ${e}.`);return t}function F(e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<0||t<0)throw Error(`Las cantidades deben ser números enteros mayores o iguales a 0.`)}function I(e,t=0,n=0){if(t>(e.llenos||0))throw Error(`El camión no tiene suficientes cilindros llenos. Disponibles: ${e.llenos||0}.`);if(n>(e.vacios||0))throw Error(`El camión no tiene suficientes cilindros vacíos. Disponibles: ${e.vacios||0}.`)}async function L(e){let t=await D(e);if(!t)throw Error(`El cliente seleccionado no existe.`);if(t.estado!==`ACTIVO`)throw Error(`El cliente seleccionado está inactivo.`);return t}async function R(e){let t={id_movimiento:N(),fecha_hora:new Date().toISOString(),estado:`ACTIVO`,created_at:new Date().toISOString(),dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,...e};return await r(`movimientos`,t),t}async function ee({idCliente:e,camion:t,cantidad:n,observacion:r=``}){if(n=Number(n),!Number.isInteger(n)||n<=0)throw Error(`La cantidad entregada debe ser un número entero mayor que 0.`);let i=await P(t);return I(i,n,0),await L(e),await m(t,{llenos:(i.llenos||0)-n}),await j(e,n),R({tipo:B.ENTREGA_CLIENTE,id_cliente:e,camion_origen:t,camion_destino:null,llenos:n,vacios:0,observacion:r})}async function te({idCliente:e,camion:t,cantidad:n,observacion:r=``,retiroEspecial:i=!1}){if(n=Number(n),!Number.isInteger(n)||n<=0)throw Error(`La cantidad retirada debe ser un número entero mayor que 0.`);let a=await P(t),o=(await L(e)).pendientes_actuales||0;if(i){if(r=r.trim(),!r)throw Error(`La observación es obligatoria para un retiro especial.`);return await m(t,{vacios:(a.vacios||0)+n}),R({tipo:B.RETIRO_CLIENTE,id_cliente:e,camion_origen:null,camion_destino:t,llenos:0,vacios:n,observacion:`[RETIRO ESPECIAL] ${r}`,retiro_especial:!0})}if(n>o)throw Error(`El cliente tiene ${o} cilindros pendientes. No puedes retirar ${n}.`);return await j(e,-n),await m(t,{vacios:(a.vacios||0)+n}),R({tipo:B.RETIRO_CLIENTE,id_cliente:e,camion_origen:null,camion_destino:t,llenos:0,vacios:n,observacion:r,retiro_especial:!1})}async function ne({idCliente:e,camion:t,llenos:n,vacios:r,observacion:i=``}){if(n=Number(n),r=Number(r),F(n,r),n<=0&&r<=0)throw Error(`Debes entregar o retirar al menos un cilindro.`);let a=await P(t);I(a,n,0);let o=(await L(e)).pendientes_actuales||0;if(o+n-r<0)throw Error(`El cliente tiene ${o} pendientes. No puedes retirar ${r} porque recibirías más de lo que debe.`);return await m(t,{llenos:(a.llenos||0)-n,vacios:(a.vacios||0)+r}),await j(e,n-r),R({tipo:B.ENTREGA_RETIRO,id_cliente:e,camion_origen:t,camion_destino:t,llenos:n,vacios:r,observacion:i})}async function re({camion:e,cantidad:t,observacion:n=``}){if(t=Number(t),!Number.isInteger(t)||t<=0)throw Error(`La cantidad enviada a planta debe ser un número entero mayor que 0.`);let i=await P(e);I(i,0,t);let a=N();await m(e,{vacios:(i.vacios||0)-t});let o={id_viaje:a,camion:e,fecha_salida:new Date().toISOString(),fecha_regreso:null,estado:`ABIERTO`,vacios_enviados:t,llenos_recibidos:0,id_movimiento_salida:null,id_movimiento_regreso:null};await r(`viajes_planta`,o);let s=await R({tipo:B.SALIDA_PLANTA,id_cliente:null,camion_origen:e,camion_destino:null,llenos:0,vacios:t,id_viaje:a,observacion:n});return o.id_movimiento_salida=s.id_movimiento,await r(`viajes_planta`,o),s}async function ie({idViaje:e,llenos:t,observacion:n=``}){if(t=Number(t),!Number.isInteger(t)||t<=0)throw Error(`La cantidad que regresa de planta debe ser un número entero mayor que 0.`);let a=await i(`viajes_planta`,e);if(!a)throw Error(`El viaje de planta no existe.`);if(a.estado!==`ABIERTO`)throw Error(`Este viaje de planta ya está cerrado.`);if(t!==a.vacios_enviados)throw Error(`El viaje envió ${a.vacios_enviados} cilindros. El regreso debe registrar exactamente ${a.vacios_enviados}.`);let o=await P(a.camion);await m(a.camion,{llenos:(o.llenos||0)+t});let s=await R({tipo:B.REGRESO_PLANTA,id_cliente:null,camion_origen:null,camion_destino:a.camion,llenos:t,vacios:0,id_viaje:e,observacion:n});return a.estado=`CERRADO`,a.fecha_regreso=new Date().toISOString(),a.llenos_recibidos=t,a.id_movimiento_regreso=s.id_movimiento,await r(`viajes_planta`,a),s}async function ae({origen:e,destino:t,llenos:n=0,vacios:r=0,observacion:i=``}){if(n=Number(n),r=Number(r),F(n,r),n<=0&&r<=0)throw Error(`Debes trasladar al menos un cilindro.`);if(e===t)throw Error(`El camión de origen y destino deben ser diferentes.`);if(e!==S.ROJO&&e!==S.BLANCO||t!==S.ROJO&&t!==S.BLANCO)throw Error(`El traslado solo puede realizarse entre ROJO y BLANCO.`);let a=await P(e),o=await P(t);return I(a,n,r),await m(e,{llenos:(a.llenos||0)-n,vacios:(a.vacios||0)-r}),await m(t,{llenos:(o.llenos||0)+n,vacios:(o.vacios||0)+r}),R({tipo:B.TRASLADO,id_cliente:null,camion_origen:e,camion_destino:t,llenos:n,vacios:r,observacion:i})}async function oe(){return(await a(`movimientos`)).sort((e,t)=>new Date(t.fecha_hora)-new Date(e.fecha_hora))}async function z(){return(await a(`viajes_planta`)).filter(e=>e.estado===`ABIERTO`).sort((e,t)=>new Date(t.fecha_salida)-new Date(e.fecha_salida))}var B,V=e((()=>{d(),C(),M(),B={ENTREGA_CLIENTE:`ENTREGA A CLIENTE`,RETIRO_CLIENTE:`RETIRO DE CLIENTE`,ENTREGA_RETIRO:`ENTREGA + RETIRO`,SALIDA_PLANTA:`SALIDA A PLANTA`,REGRESO_PLANTA:`REGRESO DE PLANTA`,TRASLADO:`TRASLADO ENTRE CAMIONES`}}));async function H(){let e=await a(`movimientos`),t=await a(`clientes`);return{movimientos:e.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`),clientes:t.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`)}}async function U(){let e=await H();return{movimientos:e.movimientos.length,clientes:e.clientes.length,total:e.movimientos.length+e.clientes.length}}var W=e((()=>{d()}));function G(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}async function K(){let e=await a(`movimientos`),t=G();return e.filter(e=>e.estado===`ACTIVO`&&e.fecha_hora?.slice(0,10)===t&&(e.tipo===`ENTREGA A CLIENTE`||e.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(t.llenos||0),0)}async function se(e){return(await a(`movimientos`)).filter(t=>t.estado===`ACTIVO`&&t.fecha_hora?.slice(0,10)===e&&(t.tipo===`ENTREGA A CLIENTE`||t.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(t.llenos||0),0)}async function ce(e,t){return(await a(`movimientos`)).filter(n=>{if(n.estado!==`ACTIVO`)return!1;let r=n.fecha_hora?.slice(0,10);return r>=e&&r<=t&&(n.tipo===`ENTREGA A CLIENTE`||n.tipo===`ENTREGA + RETIRO`)}).reduce((e,t)=>e+(t.llenos||0),0)}async function le(){let e=await a(`movimientos`),t={};return e.filter(e=>e.estado===`ACTIVO`&&(e.tipo===`ENTREGA A CLIENTE`||e.tipo===`ENTREGA + RETIRO`)).forEach(e=>{let n=e.id_cliente||`SIN CLIENTE`;t[n]||(t[n]=0),t[n]+=e.llenos||0}),t}var ue=e((()=>{d()})),q=e((()=>{}));t((()=>{C(),V(),M(),W(),d(),ue(),q();var e=document.getElementById(`app`),t=`inicio`;document.addEventListener(`DOMContentLoaded`,n);async function n(){await f(),r(),c()}function r(){`serviceWorker`in navigator&&navigator.serviceWorker.register(`/sw.js`).catch(e=>{console.error(`Error Service Worker:`,e)})}async function c(){switch(t){case`inicio`:await l();break;case`movimientos`:await u();break;case`clientes`:await P();break;case`inventario`:await $();break;case`sync`:await L();break;case`reportes`:await fe();break;default:await l()}}async function l(){let t=await p(),n=await U(),r=g(t),i=await K(),a=(t.rojo?.vacios||0)+(t.blanco?.vacios||0);e.innerHTML=`

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

            ${n.total===0?`
                <div class="status-bar status-success">
                    🟢 Datos actualizados
                </div>
              `:`
                <div class="status-bar status-warning">
                    🟡 Hay ${n.total} elemento(s) pendiente(s) de sincronización
                </div>
              `}


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
                            ${i}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span class="label">
                            VACÍOS DISPONIBLES
                        </span>

                        <strong class="number">
                            ${a}
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
                            ${t.rojo?.llenos||0}
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
                            ${t.rojo?.vacios||0}
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
                            ${t.blanco?.llenos||0}
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
                            ${t.blanco?.vacios||0}
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
                            ${t.clientes?.pendientes||0}
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
                        ${r}
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


        ${Z(`inicio`)}

    `,document.getElementById(`btnApertura`)?.addEventListener(`click`,de),document.getElementById(`btnNuevoMovimiento`)?.addEventListener(`click`,m),document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{try{let e=await o();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}}),document.getElementById(`btnImportarBD`)?.addEventListener(`click`,()=>{document.getElementById(`inputImportarBD`)?.click()}),document.getElementById(`inputImportarBD`)?.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){if(!confirm(`⚠️ ATENCIÓN

Cargar este respaldo reemplazará los datos actuales.

¿Quieres continuar?`)){e.target.value=``;return}try{await s(t),alert(`✅ Base de datos restaurada correctamente.`),window.location.reload()}catch(e){console.error(e),alert(`❌ No se pudo cargar el respaldo.\n\n${e.message}`)}e.target.value=``}}),Q()}async function u(){let t=await oe();e.innerHTML=`

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


        ${Z(`movimientos`)}
    `,document.getElementById(`btnNuevo`).addEventListener(`click`,m),Q()}function m(){e.innerHTML=`

        <header class="app-header">

            <h1>NUEVO MOVIMIENTO</h1>

            <p>Selecciona el tipo</p>

        </header>


        <main class="main-content">

            <div class="movement-grid">

                ${h(`🚚`,`ENTREGA A CLIENTE`,`Entrega cilindros llenos`,B.ENTREGA_CLIENTE)}


                ${h(`↩️`,`RETIRO DE CLIENTE`,`Retira cilindros vacíos`,B.RETIRO_CLIENTE)}


                ${h(`⇄`,`ENTREGA + RETIRO`,`Entrega llenos y recibe vacíos`,B.ENTREGA_RETIRO)}


                ${h(`🏭`,`SALIDA A PLANTA`,`Envía cilindros vacíos a planta`,B.SALIDA_PLANTA)}


                ${h(`🏭`,`REGRESO DE PLANTA`,`Recibe cilindros llenos`,B.REGRESO_PLANTA)}


                ${h(`🔄`,`TRASLADO ENTRE CAMIONES`,`Mueve cilindros entre camiones`,B.TRASLADO)}

            </div>


            <button
                class="secondary-button"
                style="margin-top: 15px;"
                id="btnVolver"
            >
                ← Volver
            </button>

        </main>
    `,document.querySelectorAll(`[data-movement]`).forEach(e=>{e.addEventListener(`click`,()=>x(e.dataset.movement))}),document.getElementById(`btnVolver`).addEventListener(`click`,()=>{t=`movimientos`,c()})}function h(e,t,n,r){return`

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
    `}async function x(e){switch(e){case B.ENTREGA_CLIENTE:await S();break;case B.RETIRO_CLIENTE:await w();break;case B.ENTREGA_RETIRO:await D();break;case B.SALIDA_PLANTA:await O();break;case B.REGRESO_PLANTA:await j();break;case B.TRASLADO:await N()}}async function S(){let t=await E();e.innerHTML=`

        ${R(`🚚 ENTREGA A CLIENTE`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${G(t)}


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
    `,J(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ee({idCliente:t.get(`idCliente`),camion:t.get(`camion`),llenos:t.get(`llenos`),observacion:t.get(`observacion`)}),Y(`ENTREGA REGISTRADA`)}catch(e){X(e.message)}})}async function w(){let t=await E();e.innerHTML=`

        ${R(`↩️ RETIRO DE CLIENTE`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${G(t)}


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


                ${H()}

            </form>

        </main>
    `,J();let n=document.getElementById(`retiroEspecial`),r=document.getElementById(`observacionRetiro`);n.addEventListener(`change`,()=>{n.checked?(r.required=!0,r.placeholder=`Obligatoria: explica por qué este saldo no estaba registrado.`):(r.required=!1,r.placeholder=`Opcional`)}),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await te({idCliente:t.get(`idCliente`),camion:t.get(`camion`),cantidad:t.get(`vacios`),observacion:t.get(`observacion`),retiroEspecial:t.get(`retiroEspecial`)===`on`}),Y(`RETIRO REGISTRADO`)}catch(e){X(e.message)}})}async function D(){let t=await E();e.innerHTML=`

        ${R(`⇄ ENTREGA + RETIRO`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${G(t)}


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
    `,J();let n=document.querySelector(`[name="idCliente"]`),r=document.querySelector(`[name="llenos"]`),a=document.querySelector(`[name="vacios"]`);async function o(){let e=await i(`clientes`,n.value);if(!e)return;let t=Number(r.value)||0,o=Number(a.value)||0,s=(e.pendientes_actuales||0)+t-o;document.getElementById(`previewPendiente`).textContent=`Pendientes después: ${s}`}n.addEventListener(`change`,o),r.addEventListener(`input`,o),a.addEventListener(`input`,o),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ne({idCliente:t.get(`idCliente`),camion:t.get(`camion`),llenos:t.get(`llenos`),vacios:t.get(`vacios`),observacion:t.get(`observacion`)}),Y(`ENTREGA + RETIRO REGISTRADO`)}catch(e){X(e.message)}})}async function O(){e.innerHTML=`

        ${R(`🏭 SALIDA A PLANTA`)}


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
    `,J(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await re({camion:t.get(`camion`),vacios:t.get(`vacios`),observacion:t.get(`observacion`)}),Y(`SALIDA A PLANTA REGISTRADA`)}catch(e){X(e.message)}})}async function j(){let t=await z();e.innerHTML=`

        ${R(`🏭 REGRESO DE PLANTA`)}


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
    `,J(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ie({idViaje:t.get(`idViaje`),llenos:t.get(`llenos`),observacion:t.get(`observacion`)}),Y(`REGRESO DE PLANTA REGISTRADO`)}catch(e){X(e.message)}})}async function N(){e.innerHTML=`

        ${R(`🔄 TRASLADO ENTRE CAMIONES`)}


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
    `,J(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ae({origen:t.get(`origen`),destino:t.get(`destino`),tipoCilindro:t.get(`tipoCilindro`),cantidad:t.get(`cantidad`),observacion:t.get(`observacion`)}),Y(`TRASLADO REGISTRADO`)}catch(e){X(e.message)}})}async function P(){let t=await E();e.innerHTML=`

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
                    ${await k()}
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


        ${Z(`clientes`)}
    `,document.getElementById(`btnNuevoCliente`).addEventListener(`click`,I),document.getElementById(`btnPendientesIniciales`).addEventListener(`click`,F),Q()}async function F(){let t=await E(),n=await k();e.innerHTML=`

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
                    ${n}
                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Asignar a clientes
                </div>


                <form id="formPendientesIniciales">

                    ${t.map(e=>`

                        <div class="form-group">

                            <label>
                                ${e.nombre}
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                class="input-pendiente-inicial"
                                data-id="${e.id_cliente}"
                                value="0"
                            >

                        </div>

                    `).join(``)}


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


        ${Z(`clientes`)}
    `;let r=document.querySelectorAll(`.input-pendiente-inicial`),i=document.getElementById(`totalPendientesAsignar`);function a(){let e=0;r.forEach(t=>{let n=Number(t.value)||0;e+=n}),i.textContent=e}r.forEach(e=>{e.addEventListener(`input`,a)}),document.getElementById(`formPendientesIniciales`).addEventListener(`submit`,async e=>{e.preventDefault();let t=[];r.forEach(e=>{t.push({idCliente:e.dataset.id,cantidad:Number(e.value)||0})});let i=t.reduce((e,t)=>e+t.cantidad,0);if(i===0){alert(`Debes asignar al menos un pendiente.`);return}if(i>n){alert(`No puedes asignar ${i}. Solo hay ${n} pendientes iniciales disponibles.`);return}try{await A(t),alert(`Pendientes iniciales asignados correctamente.`),await P()}catch(e){alert(e.message)}}),document.getElementById(`btnCancelarPendientesIniciales`).addEventListener(`click`,P),Q()}function I(){e.innerHTML=`

        ${R(`👤 NUEVO CLIENTE`)}


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
    `,J(),document.getElementById(`formCliente`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await T({nombre:t.get(`nombre`),telefono:t.get(`telefono`),direccion:t.get(`direccion`),sector:t.get(`sector`),observacion:t.get(`observacion`)}),Y(`CLIENTE REGISTRADO`)}catch(e){X(e.message)}})}async function L(){let t=await U();e.innerHTML=`

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


        ${Z(`sync`)}
    `,document.getElementById(`btnSync`).addEventListener(`click`,()=>alert(`La conexión con el PC se implementará después de terminar el motor local.`)),document.getElementById(`btnActualizar`).addEventListener(`click`,()=>alert(`La actualización PC → móvil se implementará después de la sincronización.`)),Q()}function R(e){return`

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
    `}function G(e){return`

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
    `}function J(){let e=document.getElementById(`btnCancelar`);e&&e.addEventListener(`click`,()=>{m()})}function Y(n){e.innerHTML=`

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
    `,document.getElementById(`btnContinuar`).addEventListener(`click`,()=>{t=`inicio`,c()})}function X(e){alert(`⚠️ No se puede registrar\n\n${e}`)}function Z(e){return`

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
    `}function Q(){document.querySelectorAll(`[data-page]`).forEach(e=>{e.addEventListener(`click`,()=>{t=e.dataset.page,c()})})}async function de(){e.innerHTML=`

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


        ${Z(`inicio`)}

    `,document.getElementById(`formApertura`).addEventListener(`submit`,async e=>{e.preventDefault();try{await _({rojoLlenos:Number(document.getElementById(`rojoLlenos`).value),rojoVacios:Number(document.getElementById(`rojoVacios`).value),blancoLlenos:Number(document.getElementById(`blancoLlenos`).value),blancoVacios:Number(document.getElementById(`blancoVacios`).value),clientesPendientes:Number(document.getElementById(`clientesPendientes`).value)}),alert(`Apertura configurada correctamente.`),await l()}catch(e){alert(e.message)}}),document.getElementById(`btnCancelarApertura`)?.addEventListener(`click`,l),Q()}async function fe(){let e=await K(),t=await le(),n=await a(`clientes`),r=Object.fromEntries(n.map(e=>[e.id_cliente,e.nombre])),i=document.getElementById(`app`);i.innerHTML=`
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

            ${Z(`reportes`)}

        </div>
    `,document.getElementById(`btnFechaReporte`).addEventListener(`click`,async()=>{let e=document.getElementById(`fechaReporte`).value;if(!e){alert(`Selecciona una fecha.`);return}let t=await se(e);document.getElementById(`resultadoFecha`).innerHTML=`
                <div class="report-result">
                    ${t} cilindros vendidos
                </div>
            `}),document.getElementById(`btnRangoReporte`).addEventListener(`click`,async()=>{let e=document.getElementById(`fechaInicio`).value,t=document.getElementById(`fechaFin`).value;if(!e||!t){alert(`Selecciona las dos fechas.`);return}if(e>t){alert(`La fecha inicial no puede ser mayor que la final.`);return}let n=await ce(e,t);document.getElementById(`resultadoRango`).innerHTML=`
                <div class="report-result">
                    ${n} cilindros vendidos
                </div>
            `}),Q()}document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{try{let e=await o();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}});async function $(){let n=await p(),r=n.sinAsignar||{llenos:0,vacios:0};e.innerHTML=`

        <section class="card">

            <h2>Inventario</h2>

            <p>
                Total de la empresa:
                <strong>${g(n)}</strong>
            </p>

        </section>


        <section class="card">

            <h3>Inventario actual</h3>

            <p>
                🔴 Rojo:
                ${n.rojo.llenos||0} llenos /
                ${n.rojo.vacios||0} vacíos
            </p>

            <p>
                ⚪ Blanco:
                ${n.blanco.llenos||0} llenos /
                ${n.blanco.vacios||0} vacíos
            </p>

            <p>
                👥 Clientes:
                ${n.clientes.pendientes||0}
            </p>

            <p>
                📦 Sin asignar:
                ${r.llenos||0} llenos /
                ${r.vacios||0} vacíos
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
                ${r.llenos||0} llenos /
                ${r.vacios||0} vacíos
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
    `,document.getElementById(`formAgregarSinAsignar`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await v({llenos:Number(document.getElementById(`agregarLlenos`).value),vacios:Number(document.getElementById(`agregarVacios`).value),observacion:document.getElementById(`agregarObservacion`).value.trim()}),alert(`Cilindros añadidos correctamente.`),await $()}catch(e){alert(e.message)}}),document.getElementById(`formRetirarSinAsignar`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await y({llenos:Number(document.getElementById(`retirarLlenos`).value),vacios:Number(document.getElementById(`retirarVacios`).value),observacion:document.getElementById(`retirarObservacion`).value.trim()}),alert(`Cilindros retirados correctamente.`),await $()}catch(e){alert(e.message)}}),document.getElementById(`formAsignarCamion`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await b({camion:document.getElementById(`asignarCamion`).value,llenos:Number(document.getElementById(`asignarLlenos`).value),vacios:Number(document.getElementById(`asignarVacios`).value)}),alert(`Cilindros asignados correctamente.`),await $()}catch(e){alert(e.message)}}),document.getElementById(`btnVolverInicioInventario`)?.addEventListener(`click`,()=>{t=`inicio`,c()})}}))();