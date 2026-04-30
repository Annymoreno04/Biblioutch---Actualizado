<?php
require "../conexion.php";
$data = json_decode(file_get_contents("php://input"), true);

// generar código
$tipo = $data['tipo'];
$pref = strtoupper(substr($tipo, 0, 3));

$stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE tipo=?");
$stmt->execute([$tipo]);
$numero = $stmt->fetchColumn() + 1;

$codigo = $pref . str_pad($numero, 3, "0", STR_PAD_LEFT);

$sql = "
INSERT INTO usuarios
(codigo,nombre,tipo_identificacion,cedula,sexo,tipo,telefono,correo,carrera,semestre,cargo)
VALUES (?,?,?,?,?,?,?,?,?,?,?)
";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    $codigo,
    $data['nombre'],
    $data['tipoIdentificacion'],
    $data['cedula'],
    $data['sexo'],
    $tipo,
    $data['telefono'],
    $data['correo'],
    $data['carrera'],
    $data['semestre'],
    $data['cargo']
]);

echo json_encode(["success"=>true,"codigo"=>$codigo]);
