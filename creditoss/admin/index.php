<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Créditos Express</title>
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/bootstrap-icons.css" rel="stylesheet">
    <link href="admin.css" rel="stylesheet">
    <link rel="manifest" href="../manifest.json">
    <meta name="theme-color" content="#007bff">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">
                <i class="bi-shield-check"></i> Admin Panel
            </a>
            <div class="navbar-nav ms-auto">
                <button class="btn btn-outline-light me-2" id="btnLogin">
                    <i class="bi-box-arrow-in-right"></i> Login
                </button>
                <button class="btn btn-outline-light d-none" id="btnLogout">
                    <i class="bi-box-arrow-right"></i> Logout
                </button>
            </div>
        </div>
    </nav>

    <div class="container-fluid mt-3">
        <ul class="nav nav-tabs" id="adminTabs" role="tablist">
            <li class="nav-item d-none" role="presentation">
                <button class="nav-link" id="clientes-tab" data-bs-toggle="tab" data-bs-target="#clientes" type="button" role="tab">
            
            </button>
            </li>
            <li class="nav-item d-none" role="presentation">
                <button class="nav-link" id="cuentas-tab" data-bs-toggle="tab" data-bs-target="#cuentas" type="button" role="tab">
                    <i class="bi-credit-card"></i> Cuentas
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="solicitudes-tab" data-bs-toggle="tab" data-bs-target="#solicitudes" type="button" role="tab">
                    <i class="bi-file-earmark-text"></i> Solicitudes
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="usuarios-tab" data-bs-toggle="tab" data-bs-target="#usuarios" type="button" role="tab">
                    <i class="bi-person-gear"></i> Usuarios
                </button>
            </li>
            <li class="nav-item d-none" role="presentation">
                <button class="nav-link" id="carlos-tab" data-bs-toggle="tab" data-bs-target="#carlos" type="button" role="tab">
                    <i class="bi-person-badge"></i> Carlos
                </button>
            </li>
            <li class="nav-item d-none" role="presentation">
                <button class="nav-link" id="enrique-tab" data-bs-toggle="tab" data-bs-target="#enrique" type="button" role="tab">
                </button>
            </li>
        </ul>

        <div class="tab-content" id="adminTabsContent">
            <!-- Clientes Tab -->
            <div class="tab-pane fade d-none" id="clientes" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center my-3">
                    <h3>Gestión de Clientes</h3>
                    <button class="btn btn-primary" id="btnNuevoCliente">
                        <i class="bi-plus-circle"></i> Nuevo Cliente
                    </button>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <input type="text" class="form-control" id="clientesBuscar" placeholder="Buscar por nombre o número...">
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped" id="tablaClientes">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Número</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <!-- Cuentas Tab -->
            <div class="tab-pane fade d-none" id="cuentas" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center my-3">
                    <h3>Gestión de Cuentas</h3>
                    <button class="btn btn-primary" id="btnNuevaCuenta">
                        <i class="bi-plus-circle"></i> Nueva Cuenta
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped" id="tablaCuentas">
                        <thead>
                            <tr>
                                <th>ID Cuenta</th>
                                <th>ID Cliente</th>
                                <th>Monto</th>
                                <th>Fecha/Hora</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <!-- Solicitudes Tab -->
            <div class="tab-pane fade show active" id="solicitudes" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center my-3">
                    <h3>Gestión de Solicitudes</h3>
                    <select class="form-select w-auto" id="solicitudesEstado">
                        <option value="">Todos los estados</option>
                        <option value="aceptada">Aceptadas</option>
                        <option value="rechazada">Rechazadas</option>
                    </select>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped" id="tablaSolicitudes">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Tipo Crédito</th>
                                <th>Monto</th>
                                <th>Ingresos</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <!-- Usuarios Tab -->
            <div class="tab-pane fade" id="usuarios" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center my-3">
                    <h3>Gestión de Usuarios</h3>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped" id="tablaUsuarios">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Fecha Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <!-- Carlos Tab -->
            <div class="tab-pane fade d-none" id="carlos" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center my-3">
                    <h3>Gestión Carlos</h3>
                    <button class="btn btn-primary" id="btnNuevoCarlos">
                        <i class="bi-plus-circle"></i> Nuevo Carlos
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped" id="tablaCarlos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <!-- Enrique Tab -->
            <div class="tab-pane fade d-none" id="enrique" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center my-3">
                    <h3>Gestión Enrique</h3>
                    <button class="btn btn-primary" id="btnNuevoEnrique">
                        <i class="bi-plus-circle"></i> Nuevo Enrique
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped" id="tablaEnrique">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Login -->
    <div class="modal fade" id="modalLogin" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Iniciar Sesión Admin</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="inputPin" class="form-label">PIN de Administrador</label>
                        <input type="password" class="form-control" id="inputPin" placeholder="Ingresa tu PIN">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="confirmLogin">Iniciar Sesión</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Cliente -->
    <div class="modal fade" id="modalCliente" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tituloCliente">Nuevo Cliente</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="clienteId">
                    <div class="mb-3">
                        <label for="clienteNombre" class="form-label">Nombre del Cliente</label>
                        <input type="text" class="form-control" id="clienteNombre" required>
                    </div>
                    <div class="mb-3">
                        <label for="clienteNumero" class="form-label">Número</label>
                        <input type="number" class="form-control" id="clienteNumero" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="guardarCliente">Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Cuenta -->
    <div class="modal fade" id="modalCuenta" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tituloCuenta">Nueva Cuenta</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="cuentaId">
                    <div class="mb-3">
                        <label for="cuentaCliente" class="form-label">Cliente</label>
                        <select class="form-select" id="cuentaCliente" required></select>
                    </div>
                    <div class="mb-3">
                        <label for="cuentaMonto" class="form-label">Monto</label>
                        <input type="number" step="0.01" class="form-control" id="cuentaMonto" required>
                    </div>
                    <div class="mb-3">
                        <label for="cuentaFechaHora" class="form-label">Fecha y Hora</label>
                        <input type="datetime-local" class="form-control" id="cuentaFechaHora">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="guardarCuenta">Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Carlos -->
    <div class="modal fade" id="modalCarlos" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tituloCarlos">Nuevo Carlos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="carlosId">
                    <div class="mb-3">
                        <label for="carlosNombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="carlosNombre" required>
                    </div>
                    <div class="mb-3">
                        <label for="carlosDescripcion" class="form-label">Descripción</label>
                        <textarea class="form-control" id="carlosDescripcion" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="guardarCarlos">Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Enrique -->
    <div class="modal fade" id="modalEnrique" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tituloEnrique">Nuevo Enrique</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="enriqueId">
                    <div class="mb-3">
                        <label for="enriqueNombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="enriqueNombre" required>
                    </div>
                    <div class="mb-3">
                        <label for="enriqueDescripcion" class="form-label">Descripción</label>
                        <textarea class="form-control" id="enriqueDescripcion" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="guardarEnrique">Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Usuario -->
    <div class="modal fade" id="modalUsuario" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tituloUsuario">Editar Usuario</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="usuarioId">
                    <div class="mb-3">
                        <label for="usuarioNombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="usuarioNombre" required>
                    </div>
                    <div class="mb-3">
                        <label for="usuarioEmail" class="form-label">Email</label>
                        <input type="email" class="form-control" id="usuarioEmail" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="usuarioRol" class="form-label">Rol</label>
                        <select class="form-select" id="usuarioRol" required>
                            <option value="cliente">Cliente</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="guardarUsuario">Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastContainer"></div>

    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="admin.js"></script>
</body>
</html>