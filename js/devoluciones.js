// ===============================
// VERIFICAR AUTENTICACIÓN
// ===============================

const isLoggedIn = sessionStorage.getItem('isLoggedIn');
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (!isLoggedIn || !currentUser) {
    window.location.href = '../index.html';
}

document.getElementById('userName').textContent = currentUser.nombre;
document.getElementById('userRole').textContent = currentUser.rol;

document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '../index.html';
});

// ===============================
// FECHA / HORA COLOMBIA
// ===============================
function obtenerFechaHoraColombia() {
    return new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })
    );
}

// ===============================
// UTILIDADES TIEMPO USO (12h → 24h)
// ===============================
function toHM24(horaStr) {
    if (!horaStr) return { h: 0, m: 0 };
    const raw = horaStr.toUpperCase().trim();
    const isPM = raw.includes('PM');
    const isAM = raw.includes('AM');
    const solo = raw.replace(/[^0-9:]/g, '');

    let [h = 0, m = 0] = solo.split(':').map(Number);

    if (isPM && h !== 12) h += 12;
    if (isAM && h === 12) h = 0;

    return { h, m };
}

function to24h(hora12) {
    const { h, m } = toHM24(hora12);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

function to12h(hora24) {
    const [h, m] = hora24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ✅ CORREGIDO: buildDate ahora trabaja directamente en formato 24h (HH:MM o HH:MM:SS)
// sin pasar por conversiones 12h que causaban el error de las ~12 horas
function buildDate24(fecha, hora24) {
    const [y, mo, d] = fecha.split('-').map(Number);
    const partes = hora24.split(':').map(Number);
    const h = partes[0] || 0;
    const m = partes[1] || 0;
    return new Date(y, mo - 1, d, h, m, 0);
}

// Se mantiene buildDate para uso con horas en formato 12h (si se necesita en otro lado)
function buildDate(fecha, hora) {
    const [y, mo, d] = fecha.split('-').map(Number);
    const { h, m } = toHM24(hora);
    return new Date(y, mo - 1, d, h, m, 0);
}

function calcularTiempoUso(fecha, hInicio, hFin) {
    const ini = buildDate(fecha, hInicio);
    let fin = buildDate(fecha, hFin);
    if (fin < ini) fin.setDate(fin.getDate() + 1);

    const min = Math.round((fin - ini) / 60000);
    const h = Math.floor(min / 60);
    const m = min % 60;

    return `${h ? h + 'h ' : ''}${m}min`;
}

// ===============================
// REGISTRAR DEVOLUCIÓN (PHP)
// ===============================
function devolverMaterial(prestamoId) {
    fetch(`../controllers/prestamos_activos.php?id=${prestamoId}`)
        .then(res => res.json())
        .then(prestamo => {
            // ✅ CORREGIDO: Ya NO se convierte hora_prestamo a 12h
            // Se usa directamente el formato 24h que viene de la BD (ej: "14:30:00")

            const ahora = obtenerFechaHoraColombia();
            const fecha = ahora.toISOString().split('T')[0];

            let h = ahora.getHours();
            const m = String(ahora.getMinutes()).padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            const hora = `${h}:${m} ${ampm}`;

            Swal.fire({
                title: 'Registrar devolución',
                html: `
                    <p><b>Usuario:</b> ${prestamo.usuario_nombre}</p>
                    <p><b>Material:</b> ${prestamo.material_titulo}</p>
                    <p><b>Tipo:</b> ${prestamo.tipo_prestamo}</p>
                    <p><b>Fecha devolución:</b> ${fecha}</p>
                    ${prestamo.tipo_prestamo === 'Interno'
                        ? `<p><b>Hora devolución:</b> ${hora}</p>`
                        : ''
                    }
                `,
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar'
            }).then(res => {
                if (!res.isConfirmed) return;

                // Calcular días de atraso
                const fechaDevEsperada = new Date(prestamo.fecha_devolucion + 'T00:00:00');
                const fechaDevReal = new Date(fecha + 'T00:00:00');

                let diasAtraso = 0;
                if (prestamo.tipo_prestamo === 'Interno') {
                    const diffDias = Math.ceil((fechaDevReal - new Date(prestamo.fecha_prestamo + 'T00:00:00')) / (1000 * 60 * 60 * 24));
                    if (diffDias > 0) {
                        diasAtraso = diffDias;
                    }
                } else {
                    const diffTime = fechaDevReal - fechaDevEsperada;
                    diasAtraso = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                }

                // ✅ CORREGIDO: se usa buildDate24 con hora_prestamo directamente en 24h
                // Antes: buildDate(prestamo.fecha_prestamo, prestamo.hora_prestamo_12)
                // Ese camino convertía 24h → 12h → 24h, y si la hora no tenía AM/PM
                // toHM24 la interpretaba siempre como AM, sumando hasta 12h de error.
                let tiempo_uso = '';

                if (prestamo.tipo_prestamo === 'Interno') {
                    // Internos: medir desde la hora exacta del préstamo hasta ahora
                    const inicio = buildDate24(prestamo.fecha_prestamo, prestamo.hora_prestamo);
                    const fin = obtenerFechaHoraColombia();
                    const totalMin = Math.round((fin - inicio) / 60000);
                    const totalH = Math.floor(totalMin / 60);
                    const minRestantes = totalMin % 60;
                    const diasUso = Math.floor(totalH / 24);
                    const horasUso = totalH % 24;

                    if (diasUso > 0) {
                        tiempo_uso = `${diasUso} días ${horasUso}h ${minRestantes}min`;
                    } else if (horasUso > 0) {
                        tiempo_uso = `${horasUso}h ${minRestantes}min`;
                    } else {
                        tiempo_uso = `${minRestantes}min`;
                    }
                } else {
                    // Externos: solo días calendario (la hora no se registra → sería 00:00:00 siempre)
                    const fechaInicio = new Date(prestamo.fecha_prestamo + 'T00:00:00');
                    const fechaHoy = new Date(fecha + 'T00:00:00');
                    const diasUso = Math.ceil((fechaHoy - fechaInicio) / (1000 * 60 * 60 * 24));
                    tiempo_uso = diasUso <= 1 ? '1 día' : `${diasUso} días`;
                }
                const payload = {
                    prestamo_id: prestamo.id,
                    usuario_cedula: prestamo.usuario_cedula,
                    usuario: prestamo.usuario_nombre,
                    material: prestamo.material_titulo,
                    tipo_prestamo: prestamo.tipo_prestamo,
                    fecha_prestamo: prestamo.fecha_prestamo,
                    fecha_devolucion_real: fecha,
                    hora_prestamo: prestamo.hora_prestamo,
                    hora_devolucion: prestamo.tipo_prestamo === 'Interno' ? to24h(hora) : '00:00:00',
                    tiempo_uso: tiempo_uso,
                    dias_atraso: diasAtraso,
                    recibido_por: currentUser.nombre
                };

                fetch('../controllers/devoluciones.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then(res => res.json())
                    .then(resp => {
                        if (resp.error) {
                            Swal.fire('Error', resp.error, 'error');
                        } else {
                            Swal.fire('Éxito', 'Devolución registrada', 'success');
                            loadPrestamosActivos();
                            loadDevoluciones();
                        }
                    })
                    .catch(error => {
                        Swal.fire('Error', 'No se pudo registrar la devolución', 'error');
                        console.error(error);
                    });
            });
        })
        .catch(error => {
            Swal.fire('Error', 'No se pudo cargar la información del préstamo', 'error');
            console.error(error);
        });
}

window.devolverMaterial = devolverMaterial;

let devolucionesData = [];
let historyCurrentPage = 1;
const historyRowsPerPage = 5;
const devolucionesPagination = document.getElementById('pagination');

// ===============================
// PRÉSTAMOS ACTIVOS (PHP)
// ===============================
function loadPrestamosActivos() {
    fetch('../controllers/prestamos_activos.php')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('prestamosActivosTable');

            if (!data.length) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-message">
                            No hay préstamos activos
                        </td>
                    </tr>`;
                return;
            }

            tbody.innerHTML = data.map(p => `
                <tr>
                    <td>${p.usuario_cedula}</td>
                    <td>${p.usuario_nombre}</td>
                    <td>${p.material_titulo}</td>
                    <td>${p.tipo_prestamo}</td>
                    <td>${p.fecha_prestamo}</td>
                    <td>${p.fecha_devolucion}</td>
                    <td>
                        <button class="btn-devolver" onclick="devolverMaterial(${p.id})">
                            Devolver
                        </button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error(err);
        });
}

// ===============================
// HISTORIAL DEVOLUCIONES (PHP)
// ===============================
function loadDevoluciones() {
    fetch('../controllers/devoluciones.php')
        .then(res => res.json())
        .then(data => {
            devolucionesData = Array.isArray(data) ? data : [];
            historyCurrentPage = 1;
            renderHistorialDevoluciones();
        })
        .catch(error => {
            console.error('Error al cargar devoluciones:', error);
            const tbody = document.getElementById('devolucionesTable');
            tbody.innerHTML = `<tr><td colspan="8" class="empty-message">Error al cargar devoluciones</td></tr>`;
            devolucionesPagination.innerHTML = '';
        });
}

function renderHistorialDevoluciones() {
    const tbody = document.getElementById('devolucionesTable');
    const countSpan = document.getElementById('devolucionCount');
    const total = devolucionesData.length;
    const totalPages = Math.max(1, Math.ceil(total / historyRowsPerPage));
    historyCurrentPage = Math.min(Math.max(1, historyCurrentPage), totalPages);

    countSpan.textContent = total;

    if (!total) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-message">No hay devoluciones registradas</td></tr>`;
        devolucionesPagination.innerHTML = '';
        return;
    }

    const start = (historyCurrentPage - 1) * historyRowsPerPage;
    const pageItems = devolucionesData.slice(start, start + historyRowsPerPage);

    tbody.innerHTML = pageItems.map(d => {
        const diasAtraso = d.dias_atraso || 0;
        const estado = diasAtraso > 0
            ? `<span style="color: #dc3545; font-weight: bold;">Atrasado</span>`
            : '<span style="color: #28a745; font-weight: bold;">A tiempo</span>';

        return `
            <tr>
                <td>${d.usuario_cedula || 'N/A'}</td>
                <td>${d.usuario || 'N/A'}</td>
                <td>${d.material || 'N/A'}</td>
                <td>${d.tipo_prestamo || 'N/A'}</td>
                <td>${d.fecha_prestamo || 'N/A'}</td>
                <td>${d.fecha_devolucion_real || 'N/A'}</td>
                <td>${d.tiempo_uso || '-'}</td>
                <td>${estado}</td>
            </tr>
        `;
    }).join('');

    devolucionesPagination.innerHTML = `
        <button class="pagination-btn" ${historyCurrentPage === 1 ? 'disabled' : ''} onclick="changeHistoryPage(${historyCurrentPage - 1})">Anterior</button>
        <span class="pagination-info">${historyCurrentPage}/${totalPages}</span>
        <button class="pagination-btn" ${historyCurrentPage === totalPages ? 'disabled' : ''} onclick="changeHistoryPage(${historyCurrentPage + 1})">Siguiente</button>
    `;
}

