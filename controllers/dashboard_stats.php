<?php
header('Content-Type: application/json');
require 'conexion.php';

// Préstamos activos
$stmt = $pdo->query("SELECT COUNT(*) as activos FROM prestamos WHERE estado = 'Activo'");
$prestamosActivos = $stmt->fetch()['activos'];

// Préstamos atrasados
$stmt = $pdo->query("SELECT COUNT(*) as atrasados FROM prestamos WHERE estado = 'Activo' AND fecha_devolucion < CURDATE()");
$prestamosAtrasados = $stmt->fetch()['atrasados'];

// Materiales disponibles
$stmt = $pdo->query("SELECT SUM(ejemplares) as disponibles FROM materiales");
$materialesDisponibles = $stmt->fetch()['disponibles'];

echo json_encode([
    'prestamosActivos' => $prestamosActivos,
    'prestamosAtrasados' => $prestamosAtrasados,
    'materialesDisponibles' => $materialesDisponibles
]);
?>