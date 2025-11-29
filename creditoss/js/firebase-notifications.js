/**
 * 🔔 FIREBASE CLOUD MESSAGING - PUSH NOTIFICATIONS
 * 
 * Este archivo maneja todas las notificaciones push del proyecto.
 * Incluye solicitud de permisos, suscripción a notificaciones y gestión de mensajes.
 */

// ============================================
// 🔐 PASO 1: Solicitar Permisos de Notificaciones
// ============================================

/**
 * Solicitar permiso al usuario para mostrar notificaciones
 */
window.solicitarPermisoNotificaciones = async function () {
    try {
        console.log('🔔 Solicitando permiso para notificaciones...');

        // Verificar si el navegador soporta notificaciones
        if (!('Notification' in window)) {
            console.error('❌ Este navegador no soporta notificaciones');
            return { success: false, error: 'No soportado' };
        }

        // Si ya tiene permiso
        if (Notification.permission === 'granted') {
            console.log('✅ Permiso ya concedido anteriormente');
            await suscribirseANotificaciones();
            return { success: true, permission: 'granted' };
        }

        // Si fue denegado
        if (Notification.permission === 'denied') {
            console.warn('⚠️ Permiso denegado previamente');
            return { success: false, permission: 'denied' };
        }

        // Solicitar permiso
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('✅ Permiso concedido!');
            await suscribirseANotificaciones();
            return { success: true, permission: 'granted' };
        } else {
            console.warn('⚠️ Permiso denegado por el usuario');
            return { success: false, permission: permission };
        }

    } catch (error) {
        console.error('❌ Error al solicitar permiso:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Suscribirse a notificaciones FCM
 */
async function suscribirseANotificaciones() {
    try {
        console.log('📝 Suscribiendo a Firebase Cloud Messaging...');

        // Obtener registro de Service Worker existente
        let swRegistration = undefined;
        if ('serviceWorker' in navigator) {
            swRegistration = await navigator.serviceWorker.ready;
        }

        // Obtener token FCM usando el SW correcto
        const currentToken = await messaging.getToken({
            vapidKey: window.VAPID_KEY,
            serviceWorkerRegistration: swRegistration
        });

        if (currentToken) {
            console.log('✅ Token FCM obtenido:', currentToken);

            // Guardar token en localStorage
            localStorage.setItem('fcm_token', currentToken);

            // Opcional: Guardar el token en Firestore para enviar notificaciones desde el servidor
            await guardarTokenEnFirestore(currentToken);

            return currentToken;
        } else {
            console.warn('⚠️ No se pudo obtener el token FCM');
            return null;
        }

    } catch (error) {
        console.error('❌ Error al suscribirse a notificaciones:', error);
        return null;
    }
}

/**
 * Guardar token FCM en Firestore
 */
async function guardarTokenEnFirestore(token) {
    try {
        await db.collection('fcm_tokens').doc(token).set({
            token: token,
            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
            activo: true
        });
        console.log('✅ Token guardado en Firestore');
    } catch (error) {
        console.error('❌ Error al guardar token:', error);
    }
}

// ============================================
// 📨 PASO 2: Manejar Mensajes Entrantes
// ============================================

/**
 * Escuchar mensajes cuando la app está en primer plano
 */
messaging.onMessage((payload) => {
    console.log('📨 Mensaje recibido en primer plano:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || 'icons/icon-192x192.png',
        badge: 'icons/icon-192x192.png',
        tag: payload.data?.tag || 'default',
        data: payload.data || {},
        requireInteraction: true,
        vibrate: [200, 100, 200]
    };

    // Mostrar notificación local
    if (Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
    }

    // También agregar a historial de notificaciones
    agregarAHistorial(notificationTitle, notificationOptions);
});

// ============================================
// 📢 PASO 3: Enviar Notificaciones Locales
// ============================================

/**
 * Enviar una notificación local (desde la propia app)
 * @param {object} options - {titulo, cuerpo, icono, tag, data}
 */
window.enviarNotificacion = async function (options) {
    try {
        // Verificar permisos
        if (Notification.permission !== 'granted') {
            console.warn('⚠️ No hay permiso para mostrar notificaciones');
            return { success: false, error: 'Sin permiso' };
        }

        console.log('📢 Enviando notificación:', options.titulo);

        // SIEMPRE intentar usar Service Worker primero (necesario para Chrome PC)
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;

                const notificationOptions = {
                    body: options.cuerpo || '',
                    icon: options.icono || 'icons/icon-192x192.png',
                    badge: 'icons/icon-192x192.png',
                    tag: options.tag || 'default',
                    data: options.data || {},
                    requireInteraction: true,
                    vibrate: [200, 100, 200],
                    actions: [
                        { action: 'abrir', title: '👁️ Ver' },
                        { action: 'cerrar', title: '✖️ Cerrar' }
                    ]
                };

                await registration.showNotification(options.titulo, notificationOptions);
                console.log('✅ Notificación mostrada vía Service Worker');

                // Agregar a historial
                agregarAHistorial(options.titulo, notificationOptions);
                return { success: true };

            } catch (swError) {
                console.error('❌ Error con Service Worker:', swError);
                // Fallback sin acciones (para compatibilidad)
                const simpleOptions = {
                    body: options.cuerpo || '',
                    icon: options.icono || 'icons/icon-192x192.png',
                    badge: 'icons/icon-192x192.png',
                    tag: options.tag || 'default',
                    data: options.data || {},
                    vibrate: [200, 100, 200]
                    // NO incluir 'actions' aquí
                };
                new Notification(options.titulo, simpleOptions);
                console.log('✅ Notificación mostrada vía Notification API (sin acciones)');
                agregarAHistorial(options.titulo, simpleOptions);
                return { success: true };
            }
        } else {
            // Navegador sin Service Worker (muy raro)
            const simpleOptions = {
                body: options.cuerpo || '',
                icon: options.icono || 'icons/icon-192x192.png',
                tag: options.tag || 'default'
            };
            new Notification(options.titulo, simpleOptions);
            console.log('✅ Notificación simple mostrada');
            agregarAHistorial(options.titulo, simpleOptions);
            return { success: true };
        }

    } catch (error) {
        console.error('❌ Error al enviar notificación:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// 📜 HISTORIAL DE NOTIFICACIONES
// ============================================

/**
 * Agregar notificación al historial
 */
function agregarAHistorial(titulo, options) {
    try {
        let historial = JSON.parse(localStorage.getItem('notificaciones_historial') || '[]');

        historial.unshift({
            titulo: titulo,
            cuerpo: options.body,
            fecha: new Date().toISOString(),
            leida: false
        });

        // Mantener solo las últimas 50 notificaciones
        if (historial.length > 50) {
            historial = historial.slice(0, 50);
        }

        localStorage.setItem('notificaciones_historial', JSON.stringify(historial));

        // Actualizar contador de notificaciones no leídas
        actualizarContadorNotificaciones();

    } catch (error) {
        console.error('❌ Error al agregar al historial:', error);
    }
}

/**
 * Obtener historial de notificaciones
 */
window.obtenerHistorialNotificaciones = function () {
    try {
        return JSON.parse(localStorage.getItem('notificaciones_historial') || '[]');
    } catch {
        return [];
    }
};

/**
 * Marcar todas las notificaciones como leídas
 */
window.marcarNotificacionesLeidas = function () {
    try {
        let historial = JSON.parse(localStorage.getItem('notificaciones_historial') || '[]');
        historial = historial.map(n => ({ ...n, leida: true }));
        localStorage.setItem('notificaciones_historial', JSON.stringify(historial));
        actualizarContadorNotificaciones();
    } catch (error) {
        console.error('❌ Error al marcar como leídas:', error);
    }
};

/**
 * Actualizar contador de notificaciones no leídas en la UI
 */
function actualizarContadorNotificaciones() {
    try {
        const historial = window.obtenerHistorialNotificaciones();
        const noLeidas = historial.filter(n => !n.leida).length;

        const badge = document.getElementById('notifCount');
        if (badge) {
            if (noLeidas > 0) {
                badge.textContent = noLeidas > 99 ? '99+' : noLeidas;
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        }
    } catch (error) {
        console.error('❌ Error al actualizar contador:', error);
    }
}

// ============================================
// 🎯 ESTADO DE NOTIFICACIONES
// ============================================

/**
 * Obtener estado actual de las notificaciones
 */
window.estadoNotificaciones = function () {
    const estado = {
        soportado: 'Notification' in window,
        permiso: Notification.permission,
        token: localStorage.getItem('fcm_token'),
        noLeidas: window.obtenerHistorialNotificaciones().filter(n => !n.leida).length,
        total: window.obtenerHistorialNotificaciones().length
    };

    console.log('🔔 Estado de Notificaciones:', estado);
    return estado;
};

/**
 * Probar sistema de notificaciones
 */
window.probarNotificacion = function () {
    window.enviarNotificacion({
        titulo: '🧪 Notificación de Prueba',
        cuerpo: 'Esta es una notificación de prueba del sistema Créditos Express',
        icono: 'icons/icon-192x192.png',
        tag: 'test',
        data: { tipo: 'test' }
    });
};

/**
 * 🔍 Diagnóstico completo del sistema de notificaciones
 */
window.diagnosticoNotificaciones = async function () {
    const diagnostico = {
        navegadorSoporta: 'Notification' in window,
        permiso: Notification.permission,
        serviceWorkerSoportado: 'serviceWorker' in navigator,
        serviceWorkerActivo: false,
        tokenFCM: localStorage.getItem('fcm_token'),
        historialTotal: window.obtenerHistorialNotificaciones().length,
        historialNoLeidas: window.obtenerHistorialNotificaciones().filter(n => !n.leida).length
    };

    // Verificar Service Worker
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        diagnostico.serviceWorkerActivo = !!registration;
        diagnostico.serviceWorkerEstado = registration?.active?.state || 'No registrado';
    }

    // Crear mensaje de diagnóstico
    let mensaje = '🔍 DIAGNÓSTICO DE NOTIFICACIONES\n\n';
    mensaje += `✅ Navegador soporta notificaciones: ${diagnostico.navegadorSoporta ? 'Sí' : 'No'}\n`;
    mensaje += `🔐 Permiso: ${diagnostico.permiso}\n`;
    mensaje += `⚙️ Service Worker soportado: ${diagnostico.serviceWorkerSoportado ? 'Sí' : 'No'}\n`;
    mensaje += `🔧 Service Worker activo: ${diagnostico.serviceWorkerActivo ? 'Sí' : 'No'}\n`;
    mensaje += `🔑 Token FCM: ${diagnostico.tokenFCM ? 'Generado ✓' : 'No generado ✗'}\n`;
    mensaje += `📜 Notificaciones en historial: ${diagnostico.historialTotal}\n`;
    mensaje += `🔔 Notificaciones no leídas: ${diagnostico.historialNoLeidas}\n\n`;

    // Recomendaciones
    if (diagnostico.permiso !== 'granted') {
        mensaje += '⚠️ PROBLEMA: Debes activar los permisos de notificación.\n';
        mensaje += '   Solución: Haz clic en "Activar Notificaciones Push"\n\n';
    }
    if (!diagnostico.serviceWorkerActivo) {
        mensaje += '⚠️ PROBLEMA: Service Worker no está registrado.\n';
        mensaje += '   Solución: Recarga la página (Ctrl+F5)\n\n';
    }
    if (!diagnostico.tokenFCM && diagnostico.permiso === 'granted') {
        mensaje += '⚠️ PROBLEMA: Token FCM no generado.\n';
        mensaje += '   Solución: Haz clic en "Activar Notificaciones Push" de nuevo\n\n';
    }
    if (diagnostico.permiso === 'granted' && diagnostico.serviceWorkerActivo && diagnostico.tokenFCM) {
        mensaje += '✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE\n';
        mensaje += '   Las notificaciones deberían funcionar sin problemas.\n';
    }

    alert(mensaje);
    console.log('📊 Diagnóstico completo:', diagnostico);
    return diagnostico;
};

// ============================================
// 🚀 INICIALIZACIÓN AUTOMÁTICA
// ============================================

// Actualizar contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorNotificaciones();
});

console.log('✅ Módulo firebase-notifications.js cargado correctamente');
