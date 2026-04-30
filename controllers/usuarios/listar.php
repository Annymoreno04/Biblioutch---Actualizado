<?php
require "../conexion.php";

$stmt = $pdo->query("SELECT * FROM usuarios ORDER BY id DESC");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
