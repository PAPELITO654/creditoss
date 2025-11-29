/**
 * 🌐 DETECTOR DE CONEXIÓN FIREBASE
 * Monitorea el estado de conexión y habilita/deshabilita la UI
 */

// Variable global para estado de conexión
window.isOnline = true;
window.isFirebaseConnected = false;

/**
 * Inicializar detector de conexión
 */
window.inicializarDetectorConexion = function () {
    // 1. Detectar conexión a internet (navegador)
    window.addEventListener('online', () => {
        console.log('🌐 Conexión a internet restaurada');
        window.isOnline = true;
        actualizarEstadoUI();
    });

    window.addEventListener('offline', () => {
        console.log('📡 Sin conexión a internet');
        window.isOnline = false;
        window.isFirebaseConnected = false;
        actualizarEstadoUI();
    });

    // 2. Detectar conexión a Firebase
    if (window.db) {
        const connectedRef = firebase.database().ref('.info/connected');
        connectedRef.on('value', (snapshot) => {
            if (snapshot.val() === true) {
                console.log('✅ Conectado a Firebase');
                window.isFirebaseConnected = true;
            } else {
                console.log('❌ Desconectado de Firebase');
                window.isFirebaseConnected = false;
            }
            actualizarEstadoUI();
        });
    }

    // Estado inicial
    window.isOnline = navigator.onLine;
    actualizarEstadoUI();
};

/**
 * Actualizar UI según estado de conexión
 */
function actualizarEstadoUI() {
    const estaConectado = window.isOnline && window.isFirebaseConnected;

    // Actualizar banner de estado
    mostrarBannerConexion(estaConectado);

    // Habilitar/Deshabilitar formularios
    toggleFormularios(estaConectado);

    // Habilitar/Deshabilitar botones de acción
    toggleBotonesAccion(estaConectado);
}

/**
 * Mostrar banner de estado de conexión
 */
function mostrarBannerConexion(conectado) {
    let banner = document.getElementById('connection-banner');

    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'connection-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        document.body.prepend(banner);
    }

    if (!conectado) {
        banner.style.backgroundColor = '#dc3545';
        banner.style.color = 'white';
        banner.innerHTML = '📡 MODO OFFLINE - Solo lectura. Las acciones de escritura están deshabilitadas.';
        banner.style.display = 'block';
    } else {
        banner.style.backgroundColor = '#28a745';
        banner.style.color = 'white';
        banner.innerHTML = '✅ CONECTADO - Todas las funciones disponibles';
        banner.style.display = 'block';

        // Ocultar banner de éxito después de 3 segundos
        setTimeout(() => {
            banner.style.display = 'none';
        }, 3000);
    }
}

/**
 * Habilitar/Deshabilitar formularios
 */
function toggleFormularios(habilitar) {
    const formularios = [
        document.getElementById('form-nuevo-cliente'),
        document.getElementById('form-nueva-cuenta')
    ];

    formularios.forEach(form => {
        if (form) {
            const inputs = form.querySelectorAll('input, select, button');
            inputs.forEach(input => {
                input.disabled = !habilitar;
            });

            // Agregar mensaje visual
            let mensaje = form.querySelector('.offline-message');
            if (!habilitar) {
                if (!mensaje) {
                    mensaje = document.createElement('div');
                    mensaje.className = 'offline-message alert alert-warning mt-2';
                    mensaje.innerHTML = '⚠️ Formulario deshabilitado en modo offline';
                    form.appendChild(mensaje);
                }
            } else {
                if (mensaje) {
                    mensaje.remove();
                }
            }
        }
    });
}

/**
 * Habilitar/Deshabilitar botones de acción (eliminar, editar)
 */
function toggleBotonesAccion(habilitar) {
    const botones = document.querySelectorAll('.btn-eliminar-cliente, .btn-eliminar-cuenta');
    botones.forEach(btn => {
        btn.disabled = !habilitar;
        if (!habilitar) {
            btn.title = 'Deshabilitado en modo offline';
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.title = '';
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

console.log('✅ Módulo de detección de conexión cargado');
