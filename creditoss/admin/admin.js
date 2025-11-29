// API endpoints
const API = {
    clientes: '../api/clientes.php',
    cuentas: '../api/cuentas.php',
    solicitudes: '../api/solicitudes.php',
    usuarios: '../api/usuarios.php',
    notificaciones: '../api/notificaciones.php',
    carlos: '../api/carlos.php',
    enrique: '../api/enrique.php'
};

// Cache para datos
let cache = {
    clientes: [],
    usuarios: [],
    carlos: [],
    enrique: []
};

// Toast notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const toastHTML = `
        <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">${type === 'success' ? 'Éxito' : 'Error'}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Offline queue management
let offlineQueue = JSON.parse(localStorage.getItem('adminOfflineQueue') || '[]');

function addToOfflineQueue(action) {
    offlineQueue.push(action);
    localStorage.setItem('adminOfflineQueue', JSON.stringify(offlineQueue));
}

function processOfflineQueue() {
    if (offlineQueue.length === 0) return;
    
    const queue = [...offlineQueue];
    offlineQueue = [];
    localStorage.setItem('adminOfflineQueue', JSON.stringify(offlineQueue));
    
    queue.forEach(async (action) => {
        try {
            await fetch(action.url, action.options);
        } catch (error) {
            // Re-add to queue if still failing
            addToOfflineQueue(action);
        }
    });
}

// Check online status and process queue
window.addEventListener('online', processOfflineQueue);

// Authentication
function checkAuth() {
    const pin = localStorage.getItem('adminPin');
    return pin === '1234'; // Simple PIN check
}

function login(pin) {
    if (pin === '1234') {
        localStorage.setItem('adminPin', pin);
        document.getElementById('btnLogin').classList.add('d-none');
        document.getElementById('btnLogout').classList.remove('d-none');
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('adminPin');
    document.getElementById('btnLogin').classList.remove('d-none');
    document.getElementById('btnLogout').classList.add('d-none');
}

// Generic API functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        if (!navigator.onLine) {
            addToOfflineQueue({ url, options });
            showToast('Sin conexión. Acción guardada para cuando vuelva la conexión.', 'warning');
        }
        throw error;
    }
}

// Clientes functions
async function cargarClientes() {
    try {
        const data = await apiRequest(API.clientes);
        cache.clientes = data;
        mostrarClientes(data);
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showToast('Error cargando clientes', 'error');
    }
}

function mostrarClientes(clientes) {
    const tbody = document.querySelector('#tablaClientes tbody');
    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const row = `
            <tr>
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.numero}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editarCliente(${cliente.id})">
                        <i class="bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente(${cliente.id})">
                        <i class="bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function guardarCliente() {
    const id = document.getElementById('clienteId').value;
    const nombre = document.getElementById('clienteNombre').value;
    const numero = document.getElementById('clienteNumero').value;
    
    if (!nombre || !numero) {
        showToast('Por favor complete todos los campos', 'error');
        return;
    }
    
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API.clientes}?id=${id}` : API.clientes;
        
        await apiRequest(url, {
            method,
            body: JSON.stringify({ nombre, numero })
        });
        
        showToast(`Cliente ${id ? 'actualizado' : 'creado'} exitosamente`);
        bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();
        cargarClientes();
    } catch (error) {
        console.error('Error guardando cliente:', error);
        showToast('Error guardando cliente', 'error');
    }
}

function editarCliente(id) {
    const cliente = cache.clientes.find(c => c.id == id);
    if (cliente) {
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('clienteNombre').value = cliente.nombre;
        document.getElementById('clienteNumero').value = cliente.numero;
        document.getElementById('tituloCliente').textContent = 'Editar Cliente';
        new bootstrap.Modal(document.getElementById('modalCliente')).show();
    }
}

async function eliminarCliente(id) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        try {
            await apiRequest(`${API.clientes}?id=${id}`, { method: 'DELETE' });
            showToast('Cliente eliminado exitosamente');
            cargarClientes();
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            showToast('Error eliminando cliente', 'error');
        }
    }
}

// Cuentas functions
async function cargarCuentas() {
    try {
        const data = await apiRequest(API.cuentas);
        mostrarCuentas(data);
    } catch (error) {
        console.error('Error cargando cuentas:', error);
        showToast('Error cargando cuentas', 'error');
    }
}

