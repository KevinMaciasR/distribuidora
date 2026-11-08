var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n,r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x=e((()=>{(function(e){e.Unimplemented=`UNIMPLEMENTED`,e.Unavailable=`UNAVAILABLE`})(n||={}),r=class extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}},i=e=>e?.androidBridge?`android`:e?.webkit?.messageHandlers?.bridge?`ios`:`web`,a=e=>{let t=e.CapacitorCustomPlatform||null,a=e.Capacitor||{},o=a.Plugins=a.Plugins||{},s=()=>t===null?i(e):t.name,c=()=>s()!==`web`,l=e=>!!(f.get(e)?.platforms.has(s())||u(e)),u=e=>a.PluginHeaders?.find(t=>t.name===e),d=t=>e.console.error(t),f=new Map;return a.convertFileSrc||=e=>e,a.getPlatform=s,a.handleError=d,a.isNativePlatform=c,a.isPluginAvailable=l,a.registerPlugin=(e,i={})=>{let c=f.get(e);if(c)return console.warn(`Capacitor plugin "${e}" already registered. Cannot register plugins twice.`),c.proxy;let l=s(),d=u(e),p,m=async()=>(!p&&l in i?p=p=typeof i[l]==`function`?await i[l]():i[l]:t!==null&&!p&&`web`in i&&(p=p=typeof i.web==`function`?await i.web():i.web),p),h=(t,i)=>{if(d){let n=d?.methods.find(e=>i===e.name);if(n)return n.rtype===`promise`?t=>a.nativePromise(e,i.toString(),t):(t,n)=>a.nativeCallback(e,i.toString(),t,n);if(t)return t[i]?.bind(t)}else if(t)return t[i]?.bind(t);else throw new r(`"${e}" plugin is not implemented on ${l}`,n.Unimplemented)},g=t=>{let i,a=(...a)=>{let o=m().then(o=>{let s=h(o,t);if(s){let e=s(...a);return i=e?.remove,e}throw new r(`"${e}.${t}()" is not implemented on ${l}`,n.Unimplemented)});return t===`addListener`&&(o.remove=async()=>i()),o};return a.toString=()=>`${t.toString()}() { [capacitor code] }`,Object.defineProperty(a,"name",{value:t,writable:!1,configurable:!1}),a},_=g(`addListener`),v=g(`removeListener`),y=(e,t)=>{let n=_({eventName:e},t),r=async()=>{let r=await n;v({eventName:e,callbackId:r},t)},i=new Promise(e=>n.then(()=>e({remove:r})));return i.remove=async()=>{console.warn(`Using addListener() without 'await' is deprecated.`),await r()},i},b=new Proxy({},{get(e,t){switch(t){case`$$typeof`:return;case`toJSON`:return()=>({});case`addListener`:return d?y:_;case`removeListener`:return v;default:return g(t)}}});return o[e]=b,f.set(e,{name:e,proxy:b,platforms:new Set([...Object.keys(i),...d?[l]:[]])}),b},a.Exception=r,a.DEBUG=!!a.DEBUG,a.isLoggingEnabled=!!a.isLoggingEnabled,a},o=e=>e.Capacitor=a(e),s=o(typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:typeof global<`u`?global:{}),c=s.registerPlugin,l=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);let r=this.windowListeners[e];return r&&!r.registered&&this.addWindowListener(r),n&&this.sendRetainedArgumentsForEvent(e),Promise.resolve({remove:async()=>this.removeListener(e,t)})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){let r=this.listeners[e];if(!r){if(n){let n=this.retainedEventArguments[e];n||=[],n.push(t),this.retainedEventArguments[e]=n}return}r.forEach(e=>e(t))}hasListeners(e){return!!this.listeners[e]?.length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:e=>{this.notifyListeners(t,e)}}}unimplemented(e=`not implemented`){return new s.Exception(e,n.Unimplemented)}unavailable(e=`not available`){return new s.Exception(e,n.Unavailable)}async removeListener(e,t){let n=this.listeners[e];if(!n)return;let r=n.indexOf(t);r!==-1&&this.listeners[e].splice(r,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(t=>{this.notifyListeners(e,t)}))}},u=e=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),d=e=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),f=class extends l{async getCookies(){let e=document.cookie,t={};return e.split(`;`).forEach(e=>{if(e.length<=0)return;let[n,r]=e.replace(/=/,`CAP_COOKIE`).split(`CAP_COOKIE`);n=d(n).trim(),r=d(r).trim(),t[n]=r}),t}async setCookie(e){try{let t=u(e.key),n=u(e.value),r=e.expires?`; expires=${e.expires.replace(`expires=`,``)}`:``,i=(e.path||`/`).replace(`path=`,``),a=e.url!=null&&e.url.length>0?`domain=${e.url}`:``;document.cookie=`${t}=${n||``}${r}; path=${i}; ${a};`}catch(e){return Promise.reject(e)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(e){return Promise.reject(e)}}async clearCookies(){try{let e=document.cookie.split(`;`)||[];for(let t of e)document.cookie=t.replace(/^ +/,``).replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}},c(`CapacitorCookies`,{web:()=>new f}),p=async e=>new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.indexOf(`,`)>=0?e.split(`,`)[1]:e)},r.onerror=e=>n(e),r.readAsDataURL(e)}),m=(e={})=>{let t=Object.keys(e);return Object.keys(e).map(e=>e.toLocaleLowerCase()).reduce((n,r,i)=>(n[r]=e[t[i]],n),{})},h=(e,t=!0)=>e?Object.entries(e).reduce((e,n)=>{let[r,i]=n,a,o;return Array.isArray(i)?(o=``,i.forEach(e=>{a=t?encodeURIComponent(e):e,o+=`${r}=${a}&`}),o.slice(0,-1)):(a=t?encodeURIComponent(i):i,o=`${r}=${a}`),`${e}&${o}`},``).substr(1):null,g=(e,t={})=>{let n=Object.assign({method:e.method||`GET`,headers:e.headers},t),r=m(e.headers)[`content-type`]||``;if(typeof e.data==`string`)n.body=e.data;else if(r.includes(`application/x-www-form-urlencoded`)){let t=new URLSearchParams;for(let[n,r]of Object.entries(e.data||{}))t.set(n,r);n.body=t.toString()}else if(r.includes(`multipart/form-data`)||e.data instanceof FormData){let t=new FormData;if(e.data instanceof FormData)e.data.forEach((e,n)=>{t.append(n,e)});else for(let n of Object.keys(e.data))t.append(n,e.data[n]);n.body=t;let r=new Headers(n.headers);r.delete(`content-type`),n.headers=r}else(r.includes(`application/json`)||typeof e.data==`object`)&&(n.body=JSON.stringify(e.data));return n},_=class extends l{async request(e){let t=g(e,e.webFetchExtra),n=h(e.params,e.shouldEncodeUrlParams),r=n?`${e.url}?${n}`:e.url,i=await fetch(r,t),a=i.headers.get(`content-type`)||``,{responseType:o=`text`}=i.ok?e:{};a.includes(`application/json`)&&(o=`json`);let s,c;switch(o){case`arraybuffer`:case`blob`:c=await i.blob(),s=await p(c);break;case`json`:s=await i.json();break;default:s=await i.text()}let l={};return i.headers.forEach((e,t)=>{l[t]=e}),{data:s,headers:l,status:i.status,url:i.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:`GET`}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:`POST`}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:`PUT`}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:`PATCH`}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:`DELETE`}))}},c(`CapacitorHttp`,{web:()=>new _}),(function(e){e.Dark=`DARK`,e.Light=`LIGHT`,e.Default=`DEFAULT`})(v||={}),(function(e){e.StatusBar=`StatusBar`,e.NavigationBar=`NavigationBar`})(y||={}),b=class extends l{async setStyle(){this.unavailable(`not available for web`)}async setAnimation(){this.unavailable(`not available for web`)}async show(){this.unavailable(`not available for web`)}async hide(){this.unavailable(`not available for web`)}},c(`SystemBars`,{web:()=>new b})}));function S(){return I||(I=new Promise((e,t)=>{let n=indexedDB.open(P,F);n.onupgradeneeded=e=>{let t=e.target.result;if(t.objectStoreNames.contains(`configuracion`)||t.createObjectStore(`configuracion`,{keyPath:`id`}),!t.objectStoreNames.contains(`clientes`)){let e=t.createObjectStore(`clientes`,{keyPath:`id_cliente`});e.createIndex(`estado`,`estado`,{unique:!1}),e.createIndex(`nombre`,`nombre`,{unique:!1})}if(t.objectStoreNames.contains(`inventario`)||t.createObjectStore(`inventario`,{keyPath:`ubicacion`}),!t.objectStoreNames.contains(`movimientos`)){let e=t.createObjectStore(`movimientos`,{keyPath:`id_movimiento`});e.createIndex(`fecha_hora`,`fecha_hora`,{unique:!1}),e.createIndex(`tipo`,`tipo`,{unique:!1}),e.createIndex(`sync_estado`,`sync_estado`,{unique:!1}),e.createIndex(`estado`,`estado`,{unique:!1})}t.objectStoreNames.contains(`viajes_planta`)||t.createObjectStore(`viajes_planta`,{keyPath:`id_viaje`}).createIndex(`estado`,`estado`,{unique:!1}),t.objectStoreNames.contains(`sincronizacion`)||t.createObjectStore(`sincronizacion`,{keyPath:`id`})},n.onsuccess=t=>{e(t.target.result)},n.onerror=()=>{t(n.error)}}),I)}async function C(e,t){let n=await S();return new Promise((r,i)=>{let a=n.transaction(e,`readwrite`);a.objectStore(e).put(t),a.oncomplete=()=>r(t),a.onerror=()=>i(a.error)})}async function w(e,t){let n=await S();return new Promise((r,i)=>{let a=n.transaction([`clientes`,`inventario`],`readwrite`);a.objectStore(`clientes`).put(e),a.objectStore(`inventario`).put(t),a.oncomplete=()=>{r({cliente:e,inventario:t})},a.onerror=()=>{i(a.error||Error(`No se pudieron guardar los cambios.`))},a.onabort=()=>{i(a.error||Error(`La operación fue cancelada.`))}})}async function T(e,t){let n=await S();return new Promise((r,i)=>{let a=n.transaction(e,`readonly`).objectStore(e).get(t);a.onsuccess=()=>r(a.result),a.onerror=()=>i(a.error)})}async function E(e){let t=await S();return new Promise((n,r)=>{let i=t.transaction(e,`readonly`).objectStore(e).getAll();i.onsuccess=()=>n(i.result),i.onerror=()=>r(i.error)})}async function D(e,t){if(!Array.isArray(e)||e.length===0)throw Error(`Debes indicar al menos un almacén.`);if(typeof t!=`function`)throw Error(`La función de procesamiento no es válida.`);let n=await S();return new Promise((r,i)=>{let a=n.transaction(e,`readwrite`),o={},s=e.length,c,l=null;for(let n of e){let r=a.objectStore(n).getAll();r.onsuccess=()=>{if(o[n]=r.result,s--,s===0)try{let n=t(o);if(!n||typeof n!=`object`)throw Error(`El plan de cambios no es válido.`);c=n.resultado;for(let[t,r]of Object.entries(n.puts||{})){if(!e.includes(t))throw Error(`Almacén no incluido en la transacción: ${t}`);for(let e of r)a.objectStore(t).put(e)}for(let[t,r]of Object.entries(n.deletes||{})){if(!e.includes(t))throw Error(`Almacén no incluido en la transacción: ${t}`);for(let e of r)a.objectStore(t).delete(e)}}catch(e){l=e,a.abort()}},r.onerror=()=>{l=r.error,a.abort()}}a.oncomplete=()=>r(c),a.onabort=()=>{i(l||a.error||Error(`La transacción fue cancelada.`))},a.onerror=()=>{i(l||a.error||Error(`Error en la transacción.`))}})}function O(){let e=new Date;return`respaldo_distribuidora_${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}_${String(e.getHours()).padStart(2,`0`)}-${String(e.getMinutes()).padStart(2,`0`)}-${String(e.getSeconds()).padStart(2,`0`)}.json`}async function k(){let e=await S(),t=Array.from(e.objectStoreNames);return new Promise((n,r)=>{let i=e.transaction(t,`readonly`),a={},o=null;for(let e of t){let t=i.objectStore(e).getAll();t.onsuccess=()=>{a[e]=t.result},t.onerror=()=>{o=t.error,i.abort()}}i.oncomplete=()=>{n({stores:t,datos:a})},i.onabort=()=>{r(o||i.error||Error(`No se pudieron leer todos los datos.`))},i.onerror=()=>{r(i.error||Error(`Error al leer la base de datos.`))}})}async function A(){alert(`PUNTO 2: ENTRÓ A exportarBaseDatos`);let e=await k();alert(`PUNTO 3: SE LEYÓ INDEXEDDB

Almacenes: `+e.stores.length+`
Clientes: `+(e.datos.clientes?.length??0)+`
Movimientos: `+(e.datos.movimientos?.length??0));let t={formato:`RESPALDO_DISTRIBUIDORA`,version:2,fecha_exportacion:new Date().toISOString(),base_datos:P,stores:e.stores,datos:e.datos},n=JSON.stringify(t,null,2);alert(`DIAGNÓSTICO DEL RESPALDO

Caracteres generados: `+n.length+`
Clientes encontrados: `+(e.datos.clientes?.length??0)+`
Almacenes incluidos: `+e.stores.length);let r=O();if(s.isNativePlatform())return alert(`PUNTO 5: ANDROID DETECTADO

Nombre: `+r+`
Caracteres enviados: `+n.length),await N.guardarArchivo({nombre:r,contenido:n}),alert(`PUNTO 6: ANDROID DEVOLVIÓ RESPUESTA CORRECTA`),r;let i=new Blob([n],{type:`application/json;charset=utf-8`}),a=URL.createObjectURL(i),o=document.createElement(`a`);return o.href=a,o.download=r,document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>{URL.revokeObjectURL(a)},6e4),r}function j(e,t){if(alert(`DIAGNÓSTICO DE IMPORTACIÓN

Almacenes: `+t.length+`
Clientes del respaldo: `+e.datos.clientes.length+`
Movimientos del respaldo: `+e.datos.movimientos.length),!e||typeof e!=`object`)throw Error(`El respaldo está vacío o no es válido.`);if(![1,2].includes(e.version))throw Error(`Versión de respaldo no compatible.`);if(e.base_datos!==P)throw Error(`El respaldo pertenece a otra base de datos.`);if(!e.datos||typeof e.datos!=`object`||Array.isArray(e.datos))throw Error(`La estructura de datos no es válida.`);for(let n of t)if(!Array.isArray(e.datos[n]))throw Error(`El respaldo está incompleto. Falta la tabla: ${n}`);for(let n of Object.keys(e.datos))if(!t.includes(n))throw Error(`El respaldo contiene una tabla desconocida: ${n}`);if(Array.isArray(e.stores)){let n=[...e.stores].sort(),r=[...t].sort();if(JSON.stringify(n)!==JSON.stringify(r))throw Error(`La estructura del respaldo no coincide con la aplicación.`)}for(let n of t)for(let t of e.datos[n])if(!t||typeof t!=`object`||Array.isArray(t))throw Error(`Hay un registro inválido en ${n}.`)}async function M(e){if(!e)throw Error(`No se seleccionó ningún archivo.`);if(!e.name||!e.name.toLowerCase().endsWith(`.json`))throw Error(`Selecciona un archivo JSON.`);let t=await e.text(),n;try{n=JSON.parse(t)}catch{throw Error(`El archivo no contiene un JSON válido.`)}let r=await S(),i=Array.from(r.objectStoreNames);return j(n,i),new Promise((e,t)=>{let a=r.transaction(i,`readwrite`),o=null;a.oncomplete=async()=>{let t=await k();alert(`RESTAURACIÓN FINALIZADA

Clientes guardados: `+t.datos.clientes.length+`
Movimientos guardados: `+t.datos.movimientos.length),e(!0)},a.onerror=()=>{t(o||a.error||Error(`Error durante la restauración.`))},a.onabort=()=>{t(o||a.error||Error(`La restauración fue cancelada.`))};try{for(let e of i){let t=a.objectStore(e);t.clear();for(let r of n.datos[e])t.put(r)}}catch(e){o=e;try{a.abort()}catch{t(e)}}})}var N,P,F,I,L=e((()=>{x(),N=c(`Respaldo`),P=`distribuidora_mobile`,F=1,I=null}));async function R(){let e=await E(`inventario`);e.find(e=>e.ubicacion===H.ROJO)||await C(`inventario`,{ubicacion:H.ROJO,llenos:0,vacios:0}),e.find(e=>e.ubicacion===H.BLANCO)||await C(`inventario`,{ubicacion:H.BLANCO,llenos:0,vacios:0}),e.find(e=>e.ubicacion===H.CASA)||await C(`inventario`,{ubicacion:H.CASA,llenos:0,vacios:0}),e.find(e=>e.ubicacion===H.CLIENTES)||await C(`inventario`,{ubicacion:H.CLIENTES,pendientes:0}),e.find(e=>e.ubicacion===H.SIN_ASIGNAR)||await C(`inventario`,{ubicacion:H.SIN_ASIGNAR,llenos:0,vacios:0})}async function z(){return await R(),{rojo:await T(`inventario`,H.ROJO),blanco:await T(`inventario`,H.BLANCO),casa:await T(`inventario`,H.CASA),clientes:await T(`inventario`,H.CLIENTES),sinAsignar:await T(`inventario`,H.SIN_ASIGNAR),viajesAbiertos:(await E(`viajes_planta`)).filter(e=>e.estado===`ABIERTO`)}}function B(e){let t=Number(e.rojo?.llenos||0)+Number(e.rojo?.vacios||0),n=Number(e.blanco?.llenos||0)+Number(e.blanco?.vacios||0),r=Number(e.casa?.llenos||0)+Number(e.casa?.vacios||0),i=Number(e.clientes?.pendientes||0),a=Number(e.sinAsignar?.llenos||0)+Number(e.sinAsignar?.vacios||0),o=(e.viajesAbiertos||[]).reduce((e,t)=>e+Number(t.vacios_enviados||0)-Number(t.llenos_recibidos||0),0);return t+n+r+i+a+o}async function ee({rojoLlenos:e,rojoVacios:t,blancoLlenos:n,blancoVacios:r,casaLlenos:i=0,casaVacios:a=0,clientesPendientes:o}){if((await E(`movimientos`)).length>0)throw Error(`No puedes modificar la apertura después de registrar movimientos.`);if([e,t,n,r,i,a,o].some(e=>!Number.isInteger(e)||e<0))throw Error(`Todos los valores deben ser números enteros mayores o iguales a 0.`);return await C(`inventario`,{ubicacion:H.ROJO,llenos:e,vacios:t}),await C(`inventario`,{ubicacion:H.BLANCO,llenos:n,vacios:r}),await C(`inventario`,{ubicacion:H.CASA,llenos:i,vacios:a}),await C(`inventario`,{ubicacion:H.CLIENTES,pendientes:o}),await C(`inventario`,{ubicacion:H.SIN_ASIGNAR,llenos:0,vacios:0}),z()}async function te({llenos:e=0,vacios:t=0,observacion:n=``}){if(e=Number(e),t=Number(t),V(e,t),e===0&&t===0)throw Error(`Debes agregar al menos un cilindro.`);return D([`inventario`,`movimientos`],r=>{let i=r.inventario.find(e=>e.ubicacion===H.SIN_ASIGNAR);if(!i)throw Error(`No existe la ubicación SIN ASIGNAR.`);let a={...i,llenos:(i.llenos||0)+e,vacios:(i.vacios||0)+t},o={id_movimiento:crypto.randomUUID(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),tipo:`AGREGAR SIN ASIGNAR`,ubicacion:H.SIN_ASIGNAR,llenos:e,vacios:t,observacion:n,estado:`ACTIVO`,sync_estado:`PENDIENTE`,dispositivo:`MOVIL`};return{resultado:{llenos:e,vacios:t,observacion:n},puts:{inventario:[a],movimientos:[o]}}})}async function ne({llenos:e=0,vacios:t=0,observacion:n=``}){if(e=Number(e),t=Number(t),V(e,t),e===0&&t===0)throw Error(`Debes retirar al menos un cilindro.`);return D([`inventario`,`movimientos`],r=>{let i=r.inventario.find(e=>e.ubicacion===H.SIN_ASIGNAR);if(!i)throw Error(`No existe la ubicación SIN ASIGNAR.`);if(e>(i.llenos||0))throw Error(`No puedes retirar ${e} llenos. Solo hay ${i.llenos||0} sin asignar.`);if(t>(i.vacios||0))throw Error(`No puedes retirar ${t} vacíos. Solo hay ${i.vacios||0} sin asignar.`);let a={...i,llenos:(i.llenos||0)-e,vacios:(i.vacios||0)-t},o={id_movimiento:crypto.randomUUID(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),tipo:`RETIRAR SIN ASIGNAR`,ubicacion:H.SIN_ASIGNAR,llenos:e,vacios:t,observacion:n,estado:`ACTIVO`,sync_estado:`PENDIENTE`,dispositivo:`MOVIL`};return{resultado:{llenos:e,vacios:t,observacion:n},puts:{inventario:[a],movimientos:[o]}}})}async function re({camion:e,llenos:t=0,vacios:n=0}){if(![H.ROJO,H.BLANCO,H.CASA].includes(e))throw Error(`El destino debe ser ROJO, BLANCO o CASA.`);if(t=Number(t),n=Number(n),V(t,n),t===0&&n===0)throw Error(`Debes asignar al menos un cilindro.`);return D([`inventario`,`movimientos`],r=>{let i=r.inventario.find(e=>e.ubicacion===H.SIN_ASIGNAR),a=r.inventario.find(t=>t.ubicacion===e);if(!i||!a)throw Error(`No se encontró el inventario necesario.`);if(t>(i.llenos||0))throw Error(`No hay suficientes llenos sin asignar. Disponibles: ${i.llenos||0}.`);if(n>(i.vacios||0))throw Error(`No hay suficientes vacíos sin asignar. Disponibles: ${i.vacios||0}.`);let o={...i,llenos:(i.llenos||0)-t,vacios:(i.vacios||0)-n},s={...a,llenos:(a.llenos||0)+t,vacios:(a.vacios||0)+n},c={id_movimiento:crypto.randomUUID(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),tipo:`ASIGNAR A CAMION`,camion_destino:e,llenos:t,vacios:n,estado:`ACTIVO`,sync_estado:`PENDIENTE`,dispositivo:`MOVIL`};return{resultado:{camion:e,llenos:t,vacios:n},puts:{inventario:[o,s],movimientos:[c]}}})}function V(e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<0||t<0)throw Error(`Las cantidades deben ser números enteros mayores o iguales a 0.`)}var H,U=e((()=>{L(),H={ROJO:`ROJO`,BLANCO:`BLANCO`,CASA:`CASA`,CLIENTES:`CLIENTES`,SIN_ASIGNAR:`SIN ASIGNAR`}}));function ie(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}async function ae({nombre:e,telefono:t=``,direccion:n=``,sector:r=``,observacion:i=``}){if(e=e.trim(),!e)throw Error(`El nombre del cliente es obligatorio.`);let a={id_cliente:ie(),nombre:e,telefono:t,direccion:n,sector:r,fecha_registro:new Date().toISOString(),estado:`ACTIVO`,observacion:i,pendientes_actuales:0,asignacion_inicial:{realizada:!1,cantidad:0,fecha:null},sync_estado:`PENDIENTE`};return await C(`clientes`,a),a}async function W(){return(await E(`clientes`)).filter(e=>e.estado===`ACTIVO`).sort((e,t)=>e.nombre.localeCompare(t.nombre))}async function oe(e){return T(`clientes`,e)}async function se(e,t){if(t=Number(t),!Number.isInteger(t)||t<=0)throw Error(`La cantidad inicial debe ser un número entero mayor que 0.`);let n=await oe(e);if(!n)throw Error(`El cliente no existe.`);if(n.estado!==`ACTIVO`)throw Error(`No puedes asignar pendientes a un cliente inactivo.`);if(n.asignacion_inicial?.realizada)throw Error(`Este cliente ya tiene una asignación inicial registrada.`);if((n.pendientes_actuales||0)>0)throw Error(`Este cliente ya tiene pendientes registrados. Verifica su saldo antes de realizar una asignación inicial.`);let r=(await z()).clientes,i=(r.pendientes||0)+t;return n.pendientes_actuales=t,n.asignacion_inicial={realizada:!0,cantidad:t,fecha:new Date().toISOString()},n.sync_estado=`PENDIENTE`,await w(n,{...r,pendientes:i}),n}var G=e((()=>{L(),U()}));function K(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}function q(e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<0||t<0)throw Error(`Las cantidades deben ser números enteros mayores o iguales a 0.`)}async function ce({idCliente:e,camion:t,cantidad:n,observacion:r=``}){if(n=Number(n),!Number.isInteger(n)||n<=0)throw Error(`La cantidad entregada debe ser un número entero mayor que 0.`);if(![H.ROJO,H.BLANCO,H.CASA].includes(t))throw Error(`Selecciona una ubicación válida.`);let i={id_movimiento:K(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),tipo:X.ENTREGA_CLIENTE,estado:`ACTIVO`,dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,id_cliente:e,camion_origen:t,camion_destino:null,llenos:n,vacios:0,observacion:r};return D([`inventario`,`clientes`,`movimientos`],r=>{let a=r.inventario.find(e=>e.ubicacion===t);if(!a)throw Error(`No existe el camión ${t}.`);let o=r.clientes.find(t=>t.id_cliente===e&&t.estado===`ACTIVO`);if(!o)throw Error(`El cliente no existe o está inactivo.`);if((a.llenos||0)<n)throw Error(`El camión ${t} no tiene suficientes cilindros llenos.`);let s=r.inventario.find(e=>e.ubicacion===H.CLIENTES);if(!s)throw Error(`No existe el registro de inventario de clientes.`);let c={...o,pendientes_actuales:Number(o.pendientes_actuales||0)+n,sync_estado:`PENDIENTE`},l=r.clientes.filter(t=>t.estado===`ACTIVO`&&t.id_cliente!==e).reduce((e,t)=>e+Number(t.pendientes_actuales||0),0)+c.pendientes_actuales,u={...a,llenos:(a.llenos||0)-n},d={...s,pendientes:l};return{resultado:i,puts:{inventario:[u,d],clientes:[c],movimientos:[i]}}})}async function le({idCliente:e,camion:t,cantidad:n,observacion:r=``,retiroEspecial:i=!1}){if(n=Number(n),!Number.isSafeInteger(n)||n<=0)throw Error(`La cantidad retirada debe ser un entero mayor que 0.`);if(![H.ROJO,H.BLANCO,H.CASA].includes(t))throw Error(`Selecciona una ubicación válida.`);if(typeof r!=`string`)throw Error(`La observación no es válida.`);if(i&&!r.trim())throw Error(`La observación es obligatoria para un retiro especial.`);let a={id_movimiento:K(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),tipo:X.RETIRO_CLIENTE,estado:`ACTIVO`,dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,id_cliente:e,camion_origen:null,camion_destino:t,llenos:0,vacios:n,observacion:i?`[RETIRO ESPECIAL] ${r.trim()}`:r.trim(),retiro_especial:!!i};return D([`inventario`,`clientes`,`movimientos`],r=>{let o=r.inventario.find(e=>e.ubicacion===t);if(!o)throw Error(`No existe el camión ${t}.`);let s=r.clientes.find(t=>t.id_cliente===e&&t.estado===`ACTIVO`);if(!s)throw Error(`El cliente no existe o está inactivo.`);let c={inventario:[{...o,vacios:Number(o.vacios||0)+n}],movimientos:[a]};if(!i){let t=Number(s.pendientes_actuales||0);if(n>t)throw Error(`El cliente tiene ${t} cilindros pendientes. No puedes retirar ${n}.`);let i={...s,pendientes_actuales:t-n,sync_estado:`PENDIENTE`},a=r.clientes.filter(e=>e.estado===`ACTIVO`).reduce((t,n)=>t+(n.id_cliente===e?i.pendientes_actuales:Number(n.pendientes_actuales||0)),0),o=r.inventario.find(e=>e.ubicacion===H.CLIENTES);if(!o)throw Error(`No existe el inventario agregado de clientes.`);c.clientes=[i],c.inventario.push({...o,pendientes:a})}return{resultado:a,puts:c}})}async function ue({idCliente:e,camion:t,llenos:n,vacios:r,observacion:i=``}){if(n=Number(n),r=Number(r),q(n,r),n<=0&&r<=0)throw Error(`Debes entregar o retirar al menos un cilindro.`);if(![H.ROJO,H.BLANCO,H.CASA].includes(t))throw Error(`Selecciona una ubicación válida.`);let a={id_movimiento:K(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),tipo:X.ENTREGA_RETIRO,estado:`ACTIVO`,dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,id_cliente:e,camion_origen:t,camion_destino:t,llenos:n,vacios:r,observacion:i};return D([`inventario`,`clientes`,`movimientos`],i=>{let o=i.inventario.find(e=>e.ubicacion===t),s=i.clientes.find(t=>t.id_cliente===e&&t.estado===`ACTIVO`);if(!o)throw Error(`No existe el camión ${t}.`);if(!s)throw Error(`El cliente no existe o está inactivo.`);if(n>Number(o.llenos||0))throw Error(`El camión no tiene suficientes llenos. Disponibles: ${o.llenos||0}.`);let c=Number(s.pendientes_actuales||0),l=c+n-r;if(l<0)throw Error(`El cliente tiene ${c} pendientes. No puedes retirar ${r}.`);let u={...s,pendientes_actuales:l,sync_estado:`PENDIENTE`},d={...o,llenos:Number(o.llenos||0)-n,vacios:Number(o.vacios||0)+r},f=i.inventario.find(e=>e.ubicacion===H.CLIENTES);if(!f)throw Error(`No existe el inventario agregado de clientes.`);let p=i.clientes.filter(e=>e.estado===`ACTIVO`).reduce((t,n)=>t+(n.id_cliente===e?l:Number(n.pendientes_actuales||0)),0);return{resultado:a,puts:{inventario:[d,{...f,pendientes:p}],clientes:[u],movimientos:[a]}}})}async function de({camion:e,cantidad:t,observacion:n=``}){if(t=Number(t),!Number.isSafeInteger(t)||t<=0)throw Error(`La cantidad enviada a planta debe ser un entero mayor que 0.`);if(![H.ROJO,H.BLANCO].includes(e))throw Error(`Selecciona un camión válido.`);let r=K(),i=K(),a=new Date().toISOString(),o={id_movimiento:i,fecha_hora:a,created_at:a,tipo:X.SALIDA_PLANTA,estado:`ACTIVO`,dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,id_cliente:null,camion_origen:e,camion_destino:null,llenos:0,vacios:t,id_viaje:r,observacion:n},s={id_viaje:r,camion:e,fecha_salida:a,fecha_regreso:null,estado:`ABIERTO`,vacios_enviados:t,llenos_recibidos:0,id_movimiento_salida:i,id_movimiento_regreso:null};return D([`inventario`,`movimientos`,`viajes_planta`],n=>{let r=n.inventario.find(t=>t.ubicacion===e);if(!r)throw Error(`No existe el camión ${e}.`);if(t>Number(r.vacios||0))throw Error(`El camión no tiene suficientes vacíos. Disponibles: ${r.vacios||0}.`);let i={...r,vacios:Number(r.vacios||0)-t};return{resultado:o,puts:{inventario:[i],movimientos:[o],viajes_planta:[s]}}})}async function fe({idViaje:e,llenos:t,observacion:n=``}){if(t=Number(t),!Number.isSafeInteger(t)||t<=0)throw Error(`La cantidad que regresa de planta debe ser un entero mayor que 0.`);let r=K(),i=new Date().toISOString(),a={id_movimiento:r,fecha_hora:i,created_at:i,tipo:X.REGRESO_PLANTA,estado:`ACTIVO`,dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,id_cliente:null,camion_origen:null,camion_destino:null,llenos:t,vacios:0,id_viaje:e,observacion:n};return D([`inventario`,`movimientos`,`viajes_planta`],n=>{let o=n.viajes_planta.find(t=>t.id_viaje===e);if(!o)throw Error(`El viaje de planta no existe.`);if(o.estado!==`ABIERTO`)throw Error(`Este viaje de planta ya está cerrado.`);if(t!==Number(o.vacios_enviados))throw Error(`El viaje envió ${o.vacios_enviados} cilindros. El regreso debe registrar exactamente esa cantidad.`);let s=n.inventario.find(e=>e.ubicacion===o.camion);if(!s)throw Error(`No existe el camión ${o.camion}.`);let c={...s,llenos:Number(s.llenos||0)+t},l={...o,estado:`CERRADO`,fecha_regreso:i,llenos_recibidos:t,id_movimiento_regreso:r};return a.camion_destino=o.camion,{resultado:a,puts:{inventario:[c],movimientos:[a],viajes_planta:[l]}}})}async function pe({origen:e,destino:t,llenos:n=0,vacios:r=0,observacion:i=``}){if(n=Number(n),r=Number(r),q(n,r),n<=0&&r<=0)throw Error(`Debes trasladar al menos un cilindro.`);let a=[H.ROJO,H.BLANCO,H.CASA];if(!a.includes(e)||!a.includes(t))throw Error(`Selecciona ubicaciones válidas para realizar el traslado.`);if(e===t)throw Error(`El camión de origen y destino deben ser diferentes.`);let o={id_movimiento:K(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),tipo:X.TRASLADO,estado:`ACTIVO`,dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,id_cliente:null,camion_origen:e,camion_destino:t,llenos:n,vacios:r,observacion:i};return D([`inventario`,`movimientos`],i=>{let a=i.inventario.find(t=>t.ubicacion===e),s=i.inventario.find(e=>e.ubicacion===t);if(!a||!s)throw Error(`No se encontró el inventario de ambos camiones.`);if(n>Number(a.llenos||0)||r>Number(a.vacios||0))throw Error(`El camión de origen no tiene suficientes cilindros.`);let c={...a,llenos:Number(a.llenos||0)-n,vacios:Number(a.vacios||0)-r},l={...s,llenos:Number(s.llenos||0)+n,vacios:Number(s.vacios||0)+r};return{resultado:o,puts:{inventario:[c,l],movimientos:[o]}}})}async function J(){return(await E(`movimientos`)).sort((e,t)=>{let n=new Date(e.fecha_hora||0);return new Date(t.fecha_hora||0)-n})}async function me(){return D([`inventario`,`clientes`,`movimientos`,`viajes_planta`],e=>{let t=(e.movimientos||[]).filter(e=>e.estado===`ACTIVO`).sort((e,t)=>new Date(t.fecha_hora||t.created_at||0).getTime()-new Date(e.fecha_hora||e.created_at||0).getTime())[0];if(!t)throw Error(`No hay movimientos activos para anular.`);if(t.sync_estado!==`PENDIENTE`)throw Error(`Este movimiento ya fue sincronizado. Debe anularse desde el PC.`);let n=e.inventario,r=e.clientes,i=e.viajes_planta,a=e=>{let t=n.find(t=>t.ubicacion===e);if(!t)throw Error(`No se encontró el inventario de ${e}.`);return t},o=(e,t,n)=>{let r=Number(e[t]||0)+n;if(!Number.isInteger(r)||r<0)throw Error(`No hay existencias suficientes para revertir ${t} en ${e.ubicacion}.`);e[t]=r},s=()=>{let e=r.find(e=>e.id_cliente===t.id_cliente);if(!e)throw Error(`No se encontró el cliente del movimiento.`);return e},c=e=>{let t=s(),n=Number(t.pendientes_actuales||0)+e;if(!Number.isInteger(n)||n<0)throw Error(`No se puede revertir: los pendientes del cliente no cuadran.`);t.pendientes_actuales=n,t.sync_estado=`PENDIENTE`},l=Number(t.llenos||0),u=Number(t.vacios||0);switch(t.tipo){case X.ENTREGA_CLIENTE:o(a(t.camion_origen),`llenos`,l),c(-l);break;case X.RETIRO_CLIENTE:o(a(t.camion_destino),`vacios`,-u),t.retiro_especial||c(u);break;case X.ENTREGA_RETIRO:{let e=a(t.camion_origen);o(e,`llenos`,l),o(e,`vacios`,-u),c(-l+u);break}case X.TRASLADO:{let e=a(t.camion_origen),n=a(t.camion_destino);o(e,`llenos`,l),o(e,`vacios`,u),o(n,`llenos`,-l),o(n,`vacios`,-u);break}case X.CAMBIAZO:{let e=a(t.camion_origen),n=Number(t.cantidad||0),r=String(t.estado_origen||``).toLowerCase(),i=String(t.estado_nuevo||``).toLowerCase();if(![`llenos`,`vacios`].includes(r)||![`llenos`,`vacios`].includes(i)||r===i)throw Error(`El cambiazo original tiene estados inválidos.`);o(e,r,n),o(e,i,-n);break}case X.SALIDA_PLANTA:{let e=a(t.camion_origen),n=i.find(e=>e.id_viaje===t.id_viaje);if(!n)throw Error(`No se encontró el viaje asociado a esta salida.`);if(n.estado!==`ABIERTO`)throw Error(`El viaje ya no está abierto. No se puede anular esta salida.`);o(e,`vacios`,u),n.estado=`ANULADO`;break}case X.REGRESO_PLANTA:{let e=a(t.camion_destino),n=i.find(e=>e.id_viaje===t.id_viaje);if(!n)throw Error(`No se encontró el viaje asociado a este regreso.`);if(n.estado!==`CERRADO`||n.id_movimiento_regreso!==t.id_movimiento)throw Error(`El viaje no coincide con el regreso que intentas anular.`);o(e,`llenos`,-l),n.estado=`ABIERTO`,delete n.id_movimiento_regreso,delete n.fecha_regreso,delete n.llenos_recibidos;break}case`AGREGAR SIN ASIGNAR`:{let e=a(H.SIN_ASIGNAR);o(e,`llenos`,-l),o(e,`vacios`,-u);break}case`RETIRAR SIN ASIGNAR`:{let e=a(H.SIN_ASIGNAR);o(e,`llenos`,l),o(e,`vacios`,u);break}case`ASIGNAR A CAMION`:{let e=a(H.SIN_ASIGNAR),n=a(t.camion_destino);o(e,`llenos`,l),o(e,`vacios`,u),o(n,`llenos`,-l),o(n,`vacios`,-u);break}default:throw Error(`No se puede anular este tipo de movimiento: ${t.tipo}`)}let d=r.filter(e=>e.estado===`ACTIVO`).reduce((e,t)=>e+Number(t.pendientes_actuales||0),0),f=n.find(e=>e.ubicacion===H.CLIENTES);return f&&(f.pendientes=d),t.estado=`ANULADO`,t.anulado_at=new Date().toISOString(),t.sync_estado=`PENDIENTE`,{resultado:t,puts:{inventario:n,clientes:r,movimientos:[t],viajes_planta:i}}})}async function Y(e){let{tipo:t,idCliente:n,camion:r,origen:i,destino:a,cantidad:o,llenos:s,vacios:c,observacion:l=``,retiroEspecial:u=!1,ubicacion:d,estadoActual:f,estadoNuevo:p}=e;return D([`inventario`,`clientes`,`movimientos`,`viajes_planta`],m=>{let h=m.inventario||[],g=m.clientes||[],_=m.movimientos||[],v=m.viajes_planta||[],y=_.filter(e=>e.estado===`ACTIVO`).sort((e,t)=>new Date(t.fecha_hora||t.created_at||0).getTime()-new Date(e.fecha_hora||e.created_at||0).getTime())[0];if(!y)throw Error(`No hay movimientos activos para editar.`);if(y.tipo===X.REGRESO_PLANTA&&e.idViaje&&e.idViaje!==y.id_viaje)throw Error(`No puedes cambiar el viaje asociado al regreso original.`);if(y.sync_estado!==`PENDIENTE`)throw Error(`Este movimiento ya fue sincronizado y no puede editarse desde el móvil.`);if(t&&y.tipo!==t)throw Error(`El tipo de movimiento no coincide con el registro original.`);if(!e.idMovimiento||e.idMovimiento!==y.id_movimiento)throw Error(`El movimiento seleccionado ya no es el último movimiento activo.`);let b=e=>{let t=h.find(t=>t.ubicacion===e);if(!t)throw Error(`No existe el inventario de ${e}.`);return t},x=e=>{let t=g.find(t=>t.id_cliente===e);if(!t)throw Error(`No se encontró el cliente del movimiento.`);return t},S=e=>{let t=g.find(t=>t.id_cliente===e&&t.estado===`ACTIVO`);if(!t)throw Error(`Selecciona un cliente activo.`);return t},C=(e,t,n)=>{let r=Number(e[t]||0)+n;if(!Number.isSafeInteger(r)||r<0)throw Error(`No hay existencias suficientes para modificar ${t} en ${e.ubicacion}.`);e[t]=r},w=(e,t)=>{let n=Number(e.pendientes_actuales||0)+t;if(!Number.isSafeInteger(n)||n<0)throw Error(`El cliente ${e.nombre||``} no tiene pendientes suficientes para realizar esta modificación.`);e.pendientes_actuales=n,e.sync_estado=`PENDIENTE`},T=e=>{let t=Number(e);if(!Number.isSafeInteger(t)||t<=0)throw Error(`La cantidad debe ser un número entero mayor que cero.`);return t},E=(e,t)=>{let n=Number(e),r=Number(t);if(q(n,r),n<=0&&r<=0)throw Error(`Debes registrar al menos un cilindro.`);return{llenos:n,vacios:r}},D=[H.ROJO,H.BLANCO,H.CASA],O=[H.ROJO,H.BLANCO,H.CASA],k=e=>String(e||``).toLowerCase(),A=new Date().toISOString(),j=Number(y.llenos||0),M=Number(y.vacios||0);switch(y.tipo){case X.ENTREGA_CLIENTE:{let e=b(y.camion_origen),t=x(y.id_cliente);C(e,`llenos`,j),w(t,-j);break}case X.RETIRO_CLIENTE:C(b(y.camion_destino),`vacios`,-M),y.retiro_especial||w(x(y.id_cliente),M);break;case X.ENTREGA_RETIRO:{let e=b(y.camion_origen),t=x(y.id_cliente);C(e,`llenos`,j),C(e,`vacios`,-M),w(t,-j+M);break}case X.TRASLADO:{let e=b(y.camion_origen),t=b(y.camion_destino);C(e,`llenos`,j),C(e,`vacios`,M),C(t,`llenos`,-j),C(t,`vacios`,-M);break}case X.CAMBIAZO:{let e=b(y.camion_origen),t=T(y.cantidad),n=k(y.estado_origen),r=k(y.estado_nuevo);if(![`llenos`,`vacios`].includes(n)||![`llenos`,`vacios`].includes(r)||n===r)throw Error(`El cambiazo original tiene estados inválidos.`);C(e,n,t),C(e,r,-t);break}case X.SALIDA_PLANTA:{let e=b(y.camion_origen),t=v.find(e=>e.id_viaje===y.id_viaje);if(!t||t.estado!==`ABIERTO`||t.id_movimiento_salida!==y.id_movimiento)throw Error(`La salida original no coincide con un viaje abierto válido.`);C(e,`vacios`,M),t.estado=`ANULADO`,t.fecha_regreso=null,t.llenos_recibidos=0,t.id_movimiento_regreso=null;break}case X.REGRESO_PLANTA:{let e=b(y.camion_destino),t=v.find(e=>e.id_viaje===y.id_viaje);if(!t||t.estado!==`CERRADO`||t.id_movimiento_regreso!==y.id_movimiento)throw Error(`El regreso original no coincide con el viaje registrado.`);C(e,`llenos`,-j),t.estado=`ABIERTO`,t.fecha_regreso=null,t.llenos_recibidos=0,t.id_movimiento_regreso=null;break}default:throw Error(`No se puede editar este tipo de movimiento: ${y.tipo}`)}let N={...y,observacion:String(l||``).trim(),modificado_at:A,sync_estado:`PENDIENTE`,estado:`ACTIVO`};switch(y.tipo){case X.ENTREGA_CLIENTE:{let e=T(o);if(!D.includes(r))throw Error(`Selecciona una ubicación válida.`);let t=S(n);C(b(r),`llenos`,-e),w(t,e),N.id_cliente=n,N.camion_origen=r,N.camion_destino=null,N.llenos=e,N.vacios=0;break}case X.RETIRO_CLIENTE:{let e=T(o);if(!D.includes(r))throw Error(`Selecciona una ubicación válida.`);let t=S(n),i=!!u,a=String(l||``).trim();if(i&&!a)throw Error(`La observación es obligatoria para un retiro especial.`);C(b(r),`vacios`,e),i||w(t,-e),N.id_cliente=n,N.camion_origen=null,N.camion_destino=r,N.llenos=0,N.vacios=e,N.retiro_especial=i,N.observacion=i?`[RETIRO ESPECIAL] ${a}`:a;break}case X.ENTREGA_RETIRO:{let e=E(s,c);if(!D.includes(r))throw Error(`Selecciona una ubicación válida.`);let t=S(n),i=b(r);C(i,`llenos`,-e.llenos),C(i,`vacios`,e.vacios),w(t,e.llenos-e.vacios),N.id_cliente=n,N.camion_origen=r,N.camion_destino=r,N.llenos=e.llenos,N.vacios=e.vacios;break}case X.TRASLADO:{let e=E(s,c);if(!O.includes(i)||!O.includes(a)||i===a)throw Error(`Selecciona dos ubicaciones diferentes y válidas.`);let t=b(i),n=b(a);C(t,`llenos`,-e.llenos),C(t,`vacios`,-e.vacios),C(n,`llenos`,e.llenos),C(n,`vacios`,e.vacios),N.camion_origen=i,N.camion_destino=a,N.llenos=e.llenos,N.vacios=e.vacios;break}case X.CAMBIAZO:{let e=T(o),t=k(f),n=k(p);if(![H.ROJO,H.BLANCO].includes(d))throw Error(`El cambiazo solo se permite en ROJO o BLANCO.`);if(![`llenos`,`vacios`].includes(t)||![`llenos`,`vacios`].includes(n)||t===n)throw Error(`Selecciona estados de cilindro diferentes.`);if(!String(l||``).trim())throw Error(`Debes ingresar el motivo del cambiazo.`);let r=b(d);C(r,t,-e),C(r,n,e),N.camion_origen=d,N.camion_destino=d,N.estado_origen=t,N.estado_nuevo=n,N.cantidad=e;break}case X.SALIDA_PLANTA:{let e=T(o);if(![H.ROJO,H.BLANCO].includes(r))throw Error(`Selecciona ROJO o BLANCO.`);let t=b(r),n=v.find(e=>e.id_viaje===y.id_viaje);if(!n)throw Error(`No se encontró el viaje original de planta.`);C(t,`vacios`,-e),n.camion=r,n.fecha_salida=y.fecha_hora,n.fecha_regreso=null,n.estado=`ABIERTO`,n.vacios_enviados=e,n.llenos_recibidos=0,n.id_movimiento_salida=y.id_movimiento,n.id_movimiento_regreso=null,N.camion_origen=r,N.camion_destino=null,N.llenos=0,N.vacios=e;break}case X.REGRESO_PLANTA:{let e=v.find(e=>e.id_viaje===y.id_viaje);if(!e||e.estado!==`ABIERTO`||e.id_movimiento_salida==null)throw Error(`No se puede modificar el viaje de planta.`);let t=T(o??s);if(t!==Number(e.vacios_enviados))throw Error(`El regreso debe coincidir con los ${e.vacios_enviados} cilindros enviados.`);C(b(e.camion),`llenos`,t),e.estado=`CERRADO`,e.fecha_regreso=A,e.llenos_recibidos=t,e.id_movimiento_regreso=y.id_movimiento,N.camion_origen=null,N.camion_destino=e.camion,N.llenos=t,N.vacios=0;break}}let P=h.find(e=>e.ubicacion===H.CLIENTES);if((y.tipo===X.ENTREGA_CLIENTE||y.tipo===X.RETIRO_CLIENTE||y.tipo===X.ENTREGA_RETIRO)&&!P)throw Error(`No existe el inventario agregado de clientes.`);return P&&(P.pendientes=g.filter(e=>e.estado===`ACTIVO`).reduce((e,t)=>e+Number(t.pendientes_actuales||0),0)),{resultado:N,puts:{inventario:h,clientes:g,movimientos:[N],viajes_planta:v}}})}async function he(){return(await E(`viajes_planta`)).filter(e=>e.estado===`ABIERTO`).sort((e,t)=>new Date(t.fecha_salida)-new Date(e.fecha_salida))}async function ge({ubicacion:e,estadoActual:t,estadoNuevo:n,cantidad:r,observacion:i}){if(![H.ROJO,H.BLANCO].includes(e))throw Error(`El cambiazo solo se permite en ROJO o BLANCO.`);if(![`llenos`,`vacios`].includes(t)||![`llenos`,`vacios`].includes(n))throw Error(`Estado de cilindro no válido.`);if(t===n)throw Error(`Debes seleccionar estados diferentes.`);if(r=Number(r),!Number.isSafeInteger(r)||r<=0)throw Error(`La cantidad debe ser un entero positivo.`);if(typeof i!=`string`||!i.trim())throw Error(`Debes ingresar el motivo del cambiazo.`);let a={id_movimiento:K(),fecha_hora:new Date().toISOString(),created_at:new Date().toISOString(),estado:`ACTIVO`,dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,tipo:X.CAMBIAZO,camion_origen:e,camion_destino:e,estado_origen:t,estado_nuevo:n,cantidad:r,llenos:0,vacios:0,observacion:i.trim()};return D([`inventario`,`movimientos`],i=>{let o=i.inventario.find(t=>t.ubicacion===e);if(!o)throw Error(`No existe el inventario de ${e}.`);let s=Number(o[t]||0);if(r>s)throw Error(`No hay suficientes ${t}. Disponibles: ${s}.`);let c={...o,[t]:s-r,[n]:Number(o[n]||0)+r};return{resultado:a,puts:{inventario:[c],movimientos:[a]}}})}var X,_e=e((()=>{L(),U(),G(),X={ENTREGA_CLIENTE:`ENTREGA A CLIENTE`,RETIRO_CLIENTE:`RETIRO DE CLIENTE`,ENTREGA_RETIRO:`ENTREGA + RETIRO`,SALIDA_PLANTA:`SALIDA A PLANTA`,REGRESO_PLANTA:`REGRESO DE PLANTA`,TRASLADO:`TRASLADO ENTRE CAMIONES`,CAMBIAZO:`CAMBIAZO`}}));async function ve(){let e=await E(`movimientos`),t=await E(`clientes`);return{movimientos:e.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`),clientes:t.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`)}}async function Z(){let e=await ve();return{movimientos:e.movimientos.length,clientes:e.clientes.length,total:e.movimientos.length+e.clientes.length}}var ye=e((()=>{L()}));function be(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}async function xe(){let e=await E(`inventario`),t=t=>e.find(e=>e.ubicacion===t)||{},n=t(`ROJO`),r=t(`BLANCO`),i=t(`CASA`),a=t(`CLIENTES`),o=t(`SIN ASIGNAR`),s={rojoLlenos:Number(n.llenos)||0,rojoVacios:Number(n.vacios)||0,blancoLlenos:Number(r.llenos)||0,blancoVacios:Number(r.vacios)||0,casaLlenos:Number(i.llenos)||0,casaVacios:Number(i.vacios)||0,pendientesClientes:Number(a.pendientes)||0,sinAsignarLlenos:Number(o.llenos)||0,sinAsignarVacios:Number(o.vacios)||0};return s.total=s.rojoLlenos+s.rojoVacios+s.blancoLlenos+s.blancoVacios+s.casaLlenos+s.casaVacios+s.pendientesClientes+s.sinAsignarLlenos+s.sinAsignarVacios,s}async function Se(e,t){let[n,r]=await Promise.all([E(`movimientos`),E(`clientes`)]),i=Object.fromEntries(r.map(e=>[e.id_cliente,e.nombre])),a={};return n.filter(n=>{if(n.estado!==`ACTIVO`)return!1;let r=n.fecha_hora?new Date(n.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):n.fecha;return r>=e&&r<=t&&(n.tipo===`ENTREGA A CLIENTE`||n.tipo===`ENTREGA + RETIRO`)}).forEach(e=>{let t=e.cliente||e.id_cliente||`SIN CLIENTE`,n=Number(e.llenos)||0;a[t]||(a[t]={idCliente:t,nombre:i[t]||t,cantidad:0}),a[t].cantidad+=n}),Object.values(a).sort((e,t)=>t.cantidad-e.cantidad)}async function Ce(e){return(await E(`movimientos`)).filter(t=>t.estado===`ACTIVO`&&(t.fecha_hora?new Date(t.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):t.fecha)===e&&(t.tipo===`ENTREGA A CLIENTE`||t.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(Number(t.llenos)||0),0)}async function we(e,t){return(await E(`movimientos`)).filter(n=>{if(n.estado!==`ACTIVO`)return!1;let r=n.fecha_hora?new Date(n.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):n.fecha;return r>=e&&r<=t&&(n.tipo===`ENTREGA A CLIENTE`||n.tipo===`ENTREGA + RETIRO`)}).reduce((e,t)=>e+(Number(t.llenos)||0),0)}async function Te(){let e=await E(`movimientos`),t=be();return e.filter(e=>e.estado===`ACTIVO`&&(e.fecha_hora?new Date(e.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):e.fecha)===t&&(e.tipo===`ENTREGA A CLIENTE`||e.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(Number(t.llenos)||0),0)}function Q(e){return e?new Date(e).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):``}function Ee(e){return e?new Date(e).toLocaleTimeString(`es-EC`,{timeZone:`America/Guayaquil`,hour:`2-digit`,minute:`2-digit`,hour12:!1}):`Hora no disponible`}async function De(e){let[t,n]=await Promise.all([E(`movimientos`),E(`clientes`)]),r=Object.fromEntries(n.map(e=>[e.id_cliente,e.nombre]));return t.filter(t=>t.estado===`ACTIVO`&&(t.fecha_hora?Q(t.fecha_hora):t.fecha)===e&&(t.tipo===`ENTREGA A CLIENTE`||t.tipo===`ENTREGA + RETIRO`)).map(e=>{let t=e.cliente||e.id_cliente;return{cliente:r[t]||t||`Sin cliente`,cantidad:Number(e.llenos)||0,fechaHora:e.fecha_hora,hora:Ee(e.fecha_hora)}}).sort((e,t)=>e.fechaHora?t.fechaHora?new Date(e.fechaHora)-new Date(t.fechaHora):-1:1)}async function $(e,t){return(await E(`viajes_planta`)).filter(n=>{let r=n.fecha_salida?Q(n.fecha_salida):``;return r>=e&&r<=t}).map(e=>({camion:e.camion||`Camión no identificado`,cantidad:Number(e.vacios_enviados)||0,fecha:Q(e.fecha_salida),fechaHora:e.fecha_salida,hora:Ee(e.fecha_salida)})).sort((e,t)=>e.fechaHora?t.fechaHora?new Date(e.fechaHora)-new Date(t.fechaHora):-1:1)}var Oe=e((()=>{L()})),ke=e((()=>{}));t((()=>{U(),_e(),G(),ye(),L(),Oe(),ke();var e=document.getElementById(`app`),t=`inicio`;document.addEventListener(`DOMContentLoaded`,n);async function n(){await R(),r(),i()}function r(){`serviceWorker`in navigator&&navigator.serviceWorker.register(`/sw.js`).catch(e=>{console.error(`Error Service Worker:`,e)})}async function i(){switch(t){case`inicio`:await a();break;case`movimientos`:await o();break;case`clientes`:await _();break;case`inventario`:await H();break;case`sync`:await b();break;case`reportes`:await V();break;default:await a()}}async function a(){let t=await z(),n=await Z(),r=B(t),i=await Te(),a=(t.rojo?.vacios||0)+(t.blanco?.vacios||0)+(t.casa?.vacios||0),o=(t.rojo?.llenos||0)+(t.blanco?.llenos||0)+(t.casa?.llenos||0),c=n.total===0?`
                <div class="status-bar status-success">
                    🟢 Datos actualizados
                </div>
              `:`
                <div class="status-bar status-warning">
                    🟡 Hay ${n.total} elemento(s) pendiente(s) de sincronización
                </div>
              `,l=(t.viajesAbiertos||[]).map(e=>`
        <div class="inventory-item trip-item">

            <span class="label">
                🚚 Viaje en progreso ⏳
            </span>

            <strong class="number">
                ${Math.max(0,Number(e.vacios_enviados||0)-Number(e.llenos_recibidos||0))}   
            </strong>
            <span class="label">
            ${String(e.camion||``).toUpperCase()}    
             cilindros
            </span>

        </div>
    `).join(``);e.innerHTML=`

        <!-- =========================================
             ENCABEZADO
        ========================================== -->

        <header class="app-header">

            <h1>DISTRIBUIDORA</h1>
        </header>

        <main class="main-content">
            <!-- =====================================
                 RESUMEN DE HOY
            ====================================== -->

            <section class="section">

                <div class="section-header">

                    <div>

                        <div class="section-title">
                            📊 RESUMEN DE HOY
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
            <span class="label">
                            LLENOS DISPONIBLES
                        </span>
                        <strong class="number">
                            ${o}
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
                    </div>


                    <!-- ROJO VACÍOS -->

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Rojo — Vacíos
                        </span>

                        <strong class="number">
                            ${t.rojo?.vacios||0}
                        </strong>

                    </div>


                    <!-- BLANCO LLENOS -->

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Blanco — Llenos
                        </span>

                        <strong class="number">
                            ${t.blanco?.llenos||0}
                        </strong>
                    </div>


                    <!-- BLANCO VACÍOS -->

                    <div class="inventory-item">

                        <span class="label">
                            🚚 Blanco — Vacíos
                        </span>

                        <strong class="number">
                            ${t.blanco?.vacios||0}
                        </strong>

                    </div>
<!-- CASA LLENOS -->

<div class="inventory-item">

    <span class="label">
        🏠 Casa — Llenos
    </span>

    <strong class="number">
        ${t.casa?.llenos||0}
    </strong>

</div>


<!-- CASA VACÍOS -->

<div class="inventory-item">

    <span class="label">
        🏠 Casa — Vacíos
    </span>

    <strong class="number">
        ${t.casa?.vacios||0}
    </strong>

</div>

                    <!-- CLIENTES -->

<div class="inventory-item">

    <span class="label">
        👥 Clientes
    </span>

    <strong class="number">
        ${t.clientes?.pendientes||0}
    </strong>

</div>

<!-- VIAJES ABIERTOS -->

${l}

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

            <!-- =====================================
                 SINCRONIZACIÓN
            ====================================== -->
            ${c}

        </main>


        ${k(`inicio`)}

    `,document.getElementById(`btnApertura`)?.addEventListener(`click`,N),document.getElementById(`btnNuevoMovimiento`)?.addEventListener(`click`,s),document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{alert(`PUNTO 1: SE PRESIONÓ EL BOTÓN EXPORTAR BD`);try{let e=await A();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}}),document.getElementById(`btnImportarBD`)?.addEventListener(`click`,()=>{document.getElementById(`inputImportarBD`)?.click()}),document.getElementById(`inputImportarBD`)?.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){if(!confirm(`⚠️ ATENCIÓN

Cargar este respaldo reemplazará los datos actuales.

¿Quieres continuar?`)){e.target.value=``;return}try{await M(t),alert(`✅ Base de datos restaurada correctamente.`),window.location.reload()}catch(e){console.error(e),alert(`❌ No se pudo cargar el respaldo.\n\n${e.message}`)}e.target.value=``}}),j()}async function o(){let t=await J(),n=await E(`clientes`),r=Object.fromEntries(n.map(e=>[e.id_cliente,e.nombre])),i=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),a=e=>e?new Date(e).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):``,o=e=>e.filter(e=>e.estado===`ACTIVO`).sort((e,t)=>new Date(t.fecha_hora||t.created_at||0).getTime()-new Date(e.fecha_hora||e.created_at||0).getTime())[0]||null,c=o(t),u=new Date().toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`});e.innerHTML=`

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

                <div class="fechas-horizontales">

                    <div class="form-group">
                        <label for="fechaInicioMovimientos">Desde</label>
                        <input
                            type="date"
                            id="fechaInicioMovimientos"
                            value="${u}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="fechaFinMovimientos">Hasta</label>
                        <input
                            type="date"
                            id="fechaFinMovimientos"
                            value="${u}"
                        >
                    </div>

                </div>

                <div class="form-group">
                    <label for="filtroClienteMovimientos">Cliente</label>

                    <select id="filtroClienteMovimientos">
                        <option value="">Todos</option>

                        ${n.slice().sort((e,t)=>(e.nombre||``).localeCompare(t.nombre||``,`es`)).map(e=>`
                                <option value="${i(e.id_cliente)}">
                                    ${i(e.nombre)}
                                </option>
                            `).join(``)}
                    </select>
                </div>

                <div class="card-title">
                    Resultados
                </div>

                <div id="contadorMovimientos"></div>

            </div>

            <div class="card" id="listaMovimientos"></div>

        </main>

        ${k(`movimientos`)}
    `;let d=document.getElementById(`listaMovimientos`),f=document.getElementById(`fechaInicioMovimientos`),p=document.getElementById(`fechaFinMovimientos`),m=document.getElementById(`filtroClienteMovimientos`),h=document.getElementById(`contadorMovimientos`);function g(){let e=f.value,n=p.value,s=m.value;if(!e||!n){h.textContent=``,d.innerHTML=`
                <div class="empty-state">
                    Selecciona las fechas de inicio y fin.
                </div>
            `;return}if(e>n){h.textContent=``,d.innerHTML=`
                <div class="empty-state">
                    La fecha de inicio no puede ser posterior a la fecha de fin.
                </div>
            `;return}let u=t.filter(t=>{let r=t.fecha_hora?a(t.fecha_hora):t.fecha||``,i=t.cliente||t.id_cliente||``;return r>=e&&r<=n&&(!s||String(i)===String(s))});if(h.textContent=`${u.length} movimiento${u.length===1?``:`s`}`,u.length===0){d.innerHTML=`
                <div class="empty-state">
                    <div class="icon">📋</div>
                    No hay movimientos para los filtros seleccionados.
                </div>
            `;return}d.innerHTML=`
            <div class="list">

                ${u.map(e=>{let t=[Number(e.llenos)>0?`Llenos: ${e.llenos}`:``,Number(e.vacios)>0?`Vacíos: ${e.vacios}`:``].filter(Boolean).join(` | `),n=e.fecha_hora?new Date(e.fecha_hora).toLocaleString(`es-EC`,{timeZone:`America/Guayaquil`}):e.fecha||``,a=e.cliente||e.id_cliente||``,o=a?r[a]||`Cliente`:``,s=[o?`👤 `+o:``,e.tipo===`REGRESO DE PLANTA`?`🏭 PLANTA`:e.camion_origen?`🚚 `+e.camion_origen:``,e.camion_destino?`→ `+e.camion_destino:``,t].filter(Boolean).join(` | `),l=c&&e.id_movimiento===c.id_movimiento&&e.estado===`ACTIVO`&&e.sync_estado===`PENDIENTE`,u=l&&[`ENTREGA A CLIENTE`,`RETIRO DE CLIENTE`,`ENTREGA + RETIRO`,`SALIDA A PLANTA`,`REGRESO DE PLANTA`,`TRASLADO ENTRE CAMIONES`,`CAMBIAZO`].includes(e.tipo);return`
                        <div class="list-item">

                            <div class="list-item-top">

                                <span class="list-item-title">
                                    ${i(e.tipo||`Movimiento`)}
                                </span>

                                <span class="badge badge-warning">
                                    ${e.estado===`ANULADO`?`ANULADO`:i(e.sync_estado||``)}
                                </span>

                            </div>

                            <div class="list-item-sub">
                                ${i(n)}
                            </div>

                            <div class="list-item-sub">
                                ${i(s)}
                            </div>

                            ${e.observacion?`
                                <div class="list-item-sub">
                                    ${i(e.observacion)}
                                </div>
                            `:``}

                            ${l?`
                                <div class="acciones-movimiento">

                                    ${u?`
                                        <button
                                            type="button"
                                            class="btn-accion btn-editar"
                                            data-editar="${i(e.id_movimiento)}"
                                        >
                                            ✏️ Editar
                                        </button>
                                    `:``}

                                    <button
                                        type="button"
                                        class="btn-accion btn-anular"
                                        data-anular="${i(e.id_movimiento)}"
                                    >
                                        Anular
                                    </button>

                                </div>
                            `:``}

                        </div>
                    `}).join(``)}

            </div>
        `,d.querySelectorAll(`[data-editar]`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=t.find(t=>t.id_movimiento===e.dataset.editar);if(!n||!c||n.id_movimiento!==c.id_movimiento){alert(`Este movimiento ya no es el último activo.`);return}if(n.sync_estado!==`PENDIENTE`){alert(`Este movimiento ya fue sincronizado.`);return}await l(n.tipo,n)})}),d.querySelectorAll(`[data-anular]`).forEach(e=>{e.addEventListener(`click`,async()=>{if(confirm(`¿Anular este movimiento? Se revertirán sus cantidades y se conservará el registro en el historial.`))try{e.disabled=!0,e.textContent=`Anulando...`,await me(),t=await J(),c=o(t),alert(`Movimiento anulado correctamente.`),g()}catch(t){alert(t.message||`No se pudo anular el movimiento.`),e.disabled=!1,e.textContent=`Anular`}})})}f.addEventListener(`change`,g),p.addEventListener(`change`,g),m.addEventListener(`change`,g),g(),document.getElementById(`btnNuevo`).addEventListener(`click`,s),j()}function s(){e.innerHTML=`

        <header class="app-header">

            <h1>NUEVO MOVIMIENTO</h1>

            <p>Selecciona el tipo</p>

        </header>


        <main class="main-content">

            <div class="movement-grid">

                ${c(`🚚`,`ENTREGA A CLIENTE`,`Entrega cilindros llenos`,X.ENTREGA_CLIENTE)}


                ${c(`↩️`,`RETIRO DE CLIENTE`,`Retira cilindros vacíos`,X.RETIRO_CLIENTE)}


                ${c(`⇄`,`ENTREGA + RETIRO`,`Entrega llenos y recibe vacíos`,X.ENTREGA_RETIRO)}


                ${c(`🏭`,`SALIDA A PLANTA`,`Envía cilindros vacíos a planta`,X.SALIDA_PLANTA)}


                ${c(`🏭`,`REGRESO DE PLANTA`,`Recibe cilindros llenos`,X.REGRESO_PLANTA)}


                ${c(`🔄`,`TRASLADO ENTRE CAMIONES`,`Mueve cilindros entre camiones`,X.TRASLADO)}
    ${c(`🔃`,`CAMBIAZO`,`Cambia cilindros llenos por vacíos o viceversa`,X.CAMBIAZO)}

            </div>


            <button
                class="secondary-button"
                style="margin-top: 15px;"
                id="btnVolver"
            >
                ← Volver
            </button>

        </main>
    `,document.querySelectorAll(`[data-movement]`).forEach(e=>{e.addEventListener(`click`,()=>l(e.dataset.movement))}),document.getElementById(`btnVolver`).addEventListener(`click`,()=>{t=`movimientos`,i()})}function c(e,t,n,r){return`

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
    `}async function l(e,t=null){switch(e){case X.ENTREGA_CLIENTE:await u(t);break;case X.RETIRO_CLIENTE:await d(t);break;case X.ENTREGA_RETIRO:await f(t);break;case X.SALIDA_PLANTA:await p(t);break;case X.REGRESO_PLANTA:await m(t);break;case X.TRASLADO:await h(t);break;case X.CAMBIAZO:await g(t);break;default:throw Error(`Tipo de movimiento no reconocido.`)}}async function u(t=null){let n=await W(),r=!!t;e.innerHTML=`

        ${x(r?`✏️ EDITAR ENTREGA A CLIENTE`:`🚚 ENTREGA A CLIENTE`)}

        <main class="main-content">

            <form id="formMovimiento">

                ${C(n)}

                <div class="form-group">
                    <label>Camión</label>

                    <select class="form-control" name="camion" required>
                        <option value="ROJO">Camión Rojo</option>
                        <option value="BLANCO">Camión Blanco</option>
                        <option value="CASA">Casa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Cilindros llenos</label>

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
                    <label>Observación</label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>
                </div>

                ${S()}

            </form>

        </main>
    `;let i=document.getElementById(`formMovimiento`);r&&(i.elements.namedItem(`idCliente`).value=t.id_cliente,i.elements.namedItem(`camion`).value=t.camion_origen,i.elements.namedItem(`llenos`).value=t.llenos,i.elements.namedItem(`observacion`).value=t.observacion||``),w(),i.addEventListener(`submit`,async e=>{e.preventDefault();let n=e.submitter;n&&(n.disabled=!0);let a=new FormData(i);try{let e={tipo:X.ENTREGA_CLIENTE,idMovimiento:r?t.id_movimiento:null,idCliente:a.get(`idCliente`),camion:a.get(`camion`),cantidad:a.get(`llenos`),observacion:a.get(`observacion`)};r?(await Y(e),D(`ENTREGA MODIFICADA`)):(await ce({idCliente:e.idCliente,camion:e.camion,cantidad:e.cantidad,observacion:e.observacion}),D(`ENTREGA REGISTRADA`))}catch(e){O(e.message),n&&(n.disabled=!1)}})}async function d(t=null){let n=await W(),r=!!t;e.innerHTML=`

        ${x(r?`✏️ EDITAR RETIRO DE CLIENTE`:`↩️ RETIRO DE CLIENTE`)}

        <main class="main-content">

            <form id="formMovimiento">

                ${C(n)}

                <div class="form-group">
                    <label>Camión que recibe</label>

                    <select class="form-control" name="camion" required>
                        <option value="ROJO">Camión Rojo</option>
                        <option value="BLANCO">Camión Blanco</option>
                        <option value="CASA">Casa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Cilindros vacíos retirados</label>

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
                    <label>Observación</label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        id="observacionRetiro"
                        placeholder="Opcional"
                    ></textarea>
                </div>

                ${S()}

            </form>

        </main>
    `;let i=document.getElementById(`formMovimiento`),a=document.getElementById(`retiroEspecial`),o=document.getElementById(`observacionRetiro`);r&&(i.elements.namedItem(`idCliente`).value=t.id_cliente,i.elements.namedItem(`camion`).value=t.camion_destino,i.elements.namedItem(`vacios`).value=t.vacios,a.checked=!!t.retiro_especial,o.value=(t.observacion||``).replace(/^\[RETIRO ESPECIAL\]\s*/i,``));function s(){a.checked?(o.required=!0,o.placeholder=`Obligatoria: explica por qué este saldo no estaba registrado.`):(o.required=!1,o.placeholder=`Opcional`)}a.addEventListener(`change`,s),s(),w(),i.addEventListener(`submit`,async e=>{e.preventDefault();let n=e.submitter;n&&(n.disabled=!0);let o=new FormData(i);try{let e={tipo:X.RETIRO_CLIENTE,idMovimiento:r?t.id_movimiento:null,idCliente:o.get(`idCliente`),camion:o.get(`camion`),cantidad:o.get(`vacios`),observacion:o.get(`observacion`),retiroEspecial:a.checked};r?(await Y(e),D(`RETIRO MODIFICADO`)):(await le({idCliente:e.idCliente,camion:e.camion,cantidad:e.cantidad,observacion:e.observacion,retiroEspecial:e.retiroEspecial}),D(`RETIRO REGISTRADO`))}catch(e){O(e.message),n&&(n.disabled=!1)}})}async function f(t=null){let n=await W(),r=!!t;e.innerHTML=`

        ${x(r?`✏️ EDITAR ENTREGA + RETIRO`:`⇄ ENTREGA + RETIRO`)}

        <main class="main-content">

            <form id="formMovimiento">

                ${C(n)}

                <div class="form-group">
                    <label>Camión</label>

                    <select class="form-control" name="camion" required>
                        <option value="ROJO">Camión Rojo</option>
                        <option value="BLANCO">Camión Blanco</option>
                        <option value="CASA">Casa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Cilindros llenos entregados</label>

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
                    <label>Cilindros vacíos recibidos</label>

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

                <div class="status-bar status-info" id="previewPendiente">
                    Pendientes del cliente: —
                </div>

                <div class="form-group">
                    <label>Observación</label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>
                </div>

                ${S()}

            </form>

        </main>
    `;let i=document.getElementById(`formMovimiento`),a=i.elements.namedItem(`idCliente`),o=i.elements.namedItem(`llenos`),s=i.elements.namedItem(`vacios`),c=document.getElementById(`previewPendiente`);r&&(a.value=t.id_cliente,i.elements.namedItem(`camion`).value=t.camion_origen,o.value=t.llenos,s.value=t.vacios,i.elements.namedItem(`observacion`).value=t.observacion||``);async function l(){let e=await T(`clientes`,a.value);if(!e){c.textContent=`Pendientes del cliente: —`;return}let t=Number(o.value)||0,n=Number(s.value)||0,r=(Number(e.pendientes_actuales)||0)+t-n;c.textContent=`Pendientes después: ${r}`}a.addEventListener(`change`,l),o.addEventListener(`input`,l),s.addEventListener(`input`,l),w(),await l(),i.addEventListener(`submit`,async e=>{e.preventDefault();let n=e.submitter;n&&(n.disabled=!0);let a=new FormData(i);try{let e={tipo:X.ENTREGA_RETIRO,idMovimiento:r?t.id_movimiento:null,idCliente:a.get(`idCliente`),camion:a.get(`camion`),llenos:a.get(`llenos`),vacios:a.get(`vacios`),observacion:a.get(`observacion`)};r?(await Y(e),D(`ENTREGA + RETIRO MODIFICADO`)):(await ue({idCliente:e.idCliente,camion:e.camion,llenos:e.llenos,vacios:e.vacios,observacion:e.observacion}),D(`ENTREGA + RETIRO REGISTRADO`))}catch(e){O(e.message),n&&(n.disabled=!1)}})}async function p(t=null){let n=!!t;e.innerHTML=`

        ${x(n?`✏️ EDITAR SALIDA A PLANTA`:`🏭 SALIDA A PLANTA`)}

        <main class="main-content">

            <form id="formMovimiento">

                <div class="form-group">
                    <label>Camión</label>

                    <select class="form-control" name="camion" required>
                        <option value="ROJO">Camión Rojo</option>
                        <option value="BLANCO">Camión Blanco</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Cilindros vacíos enviados</label>

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
                    <label>Observación</label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>
                </div>

                ${S()}

            </form>

        </main>
    `;let r=document.getElementById(`formMovimiento`);n&&(r.elements.namedItem(`camion`).value=t.camion_origen,r.elements.namedItem(`vacios`).value=t.vacios,r.elements.namedItem(`observacion`).value=t.observacion||``),w(),r.addEventListener(`submit`,async e=>{e.preventDefault();let i=e.submitter;i&&(i.disabled=!0);let a=new FormData(r);try{let e={tipo:X.SALIDA_PLANTA,idMovimiento:n?t.id_movimiento:null,camion:a.get(`camion`),cantidad:a.get(`vacios`),observacion:a.get(`observacion`)};n?(await Y(e),D(`SALIDA A PLANTA MODIFICADA`)):(await de({camion:e.camion,cantidad:e.cantidad,observacion:e.observacion}),D(`SALIDA A PLANTA REGISTRADA`))}catch(e){O(e.message),i&&(i.disabled=!1)}})}async function m(t=null){let n=await he(),r=!!t,i=[...n];r&&t.id_viaje&&(i.some(e=>e.id_viaje===t.id_viaje)||i.push({id_viaje:t.id_viaje,camion:t.camion_destino||t.camion||`Camión`,vacios_enviados:t.vacios_enviados||`—`,fecha_salida:t.fecha_salida||t.fecha_hora})),e.innerHTML=`

        ${x(r?`✏️ EDITAR REGRESO DE PLANTA`:`🏭 REGRESO DE PLANTA`)}

        <main class="main-content">

            <form id="formMovimiento">

                <div class="form-group">
                    <label>Viaje de planta</label>

                    <select
                        class="form-control"
                        name="idViaje"
                        required
                        ${r?`disabled`:``}
                    >

                        <option value="">
                            Selecciona el viaje
                        </option>

                        ${i.map(e=>`
                            <option value="${e.id_viaje}">
                                ${e.camion}
                                — enviados: ${e.vacios_enviados}
                                — ${e.fecha_salida?new Date(e.fecha_salida).toLocaleString(`es-EC`):``}
                            </option>
                        `).join(``)}

                    </select>
                </div>

                ${i.length===0?`
                    <div class="status-bar status-warning">
                        🟡 No hay viajes a planta abiertos.
                    </div>
                `:``}

                <div class="form-group">
                    <label>Cilindros llenos recibidos</label>

                    <input
                        class="form-control"
                        type="number"
                        name="llenos"
                        min="1"
                        step="1"
                        required
                        ${i.length===0?`disabled`:``}
                    >
                </div>

                <div class="form-group">
                    <label>Observación</label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>
                </div>

                ${S()}

            </form>

        </main>
    `;let a=document.getElementById(`formMovimiento`);r&&(a.elements.namedItem(`idViaje`).value=t.id_viaje,a.elements.namedItem(`llenos`).value=t.llenos,a.elements.namedItem(`observacion`).value=t.observacion||``),w(),a.addEventListener(`submit`,async e=>{e.preventDefault();let n=e.submitter;n&&(n.disabled=!0);let i=new FormData(a);try{let e={tipo:X.REGRESO_PLANTA,idMovimiento:r?t.id_movimiento:null,idViaje:r?t.id_viaje:i.get(`idViaje`),llenos:i.get(`llenos`),observacion:i.get(`observacion`)};r?(await Y(e),D(`REGRESO DE PLANTA MODIFICADO`)):(await fe({idViaje:e.idViaje,llenos:e.llenos,observacion:e.observacion}),D(`REGRESO DE PLANTA REGISTRADO`))}catch(e){O(e.message),n&&(n.disabled=!1)}})}async function h(t=null){let n=!!t;e.innerHTML=`

        ${x(n?`✏️ EDITAR TRASLADO`:`🔄 TRASLADO ENTRE CAMIONES`)}

        <main class="main-content">

            <form id="formMovimiento">

                <div class="form-group">
                    <label>Ubicación origen</label>

                    <select class="form-control" name="origen" required>
                        <option value="ROJO">Camión Rojo</option>
                        <option value="BLANCO">Camión Blanco</option>
                        <option value="CASA">Casa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Ubicación destino</label>

                    <select class="form-control" name="destino" required>
                        <option value="BLANCO">Camión Blanco</option>
                        <option value="ROJO">Camión Rojo</option>
                        <option value="CASA">Casa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Tipo de cilindro</label>

                    <select class="form-control" name="tipoCilindro" required>
                        <option value="LLENOS">Llenos</option>
                        <option value="VACIOS">Vacíos</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Cantidad</label>

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
                    <label>Observación</label>

                    <textarea
                        class="form-control"
                        name="observacion"
                        placeholder="Opcional"
                    ></textarea>
                </div>

                ${S()}

            </form>

        </main>
    `;let r=document.getElementById(`formMovimiento`);if(n){let e=t.ubicacion_origen||t.origen||t.camion_origen,n=t.ubicacion_destino||t.destino||t.camion_destino;r.elements.namedItem(`origen`).value=e,r.elements.namedItem(`destino`).value=n;let i=Number(t.llenos)>0;r.elements.namedItem(`tipoCilindro`).value=i?`LLENOS`:`VACIOS`,r.elements.namedItem(`cantidad`).value=i?t.llenos:t.vacios,r.elements.namedItem(`observacion`).value=t.observacion||``}w(),r.addEventListener(`submit`,async e=>{e.preventDefault();let i=e.submitter;i&&(i.disabled=!0);let a=new FormData(r);try{let e=a.get(`tipoCilindro`),r=Number(a.get(`cantidad`)),i={tipo:X.TRASLADO,idMovimiento:n?t.id_movimiento:null,origen:a.get(`origen`),destino:a.get(`destino`),llenos:e===`LLENOS`?r:0,vacios:e===`VACIOS`?r:0,observacion:a.get(`observacion`)};if(i.origen===i.destino)throw Error(`La ubicación de origen y destino no pueden ser iguales.`);n?(await Y(i),D(`TRASLADO MODIFICADO`)):(await pe({origen:i.origen,destino:i.destino,llenos:i.llenos,vacios:i.vacios,observacion:i.observacion}),D(`TRASLADO REGISTRADO`))}catch(e){O(e.message),i&&(i.disabled=!1)}})}async function g(t=null){let n=await z(),r=!!t;e.innerHTML=`

        <header class="app-header">
            <h1>${r?`EDITAR CAMBIAZO`:`CAMBIAZO`}</h1>
            <p>Reclasificación de cilindros</p>
        </header>

        <main class="main-content">

            <div class="card">

                <div class="card-title">
                    Inventario disponible
                </div>

                <div id="resumenCambiazo"></div>

                <div class="form-group">
                    <label>Camión</label>

                    <select id="camionCambiazo" class="form-control">
                        <option value="ROJO">ROJO</option>
                        <option value="BLANCO">BLANCO</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Estado actual</label>

                    <select id="estadoActualCambiazo" class="form-control">
                        <option value="llenos">Llenos</option>
                        <option value="vacios">Vacíos</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Nuevo estado</label>

                    <select id="estadoNuevoCambiazo" class="form-control">
                        <option value="vacios">Vacíos</option>
                        <option value="llenos">Llenos</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Cantidad</label>

                    <input
                        type="number"
                        id="cantidadCambiazo"
                        class="form-control"
                        min="1"
                        step="1"
                        placeholder="Cantidad de cilindros"
                    >
                </div>

                <div class="form-group">
                    <label>Motivo del cambiazo</label>

                    <textarea
                        id="observacionCambiazo"
                        class="form-control"
                        placeholder="Describe el motivo..."
                    ></textarea>
                </div>

                <button
                    class="primary-button"
                    id="btnRegistrarCambiazo"
                >
                    ${r?`GUARDAR CAMBIOS`:`REGISTRAR CAMBIAZO`}
                </button>

                <button
                    class="secondary-button"
                    id="btnCancelarCambiazo"
                    style="margin-top:10px;"
                >
                    CANCELAR
                </button>

            </div>

        </main>
    `;let i=document.getElementById(`camionCambiazo`),a=document.getElementById(`estadoActualCambiazo`),o=document.getElementById(`estadoNuevoCambiazo`),c=document.getElementById(`cantidadCambiazo`),l=document.getElementById(`observacionCambiazo`),u=document.getElementById(`resumenCambiazo`);function d(){let e=i.value.toLowerCase(),t=n[e];u.innerHTML=`
            <p>🟢 Llenos: <strong>${t?.llenos||0}</strong></p>
            <p>⚪ Vacíos: <strong>${t?.vacios||0}</strong></p>
        `}r&&(i.value=t.ubicacion||t.camion_origen,a.value=String(t.estado_origen||``).toLowerCase(),o.value=String(t.estado_nuevo||``).toLowerCase(),c.value=t.cantidad,l.value=t.observacion||``),i.addEventListener(`change`,d),d(),document.getElementById(`btnRegistrarCambiazo`).addEventListener(`click`,async e=>{let n=e.currentTarget;n.disabled=!0;try{let e={tipo:X.CAMBIAZO,idMovimiento:r?t.id_movimiento:null,ubicacion:i.value,estadoActual:a.value,estadoNuevo:o.value,cantidad:Number(c.value),observacion:l.value};if(!Number.isInteger(e.cantidad)||e.cantidad<=0)throw Error(`Ingresa una cantidad válida.`);if(e.estadoActual===e.estadoNuevo)throw Error(`El estado actual y el nuevo estado deben ser diferentes.`);r?(await Y(e),D(`CAMBIAZO MODIFICADO`)):(await ge({ubicacion:e.ubicacion,estadoActual:e.estadoActual,estadoNuevo:e.estadoNuevo,cantidad:e.cantidad,observacion:e.observacion}),D(`CAMBIAZO REGISTRADO`))}catch(e){O(e.message),n.disabled=!1}}),document.getElementById(`btnCancelarCambiazo`).addEventListener(`click`,s)}async function _(){let t=await W();e.innerHTML=`

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
    📦 ${e.pendientes_actuales} pendientes
