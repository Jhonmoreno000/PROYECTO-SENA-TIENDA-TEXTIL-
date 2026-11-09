/**
 * sw.js — Service Worker de D&D Textil (PWA)
 * Estandares: Progressive Web App, Cache-First para estaticos y Network-First para API.
 */

const NOMBRE_CACHE = 'ddtextil-v4';
const RECURSOS_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/hero-telas-premium.webp'
];

self.addEventListener('install', (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => {
      return cache.addAll(RECURSOS_PRECACHE);
    })
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nombresCache) => {
      return Promise.all(
        nombresCache
          .filter((nombre) => nombre !== NOMBRE_CACHE)
          .map((nombre) => caches.delete(nombre))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const solicitud = evento.request;
  const url = new URL(solicitud.url);

  // Solicitudes API se procesan con Network-First sin bloquear
  if (url.pathname.startsWith('/api/')) {
    evento.respondWith(
      fetch(solicitud).catch(() => caches.match(solicitud))
    );
    return;
  }

  // Solicitudes de navegacion (HTML de la aplicacion): Network-First para ver siempre los cambios frescos
  if (solicitud.mode === 'navigate' || solicitud.destination === 'document') {
    evento.respondWith(
      fetch(solicitud)
        .then((respuestaRed) => {
          if (respuestaRed && respuestaRed.status === 200) {
            const copia = respuestaRed.clone();
            caches.open(NOMBRE_CACHE).then((cache) => cache.put(solicitud, copia));
          }
          return respuestaRed;
        })
        .catch(() => caches.match(solicitud).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Activos estaticos e imagenes: Cache-First con fallback de red
  evento.respondWith(
    caches.match(solicitud).then((respuestaEnCache) => {
      if (respuestaEnCache) {
        return respuestaEnCache;
      }
      return fetch(solicitud).then((respuestaRed) => {
        if (!respuestaRed || respuestaRed.status !== 200 || respuestaRed.type !== 'basic') {
          return respuestaRed;
        }
        const respuestaParaCache = respuestaRed.clone();
        caches.open(NOMBRE_CACHE).then((cache) => {
          cache.put(solicitud, respuestaParaCache);
        });
        return respuestaRed;
      });
    })
  );
});