function changeHistoryPage(page) {
    historyCurrentPage = page;
    renderHistorialDevoluciones();
}

// ===============================
// BÚSQUEDA EN TIEMPO REAL
// ===============================
document.getElementById('searchInput').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#prestamosActivosTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// ===============================
// GENERAR PDF
// ===============================
document.getElementById('btnGenerarPDFDevoluciones').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Historial de Devoluciones', 14, 20);

    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 28);

    fetch('../controllers/devoluciones.php')
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                Swal.fire('Info', 'No hay devoluciones para exportar', 'info');
                return;
            }

            const tableData = data.map(d => [
                d.usuario_cedula || 'N/A',
                d.usuario || 'N/A',
                d.material || 'N/A',
                d.tipo_prestamo || 'N/A',
                d.fecha_prestamo || 'N/A',
                d.fecha_devolucion_real || 'N/A',
                d.tiempo_uso || '-',
                (d.dias_atraso || 0) > 0 ? `Atrasado (${d.dias_atraso}d)` : 'A tiempo'
            ]);

            doc.autoTable({
                startY: 35,
                head: [['Cédula', 'Nombre', 'Material', 'Tipo', 'F. Préstamo', 'F. Devolución', 'Tiempo Uso', 'Estado']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 8 }
            });

            doc.save(`devoluciones_${new Date().toISOString().split('T')[0]}.pdf`);
            Swal.fire('Éxito', 'PDF generado correctamente', 'success');
        })
        .catch(error => {
            Swal.fire('Error', 'No se pudo generar el PDF', 'error');
            console.error(error);
        });
});

// ===============================
// INICIAL
// ===============================
loadPrestamosActivos();
loadDevoluciones();