</div>

<div class="list-item-sub">
    ${e.asignacion_inicial?.realizada?`✓ Asignación inicial realizada`:`○ Sin asignación inicial`}
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


        ${k(`clientes`)}
    `,document.getElementById(`btnNuevoCliente`).addEventListener(`click`,y),document.getElementById(`btnPendientesIniciales`).addEventListener(`click`,v),j()}async function v(){let t=(await W()).filter(e=>!e.asignacion_inicial?.realizada&&(e.pendientes_actuales||0)===0);e.innerHTML=`

        <header class="app-header">

            <h1>ASIGNACIÓN INICIAL</h1>

            <p>
                Incorpora los cilindros pendientes
                de retirar de un cliente al inventario.
            </p>

        </header>

        <main class="main-content">

            <div class="card">

                <div class="card-title">
                    Asignar pendientes a un cliente
                </div>

                ${t.length===0?`

                    <p>
                        No hay clientes disponibles para
                        realizar una asignación inicial.
                    </p>

                `:`

                    <form id="formPendientesIniciales">

                        <div class="form-group">

                            <label for="clienteInicial">
                                Seleccionar cliente
                            </label>

                            <select
                                id="clienteInicial"
                                required
                            >

                                <option value="">
                                    Selecciona un cliente
                                </option>

                                ${t.map(e=>`

                                    <option value="${e.id_cliente}">
                                        ${e.nombre}
                                    </option>

                                `).join(``)}

                            </select>

                        </div>


                        <div class="form-group">

                            <label for="cantidadInicial">
                                Cantidad de cilindros pendientes
                            </label>

                            <input
                                type="number"
                                id="cantidadInicial"
                                min="1"
                                step="1"
                                placeholder="Ejemplo: 10"
                                required
                            >

                        </div>


                        <div class="card">

                            <div class="list-item-sub">
                                Esta asignación solo puede
                                realizarse una vez por cliente.
                            </div>

                            <div class="list-item-sub">
                                Los cilindros se incorporarán
                                directamente al inventario de CLIENTES.
                            </div>

                        </div>


                        <button
                            type="submit"
                            class="primary-button"
                        >
                            REGISTRAR ASIGNACIÓN
                        </button>

                    </form>

                `}

                <button
                    type="button"
                    class="secondary-button"
                    id="btnCancelarPendientesIniciales"
                >
                    CANCELAR
                </button>

            </div>

        </main>

        ${k(`clientes`)}

    `,document.getElementById(`formPendientesIniciales`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`clienteInicial`).value,n=Number(document.getElementById(`cantidadInicial`).value);if(!t){alert(`Selecciona un cliente.`);return}if(!Number.isInteger(n)||n<=0){alert(`Ingresa una cantidad entera mayor que cero.`);return}try{await se(t,n),alert(`Asignación inicial registrada correctamente.`),await _()}catch(e){alert(e.message)}}),document.getElementById(`btnCancelarPendientesIniciales`).addEventListener(`click`,_),j()}function y(){e.innerHTML=`

        ${x(`👤 NUEVO CLIENTE`)}


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
    `,w(),document.getElementById(`formCliente`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ae({nombre:t.get(`nombre`),telefono:t.get(`telefono`),direccion:t.get(`direccion`),sector:t.get(`sector`),observacion:t.get(`observacion`)}),D(`CLIENTE REGISTRADO`,`clientes`)}catch(e){O(e.message)}})}async function b(){let t=await Z();e.innerHTML=`

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


        ${k(`sync`)}
    `,document.getElementById(`btnSync`).addEventListener(`click`,()=>alert(`La conexión con el PC se implementará después de terminar el motor local.`)),document.getElementById(`btnActualizar`).addEventListener(`click`,()=>alert(`La actualización PC → móvil se implementará después de la sincronización.`)),j()}function x(e){return`

        <header class="app-header">

            <h1>${e}</h1>

            <p>
                Registro de operación
            </p>

        </header>
    `}function S(){return`

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
    `}function C(e){return`

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
    `}function w(){let e=document.getElementById(`btnCancelar`);e&&e.addEventListener(`click`,()=>{s()})}function D(n,r=`inicio`){e.innerHTML=`
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
    `,document.getElementById(`btnContinuar`).addEventListener(`click`,async()=>{if(r===`clientes`){await _();return}t=r,i()})}function O(e){alert(`⚠️ No se puede registrar\n\n${e}`)}function k(e){return`

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
    `}function j(){document.querySelectorAll(`[data-page]`).forEach(e=>{e.addEventListener(`click`,()=>{t=e.dataset.page,i()})})}async function N(){e.innerHTML=`

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
                            value="0"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>Vacíos</label>

                        <input
                            type="number"
                            id="rojoVacios"
                            min="0"
                            value="0"
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
                            value="0"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>Vacíos</label>

                        <input
                            type="number"
                            id="blancoVacios"
                            min="0"
                            value="0"
                            required
                        >

                    </div>
                    <h3>🏠 Casa</h3>

