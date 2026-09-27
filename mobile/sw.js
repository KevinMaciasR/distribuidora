const CACHE_NAME = 'distribuidora-v3';

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/app.css',
    '/js/app.js',
    '/js/db.js',
    '/js/inventario.js',
    '/js/movimientos.js',
    '/js/clientes.js',
    '/js/sincronizacion.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});