<?php
require "../conexion.php";
$data = json_decode(file_get_contents("php://input"), true);

$sql = "
UPDATE usuarios SET
nombre=?, tipo_identificacion=?, cedula=?, sexo=?, tipo=?,
telefono=?, correo=?, carrera=?, semestre=?, cargo=?
WHERE id=?
";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    $data['nombre'],
    $data['tipoIdentificacion'],
    $data['cedula'],
    $data['sexo'],
    $data['tipo'],
    $data['telefono'],
    $data['correo'],
    $data['carrera'],
    $data['semestre'],
    $data['cargo'],
    $data['id']
]);

echo json_encode(["success"=>true]);
