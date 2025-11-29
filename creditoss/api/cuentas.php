<?php
require_once __DIR__ . '/config.php';
$mysqli = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $result = $mysqli->query('SELECT idCuenta, idCliente, monto, fechaHora FROM cuentas ORDER BY idCuenta DESC');
  $rows = [];
  while ($row = $result->fetch_assoc()) { $rows[] = $row; }
  echo json_encode($rows);
  exit;
}

if ($method === 'POST') {
  $data = readJsonBody();
  $idCliente = intval($data['idCliente'] ?? 0);
  $monto = floatval($data['monto'] ?? 0);
  $fechaHora = $mysqli->real_escape_string($data['fechaHora'] ?? date('Y-m-d H:i:s'));
  if ($idCliente<=0 || $monto<=0) { http_response_code(400); echo json_encode(['error'=>'Datos inválidos']); exit; }
  $sql = "INSERT INTO cuentas (idCliente, monto, fechaHora) VALUES ($idCliente, $monto, '$fechaHora')";
  if ($mysqli->query($sql) === true) {
    echo json_encode(['idCuenta' => $mysqli->insert_id]);
  } else {
    http_response_code(500); echo json_encode(['error'=>'Insert failed', 'details'=>$mysqli->error]);
  }
  exit;
}

if ($method === 'PUT') {
  $id = intval($_GET['id'] ?? 0);
  $data = readJsonBody();
  $idCliente = intval($data['idCliente'] ?? 0);
  $monto = floatval($data['monto'] ?? 0);
  $fechaHora = $mysqli->real_escape_string($data['fechaHora'] ?? date('Y-m-d H:i:s'));
  if ($id<=0) { http_response_code(400); echo json_encode(['error'=>'ID inválido']); exit; }
  $sets = [];
  if ($idCliente>0) $sets[] = "idCliente=$idCliente";
  if ($monto>0) $sets[] = "monto=$monto";
  if ($fechaHora) $sets[] = "fechaHora='$fechaHora'";
  $sql = "UPDATE cuentas SET " . implode(', ', $sets) . " WHERE idCuenta=$id";
  if ($mysqli->query($sql) === true) { echo json_encode(['ok'=>true]); }
  else { http_response_code(500); echo json_encode(['error'=>'Update failed', 'details'=>$mysqli->error]); }
  exit;
}

if ($method === 'DELETE') {
  $id = intval($_GET['id'] ?? 0);
  if ($id<=0) { http_response_code(400); echo json_encode(['error'=>'ID inválido']); exit; }
  $sql = "DELETE FROM cuentas WHERE idCuenta=$id";
  if ($mysqli->query($sql) === true) { echo json_encode(['ok'=>true]); }
  else { http_response_code(500); echo json_encode(['error'=>'Delete failed', 'details'=>$mysqli->error]); }
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);