function mostrarCuentas(cuentas) {
    const tbody = document.querySelector('#tablaCuentas tbody');
    tbody.innerHTML = '';
    
    cuentas.forEach(cuenta => {
        const row = `
            <tr>
                <td>${cuenta.id_cuenta}</td>
                <td>${cuenta.id_cliente}</td>
                <td>$${parseFloat(cuenta.monto).toFixed(2)}</td>
                <td>${new Date(cuenta.fecha_hora).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editarCuenta(${cuenta.id_cuenta})">
                        <i class="bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarCuenta(${cuenta.id_cuenta})">
                        <i class="bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function llenarSelectClientes() {
    const select = document.getElementById('cuentaCliente');
    select.innerHTML = '<option value="">Seleccione un cliente</option>';
    
    cache.clientes.forEach(cliente => {
        select.innerHTML += `<option value="${cliente.id}">${cliente.nombre}</option>`;
    });
}

async function guardarCuenta() {
    const id = document.getElementById('cuentaId').value;
    const id_cliente = document.getElementById('cuentaCliente').value;
    const monto = document.getElementById('cuentaMonto').value;
    const fecha_hora = document.getElementById('cuentaFechaHora').value;
    
    if (!id_cliente || !monto) {
        showToast('Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API.cuentas}?id=${id}` : API.cuentas;
        
        await apiRequest(url, {
            method,
            body: JSON.stringify({ id_cliente, monto, fecha_hora })
        });
        
        showToast(`Cuenta ${id ? 'actualizada' : 'creada'} exitosamente`);
        bootstrap.Modal.getInstance(document.getElementById('modalCuenta')).hide();
        cargarCuentas();
    } catch (error) {
        console.error('Error guardando cuenta:', error);
        showToast('Error guardando cuenta', 'error');
    }
}

// Solicitudes functions
async function cargarSolicitudes() {
    try {
        const data = await apiRequest(API.solicitudes);
        mostrarSolicitudes(data);
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
        showToast('Error cargando solicitudes', 'error');
    }
}

function mostrarSolicitudes(solicitudes) {
    const tbody = document.querySelector('#tablaSolicitudes tbody');
    tbody.innerHTML = '';
    
    solicitudes.forEach(solicitud => {
        const estadoClass = {
            'pendiente': 'warning',
            'aceptada': 'success',
            'rechazada': 'danger'
        }[solicitud.estado] || 'secondary';
        
        const row = `
            <tr>
                <td>${solicitud.id}</td>
                <td>${solicitud.nombre}</td>
                <td>${solicitud.email}</td>
                <td>${solicitud.telefono}</td>
                <td>${solicitud.tipo_credito}</td>
                <td>$${parseFloat(solicitud.monto).toLocaleString()}</td>
                <td>$${parseFloat(solicitud.ingresos).toLocaleString()}</td>
                <td>${solicitud.motivo}</td>
                <td><span class="badge bg-${estadoClass}">${solicitud.estado}</span></td>
                <td>${new Date(solicitud.fecha_creacion).toLocaleDateString()}</td>
                <td>
                    ${solicitud.estado === 'pendiente' ? `
                        <button class="btn btn-sm btn-success me-1" onclick="cambiarEstadoSolicitud(${solicitud.id}, 'aceptada')">
                            <i class="bi-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="cambiarEstadoSolicitud(${solicitud.id}, 'rechazada')">
                            <i class="bi-x"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function cambiarEstadoSolicitud(id, estado) {
    try {
        await apiRequest(`${API.solicitudes}?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
        
        showToast(`Solicitud ${estado} exitosamente`);
        cargarSolicitudes();
    } catch (error) {
        console.error('Error cambiando estado:', error);
        showToast('Error cambiando estado de solicitud', 'error');
    }
}

// Usuarios functions
async function cargarUsuarios() {
    try {
        const data = await apiRequest(API.usuarios);
        cache.usuarios = data;
        mostrarUsuarios(data);
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showToast('Error cargando usuarios', 'error');
    }
}

function mostrarUsuarios(usuarios) {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const row = `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td><span class="badge bg-${usuario.rol === 'admin' ? 'primary' : 'secondary'}">${usuario.rol}</span></td>
                <td>${new Date(usuario.fecha_registro).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editarUsuario(${usuario.id})">
                        <i class="bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function editarUsuario(id) {
    const usuario = cache.usuarios.find(u => u.id == id);
    if (usuario) {
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('usuarioNombre').value = usuario.nombre;
        document.getElementById('usuarioEmail').value = usuario.email;
        document.getElementById('usuarioRol').value = usuario.rol;
        new bootstrap.Modal(document.getElementById('modalUsuario')).show();
    }
}

async function guardarUsuario() {
    const id = document.getElementById('usuarioId').value;
    const nombre = document.getElementById('usuarioNombre').value;
    const rol = document.getElementById('usuarioRol').value;
    
    if (!nombre || !rol) {
        showToast('Por favor complete todos los campos', 'error');
        return;
    }
    
    try {
        await apiRequest(`${API.usuarios}?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ nombre, rol })
        });
        
        showToast('Usuario actualizado exitosamente');
        bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
        cargarUsuarios();
    } catch (error) {
        console.error('Error guardando usuario:', error);
        showToast('Error guardando usuario', 'error');
    }
}

// Carlos functions
async function cargarCarlos() {
    try {
        const data = await apiRequest(API.carlos);
        cache.carlos = data;
        mostrarCarlos(data);
    } catch (error) {
        console.error('Error cargando carlos:', error);
        showToast('Error cargando carlos', 'error');
    }
}

function mostrarCarlos(carlos) {
    const tbody = document.querySelector('#tablaCarlos tbody');
    tbody.innerHTML = '';
    
    carlos.forEach(item => {
        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.descripcion || ''}</td>
                <td>${new Date(item.fecha).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editarCarlos(${item.id})">
                        <i class="bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarCarlos(${item.id})">
                        <i class="bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function guardarCarlos() {
    const id = document.getElementById('carlosId').value;
    const nombre = document.getElementById('carlosNombre').value;
    const descripcion = document.getElementById('carlosDescripcion').value;
    
    if (!nombre) {
        showToast('Por favor ingrese el nombre', 'error');
        return;
    }
    
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API.carlos}?id=${id}` : API.carlos;
        
        await apiRequest(url, {
            method,
            body: JSON.stringify({ nombre, descripcion })
        });
        
        showToast(`Carlos ${id ? 'actualizado' : 'creado'} exitosamente`);
        bootstrap.Modal.getInstance(document.getElementById('modalCarlos')).hide();
        cargarCarlos();
    } catch (error) {
        console.error('Error guardando carlos:', error);
        showToast('Error guardando carlos', 'error');
    }
}

function editarCarlos(id) {
    const item = cache.carlos.find(c => c.id == id);
    if (item) {
        document.getElementById('carlosId').value = item.id;
        document.getElementById('carlosNombre').value = item.nombre;
        document.getElementById('carlosDescripcion').value = item.descripcion || '';
        document.getElementById('tituloCarlos').textContent = 'Editar Carlos';
        new bootstrap.Modal(document.getElementById('modalCarlos')).show();
    }
}

async function eliminarCarlos(id) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
        try {
            await apiRequest(`${API.carlos}?id=${id}`, { method: 'DELETE' });
            showToast('Carlos eliminado exitosamente');
            cargarCarlos();
        } catch (error) {
            console.error('Error eliminando carlos:', error);
            showToast('Error eliminando carlos', 'error');
        }
    }
}

// Enrique functions
async function cargarEnrique() {
    try {
        const data = await apiRequest(API.enrique);
        cache.enrique = data;
        mostrarEnrique(data);
    } catch (error) {
        console.error('Error cargando enrique:', error);
        showToast('Error cargando enrique', 'error');
    }
}

function mostrarEnrique(enrique) {
    const tbody = document.querySelector('#tablaEnrique tbody');
    tbody.innerHTML = '';
    
    enrique.forEach(item => {
        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.descripcion || ''}</td>
                <td>${new Date(item.fecha).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editarEnrique(${item.id})">
                        <i class="bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarEnrique(${item.id})">
                        <i class="bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function guardarEnrique() {
    const id = document.getElementById('enriqueId').value;
    const nombre = document.getElementById('enriqueNombre').value;
    const descripcion = document.getElementById('enriqueDescripcion').value;
    
    if (!nombre) {
        showToast('Por favor ingrese el nombre', 'error');
        return;
    }
    
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API.enrique}?id=${id}` : API.enrique;
        
        await apiRequest(url, {
            method,
            body: JSON.stringify({ nombre, descripcion })
        });
        
        showToast(`Enrique ${id ? 'actualizado' : 'creado'} exitosamente`);
        bootstrap.Modal.getInstance(document.getElementById('modalEnrique')).hide();
        cargarEnrique();
    } catch (error) {
        console.error('Error guardando enrique:', error);
        showToast('Error guardando enrique', 'error');
    }
}

function editarEnrique(id) {
    const item = cache.enrique.find(e => e.id == id);
    if (item) {
        document.getElementById('enriqueId').value = item.id;
        document.getElementById('enriqueNombre').value = item.nombre;
        document.getElementById('enriqueDescripcion').value = item.descripcion || '';
        document.getElementById('tituloEnrique').textContent = 'Editar Enrique';
        new bootstrap.Modal(document.getElementById('modalEnrique')).show();
    }
}

async function eliminarEnrique(id) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
        try {
            await apiRequest(`${API.enrique}?id=${id}`, { method: 'DELETE' });
            showToast('Enrique eliminado exitosamente');
            cargarEnrique();
        } catch (error) {
            console.error('Error eliminando enrique:', error);
            showToast('Error eliminando enrique', 'error');
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (checkAuth()) {
        document.getElementById('btnLogin').classList.add('d-none');
        document.getElementById('btnLogout').classList.remove('d-none');
    }
    
    // Login modal
    document.getElementById('btnLogin').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('modalLogin')).show();
    });
    
    document.getElementById('confirmLogin').addEventListener('click', () => {
        const pin = document.getElementById('inputPin').value;
        if (login(pin)) {
            bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
            showToast('Sesión iniciada correctamente');
            // Load initial data
            cargarClientes();
            cargarSolicitudes();
            cargarUsuarios();
            cargarCarlos();
            cargarEnrique();
        } else {
            showToast('PIN incorrecto', 'error');
        }
    });
    
    document.getElementById('btnLogout').addEventListener('click', () => {
        logout();
        showToast('Sesión cerrada');
    });
    
    // Tab change events
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (event) => {
            const target = event.target.getAttribute('data-bs-target');
            switch(target) {
                case '#clientes':
                    cargarClientes();
                    break;
                case '#cuentas':
                    cargarCuentas();
                    break;
                case '#solicitudes':
                    cargarSolicitudes();
                    break;
                case '#usuarios':
                    cargarUsuarios();
                    break;
                case '#carlos':
                    cargarCarlos();
                    break;
                case '#enrique':
                    cargarEnrique();
                    break;
            }
        });
    });
    
    // Modal events
    document.getElementById('btnNuevoCliente').addEventListener('click', () => {
        document.getElementById('clienteId').value = '';
        document.getElementById('clienteNombre').value = '';
        document.getElementById('clienteNumero').value = '';
        document.getElementById('tituloCliente').textContent = 'Nuevo Cliente';
        new bootstrap.Modal(document.getElementById('modalCliente')).show();
    });
    
    document.getElementById('btnNuevaCuenta').addEventListener('click', () => {
        document.getElementById('cuentaId').value = '';
        document.getElementById('cuentaMonto').value = '';
        document.getElementById('cuentaFechaHora').value = '';
        document.getElementById('tituloCuenta').textContent = 'Nueva Cuenta';
        llenarSelectClientes();
        new bootstrap.Modal(document.getElementById('modalCuenta')).show();
    });
    
    document.getElementById('btnNuevoCarlos').addEventListener('click', () => {
        document.getElementById('carlosId').value = '';
        document.getElementById('carlosNombre').value = '';
        document.getElementById('carlosDescripcion').value = '';
        document.getElementById('tituloCarlos').textContent = 'Nuevo Carlos';
        new bootstrap.Modal(document.getElementById('modalCarlos')).show();
    });
    
    document.getElementById('btnNuevoEnrique').addEventListener('click', () => {
        document.getElementById('enriqueId').value = '';
        document.getElementById('enriqueNombre').value = '';
        document.getElementById('enriqueDescripcion').value = '';
        document.getElementById('tituloEnrique').textContent = 'Nuevo Enrique';
        new bootstrap.Modal(document.getElementById('modalEnrique')).show();
    });
    
    // Save buttons
    document.getElementById('guardarCliente').addEventListener('click', guardarCliente);
    document.getElementById('guardarCuenta').addEventListener('click', guardarCuenta);
    document.getElementById('guardarUsuario').addEventListener('click', guardarUsuario);
    document.getElementById('guardarCarlos').addEventListener('click', guardarCarlos);
    document.getElementById('guardarEnrique').addEventListener('click', guardarEnrique);
    
    // Search functionality
    document.getElementById('clientesBuscar').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = cache.clientes.filter(cliente => 
            cliente.nombre.toLowerCase().includes(term) || 
            cliente.numero.toString().includes(term)
        );
        mostrarClientes(filtered);
    });
    
    // Filter solicitudes by status
    document.getElementById('solicitudesEstado').addEventListener('change', (e) => {
        cargarSolicitudes(); // Reload with filter
    });
    
    // Load initial data for first tab
    cargarClientes();
});