<div class="form-group">
    <label>Llenos</label>
    <input
        type="number"
        id="casaLlenos"
        min="0"
        value="0"
        required
    >
</div>

<div class="form-group">
    <label>Vacíos</label>
    <input
        type="number"
        id="casaVacios"
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


        ${k(`inicio`)}

    `,document.getElementById(`formApertura`).addEventListener(`submit`,async e=>{e.preventDefault();try{await ee({rojoLlenos:Number(document.getElementById(`rojoLlenos`).value),rojoVacios:Number(document.getElementById(`rojoVacios`).value),blancoLlenos:Number(document.getElementById(`blancoLlenos`).value),blancoVacios:Number(document.getElementById(`blancoVacios`).value),casaLlenos:Number(document.getElementById(`casaLlenos`).value),casaVacios:Number(document.getElementById(`casaVacios`).value)}),alert(`Apertura configurada correctamente.`),await a()}catch(e){alert(e.message)}}),document.getElementById(`btnCancelarApertura`)?.addEventListener(`click`,a),j()}function P(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}async function F(e){try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(e);else{let t=document.createElement(`textarea`);t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select();let n=document.execCommand(`copy`);if(t.remove(),!n)throw Error(`No se pudo copiar automáticamente.`)}alert(`Reporte copiado. Ya puedes pegarlo en WhatsApp.`)}catch(e){console.error(e),alert(`No se pudo copiar automáticamente. Selecciona y copia el texto del reporte.`)}}async function I(e){try{navigator.share?await navigator.share({title:`Reporte de la distribuidora`,text:e}):window.open(`https://wa.me/?text=${encodeURIComponent(e)}`,`_blank`)}catch(e){e.name!==`AbortError`&&(console.error(e),alert(`No se pudo abrir la opción para compartir el reporte.`))}}async function V(){let e=P(),t=new Date;t.setDate(t.getDate()-6);let n=[t.getFullYear(),String(t.getMonth()+1).padStart(2,`0`),String(t.getDate()).padStart(2,`0`)].join(`-`),r=document.getElementById(`app`);r.innerHTML=`
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
                    value="${e}"
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
                    value="${n}"
                >

                <label for="fechaFin">Hasta</label>
                <input
                    type="date"
                    id="fechaFin"
                    value="${e}"
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

            ${k(`reportes`)}
        </div>
    `;function i(e,t,n){let r=document.getElementById(e);r.innerHTML=`
            <div class="report-result">
                <h3>Resultado del reporte</h3>

                <pre id="${n}Texto" style="
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                    font-family: inherit;
                "></pre>

                <button
                    type="button"
                    class="primary-button"
                    id="${n}Compartir"
                >
                    📲 COMPARTIR
                </button>

                <button
                    type="button"
                    class="secondary-button"
                    id="${n}Copiar"
                >
                    📋 COPIAR TEXTO
                </button>
            </div>
        `,document.getElementById(`${n}Texto`).textContent=t,document.getElementById(`${n}Compartir`).addEventListener(`click`,()=>I(t)),document.getElementById(`${n}Copiar`).addEventListener(`click`,()=>F(t))}document.getElementById(`btnGenerarDiario`).addEventListener(`click`,async()=>{let e=document.getElementById(`btnGenerarDiario`),t=document.getElementById(`fechaReporte`).value;if(!t){alert(`Selecciona la fecha del reporte.`);return}e.disabled=!0,e.textContent=`GENERANDO...`;try{let[e,n,r,a,o,s]=await Promise.all([Ce(t),xe(),E(`clientes`),Se(t,t),De(t),$(t,t)]),c=r.map(e=>({nombre:e.nombre||`Cliente sin nombre`,cantidad:Number(e.pendientes_actuales)||0})).filter(e=>e.cantidad>0).sort((e,t)=>t.cantidad-e.cantidad);i(`resultadoDiario`,`📊 REPORTE DIARIO
