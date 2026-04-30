<?php
header('Content-Type: application/json');
require 'conexion.php';

// Materiales más prestados
$stmt = $pdo->query("
    SELECT m.titulo, m.autor, m.tipo, COUNT(p.id) as total_prestamos
    FROM prestamos p
    JOIN materiales m ON p.material_id = m.id
    GROUP BY m.id, m.titulo, m.autor, m.tipo
    ORDER BY total_prestamos DESC
    LIMIT 10
");
$materialesMasPrestados = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($materialesMasPrestados);
?>