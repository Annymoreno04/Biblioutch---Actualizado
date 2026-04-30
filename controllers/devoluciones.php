<?php
header('Content-Type: application/json');
require 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Registrar devolución
    $data = json_decode(file_get_contents("php://input"), true);

    // Validar datos requeridos
    if (empty($data['prestamo_id'])) {
        echo json_encode(['error' => 'ID de préstamo requerido']);
        exit;
    }

    // Verificar que el préstamo esté activo
    $checkStmt = $pdo->prepare("SELECT estado FROM prestamos WHERE id = ?");
    $checkStmt->execute([$data['prestamo_id']]);
    $estado = $checkStmt->fetchColumn();
    if ($estado !== 'Activo') {
        echo json_encode(['error' => 'El préstamo no está activo o ya fue devuelto']);
        exit;
    }

    $sql = "INSERT INTO devoluciones (
        prestamo_id, usuario_cedula, usuario, material,
        tipo_prestamo, fecha_prestamo, fecha_devolucion_real,
        hora_prestamo, hora_devolucion, tiempo_uso,
        dias_atraso, recibido_por
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";

    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $data['prestamo_id'],
        $data['usuario_cedula'],
        $data['usuario'],
        $data['material'],
        $data['tipo_prestamo'],
        $data['fecha_prestamo'],
        $data['fecha_devolucion_real'],
        $data['hora_prestamo'],
        $data['hora_devolucion'],
        $data['tiempo_uso'],
        $data['dias_atraso'],
        $data['recibido_por']
    ]);

    if (!$result) {
        echo json_encode(['error' => 'No se puede realizar devolución']);
        exit;
    }

    // Actualizar estado del préstamo
    $updatePrestamo = $pdo->prepare("UPDATE prestamos SET estado = 'Devuelto' WHERE id = ?");
    $updatePrestamo->execute([$data['prestamo_id']]);

    // Obtener material_id del préstamo
    $getMaterial = $pdo->prepare("SELECT material_id FROM prestamos WHERE id = ?");
    $getMaterial->execute([$data['prestamo_id']]);
    $material_id = $getMaterial->fetchColumn();

    // Incrementar ejemplares del material
    if ($material_id) {
        $updateMaterial = $pdo->prepare("UPDATE materiales SET ejemplares = ejemplares + 1 WHERE id = ?");
        $updateMaterial->execute([$material_id]);
    }

    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'GET') {
    // Listar devoluciones
    $stmt = $pdo->query("SELECT * FROM devoluciones ORDER BY id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}
