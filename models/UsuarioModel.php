<?php
require_once '../controllers/conexion.php';

class UsuarioModel {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM usuarios ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        // generar código
        $tipo = $data['tipo'];
        $pref = strtoupper(substr($tipo, 0, 3));

        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE tipo=?");
        $stmt->execute([$tipo]);
        $numero = $stmt->fetchColumn() + 1;

        $codigo = $pref . str_pad($numero, 3, "0", STR_PAD_LEFT);

        $sql = "
        INSERT INTO usuarios
        (codigo,nombre,tipo_identificacion,cedula,sexo,tipo,telefono,correo,carrera,semestre,cargo)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
        ";

        $stmt = $this->pdo->prepare($sql);
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

        return ["success" => true, "codigo" => $codigo];
    }

    // Agregar métodos para actualizar y eliminar si es necesario
}
?>