Fecha: ${t.split(`-`).reverse().join(`/`)}
*Ventas Del Día: ${e}*

INVENTARIO ACTUAL
Camión Rojo: ${n.rojoLlenos} Llenos, ${n.rojoVacios} Vacíos
Camión Blanco: ${n.blancoLlenos} Llenos, ${n.blancoVacios} Vacíos 
Casa: ${n.casaLlenos} Llenos, ${n.casaVacios} Vacíos
*Total: ${n.rojoLlenos+n.blancoLlenos+n.casaLlenos} Llenos, ${n.rojoVacios+n.blancoVacios+n.casaVacios} Vacíos*

Lista de Ventas Del Día:
${o.length?o.map((e,t)=>`${t+1}. ${e.hora} — ${e.cliente}: ${e.cantidad} cilindros`).join(`
`):`No hay ventas registradas para esta fecha.`}

VIAJES A PLANTA
${s.length?`${s.length} ${s.length===1?`viaje`:`viajes`} — ${s.reduce((e,t)=>e+t.cantidad,0)} cilindros enviados
${s.map((e,t)=>`${t+1}. ${e.camion} — ${e.cantidad} cilindros — ${e.hora}`).join(`
`)}`:`No hubo viajes a planta en esta fecha.`}

Clientes con Cilindros pendientes:
${c.length?c.map((e,t)=>`${t+1}. ${e.nombre}: ${e.cantidad}`).join(`
`):`No hay pendientes asignados a clientes.`}

