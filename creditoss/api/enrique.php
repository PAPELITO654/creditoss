<?php
require_once __DIR__ . '/config.php';
session_start();
$mysqli = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Asegurar tabla para módulo Enrique
$mysqli->query("CREATE TABLE IF NOT EXISTS enrique_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NULL,
  creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

header('Content-Type: application/json; charset=utf-8');

function jsonBody() {
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);
  return is_array($data) ? $data : [];
}

function isAdmin() {
  return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

function requireAdmin() {
  if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
  }
}

if ($method === 'GET') {
  requireAdmin();
  $result = $mysqli->query('SELECT id, titulo, descripcion, creado FROM enrique_items ORDER BY id DESC');
  $rows = [];
  if ($result) { while ($row = $result->fetch_assoc()) { $rows[] = $row; } }
  echo json_encode($rows);
  exit;
}

if ($method === 'POST') {
  requireAdmin();
  $data = jsonBody();
  $titulo = $mysqli->real_escape_string($data['titulo'] ?? '');
  $descripcion = $mysqli->real_escape_string($data['descripcion'] ?? '');
  if ($titulo === '') { http_response_code(400); echo json_encode(['error'=>'Título requerido']); exit; }
  $sql = "INSERT INTO enrique_items (titulo, descripcion) VALUES ('$titulo', '$descripcion')";
  if ($mysqli->query($sql) === true) {
    echo json_encode(['ok'=>true, 'id'=>$mysqli->insert_id]);
  } else {
    http_response_code(500); echo json_encode(['error'=>'Insert failed', 'details'=>$mysqli->error]);
  }
  exit;
}

if ($method === 'PUT') {
  requireAdmin();
  $id = intval($_GET['id'] ?? 0);
  $data = jsonBody();
  if ($id<=0) { http_response_code(400); echo json_encode(['error'=>'ID inválido']); exit; }
  $sets = [];
  if (isset($data['titulo'])) { $sets[] = "titulo='".$mysqli->real_escape_string($data['titulo'])."'"; }
  if (isset($data['descripcion'])) { $sets[] = "descripcion='".$mysqli->real_escape_string($data['descripcion'])."'"; }
  if (empty($sets)) { http_response_code(400); echo json_encode(['error'=>'Sin cambios']); exit; }
  $sql = "UPDATE enrique_items SET ".implode(', ', $sets)." WHERE id=$id";
  if ($mysqli->query($sql) === true) { echo json_encode(['ok'=>true]); }
  else { http_response_code(500); echo json_encode(['error'=>'Update failed', 'details'=>$mysqli->error]); }
  exit;
}

if ($method === 'DELETE') {
  requireAdmin();
  $id = intval($_GET['id'] ?? 0);
  if ($id<=0) { http_response_code(400); echo json_encode(['error'=>'ID inválido']); exit; }
  $sql = "DELETE FROM enrique_items WHERE id=$id";
  if ($mysqli->query($sql) === true) { echo json_encode(['ok'=>true]); }
  else { http_response_code(500); echo json_encode(['error'=>'Delete failed', 'details'=>$mysqli->error]); }
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);