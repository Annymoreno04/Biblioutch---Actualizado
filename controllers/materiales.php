<?php
require '../models/MaterialModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new MaterialModel();

if ($method === 'GET') {
    // Obtener materiales
    echo json_encode($model->getAll());
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST') {
    // Crear material
    echo json_encode($model->create($data));
    exit;
}

if ($method === 'PUT') {
    // Editar material
    echo json_encode($model->update($data['id'], $data));
    exit;
}

if ($method === 'DELETE') {
    // Eliminar material
    echo json_encode($model->delete($data['id']));
    exit;
}