Pendientes en clientes: ${n.pendientesClientes}
TOTAL DE CILINDROS: ${n.total}

Sin asignar (Nuevos cilindros)
Llenos: ${n.sinAsignarLlenos}
Vacíos: ${n.sinAsignarVacios}`,`diario`)}catch(e){console.error(e),alert(`No se pudo generar el reporte diario. Revisa la consola para ver el error.`)}finally{e.disabled=!1,e.textContent=`GENERAR REPORTE DIARIO`}}),document.getElementById(`btnGenerarRango`).addEventListener(`click`,async()=>{let e=document.getElementById(`btnGenerarRango`),t=document.getElementById(`fechaInicio`).value,n=document.getElementById(`fechaFin`).value;if(!t||!n){alert(`Selecciona las dos fechas.`);return}if(t>n){alert(`La fecha inicial no puede ser mayor que la final.`);return}e.disabled=!0,e.textContent=`GENERANDO...`;try{let[e,r,a]=await Promise.all([we(t,n),Se(t,n),$(t,n)]);i(`resultadoRango`,`📊 REPORTE DE VENTAS POR RANGO
Distribuidora de cilindros
Desde: ${t.split(`-`).reverse().join(`/`)}
Hasta: ${n.split(`-`).reverse().join(`/`)}

VIAJES A PLANTA
${a.length?`${a.length} ${a.length===1?`viaje`:`viajes`} — ${a.reduce((e,t)=>e+t.cantidad,0)} cilindros enviados
${a.map((e,t)=>`${t+1}. ${e.fecha.split(`-`).reverse().join(`/`)} — ${e.camion} — ${e.cantidad} cilindros — ${e.hora}`).join(`
`)}`:`No hubo viajes a planta en este período.`}


