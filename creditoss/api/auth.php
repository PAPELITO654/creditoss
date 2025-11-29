<?php
require_once __DIR__ . '/config.php';
session_start();
$mysqli = getDb();

// Asegurar tabla usuarios
$mysqli->query("CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
  creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

$action = $_GET['action'] ?? $_POST['action'] ?? '';
header('Content-Type: application/json; charset=utf-8');

function jsonBody() {
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);
  return is_array($data) ? $data : [];
}

if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = jsonBody();
  $nombre = $mysqli->real_escape_string($data['nombre'] ?? '');
  $email = $mysqli->real_escape_string($data['email'] ?? '');
  $password = $data['password'] ?? '';
  $rol = $mysqli->real_escape_string($data['rol'] ?? 'cliente');
  if (!in_array($rol, ['admin','cliente'])) $rol = 'cliente';
  if ($nombre === '' || $email === '' || $password === '') {
    http_response_code(400); echo json_encode(['error' => 'Datos incompletos']); exit;
  }
  $hash = password_hash($password, PASSWORD_BCRYPT);
  $sql = "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ('$nombre', '$email', '$hash', '$rol')";
  if ($mysqli->query($sql) === true) {
    echo json_encode(['ok' => true, 'id' => $mysqli->insert_id]);
  } else {
    http_response_code(400);
    echo json_encode(['error' => 'Registro fallido', 'details' => $mysqli->error]);
  }
  exit;
}

if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = jsonBody();
  $email = $mysqli->real_escape_string($data['email'] ?? '');
  $password = $data['password'] ?? '';
  if ($email === '' || $password === '') { http_response_code(400); echo json_encode(['error' => 'Datos incompletos']); exit; }
  $res = $mysqli->query("SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email='$email' LIMIT 1");
  if ($res && $res->num_rows === 1) {
    $u = $res->fetch_assoc();
    if (password_verify($password, $u['password_hash'])) {
      $_SESSION['user_id'] = (int)$u['id'];
      $_SESSION['user_name'] = $u['nombre'];
      $_SESSION['user_role'] = $u['rol'];
      echo json_encode(['ok' => true, 'rol' => $u['rol'], 'nombre' => $u['nombre']]);
      exit;
    }
  }
  http_response_code(401);
  echo json_encode(['error' => 'Credenciales inválidas']);
  exit;
}

if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
      $params['path'], $params['domain'], $params['secure'], $params['httponly']
    );
  }
  session_destroy();
  echo json_encode(['ok' => true]);
  exit;
}

if ($action === 'status' && $_SERVER['REQUEST_METHOD'] === 'GET') {
  if (!empty($_SESSION['user_id'])) {
    echo json_encode([
      'loggedIn' => true,
      'rol' => $_SESSION['user_role'] ?? 'cliente',
      'nombre' => $_SESSION['user_name'] ?? ''
    ]);
  } else {
    echo json_encode(['loggedIn' => false]);
  }
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Acción no permitida']);