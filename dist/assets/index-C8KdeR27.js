var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n,r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x=e((()=>{(function(e){e.Unimplemented=`UNIMPLEMENTED`,e.Unavailable=`UNAVAILABLE`})(n||={}),r=class extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}},i=e=>e?.androidBridge?`android`:e?.webkit?.messageHandlers?.bridge?`ios`:`web`,a=e=>{let t=e.CapacitorCustomPlatform||null,a=e.Capacitor||{},o=a.Plugins=a.Plugins||{},s=()=>t===null?i(e):t.name,c=()=>s()!==`web`,l=e=>!!(f.get(e)?.platforms.has(s())||u(e)),u=e=>a.PluginHeaders?.find(t=>t.name===e),d=t=>e.console.error(t),f=new Map;return a.convertFileSrc||=e=>e,a.getPlatform=s,a.handleError=d,a.isNativePlatform=c,a.isPluginAvailable=l,a.registerPlugin=(e,i={})=>{let c=f.get(e);if(c)return console.warn(`Capacitor plugin "${e}" already registered. Cannot register plugins twice.`),c.proxy;let l=s(),d=u(e),p,m=async()=>(!p&&l in i?p=p=typeof i[l]==`function`?await i[l]():i[l]:t!==null&&!p&&`web`in i&&(p=p=typeof i.web==`function`?await i.web():i.web),p),h=(t,i)=>{if(d){let n=d?.methods.find(e=>i===e.name);if(n)return n.rtype===`promise`?t=>a.nativePromise(e,i.toString(),t):(t,n)=>a.nativeCallback(e,i.toString(),t,n);if(t)return t[i]?.bind(t)}else if(t)return t[i]?.bind(t);else throw new r(`"${e}" plugin is not implemented on ${l}`,n.Unimplemented)},g=t=>{let i,a=(...a)=>{let o=m().then(o=>{let s=h(o,t);if(s){let e=s(...a);return i=e?.remove,e}throw new r(`"${e}.${t}()" is not implemented on ${l}`,n.Unimplemented)});return t===`addListener`&&(o.remove=async()=>i()),o};return a.toString=()=>`${t.toString()}() { [capacitor code] }`,Object.defineProperty(a,"name",{value:t,writable:!1,configurable:!1}),a},_=g(`addListener`),v=g(`removeListener`),y=(e,t)=>{let n=_({eventName:e},t),r=async()=>{let r=await n;v({eventName:e,callbackId:r},t)},i=new Promise(e=>n.then(()=>e({remove:r})));return i.remove=async()=>{console.warn(`Using addListener() without 'await' is deprecated.`),await r()},i},b=new Proxy({},{get(e,t){switch(t){case`$$typeof`:return;case`toJSON`:return()=>({});case`addListener`:return d?y:_;case`removeListener`:return v;default:return g(t)}}});return o[e]=b,f.set(e,{name:e,proxy:b,platforms:new Set([...Object.keys(i),...d?[l]:[]])}),b},a.Exception=r,a.DEBUG=!!a.DEBUG,a.isLoggingEnabled=!!a.isLoggingEnabled,a},o=e=>e.Capacitor=a(e),s=o(typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:typeof global<`u`?global:{}),c=s.registerPlugin,l=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);let r=this.windowListeners[e];return r&&!r.registered&&this.addWindowListener(r),n&&this.sendRetainedArgumentsForEvent(e),Promise.resolve({remove:async()=>this.removeListener(e,t)})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){let r=this.listeners[e];if(!r){if(n){let n=this.retainedEventArguments[e];n||=[],n.push(t),this.retainedEventArguments[e]=n}return}r.forEach(e=>e(t))}hasListeners(e){return!!this.listeners[e]?.length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:e=>{this.notifyListeners(t,e)}}}unimplemented(e=`not implemented`){return new s.Exception(e,n.Unimplemented)}unavailable(e=`not available`){return new s.Exception(e,n.Unavailable)}async removeListener(e,t){let n=this.listeners[e];if(!n)return;let r=n.indexOf(t);r!==-1&&this.listeners[e].splice(r,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(t=>{this.notifyListeners(e,t)}))}},u=e=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),d=e=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),f=class extends l{async getCookies(){let e=document.cookie,t={};return e.split(`;`).forEach(e=>{if(e.length<=0)return;let[n,r]=e.replace(/=/,`CAP_COOKIE`).split(`CAP_COOKIE`);n=d(n).trim(),r=d(r).trim(),t[n]=r}),t}async setCookie(e){try{let t=u(e.key),n=u(e.value),r=e.expires?`; expires=${e.expires.replace(`expires=`,``)}`:``,i=(e.path||`/`).replace(`path=`,``),a=e.url!=null&&e.url.length>0?`domain=${e.url}`:``;document.cookie=`${t}=${n||``}${r}; path=${i}; ${a};`}catch(e){return Promise.reject(e)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(e){return Promise.reject(e)}}async clearCookies(){try{let e=document.cookie.split(`;`)||[];for(let t of e)document.cookie=t.replace(/^ +/,``).replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}},c(`CapacitorCookies`,{web:()=>new f}),p=async e=>new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.indexOf(`,`)>=0?e.split(`,`)[1]:e)},r.onerror=e=>n(e),r.readAsDataURL(e)}),m=(e={})=>{let t=Object.keys(e);return Object.keys(e).map(e=>e.toLocaleLowerCase()).reduce((n,r,i)=>(n[r]=e[t[i]],n),{})},h=(e,t=!0)=>e?Object.entries(e).reduce((e,n)=>{let[r,i]=n,a,o;return Array.isArray(i)?(o=``,i.forEach(e=>{a=t?encodeURIComponent(e):e,o+=`${r}=${a}&`}),o.slice(0,-1)):(a=t?encodeURIComponent(i):i,o=`${r}=${a}`),`${e}&${o}`},``).substr(1):null,g=(e,t={})=>{let n=Object.assign({method:e.method||`GET`,headers:e.headers},t),r=m(e.headers)[`content-type`]||``;if(typeof e.data==`string`)n.body=e.data;else if(r.includes(`application/x-www-form-urlencoded`)){let t=new URLSearchParams;for(let[n,r]of Object.entries(e.data||{}))t.set(n,r);n.body=t.toString()}else if(r.includes(`multipart/form-data`)||e.data instanceof FormData){let t=new FormData;if(e.data instanceof FormData)e.data.forEach((e,n)=>{t.append(n,e)});else for(let n of Object.keys(e.data))t.append(n,e.data[n]);n.body=t;let r=new Headers(n.headers);r.delete(`content-type`),n.headers=r}else(r.includes(`application/json`)||typeof e.data==`object`)&&(n.body=JSON.stringify(e.data));return n},_=class extends l{async request(e){let t=g(e,e.webFetchExtra),n=h(e.params,e.shouldEncodeUrlParams),r=n?`${e.url}?${n}`:e.url,i=await fetch(r,t),a=i.headers.get(`content-type`)||``,{responseType:o=`text`}=i.ok?e:{};a.includes(`application/json`)&&(o=`json`);let s,c;switch(o){case`arraybuffer`:case`blob`:c=await i.blob(),s=await p(c);break;case`json`:s=await i.json();break;default:s=await i.text()}let l={};return i.headers.forEach((e,t)=>{l[t]=e}),{data:s,headers:l,status:i.status,url:i.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:`GET`}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:`POST`}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:`PUT`}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:`PATCH`}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:`DELETE`}))}},c(`CapacitorHttp`,{web:()=>new _}),(function(e){e.Dark=`DARK`,e.Light=`LIGHT`,e.Default=`DEFAULT`})(v||={}),(function(e){e.StatusBar=`StatusBar`,e.NavigationBar=`NavigationBar`})(y||={}),b=class extends l{async setStyle(){this.unavailable(`not available for web`)}async setAnimation(){this.unavailable(`not available for web`)}async show(){this.unavailable(`not available for web`)}async hide(){this.unavailable(`not available for web`)}},c(`SystemBars`,{web:()=>new b})}));function S(){return M||(M=new Promise((e,t)=>{let n=indexedDB.open(A,j);n.onupgradeneeded=e=>{let t=e.target.result;if(t.objectStoreNames.contains(`configuracion`)||t.createObjectStore(`configuracion`,{keyPath:`id`}),!t.objectStoreNames.contains(`clientes`)){let e=t.createObjectStore(`clientes`,{keyPath:`id_cliente`});e.createIndex(`estado`,`estado`,{unique:!1}),e.createIndex(`nombre`,`nombre`,{unique:!1})}if(t.objectStoreNames.contains(`inventario`)||t.createObjectStore(`inventario`,{keyPath:`ubicacion`}),!t.objectStoreNames.contains(`movimientos`)){let e=t.createObjectStore(`movimientos`,{keyPath:`id_movimiento`});e.createIndex(`fecha_hora`,`fecha_hora`,{unique:!1}),e.createIndex(`tipo`,`tipo`,{unique:!1}),e.createIndex(`sync_estado`,`sync_estado`,{unique:!1}),e.createIndex(`estado`,`estado`,{unique:!1})}t.objectStoreNames.contains(`viajes_planta`)||t.createObjectStore(`viajes_planta`,{keyPath:`id_viaje`}).createIndex(`estado`,`estado`,{unique:!1}),t.objectStoreNames.contains(`sincronizacion`)||t.createObjectStore(`sincronizacion`,{keyPath:`id`})},n.onsuccess=t=>{e(t.target.result)},n.onerror=()=>{t(n.error)}}),M)}async function C(e,t){let n=await S();return new Promise((r,i)=>{let a=n.transaction(e,`readwrite`);a.objectStore(e).put(t),a.oncomplete=()=>r(t),a.onerror=()=>i(a.error)})}async function w(e,t){let n=await S();return new Promise((r,i)=>{let a=n.transaction(e,`readonly`).objectStore(e).get(t);a.onsuccess=()=>r(a.result),a.onerror=()=>i(a.error)})}async function T(e){let t=await S();return new Promise((n,r)=>{let i=t.transaction(e,`readonly`).objectStore(e).getAll();i.onsuccess=()=>n(i.result),i.onerror=()=>r(i.error)})}function E(){let e=new Date;return`respaldo_distribuidora_${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}_${String(e.getHours()).padStart(2,`0`)}-${String(e.getMinutes()).padStart(2,`0`)}-${String(e.getSeconds()).padStart(2,`0`)}.json`}async function D(){let e=await S(),t=Array.from(e.objectStoreNames);return new Promise((n,r)=>{let i=e.transaction(t,`readonly`),a={},o=null;for(let e of t){let t=i.objectStore(e).getAll();t.onsuccess=()=>{a[e]=t.result},t.onerror=()=>{o=t.error,i.abort()}}i.oncomplete=()=>{n({stores:t,datos:a})},i.onabort=()=>{r(o||i.error||Error(`No se pudieron leer todos los datos.`))},i.onerror=()=>{r(i.error||Error(`Error al leer la base de datos.`))}})}async function ee(){let e=await D(),t={formato:`RESPALDO_DISTRIBUIDORA`,version:2,fecha_exportacion:new Date().toISOString(),base_datos:A,stores:e.stores,datos:e.datos},n=JSON.stringify(t,null,2),r=E();if(s.isNativePlatform())return await k.guardarArchivo({nombre:r,contenido:n}),r;let i=new Blob([n],{type:`application/json;charset=utf-8`}),a=URL.createObjectURL(i),o=document.createElement(`a`);return o.href=a,o.download=r,document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>{URL.revokeObjectURL(a)},6e4),r}function O(e,t){if(!e||typeof e!=`object`)throw Error(`El respaldo está vacío o no es válido.`);if(![1,2].includes(e.version))throw Error(`Versión de respaldo no compatible.`);if(e.base_datos!==A)throw Error(`El respaldo pertenece a otra base de datos.`);if(!e.datos||typeof e.datos!=`object`||Array.isArray(e.datos))throw Error(`La estructura de datos no es válida.`);for(let n of t)if(!Array.isArray(e.datos[n]))throw Error(`El respaldo está incompleto. Falta la tabla: ${n}`);for(let n of Object.keys(e.datos))if(!t.includes(n))throw Error(`El respaldo contiene una tabla desconocida: ${n}`);if(Array.isArray(e.stores)){let n=[...e.stores].sort(),r=[...t].sort();if(JSON.stringify(n)!==JSON.stringify(r))throw Error(`La estructura del respaldo no coincide con la aplicación.`)}for(let n of t)for(let t of e.datos[n])if(!t||typeof t!=`object`||Array.isArray(t))throw Error(`Hay un registro inválido en ${n}.`)}async function te(e){if(!e)throw Error(`No se seleccionó ningún archivo.`);if(!e.name||!e.name.toLowerCase().endsWith(`.json`))throw Error(`Selecciona un archivo JSON.`);let t=await e.text(),n;try{n=JSON.parse(t)}catch{throw Error(`El archivo no contiene un JSON válido.`)}let r=await S(),i=Array.from(r.objectStoreNames);return O(n,i),new Promise((e,t)=>{let a=r.transaction(i,`readwrite`),o=null;a.oncomplete=()=>{e(!0)},a.onerror=()=>{t(o||a.error||Error(`Error durante la restauración.`))},a.onabort=()=>{t(o||a.error||Error(`La restauración fue cancelada.`))};try{for(let e of i){let t=a.objectStore(e);t.clear();for(let r of n.datos[e])t.put(r)}}catch(e){o=e;try{a.abort()}catch{t(e)}}})}var k,A,j,M,N=e((()=>{x(),k=c(`Respaldo`),A=`distribuidora_mobile`,j=1,M=null}));async function P(){let e=await T(`inventario`);e.find(e=>e.ubicacion===B.ROJO)||await C(`inventario`,{ubicacion:B.ROJO,llenos:0,vacios:0}),e.find(e=>e.ubicacion===B.BLANCO)||await C(`inventario`,{ubicacion:B.BLANCO,llenos:0,vacios:0}),e.find(e=>e.ubicacion===B.CLIENTES)||await C(`inventario`,{ubicacion:B.CLIENTES,pendientes:0}),e.find(e=>e.ubicacion===B.SIN_ASIGNAR)||await C(`inventario`,{ubicacion:B.SIN_ASIGNAR,llenos:0,vacios:0})}async function F(){return await P(),{rojo:await w(`inventario`,B.ROJO),blanco:await w(`inventario`,B.BLANCO),clientes:await w(`inventario`,B.CLIENTES),sinAsignar:await w(`inventario`,B.SIN_ASIGNAR)}}async function I(e,t){let n=await w(`inventario`,e);if(!n)throw Error(`No existe la ubicación ${e}.`);let r={...n,...t,ubicacion:e};return L(r),await C(`inventario`,r),r}function L(e){if(e.llenos!==void 0&&(!Number.isInteger(e.llenos)||e.llenos<0))throw Error(`Los cilindros llenos deben ser un número entero mayor o igual a 0.`);if(e.vacios!==void 0&&(!Number.isInteger(e.vacios)||e.vacios<0))throw Error(`Los cilindros vacíos deben ser un número entero mayor o igual a 0.`);if(e.pendientes!==void 0&&(!Number.isInteger(e.pendientes)||e.pendientes<0))throw Error(`Los pendientes de clientes deben ser un número entero mayor o igual a 0.`)}function R(e){let t=(e.rojo?.llenos||0)+(e.rojo?.vacios||0),n=(e.blanco?.llenos||0)+(e.blanco?.vacios||0),r=e.clientes?.pendientes||0,i=(e.sinAsignar?.llenos||0)+(e.sinAsignar?.vacios||0);return t+n+r+i}async function ne({rojoLlenos:e,rojoVacios:t,blancoLlenos:n,blancoVacios:r,clientesPendientes:i}){if((await T(`movimientos`)).length>0)throw Error(`No puedes modificar la apertura después de registrar movimientos.`);if([e,t,n,r,i].some(e=>!Number.isInteger(e)||e<0))throw Error(`Todos los valores deben ser números enteros mayores o iguales a 0.`);return await C(`inventario`,{ubicacion:B.ROJO,llenos:e,vacios:t}),await C(`inventario`,{ubicacion:B.BLANCO,llenos:n,vacios:r}),await C(`inventario`,{ubicacion:B.CLIENTES,pendientes:i}),await C(`inventario`,{ubicacion:B.SIN_ASIGNAR,llenos:0,vacios:0}),F()}async function re({llenos:e=0,vacios:t=0,observacion:n=``}){if(e=Number(e),t=Number(t),z(e,t),e===0&&t===0)throw Error(`Debes agregar al menos un cilindro.`);let r=await w(`inventario`,B.SIN_ASIGNAR);if(!r)throw Error(`No existe la ubicación SIN ASIGNAR.`);return await C(`inventario`,{...r,llenos:(r.llenos||0)+e,vacios:(r.vacios||0)+t}),{llenos:e,vacios:t,observacion:n}}async function ie({llenos:e=0,vacios:t=0,observacion:n=``}){if(e=Number(e),t=Number(t),z(e,t),e===0&&t===0)throw Error(`Debes retirar al menos un cilindro.`);let r=await w(`inventario`,B.SIN_ASIGNAR);if(!r)throw Error(`No existe la ubicación SIN ASIGNAR.`);if(e>(r.llenos||0))throw Error(`No puedes retirar ${e} llenos. Solo hay ${r.llenos||0} sin asignar.`);if(t>(r.vacios||0))throw Error(`No puedes retirar ${t} vacíos. Solo hay ${r.vacios||0} sin asignar.`);return await C(`inventario`,{...r,llenos:(r.llenos||0)-e,vacios:(r.vacios||0)-t}),{llenos:e,vacios:t,observacion:n}}async function ae({camion:e,llenos:t=0,vacios:n=0}){if(e!==B.ROJO&&e!==B.BLANCO)throw Error(`El destino debe ser ROJO o BLANCO.`);if(t=Number(t),n=Number(n),z(t,n),t===0&&n===0)throw Error(`Debes asignar al menos un cilindro.`);let r=await w(`inventario`,B.SIN_ASIGNAR),i=await w(`inventario`,e);if(!r||!i)throw Error(`No se encontró el inventario necesario.`);if(t>(r.llenos||0))throw Error(`No hay suficientes cilindros llenos sin asignar. Disponibles: ${r.llenos||0}.`);if(n>(r.vacios||0))throw Error(`No hay suficientes cilindros vacíos sin asignar. Disponibles: ${r.vacios||0}.`);return await C(`inventario`,{...r,llenos:(r.llenos||0)-t,vacios:(r.vacios||0)-n}),await C(`inventario`,{...i,llenos:(i.llenos||0)+t,vacios:(i.vacios||0)+n}),F()}function z(e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<0||t<0)throw Error(`Las cantidades deben ser números enteros mayores o iguales a 0.`)}var B,V=e((()=>{N(),B={ROJO:`ROJO`,BLANCO:`BLANCO`,CLIENTES:`CLIENTES`,SIN_ASIGNAR:`SIN ASIGNAR`}}));function oe(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}async function se({nombre:e,telefono:t=``,direccion:n=``,sector:r=``,observacion:i=``}){if(e=e.trim(),!e)throw Error(`El nombre del cliente es obligatorio.`);let a={id_cliente:oe(),nombre:e,telefono:t,direccion:n,sector:r,fecha_registro:new Date().toISOString(),estado:`ACTIVO`,observacion:i,pendientes_actuales:0,sync_estado:`PENDIENTE`};return await C(`clientes`,a),a}async function H(){return(await T(`clientes`)).filter(e=>e.estado===`ACTIVO`).sort((e,t)=>e.nombre.localeCompare(t.nombre))}async function U(e){return w(`clientes`,e)}async function ce(){return(await T(`clientes`)).filter(e=>e.estado===`ACTIVO`).reduce((e,t)=>e+(t.pendientes_actuales||0),0)}async function le(){let e=((await F()).clientes?.pendientes||0)-await ce();return Math.max(0,e)}async function ue(e){if(!Array.isArray(e))throw Error(`Las asignaciones deben ser un arreglo.`);let t=(await F()).clientes?.pendientes||0,n=(await T(`clientes`)).filter(e=>e.estado===`ACTIVO`),r=new Map(n.map(e=>[e.id_cliente,e])),i=0;for(let t of e){let e=Number(t.cantidad);if(!Number.isInteger(e)||e<0)throw Error(`Las cantidades iniciales deben ser números enteros mayores o iguales a 0.`);if(e!==0){if(!r.get(t.idCliente))throw Error(`Uno de los clientes seleccionados no existe o está inactivo.`);i+=e}}let a=t-n.reduce((e,t)=>e+(t.pendientes_actuales||0),0);if(i>a)throw Error(`No hay suficientes pendientes iniciales. Disponibles: ${a}.`);for(let t of e){let e=Number(t.cantidad);if(e===0)continue;let n=r.get(t.idCliente);n.pendientes_actuales=(n.pendientes_actuales||0)+e,n.sync_estado=`PENDIENTE`,await C(`clientes`,n)}return{asignados:i,disponibles:a-i}}async function W(e,t){if(t=Number(t),!Number.isInteger(t))throw Error(`La cantidad debe ser un número entero.`);let n=await U(e);if(!n)throw Error(`El cliente no existe.`);let r=(n.pendientes_actuales||0)+t;if(r<0)throw Error(`El pendiente del cliente no puede quedar negativo.`);n.pendientes_actuales=r,n.sync_estado=`PENDIENTE`,await C(`clientes`,n);let i=await ce();return await I(B.CLIENTES,{pendientes:i}),n}var de=e((()=>{N(),V()}));function G(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}async function K(e){let t=await w(`inventario`,e);if(!t||e!==B.ROJO&&e!==B.BLANCO)throw Error(`No existe el camión ${e}.`);return t}function q(e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<0||t<0)throw Error(`Las cantidades deben ser números enteros mayores o iguales a 0.`)}function J(e,t=0,n=0){if(t>(e.llenos||0))throw Error(`El camión no tiene suficientes cilindros llenos. Disponibles: ${e.llenos||0}.`);if(n>(e.vacios||0))throw Error(`El camión no tiene suficientes cilindros vacíos. Disponibles: ${e.vacios||0}.`)}async function Y(e){let t=await U(e);if(!t)throw Error(`El cliente seleccionado no existe.`);if(t.estado!==`ACTIVO`)throw Error(`El cliente seleccionado está inactivo.`);return t}async function X(e){let t={id_movimiento:G(),fecha_hora:new Date().toISOString(),estado:`ACTIVO`,created_at:new Date().toISOString(),dispositivo:`MOVIL`,sync_estado:`PENDIENTE`,...e};return await C(`movimientos`,t),t}async function fe({idCliente:e,camion:t,cantidad:n,observacion:r=``}){if(n=Number(n),!Number.isInteger(n)||n<=0)throw Error(`La cantidad entregada debe ser un número entero mayor que 0.`);let i=await K(t);return J(i,n,0),await Y(e),await I(t,{llenos:(i.llenos||0)-n}),await W(e,n),X({tipo:Z.ENTREGA_CLIENTE,id_cliente:e,camion_origen:t,camion_destino:null,llenos:n,vacios:0,observacion:r})}async function pe({idCliente:e,camion:t,cantidad:n,observacion:r=``,retiroEspecial:i=!1}){if(n=Number(n),!Number.isInteger(n)||n<=0)throw Error(`La cantidad retirada debe ser un número entero mayor que 0.`);let a=await K(t),o=(await Y(e)).pendientes_actuales||0;if(i){if(r=r.trim(),!r)throw Error(`La observación es obligatoria para un retiro especial.`);return await I(t,{vacios:(a.vacios||0)+n}),X({tipo:Z.RETIRO_CLIENTE,id_cliente:e,camion_origen:null,camion_destino:t,llenos:0,vacios:n,observacion:`[RETIRO ESPECIAL] ${r}`,retiro_especial:!0})}if(n>o)throw Error(`El cliente tiene ${o} cilindros pendientes. No puedes retirar ${n}.`);return await W(e,-n),await I(t,{vacios:(a.vacios||0)+n}),X({tipo:Z.RETIRO_CLIENTE,id_cliente:e,camion_origen:null,camion_destino:t,llenos:0,vacios:n,observacion:r,retiro_especial:!1})}async function me({idCliente:e,camion:t,llenos:n,vacios:r,observacion:i=``}){if(n=Number(n),r=Number(r),q(n,r),n<=0&&r<=0)throw Error(`Debes entregar o retirar al menos un cilindro.`);let a=await K(t);J(a,n,0);let o=(await Y(e)).pendientes_actuales||0;if(o+n-r<0)throw Error(`El cliente tiene ${o} pendientes. No puedes retirar ${r} porque recibirías más de lo que debe.`);return await I(t,{llenos:(a.llenos||0)-n,vacios:(a.vacios||0)+r}),await W(e,n-r),X({tipo:Z.ENTREGA_RETIRO,id_cliente:e,camion_origen:t,camion_destino:t,llenos:n,vacios:r,observacion:i})}async function he({camion:e,cantidad:t,observacion:n=``}){if(t=Number(t),!Number.isInteger(t)||t<=0)throw Error(`La cantidad enviada a planta debe ser un número entero mayor que 0.`);let r=await K(e);J(r,0,t);let i=G();await I(e,{vacios:(r.vacios||0)-t});let a={id_viaje:i,camion:e,fecha_salida:new Date().toISOString(),fecha_regreso:null,estado:`ABIERTO`,vacios_enviados:t,llenos_recibidos:0,id_movimiento_salida:null,id_movimiento_regreso:null};await C(`viajes_planta`,a);let o=await X({tipo:Z.SALIDA_PLANTA,id_cliente:null,camion_origen:e,camion_destino:null,llenos:0,vacios:t,id_viaje:i,observacion:n});return a.id_movimiento_salida=o.id_movimiento,await C(`viajes_planta`,a),o}async function ge({idViaje:e,llenos:t,observacion:n=``}){if(t=Number(t),!Number.isInteger(t)||t<=0)throw Error(`La cantidad que regresa de planta debe ser un número entero mayor que 0.`);let r=await w(`viajes_planta`,e);if(!r)throw Error(`El viaje de planta no existe.`);if(r.estado!==`ABIERTO`)throw Error(`Este viaje de planta ya está cerrado.`);if(t!==r.vacios_enviados)throw Error(`El viaje envió ${r.vacios_enviados} cilindros. El regreso debe registrar exactamente ${r.vacios_enviados}.`);let i=await K(r.camion);await I(r.camion,{llenos:(i.llenos||0)+t});let a=await X({tipo:Z.REGRESO_PLANTA,id_cliente:null,camion_origen:null,camion_destino:r.camion,llenos:t,vacios:0,id_viaje:e,observacion:n});return r.estado=`CERRADO`,r.fecha_regreso=new Date().toISOString(),r.llenos_recibidos=t,r.id_movimiento_regreso=a.id_movimiento,await C(`viajes_planta`,r),a}async function _e({origen:e,destino:t,llenos:n=0,vacios:r=0,observacion:i=``}){if(n=Number(n),r=Number(r),q(n,r),n<=0&&r<=0)throw Error(`Debes trasladar al menos un cilindro.`);if(e===t)throw Error(`El camión de origen y destino deben ser diferentes.`);if(e!==B.ROJO&&e!==B.BLANCO||t!==B.ROJO&&t!==B.BLANCO)throw Error(`El traslado solo puede realizarse entre ROJO y BLANCO.`);let a=await K(e),o=await K(t);return J(a,n,r),await I(e,{llenos:(a.llenos||0)-n,vacios:(a.vacios||0)-r}),await I(t,{llenos:(o.llenos||0)+n,vacios:(o.vacios||0)+r}),X({tipo:Z.TRASLADO,id_cliente:null,camion_origen:e,camion_destino:t,llenos:n,vacios:r,observacion:i})}async function ve(){return(await T(`movimientos`)).sort((e,t)=>{let n=new Date(e.fecha_hora||0);return new Date(t.fecha_hora||0)-n})}async function ye(){return(await T(`viajes_planta`)).filter(e=>e.estado===`ABIERTO`).sort((e,t)=>new Date(t.fecha_salida)-new Date(e.fecha_salida))}var Z,be=e((()=>{N(),V(),de(),Z={ENTREGA_CLIENTE:`ENTREGA A CLIENTE`,RETIRO_CLIENTE:`RETIRO DE CLIENTE`,ENTREGA_RETIRO:`ENTREGA + RETIRO`,SALIDA_PLANTA:`SALIDA A PLANTA`,REGRESO_PLANTA:`REGRESO DE PLANTA`,TRASLADO:`TRASLADO ENTRE CAMIONES`}}));async function xe(){let e=await T(`movimientos`),t=await T(`clientes`);return{movimientos:e.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`),clientes:t.filter(e=>e.sync_estado===`PENDIENTE`||e.sync_estado===`ERROR`)}}async function Se(){let e=await xe();return{movimientos:e.movimientos.length,clientes:e.clientes.length,total:e.movimientos.length+e.clientes.length}}var Ce=e((()=>{N()}));function we(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}async function Te(){let e=await T(`inventario`),t=t=>e.find(e=>e.ubicacion===t)||{},n=t(`ROJO`),r=t(`BLANCO`),i=t(`CLIENTES`),a=t(`SIN ASIGNAR`),o={rojoLlenos:Number(n.llenos)||0,rojoVacios:Number(n.vacios)||0,blancoLlenos:Number(r.llenos)||0,blancoVacios:Number(r.vacios)||0,pendientesClientes:Number(i.pendientes)||0,sinAsignarLlenos:Number(a.llenos)||0,sinAsignarVacios:Number(a.vacios)||0};return o.total=o.rojoLlenos+o.rojoVacios+o.blancoLlenos+o.blancoVacios+o.pendientesClientes+o.sinAsignarLlenos+o.sinAsignarVacios,o}async function Q(e,t){let[n,r]=await Promise.all([T(`movimientos`),T(`clientes`)]),i=Object.fromEntries(r.map(e=>[e.id_cliente,e.nombre])),a={};return n.filter(n=>{if(n.estado!==`ACTIVO`)return!1;let r=n.fecha_hora?new Date(n.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):n.fecha;return r>=e&&r<=t&&(n.tipo===`ENTREGA A CLIENTE`||n.tipo===`ENTREGA + RETIRO`)}).forEach(e=>{let t=e.cliente||e.id_cliente||`SIN CLIENTE`,n=Number(e.llenos)||0;a[t]||(a[t]={idCliente:t,nombre:i[t]||t,cantidad:0}),a[t].cantidad+=n}),Object.values(a).sort((e,t)=>t.cantidad-e.cantidad)}async function Ee(e){return(await T(`movimientos`)).filter(t=>t.estado===`ACTIVO`&&(t.fecha_hora?new Date(t.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):t.fecha)===e&&(t.tipo===`ENTREGA A CLIENTE`||t.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(Number(t.llenos)||0),0)}async function De(e,t){return(await T(`movimientos`)).filter(n=>{if(n.estado!==`ACTIVO`)return!1;let r=n.fecha_hora?new Date(n.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):n.fecha;return r>=e&&r<=t&&(n.tipo===`ENTREGA A CLIENTE`||n.tipo===`ENTREGA + RETIRO`)}).reduce((e,t)=>e+(Number(t.llenos)||0),0)}async function Oe(){let e=await T(`movimientos`),t=we();return e.filter(e=>e.estado===`ACTIVO`&&(e.fecha_hora?new Date(e.fecha_hora).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):e.fecha)===t&&(e.tipo===`ENTREGA A CLIENTE`||e.tipo===`ENTREGA + RETIRO`)).reduce((e,t)=>e+(Number(t.llenos)||0),0)}function $(e){return e?new Date(e).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):``}function ke(e){return e?new Date(e).toLocaleTimeString(`es-EC`,{timeZone:`America/Guayaquil`,hour:`2-digit`,minute:`2-digit`,hour12:!1}):`Hora no disponible`}async function Ae(e){let[t,n]=await Promise.all([T(`movimientos`),T(`clientes`)]),r=Object.fromEntries(n.map(e=>[e.id_cliente,e.nombre]));return t.filter(t=>t.estado===`ACTIVO`&&(t.fecha_hora?$(t.fecha_hora):t.fecha)===e&&(t.tipo===`ENTREGA A CLIENTE`||t.tipo===`ENTREGA + RETIRO`)).map(e=>{let t=e.cliente||e.id_cliente;return{cliente:r[t]||t||`Sin cliente`,cantidad:Number(e.llenos)||0,fechaHora:e.fecha_hora,hora:ke(e.fecha_hora)}}).sort((e,t)=>e.fechaHora?t.fechaHora?new Date(e.fechaHora)-new Date(t.fechaHora):-1:1)}async function je(e,t){return(await T(`viajes_planta`)).filter(n=>{let r=n.fecha_salida?$(n.fecha_salida):``;return r>=e&&r<=t}).map(e=>({camion:e.camion||`Camión no identificado`,cantidad:Number(e.vacios_enviados)||0,fecha:$(e.fecha_salida),fechaHora:e.fecha_salida,hora:ke(e.fecha_salida)})).sort((e,t)=>e.fechaHora?t.fechaHora?new Date(e.fechaHora)-new Date(t.fechaHora):-1:1)}var Me=e((()=>{N()})),Ne=e((()=>{}));t((()=>{V(),be(),de(),Ce(),N(),Me(),Ne();var e=document.getElementById(`app`),t=`inicio`;document.addEventListener(`DOMContentLoaded`,n);async function n(){await P(),r(),i()}function r(){`serviceWorker`in navigator&&navigator.serviceWorker.register(`/sw.js`).catch(e=>{console.error(`Error Service Worker:`,e)})}async function i(){switch(t){case`inicio`:await a();break;case`movimientos`:await o();break;case`clientes`:await g();break;case`inventario`:await z();break;case`sync`:await y();break;case`reportes`:await L();break;default:await a()}}async function a(){let t=await F(),n=await Se(),r=R(t),i=await Oe(),a=(t.rojo?.vacios||0)+(t.blanco?.vacios||0),o=(t.rojo?.llenos||0)+(t.blanco?.llenos||0);e.innerHTML=`

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


        ${O(`inicio`)}

    `,document.getElementById(`btnApertura`)?.addEventListener(`click`,A),document.getElementById(`btnNuevoMovimiento`)?.addEventListener(`click`,s),document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{try{let e=await ee();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}}),document.getElementById(`btnImportarBD`)?.addEventListener(`click`,()=>{document.getElementById(`inputImportarBD`)?.click()}),document.getElementById(`inputImportarBD`)?.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){if(!confirm(`⚠️ ATENCIÓN

Cargar este respaldo reemplazará los datos actuales.

¿Quieres continuar?`)){e.target.value=``;return}try{await te(t),alert(`✅ Base de datos restaurada correctamente.`),window.location.reload()}catch(e){console.error(e),alert(`❌ No se pudo cargar el respaldo.\n\n${e.message}`)}e.target.value=``}}),k()}async function o(){let t=await ve(),n=await T(`clientes`),r=Object.fromEntries(n.map(e=>[e.id_cliente,e.nombre])),i=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),a=e=>e?new Date(e).toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`}):``,o=new Date().toLocaleDateString(`en-CA`,{timeZone:`America/Guayaquil`});e.innerHTML=`

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
            value="${o}"
        >
    </div>

    <div class="form-group">
        <label for="fechaFinMovimientos">
            Hasta
        </label>

        <input
            type="date"
            id="fechaFinMovimientos"
            value="${o}"
        >
    </div>

</div>

                <div class="form-group">
                    <label for="filtroClienteMovimientos">
                        Cliente
                    </label>

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

        ${O(`movimientos`)}
    `;let c=document.getElementById(`listaMovimientos`),l=document.getElementById(`fechaInicioMovimientos`),u=document.getElementById(`fechaFinMovimientos`),d=document.getElementById(`filtroClienteMovimientos`),f=document.getElementById(`contadorMovimientos`);function p(){let e=l.value,n=u.value,o=d.value;if(!e||!n){f.textContent=``,c.innerHTML=`
                <div class="empty-state">
                    Selecciona las fechas de inicio y fin.
                </div>
            `;return}if(e>n){f.textContent=``,c.innerHTML=`
                <div class="empty-state">
                    La fecha de inicio no puede ser posterior
                    a la fecha de fin.
                </div>
            `;return}let s=t.filter(t=>{let r=t.fecha_hora?a(t.fecha_hora):t.fecha||``,i=t.cliente||t.id_cliente||``;return r>=e&&r<=n&&(!o||String(i)===String(o))});if(f.textContent=`${s.length} movimiento${s.length===1?``:`s`}`,s.length===0){c.innerHTML=`
                <div class="empty-state">
                    <div class="icon">📋</div>
                    No hay movimientos para los filtros seleccionados.
                </div>
            `;return}c.innerHTML=`
            <div class="list">

                ${s.map(e=>{let t=[Number(e.llenos)>0?`Llenos: ${e.llenos}`:``,Number(e.vacios)>0?`Vacíos: ${e.vacios}`:``].filter(Boolean).join(` | `),n=e.fecha_hora?new Date(e.fecha_hora).toLocaleString(`es-EC`,{timeZone:`America/Guayaquil`}):e.fecha||``,a=e.cliente||e.id_cliente||``,o=a?r[a]||`Cliente`:``,s=[o?`👤 `+o:``,e.tipo===`REGRESO DE PLANTA`?`🏭 PLANTA`:e.camion_origen?`🚚 `+e.camion_origen:``,e.camion_destino?`→ `+e.camion_destino:``,t].filter(Boolean).join(` | `);return`
                        <div class="list-item">

                            <div class="list-item-top">

                                <span class="list-item-title">
                                    ${i(e.tipo||`Movimiento`)}
                                </span>

                                <span class="badge badge-warning">
                                    ${i(e.sync_estado||``)}
                                </span>

                            </div>

                            <div class="list-item-sub">
                                ${i(n)}
                            </div>

                            <div class="list-item-sub">
                                ${i(s)}
                            </div>

                        </div>
                    `}).join(``)}

            </div>
        `}l.addEventListener(`change`,p),u.addEventListener(`change`,p),d.addEventListener(`change`,p),p(),document.getElementById(`btnNuevo`).addEventListener(`click`,s),k()}function s(){e.innerHTML=`

        <header class="app-header">

            <h1>NUEVO MOVIMIENTO</h1>

            <p>Selecciona el tipo</p>

        </header>


        <main class="main-content">

            <div class="movement-grid">

                ${c(`🚚`,`ENTREGA A CLIENTE`,`Entrega cilindros llenos`,Z.ENTREGA_CLIENTE)}


                ${c(`↩️`,`RETIRO DE CLIENTE`,`Retira cilindros vacíos`,Z.RETIRO_CLIENTE)}


                ${c(`⇄`,`ENTREGA + RETIRO`,`Entrega llenos y recibe vacíos`,Z.ENTREGA_RETIRO)}


                ${c(`🏭`,`SALIDA A PLANTA`,`Envía cilindros vacíos a planta`,Z.SALIDA_PLANTA)}


                ${c(`🏭`,`REGRESO DE PLANTA`,`Recibe cilindros llenos`,Z.REGRESO_PLANTA)}


                ${c(`🔄`,`TRASLADO ENTRE CAMIONES`,`Mueve cilindros entre camiones`,Z.TRASLADO)}

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
    `}async function l(e){switch(e){case Z.ENTREGA_CLIENTE:await u();break;case Z.RETIRO_CLIENTE:await d();break;case Z.ENTREGA_RETIRO:await f();break;case Z.SALIDA_PLANTA:await p();break;case Z.REGRESO_PLANTA:await m();break;case Z.TRASLADO:await h()}}async function u(){let t=await H();e.innerHTML=`

        ${b(`🚚 ENTREGA A CLIENTE`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${S(t)}


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


                ${x()}

            </form>

        </main>
    `,C(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await fe({idCliente:t.get(`idCliente`),camion:t.get(`camion`),cantidad:t.get(`llenos`),observacion:t.get(`observacion`)}),E(`ENTREGA REGISTRADA`)}catch(e){D(e.message)}})}async function d(){let t=await H();e.innerHTML=`

        ${b(`↩️ RETIRO DE CLIENTE`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${S(t)}


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


                ${x()}

            </form>

        </main>
    `,C();let n=document.getElementById(`retiroEspecial`),r=document.getElementById(`observacionRetiro`);n.addEventListener(`change`,()=>{n.checked?(r.required=!0,r.placeholder=`Obligatoria: explica por qué este saldo no estaba registrado.`):(r.required=!1,r.placeholder=`Opcional`)}),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await pe({idCliente:t.get(`idCliente`),camion:t.get(`camion`),cantidad:t.get(`vacios`),observacion:t.get(`observacion`),retiroEspecial:t.get(`retiroEspecial`)===`on`}),E(`RETIRO REGISTRADO`)}catch(e){D(e.message)}})}async function f(){let t=await H();e.innerHTML=`

        ${b(`⇄ ENTREGA + RETIRO`)}


        <main class="main-content">

            <form id="formMovimiento">


                ${S(t)}


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


                ${x()}

            </form>

        </main>
    `,C();let n=document.querySelector(`[name="idCliente"]`),r=document.querySelector(`[name="llenos"]`),i=document.querySelector(`[name="vacios"]`);async function a(){let e=await w(`clientes`,n.value);if(!e)return;let t=Number(r.value)||0,a=Number(i.value)||0,o=(e.pendientes_actuales||0)+t-a;document.getElementById(`previewPendiente`).textContent=`Pendientes después: ${o}`}n.addEventListener(`change`,a),r.addEventListener(`input`,a),i.addEventListener(`input`,a),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await me({idCliente:t.get(`idCliente`),camion:t.get(`camion`),llenos:t.get(`llenos`),vacios:t.get(`vacios`),observacion:t.get(`observacion`)}),E(`ENTREGA + RETIRO REGISTRADO`)}catch(e){D(e.message)}})}async function p(){e.innerHTML=`

        ${b(`🏭 SALIDA A PLANTA`)}


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


                ${x()}

            </form>

        </main>
    `,C(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await he({camion:t.get(`camion`),cantidad:t.get(`vacios`),observacion:t.get(`observacion`)}),E(`SALIDA A PLANTA REGISTRADA`)}catch(e){D(e.message)}})}async function m(){let t=await ye();e.innerHTML=`

        ${b(`🏭 REGRESO DE PLANTA`)}


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


                ${x()}

            </form>

        </main>
    `,C(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await ge({idViaje:t.get(`idViaje`),llenos:t.get(`llenos`),observacion:t.get(`observacion`)}),E(`REGRESO DE PLANTA REGISTRADO`)}catch(e){D(e.message)}})}async function h(){e.innerHTML=`

        ${b(`🔄 TRASLADO ENTRE CAMIONES`)}


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


                ${x()}

            </form>

        </main>
    `,C(),document.getElementById(`formMovimiento`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{let e=t.get(`tipoCilindro`),n=Number(t.get(`cantidad`));await _e({origen:t.get(`origen`),destino:t.get(`destino`),llenos:e===`LLENOS`?n:0,vacios:e===`VACIOS`?n:0,observacion:t.get(`observacion`)}),E(`TRASLADO REGISTRADO`)}catch(e){D(e.message)}})}async function g(){let t=await H();e.innerHTML=`

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
                    ${await le()}
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


        ${O(`clientes`)}
    `,document.getElementById(`btnNuevoCliente`).addEventListener(`click`,v),document.getElementById(`btnPendientesIniciales`).addEventListener(`click`,_),k()}async function _(){let t=await H(),n=await le();e.innerHTML=`

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


        ${O(`clientes`)}
    `;let r=document.querySelectorAll(`.input-pendiente-inicial`),i=document.getElementById(`totalPendientesAsignar`);function a(){let e=0;r.forEach(t=>{let n=Number(t.value)||0;e+=n}),i.textContent=e}r.forEach(e=>{e.addEventListener(`input`,a)}),document.getElementById(`formPendientesIniciales`).addEventListener(`submit`,async e=>{e.preventDefault();let t=[];r.forEach(e=>{t.push({idCliente:e.dataset.id,cantidad:Number(e.value)||0})});let i=t.reduce((e,t)=>e+t.cantidad,0);if(i===0){alert(`Debes asignar al menos un pendiente.`);return}if(i>n){alert(`No puedes asignar ${i}. Solo hay ${n} pendientes iniciales disponibles.`);return}try{await ue(t),alert(`Pendientes iniciales asignados correctamente.`),await g()}catch(e){alert(e.message)}}),document.getElementById(`btnCancelarPendientesIniciales`).addEventListener(`click`,g),k()}function v(){e.innerHTML=`

        ${b(`👤 NUEVO CLIENTE`)}


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
    `,C(),document.getElementById(`formCliente`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target);try{await se({nombre:t.get(`nombre`),telefono:t.get(`telefono`),direccion:t.get(`direccion`),sector:t.get(`sector`),observacion:t.get(`observacion`)}),E(`CLIENTE REGISTRADO`,`clientes`)}catch(e){D(e.message)}})}async function y(){let t=await Se();e.innerHTML=`

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


        ${O(`sync`)}
    `,document.getElementById(`btnSync`).addEventListener(`click`,()=>alert(`La conexión con el PC se implementará después de terminar el motor local.`)),document.getElementById(`btnActualizar`).addEventListener(`click`,()=>alert(`La actualización PC → móvil se implementará después de la sincronización.`)),k()}function b(e){return`

        <header class="app-header">

            <h1>${e}</h1>

            <p>
                Registro de operación
            </p>

        </header>
    `}function x(){return`

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
    `}function S(e){return`

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
    `}function C(){let e=document.getElementById(`btnCancelar`);e&&e.addEventListener(`click`,()=>{s()})}function E(n,r=`inicio`){e.innerHTML=`
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
    `,document.getElementById(`btnContinuar`).addEventListener(`click`,async()=>{if(r===`clientes`){await g();return}t=r,i()})}function D(e){alert(`⚠️ No se puede registrar\n\n${e}`)}function O(e){return`

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
    `}function k(){document.querySelectorAll(`[data-page]`).forEach(e=>{e.addEventListener(`click`,()=>{t=e.dataset.page,i()})})}async function A(){e.innerHTML=`

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


        ${O(`inicio`)}

    `,document.getElementById(`formApertura`).addEventListener(`submit`,async e=>{e.preventDefault();try{await ne({rojoLlenos:Number(document.getElementById(`rojoLlenos`).value),rojoVacios:Number(document.getElementById(`rojoVacios`).value),blancoLlenos:Number(document.getElementById(`blancoLlenos`).value),blancoVacios:Number(document.getElementById(`blancoVacios`).value),clientesPendientes:Number(document.getElementById(`clientesPendientes`).value)}),alert(`Apertura configurada correctamente.`),await a()}catch(e){alert(e.message)}}),document.getElementById(`btnCancelarApertura`)?.addEventListener(`click`,a),k()}function j(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}async function M(e){try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(e);else{let t=document.createElement(`textarea`);t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select();let n=document.execCommand(`copy`);if(t.remove(),!n)throw Error(`No se pudo copiar automáticamente.`)}alert(`Reporte copiado. Ya puedes pegarlo en WhatsApp.`)}catch(e){console.error(e),alert(`No se pudo copiar automáticamente. Selecciona y copia el texto del reporte.`)}}async function I(e){try{navigator.share?await navigator.share({title:`Reporte de la distribuidora`,text:e}):window.open(`https://wa.me/?text=${encodeURIComponent(e)}`,`_blank`)}catch(e){e.name!==`AbortError`&&(console.error(e),alert(`No se pudo abrir la opción para compartir el reporte.`))}}async function L(){let e=j(),t=new Date;t.setDate(t.getDate()-6);let n=[t.getFullYear(),String(t.getMonth()+1).padStart(2,`0`),String(t.getDate()).padStart(2,`0`)].join(`-`),r=document.getElementById(`app`);r.innerHTML=`
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

            ${O(`reportes`)}
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
        `,document.getElementById(`${n}Texto`).textContent=t,document.getElementById(`${n}Compartir`).addEventListener(`click`,()=>I(t)),document.getElementById(`${n}Copiar`).addEventListener(`click`,()=>M(t))}document.getElementById(`btnGenerarDiario`).addEventListener(`click`,async()=>{let e=document.getElementById(`btnGenerarDiario`),t=document.getElementById(`fechaReporte`).value;if(!t){alert(`Selecciona la fecha del reporte.`);return}e.disabled=!0,e.textContent=`GENERANDO...`;try{let[e,n,r,a,o,s]=await Promise.all([Ee(t),Te(),T(`clientes`),Q(t,t),Ae(t),je(t,t)]),c=r.map(e=>({nombre:e.nombre||`Cliente sin nombre`,cantidad:Number(e.pendientes_actuales)||0})).filter(e=>e.cantidad>0).sort((e,t)=>t.cantidad-e.cantidad);i(`resultadoDiario`,`📊 REPORTE DIARIO
Distribuidora de cilindros
Fecha: ${t.split(`-`).reverse().join(`/`)}

*VENTAS DEL DÍA: ${e}*

INVENTARIO ACTUAL
Camión Rojo: ${n.rojoLlenos} Llenos, ${n.rojoVacios} Vacíos
Camión Blanco: ${n.blancoLlenos} Llenos, ${n.blancoVacios} Vacíos 

*Total: ${n.rojoLlenos+n.blancoLlenos} Llenos, ${n.rojoVacios+n.blancoVacios} Vacíos*

VENTAS DEL DÍA
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
TOTAL GENERAL DE CILINDROS: ${n.total}

Sin asignar (Nuevos cilindros)
Llenos: ${n.sinAsignarLlenos}
Vacíos: ${n.sinAsignarVacios}`,`diario`)}catch(e){console.error(e),alert(`No se pudo generar el reporte diario. Revisa la consola para ver el error.`)}finally{e.disabled=!1,e.textContent=`GENERAR REPORTE DIARIO`}}),document.getElementById(`btnGenerarRango`).addEventListener(`click`,async()=>{let e=document.getElementById(`btnGenerarRango`),t=document.getElementById(`fechaInicio`).value,n=document.getElementById(`fechaFin`).value;if(!t||!n){alert(`Selecciona las dos fechas.`);return}if(t>n){alert(`La fecha inicial no puede ser mayor que la final.`);return}e.disabled=!0,e.textContent=`GENERANDO...`;try{let[e,r,a]=await Promise.all([De(t,n),Q(t,n),je(t,n)]);i(`resultadoRango`,`📊 REPORTE DE VENTAS POR RANGO
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
`):`No hay ventas registradas en este período.`}`,`rango`)}catch(e){console.error(e),alert(`No se pudo generar el reporte por rango. Revisa la consola para ver el error.`)}finally{e.disabled=!1,e.textContent=`GENERAR REPORTE POR RANGO`}}),k()}document.getElementById(`btnExportarBD`)?.addEventListener(`click`,async()=>{try{let e=await ee();alert(`✅ Respaldo creado correctamente.\n\n${e}`)}catch(e){console.error(e),alert(`❌ No se pudo exportar la base de datos.\n\n${e.message}`)}});async function z(){let n=await F(),r=n.sinAsignar||{llenos:0,vacios:0};e.innerHTML=`

        <section class="card">

            <h2>Inventario</h2>

            <p>
                Total de la empresa:
                <strong>${R(n)}</strong>
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
    `,document.getElementById(`formAgregarSinAsignar`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await re({llenos:Number(document.getElementById(`agregarLlenos`).value),vacios:Number(document.getElementById(`agregarVacios`).value),observacion:document.getElementById(`agregarObservacion`).value.trim()}),alert(`Cilindros añadidos correctamente.`),await z()}catch(e){alert(e.message)}}),document.getElementById(`formRetirarSinAsignar`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await ie({llenos:Number(document.getElementById(`retirarLlenos`).value),vacios:Number(document.getElementById(`retirarVacios`).value),observacion:document.getElementById(`retirarObservacion`).value.trim()}),alert(`Cilindros retirados correctamente.`),await z()}catch(e){alert(e.message)}}),document.getElementById(`formAsignarCamion`)?.addEventListener(`submit`,async e=>{e.preventDefault();try{await ae({camion:document.getElementById(`asignarCamion`).value,llenos:Number(document.getElementById(`asignarLlenos`).value),vacios:Number(document.getElementById(`asignarVacios`).value)}),alert(`Cilindros asignados correctamente.`),await z()}catch(e){alert(e.message)}}),document.getElementById(`btnVolverInicioInventario`)?.addEventListener(`click`,()=>{t=`inicio`,i()})}}))();