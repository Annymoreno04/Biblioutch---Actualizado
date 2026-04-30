<?php
header('Content-Type: application/json');
require 'conexion.php';

// Estadísticas de inventario
$stmt = $pdo->query("SELECT COUNT(*) as total FROM materiales");
$totalMateriales = $stmt->fetch()['total'];

$stmt = $pdo->query("SELECT SUM(ejemplares) as disponibles FROM materiales WHERE disponible = 1");
$result = $stmt->fetch();
$materialesDisponibles = $result['disponibles'] ?? 0;

$materialesPrestados = $totalMateriales - $materialesDisponibles;

$stmt = $pdo->query("SELECT tipo, COUNT(*) as count FROM materiales GROUP BY tipo");
$tipos = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
$totalLibros = $tipos['Libro'] ?? 0;
$totalTesis = $tipos['Tesis'] ?? 0;
$totalRevistas = $tipos['Revista'] ?? 0;

// Estadísticas de usuarios
$stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
$totalUsuarios = $stmt->fetch()['total'];

$stmt = $pdo->query("SELECT tipo, COUNT(*) as count FROM usuarios GROUP BY tipo");
$tiposUsuario = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
$totalEstudiantes = $tiposUsuario['Estudiante'] ?? 0;
$totalDocentes = $tiposUsuario['Docente'] ?? 0; // Asumiendo 'Docente' como docente
$totalAdministrativos = $tiposUsuario['Administrativo'] ?? 0;

// Estadísticas de préstamos
$stmt = $pdo->query("SELECT COUNT(*) as total FROM prestamos");
$totalPrestamos = $stmt->fetch()['total'];

$stmt = $pdo->query("SELECT estado, COUNT(*) as count FROM prestamos GROUP BY estado");
$estadosPrestamo = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
$prestamosActivos = $estadosPrestamo['Activo'] ?? 0;
$prestamosDevueltos = $estadosPrestamo['Devuelto'] ?? 0;

$stmt = $pdo->query("SELECT tipo_prestamo, COUNT(*) as count FROM prestamos GROUP BY tipo_prestamo");
$tiposPrestamo = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
$prestamosExternos = $tiposPrestamo['Externo'] ?? 0;
$prestamosInternos = $tiposPrestamo['Interno'] ?? 0;

// Préstamos atrasados (activos con fecha_devolucion < hoy)
$stmt = $pdo->query("SELECT COUNT(*) as atrasados FROM prestamos WHERE estado = 'Activo' AND fecha_devolucion < CURDATE()");
$prestamosAtrasados = $stmt->fetch()['atrasados'];

// Estadísticas de devoluciones
$stmt = $pdo->query("SELECT COUNT(*) as total FROM devoluciones");
$totalDevoluciones = $stmt->fetch()['total'];

$stmt = $pdo->query("SELECT COUNT(*) as a_tiempo FROM devoluciones WHERE dias_atraso = 0");
$devolucionesATiempo = $stmt->fetch()['a_tiempo'];

$devolucionesAtrasadas = $totalDevoluciones - $devolucionesATiempo;

echo json_encode([
    'inventario' => [
        'totalMateriales' => $totalMateriales,
        'materialesDisponibles' => $materialesDisponibles,
        'totalLibros' => $totalLibros,
        'totalTesis' => $totalTesis,
        'totalRevistas' => $totalRevistas
    ],
    'usuarios' => [
        'totalUsuarios' => $totalUsuarios,
        'totalEstudiantes' => $totalEstudiantes,
        'totalDocentes' => $totalDocentes,
        'totalAdministrativos' => $totalAdministrativos
    ],
    'prestamos' => [
        'totalPrestamos' => $totalPrestamos,
        'prestamosActivos' => $prestamosActivos,
        'prestamosDevueltos' => $prestamosDevueltos,
        'prestamosAtrasados' => $prestamosAtrasados,
        'prestamosExternos' => $prestamosExternos,
        'prestamosInternos' => $prestamosInternos
    ],
    'devoluciones' => [
        'totalDevoluciones' => $totalDevoluciones,
        'devolucionesATiempo' => $devolucionesATiempo,
        'devolucionesAtrasadas' => $devolucionesAtrasadas
    ]
]);
?>