/**
 * 🎮 DASHBOARD LOGIC
 * Lógica para manejar el dashboard de Firebase en el frontend
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Referencias DOM
    const statusFirebase = document.getElementById('status-firebase');
    const statusFirestore = document.getElementById('status-firestore');
    const statusMessaging = document.getElementById('status-messaging');
    const btnEnableNotif = document.getElementById('btn-enable-notifications');

    // Formularios
    const formCliente = document.getElementById('form-nuevo-cliente');
    const formCuenta = document.getElementById('form-nueva-cuenta');
    const selectCliente = document.getElementById('cuenta-cliente-id');

    // Listas
    const listaClientes = document.getElementById('lista-clientes');
    const listaCuentas = document.getElementById('lista-cuentas');

    // Contadores
    const countClientes = document.getElementById('count-clientes');
    const countCuentas = document.getElementById('count-cuentas');

    // ==========================================
    // 🔧 AUTO-REGISTRO DEL SERVICE WORKER
    // ==========================================
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('✅ Service Worker registrado:', registration);
        } catch (error) {
            console.error('❌ Error al registrar Service Worker:', error);
        }
    }

    // ==========================================
    // 🔔 AUTO-ACTIVAR NOTIFICACIONES
    // ==========================================
    setTimeout(async () => {
        if (Notification.permission === 'default') {
            console.log('🔔 Solicitando permisos de notificación automáticamente...');
            const result = await window.solicitarPermisoNotificaciones();
            if (result.success) {
                console.log('✅ Notificaciones activadas automáticamente');
                statusMessaging.textContent = 'Notificaciones: Activas';
                statusMessaging.className = 'badge bg-success';
                btnEnableNotif.style.display = 'none';
            }
        } else if (Notification.permission === 'granted') {
            console.log('🔔 Permisos ya concedidos, suscribiendo...');
            await window.solicitarPermisoNotificaciones();
        }
    }, 2000);

    // ==========================================
    // 1. VERIFICAR ESTADO INICIAL
    // ==========================================
    setTimeout(async () => {
        if (window.firebaseApp) {
            statusFirebase.textContent = 'Firebase: Conectado';
            statusFirebase.className = 'badge bg-success';
        } else {
            statusFirebase.textContent = 'Firebase: Error';
            statusFirebase.className = 'badge bg-danger';
        }

        if (window.db) {
            statusFirestore.textContent = 'Firestore: Activo';
            statusFirestore.className = 'badge bg-success';
            cargarDatosIniciales();
        }

        // 🔔 AUTO-VERIFICAR PERMISOS DE NOTIFICACIONES
        if (Notification.permission === 'granted') {
            statusMessaging.textContent = 'Notificaciones: Activas';
            statusMessaging.className = 'badge bg-success';
            btnEnableNotif.style.display = 'none';

            // Auto-suscribirse si ya tiene permiso
            if (window.solicitarPermisoNotificaciones) {
                await window.solicitarPermisoNotificaciones();
            }
        } else if (Notification.permission === 'denied') {
            statusMessaging.textContent = 'Notificaciones: Bloqueadas';
            statusMessaging.className = 'badge bg-danger';
            btnEnableNotif.textContent = '🔒 Notificaciones Bloqueadas (revisar configuración del navegador)';
            btnEnableNotif.disabled = true;
        } else {
            statusMessaging.textContent = 'Notificaciones: Solicitando...';
            statusMessaging.className = 'badge bg-info';
        }
    }, 1000);

    // ==========================================
    // 2. MANEJAR NOTIFICACIONES
    // ==========================================
    btnEnableNotif.addEventListener('click', async () => {
        const result = await window.solicitarPermisoNotificaciones();
        if (result.success) {
            statusMessaging.textContent = 'Notificaciones: Activas';
            statusMessaging.className = 'badge bg-success';
            btnEnableNotif.style.display = 'none';
            alert('✅ Notificaciones activadas correctamente');
        } else {
            alert('❌ No se pudieron activar las notificaciones: ' + (result.error || result.permission));
        }
    });

    // ==========================================
    // 3. CARGAR DATOS EN TIEMPO REAL
    // ==========================================
    function cargarDatosIniciales() {
        // Escuchar Clientes
        window.obtenerClientesEnTiempoReal((clientes) => {
            renderizarClientes(clientes);
            actualizarSelectClientes(clientes);
            countClientes.textContent = clientes.length;
        });

        // Escuchar Todas las Cuentas (para el contador global)
        window.obtenerTodasLasCuentas((cuentas) => {
            countCuentas.textContent = cuentas.length;
        });
    }

    // ==========================================
    // 4. RENDERIZADO DE UI
    // ==========================================
    function renderizarClientes(clientes) {
        listaClientes.innerHTML = '';

        if (clientes.length === 0) {
            listaClientes.innerHTML = '<div class="text-center p-3 text-muted">No hay clientes registrados</div>';
            return;
        }

        clientes.forEach(cliente => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <div>
                    <h6 class="mb-0">${cliente.nombreCliente}</h6>
                    <small class="text-muted">ID: ${cliente.numero}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-1 btn-ver-cuentas" data-id="${cliente.id}" data-nombre="${cliente.nombreCliente}">
                        <i class="bi-wallet2"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-eliminar-cliente" data-id="${cliente.id}">
                        <i class="bi-trash"></i>
                    </button>
                </div>
            `;
            listaClientes.appendChild(item);
        });

        // Listeners para botones dinámicos
        document.querySelectorAll('.btn-ver-cuentas').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                cargarCuentasDeCliente(id, nombre);
                // Seleccionar en el dropdown también
                selectCliente.value = id;
            });
        });

        document.querySelectorAll('.btn-eliminar-cliente').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('¿Estás seguro de eliminar este cliente?')) {
                    await window.eliminarCliente(btn.dataset.id);
                }
            });
        });
    }

    function actualizarSelectClientes(clientes) {
        const valorActual = selectCliente.value;
        selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nombreCliente} (#${cliente.numero})`;
            selectCliente.appendChild(option);
        });
        selectCliente.value = valorActual;
    }

    function cargarCuentasDeCliente(clienteId, nombreCliente) {
        listaCuentas.innerHTML = `<div class="text-center p-3"><div class="spinner-border spinner-border-sm"></div> Cargando cuentas de ${nombreCliente}...</div>`;

        window.obtenerCuentasEnTiempoReal(clienteId, (cuentas) => {
            renderizarCuentas(cuentas, nombreCliente);
        });
    }

    function renderizarCuentas(cuentas, nombreCliente) {
        listaCuentas.innerHTML = '';

        if (cuentas.length === 0) {
            listaCuentas.innerHTML = `<div class="text-center p-3 text-muted">No hay cuentas para ${nombreCliente}</div>`;
            return;
        }

        // Header
        const header = document.createElement('div');
        header.className = 'alert alert-info py-2 mb-2';
        header.innerHTML = `<small>Mostrando cuentas de: <strong>${nombreCliente}</strong></small>`;
        listaCuentas.appendChild(header);

        cuentas.forEach(cuenta => {
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            const fecha = cuenta.fechaHora ? new Date(cuenta.fechaHora.seconds * 1000).toLocaleDateString() : 'Reciente';

            item.innerHTML = `
                <div>
                    <h6 class="mb-0 text-success">$${cuenta.monto}</h6>
                    <small class="text-muted">${cuenta.tipo || 'Crédito'} • ${fecha}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger btn-eliminar-cuenta" data-id="${cuenta.id}" data-cliente="${cuenta.clienteId}">
                    <i class="bi-trash"></i>
                </button>
            `;
            listaCuentas.appendChild(item);
        });

        document.querySelectorAll('.btn-eliminar-cuenta').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Eliminar esta cuenta?')) {
                    await window.eliminarCuenta(btn.dataset.cliente, btn.dataset.id);
                }
            });
        });
    }

    // ==========================================
    // 5. MANEJO DE FORMULARIOS
    // ==========================================
    formCliente.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formCliente.querySelector('button');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Guardando...';

        const nombre = document.getElementById('cliente-nombre').value;
        const numero = document.getElementById('cliente-numero').value;

        const result = await window.crearCliente({ nombreCliente: nombre, numero: numero });

        if (result.success) {
            formCliente.reset();
            // Notificación visual simple
            const badge = document.createElement('span');
            badge.className = 'badge bg-success ms-2';
            badge.textContent = '¡Guardado!';
            btn.parentNode.appendChild(badge);
            setTimeout(() => badge.remove(), 2000);
        } else {
            alert('Error: ' + result.error);
        }

        btn.disabled = false;
        btn.innerHTML = originalText;
    });

    formCuenta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clienteId = selectCliente.value;
        if (!clienteId) {
            alert('Por favor seleccione un cliente primero');
            return;
        }

        const btn = formCuenta.querySelector('button');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Creando...';

        const monto = document.getElementById('cuenta-monto').value;
        const tipo = document.getElementById('cuenta-tipo').value;

        const result = await window.crearCuenta(clienteId, { monto: monto, tipo: tipo });

        if (result.success) {
            formCuenta.reset();
            selectCliente.value = clienteId; // Mantener seleccionado
            // Recargar vista de cuentas si es el mismo cliente
            const nombre = selectCliente.options[selectCliente.selectedIndex].text.split(' (')[0];
            cargarCuentasDeCliente(clienteId, nombre);
        } else {
            alert('Error: ' + result.error);
        }

        btn.disabled = false;
        btn.innerHTML = originalText;
    });

    // Al cambiar el select de cliente, cargar sus cuentas
    selectCliente.addEventListener('change', () => {
        const clienteId = selectCliente.value;
        if (clienteId) {
            const nombre = selectCliente.options[selectCliente.selectedIndex].text.split(' (')[0];
            cargarCuentasDeCliente(clienteId, nombre);
        } else {
            listaCuentas.innerHTML = '<div class="text-center p-3 text-muted">Selecciona un cliente para ver sus cuentas</div>';
        }
    });
    // ==========================================
    // 6. MANEJO DE ESTADO ONLINE/OFFLINE (PWA)
    // ==========================================
    const offlineBanner = document.createElement('div');
    offlineBanner.className = 'alert alert-warning text-center sticky-top shadow-sm';
    offlineBanner.style.display = 'none';
    offlineBanner.style.zIndex = '1050';
    offlineBanner.innerHTML = '<strong>⚠️ MODO OFFLINE:</strong> Estás sin conexión. Puedes ver los datos pero no realizar cambios.';
    document.body.prepend(offlineBanner);

    function actualizarEstadoConexion() {
        const isOnline = navigator.onLine;
        const btns = document.querySelectorAll('button[type="submit"], .btn-eliminar-cliente, .btn-eliminar-cuenta');

        if (isOnline) {
            offlineBanner.style.display = 'none';
            btns.forEach(btn => btn.disabled = false);
            statusFirebase.textContent = window.firebaseApp ? 'Firebase: Conectado' : 'Firebase: Error';
            statusFirebase.className = window.firebaseApp ? 'badge bg-success' : 'badge bg-danger';
        } else {
            offlineBanner.style.display = 'block';
            btns.forEach(btn => btn.disabled = true);
            statusFirebase.textContent = 'Firebase: Offline';
            statusFirebase.className = 'badge bg-warning text-dark';
        }
    }

    window.addEventListener('online', () => {
        console.log('🌐 Conexión restaurada');
        actualizarEstadoConexion();
        alert('✅ Conexión restaurada. Ya puedes realizar cambios.');
    });

    window.addEventListener('offline', () => {
        console.log('📡 Conexión perdida');
        actualizarEstadoConexion();
    });

    // Verificar estado inicial
    actualizarEstadoConexion();

});
