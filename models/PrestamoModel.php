<?php
require_once '../controllers/conexion.php';

class PrestamoModel {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("
            SELECT p.*, 
                   u.nombre AS usuario_nombre,
                   m.titulo AS material_titulo
            FROM prestamos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN materiales m ON p.material_id = m.id
            ORDER BY p.id DESC
        ");
            $stmt = $this->pdo->query("
                SELECT p.*, 
                       u.cedula AS usuario_cedula,
                       u.nombre AS usuario,
                       m.titulo AS material
                FROM prestamos p
                JOIN usuarios u ON p.usuario_id = u.id
                JOIN materiales m ON p.material_id = m.id
                ORDER BY p.id DESC
            ");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        if (
            empty($data['usuario_id']) ||
            empty($data['material_id']) ||
            empty($data['tipo_prestamo'])
        ) {
            return ["error" => "Datos incompletos"];
        }

        // Verificar material
        $stmt = $this->pdo->prepare("SELECT * FROM materiales WHERE id=?");
        $stmt->execute([$data['material_id']]);
        $material = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$material || $material['ejemplares'] <= 0) {
            return ["error" => "Material no disponible"];
        }

        // Calcular fecha y hora en zona America/Bogota
        
        $tz = new DateTimeZone('America/Bogota');
        $dt = new DateTime('now', $tz);
        $fechaPrestamo = $dt->format('Y-m-d');
        $horaPrestamo  = $dt->format('h:i A');

        if ($data['tipo_prestamo'] === 'Externo') {
            $fechaDev = $this->addBusinessDays($fechaPrestamo, 8);
        } else {
            $fechaDev = $fechaPrestamo;
        }

        // Insertar préstamo
        $stmt = $this->pdo->prepare("
            INSERT INTO prestamos 
            (usuario_id, material_id, tipo_prestamo, fecha_prestamo, hora_prestamo, fecha_devolucion, estado)
            VALUES (?,?,?,?,?,?,?)
        ");

        $stmt->execute([
            $data['usuario_id'],
            $data['material_id'],
            $data['tipo_prestamo'],
            $fechaPrestamo,
            $horaPrestamo,
            $fechaDev,
            'Activo'
        ]);

        $lastId = $this->pdo->lastInsertId();

        // Descontar ejemplar
        $this->pdo->prepare("
            UPDATE materiales SET ejemplares = ejemplares - 1 WHERE id=?
        ")->execute([$data['material_id']]);

        // Recuperar fila guardada para devolver al cliente (coherencia con BD)
        $stmt2 = $this->pdo->prepare(
            "SELECT p.*, u.cedula AS usuario_cedula, u.nombre AS usuario, m.titulo AS material
             FROM prestamos p
             JOIN usuarios u ON p.usuario_id = u.id
             JOIN materiales m ON p.material_id = m.id
             WHERE p.id = ?"
        );
        $stmt2->execute([$lastId]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);

        return [
            "success" => true,
            "id" => $lastId,
            "data" => $row
        ];
    }

    // Suma días hábiles (excluye sábados, domingos y festivos) a una fecha YYYY-MM-DD
    private function addBusinessDays($startDate, $days) {
        // Lista de festivos (YYYY-MM-DD) - editar según la política local
        $holidays = [
            // '2026-01-01',
            // '2026-01-06',
        ];

        $dt = new DateTime($startDate);
        $added = 0;
        while ($added < $days) {
            // avanzar al siguiente día
            $dt->modify('+1 day');
            $w = (int)$dt->format('w'); // 0 (Sun) .. 6 (Sat)
            $dstr = $dt->format('Y-m-d');
            // saltar sábados (6), domingos (0) y festivos
            if ($w !== 0 && $w !== 6 && !in_array($dstr, $holidays)) {
                $added++;
            }
        }
        return $dt->format('Y-m-d');
    }

    public function delete($id) {
        if (!$id) {
            return ["error" => "ID requerido"];
        }

        // Devolver ejemplar
        $stmt = $this->pdo->prepare("SELECT material_id FROM prestamos WHERE id=?");
        $stmt->execute([$id]);
        $prestamo = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($prestamo) {
            $this->pdo->prepare("
                UPDATE materiales SET ejemplares = ejemplares + 1 WHERE id=?
            ")->execute([$prestamo['material_id']]);
        }

        $this->pdo->prepare("DELETE FROM prestamos WHERE id=?")->execute([$id]);

        return ["success" => true];
    }
}
?>