<?php
require_once '../controllers/conexion.php';

class MaterialModel {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM materiales ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO materiales 
            (codigo, titulo, autor, anio, idioma, tipo, categoria, ejemplares, disponible)
            VALUES (?,?,?,?,?,?,?,?,1)
        ");
        $stmt->execute([
            $data['codigo'],
            $data['titulo'],
            $data['autor'],
            $data['anio'],
            $data['idioma'],
            $data['tipo'],
            $data['categoria'],
            $data['ejemplares']
        ]);
        return ['success' => true];
    }

    public function update($id, $data) {
        // Si ejemplares llega a 0, marcar como no disponible (Agotado)
        $disponible = $data['ejemplares'] > 0 ? 1 : 0;
        
        $stmt = $this->pdo->prepare("
            UPDATE materiales SET
            titulo=?, autor=?, anio=?, idioma=?, tipo=?, categoria=?, ejemplares=?, disponible=?
            WHERE id=?
        ");
        $stmt->execute([
            $data['titulo'],
            $data['autor'],
            $data['anio'],
            $data['idioma'],
            $data['tipo'],
            $data['categoria'],
            $data['ejemplares'],
            $disponible,
            $id
        ]);
        return ['success' => true];
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM materiales WHERE id=?");
        $stmt->execute([$id]);
        return ['success' => true];
    }
}
?>