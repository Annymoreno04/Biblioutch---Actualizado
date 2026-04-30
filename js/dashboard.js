// Verificar autenticación
const isLoggedIn = sessionStorage.getItem('isLoggedIn');
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (!isLoggedIn || !currentUser) {
    window.location.href = '../index.html';
}

// Mostrar información del usuario
document.getElementById('userName').textContent = currentUser.nombre;
document.getElementById('userRole').textContent = currentUser.rol;

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
    Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then(res => {
        if (res.isConfirmed) {
            sessionStorage.clear();
            window.location.href = '../index.html';
        }
    });
});

// Obtener datos del localStorage
function getData(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

// Cargar estadísticas
async function loadStats() {
    try {
        const response = await fetch('../controllers/dashboard_stats.php');
        const data = await response.json();
        
        document.getElementById('prestamosActivos').textContent = data.prestamosActivos;
        document.getElementById('prestamosAtrasados').textContent = data.prestamosAtrasados;
        document.getElementById('materialesDisponibles').textContent = data.materialesDisponibles;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Cargar préstamos recientes
async function loadRecentLoans() {
    try {
        const response = await fetch('../controllers/prestamos.php');
        const prestamos = await response.json();
        const tbody = document.getElementById('prestamosTable');
        
        if (prestamos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No hay préstamos registrados</td></tr>';
            return;
        }
        
        // Mostrar los últimos 5 préstamos
        const recentLoans = prestamos.slice(0, 5);
        
        tbody.innerHTML = recentLoans.map(prestamo => {
            const estadoBadge = prestamo.estado === 'Activo' 
                ? '<span class="badge badge-active">Activo</span>' 
                : '<span class="badge badge-completed">Devuelto</span>';
            
            return `
                <tr>
                    <td>${prestamo.usuario}</td>
                    <td>${prestamo.material}</td>
                    <td>${prestamo.tipo_prestamo}</td>
                    <td>${prestamo.fecha_devolucion}</td>
                    <td>${estadoBadge}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error cargando préstamos recientes:', error);
    }
}

// Cargar datos al inicio
(async () => {
    await loadStats();
    await loadRecentLoans();
})();

// Actualizar datos cada 5 segundos
setInterval(async () => {
    await loadStats();
    await loadRecentLoans();
}, 5000);