TOTAL DE CILINDROS VENDIDOS: ${e}

VENTAS POR CLIENTE
${r.length?r.map((e,t)=>`${t+1}. ${e.nombre}: ${e.cantidad} cilindros`).join(`
`):`No hay ventas registradas en este período.`}`,`rango`)}catch(e){console.error(e),alert(`No se pudo generar el reporte por rango. Revisa la consola para ver el error.`)}finally{e.disabled=!1,e.textContent=`GENERAR REPORTE POR RANGO`}}),j()}document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{try{let e=await A();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}});async function H(){let n=await z(),r=n.sinAsignar||{llenos:0,vacios:0};e.innerHTML=`

        <section class="card">

            <h2>Inventario</h2>

            <p>
                Total de la empresa:
                <strong>${B(n)}</strong>
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
    🏠 Casa:
    ${n.casa?.llenos||0} llenos /
    ${n.casa?.vacios||0} vacíos
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

        formAsignarCamion">

                <label>
                    Camión
                    <select id="asignarCamion">
                        <option value="ROJO">ROJO</option>
                        <option value="BLANCO">BLANCO</option>
                         <option value="CASA">CASA</option>
                    </select>
                </label>
    <h3>Asignar a camión</h3>

            <p>
                Disponible sin asignar:
                ${r.llenos||0} llenos /
                ${r.vacios||0} vacíos
            </p>

            <form id="
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
    `,document.getElementById(`formAgregarSinAsignar`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await te({llenos:Number(document.getElementById(`agregarLlenos`).value),vacios:Number(document.getElementById(`agregarVacios`).value),observacion:document.getElementById(`agregarObservacion`).value.trim()}),alert(`Cilindros añadidos correctamente.`),await H()}catch(e){alert(e.message)}}),document.getElementById(`formRetirarSinAsignar`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await ne({llenos:Number(document.getElementById(`retirarLlenos`).value),vacios:Number(document.getElementById(`retirarVacios`).value),observacion:document.getElementById(`retirarObservacion`).value.trim()}),alert(`Cilindros retirados correctamente.`),await H()}catch(e){alert(e.message)}}),document.getElementById(`formAsignarCamion`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await re({camion:document.getElementById(`asignarCamion`).value,llenos:Number(document.getElementById(`asignarLlenos`).value),vacios:Number(document.getElementById(`asignarVacios`).value)}),alert(`Cilindros asignados correctamente.`),await H()}catch(e){alert(e.message)}}),document.getElementById(`btnVolverInicioInventario`)?.addEventListener(`click`,()=>{t=`inicio`,i()})}}))();