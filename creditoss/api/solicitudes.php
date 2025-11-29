<?php
require_once __DIR__ . '/config.php';
session_start();
$mysqli = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Asegurar tabla solicitudes
$mysqli->query("CREATE TABLE IF NOT EXISTS solicitudes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  tipo_credito VARCHAR(50) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  ingresos_mensuales VARCHAR(50) NOT NULL,
  motivo TEXT NULL,
  estado ENUM('pendiente','aceptada','rechazada') NOT NULL DEFAULT 'pendiente',
  creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
// Asegurar columna motivo en bases ya creadas
$col = $mysqli->query("SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='solicitudes' AND COLUMN_NAME='motivo'");
if (!($col && $col->num_rows === 1)) { $mysqli->query("ALTER TABLE solicitudes ADD COLUMN motivo TEXT NULL"); }
if ($col) { $col->free(); }

header('Content-Type: application/json; charset=utf-8');

// Eliminar funciones duplicadas de lectura JSON; usar las de config.php

function requireLogin(){
  if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
  }
}
function isAdmin() {
  return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

if ($method === 'GET') {
  // Listar solicitudes: admin ve todas, cliente ve solo las suyas
  requireLogin();
  if (isAdmin()) {
    $result = $mysqli->query('SELECT id, user_id, nombre, email, telefono, tipo_credito, monto, ingresos_mensuales, motivo, estado, creado FROM solicitudes ORDER BY id DESC');
  } else {
    $uid = (int)$_SESSION['user_id'];
    $result = $mysqli->query("SELECT id, user_id, nombre, email, telefono, tipo_credito, monto, ingresos_mensuales, motivo, estado, creado FROM solicitudes WHERE user_id=$uid ORDER BY id DESC");
  }
  $rows = [];
  if ($result) {
    while ($row = $result->fetch_assoc()) { $rows[] = $row; }
  }
  echo json_encode($rows);
  exit;
}

if ($method === 'POST') {
  // Crear nueva solicitud (cliente autenticado o visitante)
  $uid = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
  $data = readJsonBody();
  $nombre = $mysqli->real_escape_string($data['nombre'] ?? '');
  $email = $mysqli->real_escape_string($data['email'] ?? '');
  $telefono = $mysqli->real_escape_string($data['telefono'] ?? '');
  $tipo = $mysqli->real_escape_string($data['tipo_credito'] ?? '');
  $monto = floatval($data['monto'] ?? 0);
  $ingresos = $mysqli->real_escape_string($data['ingresos_mensuales'] ?? '');

  if ($nombre === '' || $email === '' || $telefono === '' || $tipo === '' || $monto <= 0 || $ingresos === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
  }

  $motivo = $mysqli->real_escape_string($data['motivo'] ?? '');
  $sql = "INSERT INTO solicitudes (user_id, nombre, email, telefono, tipo_credito, monto, ingresos_mensuales, motivo) VALUES ($uid, '$nombre', '$email', '$telefono', '$tipo', $monto, '$ingresos', " . ($motivo !== '' ? "'$motivo'" : "NULL") . ")";
  if ($mysqli->query($sql) === true) {
    $sid = (int)$mysqli->insert_id;
    // Notificación para admin: nueva solicitud creada
    $mysqli->query("CREATE TABLE IF NOT EXISTS notificaciones (
      id BIGINT NOT NULL AUTO_INCREMENT,
      tipo VARCHAR(50) NOT NULL,
      titulo VARCHAR(150) NOT NULL,
      cuerpo TEXT,
      creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      leida TINYINT(1) NOT NULL DEFAULT 0,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    $titulo = $mysqli->real_escape_string('Nueva solicitud');
    $cuerpo = $mysqli->real_escape_string("Cliente: $nombre ($email) | Tipo: $tipo | Monto: $monto");
    $mysqli->query("INSERT INTO notificaciones (tipo, titulo, cuerpo) VALUES ('solicitud_creada', '$titulo', '$cuerpo')");
    echo json_encode(['ok' => true, 'id' => $sid]);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Insert failed', 'details' => $mysqli->error]);
  }
  exit;
}

if ($method === 'PUT') {
  // Actualizar estado (solo admin)
  if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
  }
  $id = intval($_GET['id'] ?? 0);
  $data = readJsonBody();
  $estado = $mysqli->real_escape_string($data['estado'] ?? '');
  if ($id <= 0 || !in_array($estado, ['pendiente','aceptada','rechazada'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
  }
  $sql = "UPDATE solicitudes SET estado='$estado' WHERE id=$id";
  if ($mysqli->query($sql) === true) {
    // Si se acepta, crear/actualizar cliente y abrir cuenta automáticamente
    if ($estado === 'aceptada') {
      // Obtener datos de la solicitud
      $rs = $mysqli->query("SELECT user_id, monto, nombre, email FROM solicitudes WHERE id=$id LIMIT 1");
      if ($rs && $rs->num_rows === 1) {
        $s = $rs->fetch_assoc();
        $uid = (int)$s['user_id'];
        $monto = floatval($s['monto']);
        $nombreSol = $mysqli->real_escape_string($s['nombre']);

        // Asegurar tabla clientes
        $mysqli->query("CREATE TABLE IF NOT EXISTS clientes (
          idCliente BIGINT NOT NULL AUTO_INCREMENT,
          nombreCliente VARCHAR(150) NOT NULL,
          numero BIGINT NOT NULL DEFAULT 0,
          PRIMARY KEY (idCliente)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        // Intentar localizar cliente por nombre de la solicitud
        $clienteId = 0;
        $rc = $mysqli->query("SELECT idCliente FROM clientes WHERE nombreCliente='$nombreSol' LIMIT 1");
        if ($rc && $rc->num_rows === 1) {
          $clienteId = (int)$rc->fetch_assoc()['idCliente'];
        }
        // Si no, intentar por nombre del usuario
        if ($clienteId <= 0) {
          $ru2 = $mysqli->query("SELECT nombre FROM usuarios WHERE id=$uid LIMIT 1");
          if ($ru2 && $ru2->num_rows === 1) {
            $userName = $mysqli->real_escape_string($ru2->fetch_assoc()['nombre']);
            $rc2 = $mysqli->query("SELECT idCliente FROM clientes WHERE nombreCliente='$userName' LIMIT 1");
            if ($rc2 && $rc2->num_rows === 1) {
              $clienteId = (int)$rc2->fetch_assoc()['idCliente'];
            }
          }
        }
        // Si sigue sin existir, crear cliente nuevo (numero guarda el user_id)
        if ($clienteId <= 0) {
          if ($mysqli->query("INSERT INTO clientes (nombreCliente, numero) VALUES ('$nombreSol', $uid)") === true) {
            $clienteId = (int)$mysqli->insert_id;
          }
        }

        // Asegurar y crear cuenta
        if ($clienteId > 0 && $monto > 0) {
          $mysqli->query("CREATE TABLE IF NOT EXISTS cuentas (
            idCuenta BIGINT NOT NULL AUTO_INCREMENT,
            idCliente BIGINT NOT NULL,
            monto DECIMAL(12,2) NOT NULL,
            fechaHora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (idCuenta)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
          $mysqli->query("INSERT INTO cuentas (idCliente, monto) VALUES ($clienteId, $monto)");
          $cuentaId = (int)$mysqli->insert_id;
          // Registrar notificación
          $mysqli->query("CREATE TABLE IF NOT EXISTS notificaciones (
            id BIGINT NOT NULL AUTO_INCREMENT,
            tipo VARCHAR(50) NOT NULL,
            titulo VARCHAR(150) NOT NULL,
            cuerpo TEXT,
            creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            leida TINYINT(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
          $titulo = $mysqli->real_escape_string('Cuenta creada por solicitud aceptada');
          $cuerpo = $mysqli->real_escape_string("ClienteID: $clienteId | Monto: $monto | CuentaID: $cuentaId");
          $mysqli->query("INSERT INTO notificaciones (tipo, titulo, cuerpo) VALUES ('cuenta_creada', '$titulo', '$cuerpo')");
        }
      }
    }
    // Notificación de cambio de estado
    $mysqli->query("CREATE TABLE IF NOT EXISTS notificaciones (
      id BIGINT NOT NULL AUTO_INCREMENT,
      tipo VARCHAR(50) NOT NULL,
      titulo VARCHAR(150) NOT NULL,
      cuerpo TEXT,
      creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      leida TINYINT(1) NOT NULL DEFAULT 0,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    $titulo = $mysqli->real_escape_string('Solicitud actualizada');
    $cuerpo = $mysqli->real_escape_string("ID: $id | Nuevo estado: $estado");
    $mysqli->query("INSERT INTO notificaciones (tipo, titulo, cuerpo) VALUES ('solicitud_estado', '$titulo', '$cuerpo')");
    echo json_encode(['ok' => true]);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Update failed', 'details' => $mysqli->error]);
  }
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);