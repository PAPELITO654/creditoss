/**
 * 🔔 FIREBASE MESSAGING SERVICE WORKER
 * 
 * Este archivo se ejecuta en segundo plano y es ESENCIAL para:
 * - Recibir notificaciones cuando el navegador está cerrado
 * - Manejar notificaciones en background
 * - Hacer que la PWA sea verdaderamente funcional
 * 
 * IMPORTANTE: Este archivo DEBE estar en la raíz del proyecto.
 */

// Importar Firebase scripts necesarios para el service worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// ============================================
// 🔥 CONFIGURACIÓN DE FIREBASE
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyASAYKw1zzg82qhbW9aP3FOO5P1XsXC3sk",
    authDomain: "creditos-d0fee.firebaseapp.com",
    projectId: "creditos-d0fee",
    storageBucket: "creditos-d0fee.firebasestorage.app",
    messagingSenderId: "121632110240",
    appId: "1:121632110240:web:2ce1408dc14797026afbc5",
    measurementId: "G-DVJNRER492"
};

// Inicializar Firebase en el service worker
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

console.log('🔥 Firebase Messaging Service Worker inicializado');

// ============================================
// 📨 MANEJO DE NOTIFICACIONES EN BACKGROUND
// ============================================

/**
 * Este evento se dispara cuando llega una notificación
 * mientras la app está en segundo plano o cerrada
 */
messaging.onBackgroundMessage((payload) => {
    console.log('📨 Notificación recibida en background:', payload);

    const notificationTitle = payload.notification?.title || '🔔 Créditos Express';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva notificación',
        icon: payload.notification?.icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: payload.data?.tag || 'creditos-express',
        data: payload.data || {},
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'abrir', title: '👁️ Ver', icon: '/icons/icon-192x192.png' },
            { action: 'cerrar', title: '✖️ Cerrar' }
        ]
    };

    // Mostrar la notificación
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================
// 🖱️ MANEJO DE CLICKS EN NOTIFICACIONES
// ============================================

/**
 * Cuando el usuario hace click en una notificación
 */
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Click en notificación:', event.notification.tag);

    event.notification.close(); // Cerrar la notificación

    // Manejar las acciones
    if (event.action === 'cerrar') {
        return; // Solo cerrar
    }

    // Acción 'abrir' o click en el cuerpo de la notificación
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        // Buscar si ya hay una ventana/pestaña abierta con nuestra app
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ============================================
// 📝 LOG DE ESTADO
// ============================================

// ============================================
// 📦 CACHING PWA (MODO OFFLINE)
// ============================================

const CACHE_NAME = 'creditos-express-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/bootstrap.min.css',
    './css/bootstrap-icons.css',
    './css/templatemo-topic-listing.css',
    './js/jquery.min.js',
    './js/bootstrap.bundle.min.js',
    './js/firebase-config.js',
    './js/firebase-db.js',
    './js/firebase-notifications.js',
    './js/dashboard-logic.js',
    './images/faq_graphic.jpg',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// 1. Instalación: Cachear recursos estáticos
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Instalando y cacheando assets...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Activación: Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
    console.log('📦 Service Worker: Activado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Borrando caché antiguo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch: Interceptar peticiones (Estrategia: Network First con Fallback Robusto)
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones que no sean GET
    if (event.request.method !== 'GET') return;

    // 1. Manejo especial para la navegación (HTML principal)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Si la respuesta es válida (200-299), devolverla
                    if (response.ok) {
                        return response;
                    }
                    // Si es error (ej. ngrok error page 502/503), forzar error para ir al catch
                    throw new Error('Respuesta de red no válida (' + response.status + ')');
                })
                .catch(() => {
                    // Si falla la red o la respuesta no es ok, devolver index.html del caché
                    console.log('⚠️ Modo Offline: Sirviendo index.html desde caché');
                    return caches.match('./index.html')
                        .then((response) => {
                            // Intentar variants si falla la primera
                            return response || caches.match('./') || caches.match('index.html');
                        });
                })
        );
        return;
    }

    // 2. Para otros recursos (CSS, JS, Imágenes): Cache First
    // Usamos ignoreSearch para evitar problemas con query params
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
            .then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
    );
});

console.log('✅ PWA Caching activado (Modo Robusto)');
