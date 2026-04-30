
<?php
require 'conexion.php';

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.tipo_prestamo,
            p.fecha_prestamo,
            p.hora_prestamo,
            p.fecha_devolucion,
            p.estado,
            u.cedula AS usuario_cedula,
            u.nombre AS usuario_nombre,
            m.titulo AS material_titulo
        FROM prestamos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN materiales m ON p.material_id = m.id
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    exit;
}

$stmt = $pdo->query("
    SELECT 
        p.id,
        p.tipo_prestamo,
        p.fecha_prestamo,
        p.hora_prestamo,
        p.fecha_devolucion,
        p.estado,
        u.cedula AS usuario_cedula,
        u.nombre AS usuario_nombre,
        m.titulo AS material_titulo
    FROM prestamos p
    JOIN usuarios u ON p.usuario_id = u.id
    JOIN materiales m ON p.material_id = m.id
    WHERE p.estado = 'Activo'
    ORDER BY p.id DESC
");

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

