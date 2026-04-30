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

// Funciones de almacenamiento
function getData(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

// Cargar todas las estadísticas
async function loadAllStats() {
    try {
        const response = await fetch('../controllers/reportes.php');
        const data = await response.json();
        
        // Inventario
        document.getElementById('totalMateriales').textContent = data.inventario.totalMateriales;
        document.getElementById('materialesDisponibles').textContent = data.inventario.materialesDisponibles;
        document.getElementById('totalLibros').textContent = data.inventario.totalLibros;
        document.getElementById('totalTesis').textContent = data.inventario.totalTesis;
        document.getElementById('totalRevistas').textContent = data.inventario.totalRevistas;
        
        // Usuarios
        document.getElementById('totalUsuarios').textContent = data.usuarios.totalUsuarios;
        document.getElementById('totalEstudiantes').textContent = data.usuarios.totalEstudiantes;
        document.getElementById('totalDocentes').textContent = data.usuarios.totalDocentes;
        document.getElementById('totalAdministrativos').textContent = data.usuarios.totalAdministrativos;
        
        // Préstamos
        document.getElementById('totalPrestamos').textContent = data.prestamos.totalPrestamos;
        document.getElementById('prestamosActivos').textContent = data.prestamos.prestamosActivos;
        document.getElementById('prestamosDevueltos').textContent = data.prestamos.prestamosDevueltos;
        document.getElementById('prestamosAtrasados').textContent = data.prestamos.prestamosAtrasados;
        document.getElementById('prestamosExternos').textContent = data.prestamos.prestamosExternos;
        document.getElementById('prestamosInternos').textContent = data.prestamos.prestamosInternos;
        
        // Devoluciones
        document.getElementById('totalDevoluciones').textContent = data.devoluciones.totalDevoluciones;
        document.getElementById('devolucionesATiempo').textContent = data.devoluciones.devolucionesATiempo;
        document.getElementById('devolucionesAtrasadas').textContent = data.devoluciones.devolucionesAtrasadas;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Cargar materiales más prestados
async function loadMaterialesMasPrestados() {
    try {
        const response = await fetch('../controllers/materiales_mas_prestados.php');
        const materiales = await response.json();
        const tbody = document.getElementById('materialesMasPrestadosTable');
        
        if (materiales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No hay datos disponibles</td></tr>';
            return;
        }
        
        tbody.innerHTML = materiales.map(item => `
            <tr>
                <td>${item.titulo}</td>
                <td>${item.autor || 'N/A'}</td>
                <td>${item.tipo}</td>
                <td><strong>${item.total_prestamos}</strong></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error cargando materiales más prestados:', error);
    }
}

// Cargar materiales más prestados
async function loadMaterialesMasPrestados() {
    try {
        const response = await fetch('../controllers/materiales_mas_prestados.php');
        const materiales = await response.json();
        const tbody = document.getElementById('materialesMasPrestadosTable');
        
        if (materiales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No hay datos disponibles</td></tr>';
            return;
        }
        
        tbody.innerHTML = materiales.map(item => `
            <tr>
                <td>${item.titulo}</td>
                <td>${item.autor || 'N/A'}</td>
                <td>${item.tipo}</td>
                <td><strong>${item.total_prestamos}</strong></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error cargando materiales más prestados:', error);
    }
}

// Cargar todas las estadísticas al inicio
(async () => {
    await loadAllStats();
    await loadMaterialesMasPrestados();
})();

// Actualizar cada 10 segundos
setInterval(async () => {
    await loadAllStats();
    await loadMaterialesMasPrestados();
}, 10000);

// ===================== CHARTS (DOM -> Chart.js) =====================

// Registro local de instancias Chart.js
const charts = {};

// Utilidad para leer enteros desde elementos por ID
function safeInt(id) {
  const el = document.getElementById(id);
  return el ? parseInt((el.textContent || '').replace(/\D+/g, ''), 10) || 0 : 0;
}

// Extrae "Top materiales más prestados" desde la tabla del DOM
function extractTopMaterialesFromTable() {
  const rows = Array.from(document.querySelectorAll('#materialesMasPrestadosTable tr'));
  const labels = [];
  const data = [];

  for (const tr of rows) {
    const tds = tr.querySelectorAll('td');
    if (tds.length !== 4) continue;
    const titulo = tds[0].textContent.trim();
    const countTxt = tds[3].textContent.trim();
    if (!titulo || /No hay datos/i.test(titulo)) continue;
    const count = parseInt(countTxt.replace(/\D+/g, ''), 10) || 0;
    labels.push(titulo);
    data.push(count);
  }

  return { labels, data };
}

// Totales por tipo de usuario desde indicadores
function extractUsuariosTipoFromDOM() {
  return {
    labels: ['Estudiantes', 'Docentes', 'Administrativos'],
    data: [safeInt('totalEstudiantes'), safeInt('totalDocentes'), safeInt('totalAdministrativos')]
  };
}

// Totales de préstamos por estado desde indicadores
function extractPrestamosEstadoFromDOM() {
  return {
    labels: ['Activos', 'Devueltos', 'Atrasados'],
    data: [safeInt('prestamosActivos'), safeInt('prestamosDevueltos'), safeInt('prestamosAtrasados')]
  };
}

// Totales de préstamos por tipo desde indicadores
function extractPrestamosTipoFromDOM() {
  return {
    labels: ['Interno', 'Externo'],
    data: [safeInt('prestamosInternos'), safeInt('prestamosExternos')]
  };
}

// Totales de devoluciones desde indicadores
function extractDevolucionesFromDOM() {
  return {
    labels: ['A tiempo', 'Con atraso'],
    data: [safeInt('devolucionesATiempo'), safeInt('devolucionesAtrasadas')]
  };
}

// Crea o actualiza una instancia de gráfico
function createOrUpdateChart(key, type, ctxEl, data, options = {}) {
  if (!ctxEl || typeof Chart === 'undefined') return;
  if (charts[key]) {
    charts[key].data = data;
    charts[key].options = options;
    charts[key].update();
    return charts[key];
  }
  charts[key] = new Chart(ctxEl, { type, data, options });
  return charts[key];
}

// Paleta
const palette = {
  primary: '#f59e0b',  // amarillo
  secondary: '#6366f1',
  green: '#10b981',
  blue: '#3b82f6',
  red: '#ef4444',
  cyan: '#06b6d4',
  gray: '#9ca3af'
};

// Opciones base responsivas
function baseOptions({ legend = 'bottom', isStacked = false } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 100 },
    plugins: {
      legend: { position: legend },
      tooltip: { enabled: true }
    },
    scales: isStacked
      ? {
          x: { stacked: true, ticks: { autoSkip: true, maxRotation: 0 } },
          y: { stacked: true, beginAtZero: true }
        }
      : {
          x: { ticks: { autoSkip: true, maxRotation: 0 } },
          y: { beginAtZero: true }
        }
  };
}

// Construye/actualiza todos los gráficos
function updateAllCharts() {
  // Top materiales (barras horizontales) — desde la tabla
  const topMat = extractTopMaterialesFromTable();
  const ctxTop = document.getElementById('chartTopMateriales');
  createOrUpdateChart(
    'chartTopMateriales',
    'bar',
    ctxTop,
    {
      labels: topMat.labels,
      datasets: [{
        label: 'Veces prestado',
        data: topMat.data,
        backgroundColor: topMat.data.map((_, i) => i % 2 ? palette.secondary : palette.primary),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    { ...baseOptions(), indexAxis: 'y' }
  );

  // Devoluciones (dona)
  const devol = extractDevolucionesFromDOM();
  const ctxDevol = document.getElementById('chartDevoluciones');
  createOrUpdateChart(
    'chartDevoluciones',
    'doughnut',
    ctxDevol,
    {
      labels: devol.labels,
      datasets: [{ data: devol.data, backgroundColor: [palette.green, palette.red], hoverOffset: 8 }]
    },
    { ...baseOptions({ legend: 'bottom' }), cutout: '55%' }
  );
}

// Sincroniza con el ciclo existente y con cambios en el DOM
(function setupChartsLifecycle() {
  // Actualiza al inicio
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAllCharts);
  } else {
    updateAllCharts();
  }

  // Observa cambios en la tabla y contadores
  const main = document.querySelector('main');
  if (main && 'MutationObserver' in window) {
    const obs = new MutationObserver(() => {
      requestAnimationFrame(updateAllCharts);
    });
    obs.observe(main, { childList: true, subtree: true, characterData: true });
  }

  // Sincronización con la carga de datos
  setInterval(updateAllCharts, 10500); // Ligeramente después del intervalo de carga de datos
})();