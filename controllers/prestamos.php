<?php
header("Content-Type: application/json");
require '../models/PrestamoModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new PrestamoModel();

switch ($method) {

    // ===========================
    // LISTAR PRÉSTAMOS
    // ===========================
    case 'GET':
        echo json_encode($model->getAll());
        break;

    // ===========================
    // REGISTRAR PRÉSTAMO
    // ===========================
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $result = $model->create($data);
        if (isset($result['error'])) {
            http_response_code(400);
            echo json_encode($result);
        } else {
            echo json_encode($result);
        }
        break;

    // ===========================
    // ELIMINAR PRÉSTAMO
    // ===========================
    case 'DELETE':
        try{
            parse_str($_SERVER['QUERY_STRING'], $params);
            $id = $params['id'] ?? null;
            $result = $model->delete($id);
            if (isset($result['error'])) {
                http_response_code(400);
                //echo json_encode($result);
                echo json_encode([
                    'success' => false,
                    'error' => $result['error']
                ]);
            } else {
                echo json_encode($result);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'No es posible eliminar el préstamo' // $e->getMessage()
            ]);
        }

        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}
