/**
 * 🔔 SERVICE WORKER SIMPLIFICADO PARA PWA OFFLINE
 * Versión corregida para funcionar con ngrok
 */

// Nombre del caché
const CACHE_NAME = 'creditoss-pwa-v3';

// Archivos a cachear (rutas relativas desde la raíz del proyecto)
const FILES_TO_CACHE = [
  './',
  './index.html',
  './css/bootstrap.min.css',
  './css/bootstrap-icons.css',
  './css/templatemo-topic-listing.css',
  './js/jquery.min.js',
  './js/bootstrap.min.js',
  './js/custom.js'
];

// Instalar: cachear archivos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Error al cachear:', err))
  );
});

// Activar: limpiar cachés viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
              console.log('[SW] Eliminando caché viejo:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: servir desde caché, actualizar en segundo plano
self.addEventListener('fetch', (event) => {
  // Ignorar requests de Firebase y APIs externas
  if (event.request.url.includes('firebase') ||
    event.request.url.includes('gstatic') ||
    event.request.url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          console.log('[SW] Sirviendo desde caché:', event.request.url);
          return cachedResponse;
        }

        // Si no, intentar fetch
        return fetch(event.request)
          .then(response => {
            // Cachear la respuesta para futuro uso
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Si todo falla, devolver index.html desde caché
            return caches.match('./index.html');
          });
      })
  );
});

console.log('[SW] Service Worker cargado');
