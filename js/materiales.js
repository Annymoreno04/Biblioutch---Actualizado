// ==============================
// 🔐 Verificar autenticación
// ==============================

const isLoggedIn = sessionStorage.getItem('isLoggedIn');
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!isLoggedIn || !currentUser) window.location.href = '../index.html';

document.getElementById('userName').textContent = currentUser.nombre;
document.getElementById('userRole').textContent = currentUser.rol;

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

// ==============================
// ❌ LocalStorage (DESACTIVADO)
// ==============================

// function getData(key, def = []) { ... }
// function setData(key, val) { ... }

// ==============================
// 📦 Datos en memoria
// ==============================

let materiales = [];
let currentPage = 1;
const rowsPerPage = 5;
const pagination = document.getElementById('pagination');

// ==============================
// 🔥 Cargar materiales desde BD
// ==============================

async function loadMaterials() {
    const res = await fetch('../controllers/materiales.php');
    materiales = await res.json();

    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = materiales.filter(m =>
        m.titulo.toLowerCase().includes(search) ||
        m.autor.toLowerCase().includes(search) ||
        m.codigo.toLowerCase().includes(search)
    );

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    renderTable(filtered);
}

function renderPagination(total) {
    const totalPages = Math.ceil(total / rowsPerPage);
    pagination.innerHTML = `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Anterior</button>
        <span class="pagination-info">${currentPage}/${totalPages}</span>
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Siguiente</button>
    `;
}

function changePage(page) {
    currentPage = page;
    loadMaterials();
}

function renderTable(filtered) {
    const tbody = document.getElementById('materialsTable');
    const total = filtered.length;
    document.getElementById('materialCount').textContent = total;

    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);

    if (!paginated.length) {
        tbody.innerHTML = `<tr><td colspan="9">No hay materiales registrados</td></tr>`;
        pagination.innerHTML = '';
        return;
    }

    tbody.innerHTML = paginated.map(m => `
        <tr>
            <td><strong>${m.codigo}</strong></td>
            <td>${m.titulo}</td>
            <td>${m.autor}</td>
            <td>${m.anio}</td>
            <td>${m.tipo}</td>
            <td>${m.categoria || '-'}</td>
            <td>${m.ejemplares}</td>
            <td>${m.ejemplares == 0 ? 'Agotado' : (m.disponible == 1 ? 'Disponible' : 'Prestado')}</td>
            <td class="actions">
                <button class="action-btn view" onclick="verMaterial(${m.id})" title="Ver">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                </button>
                <button class="action-btn edit" onclick="editarMaterial(${m.id})" title="Editar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="action-btn delete" onclick="eliminarMaterial(${m.id})" title="Eliminar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(total);
}

// ==============================
// ➕ Registrar material
// ==============================

document.getElementById('showFormBtn').addEventListener('click', () => {
    const formContainer = document.getElementById('materialFormContainer');
    Swal.fire({
        title: 'Registrar Nuevo Material',
        html: formContainer.innerHTML,
        width: 600,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const form = Swal.getHtmlContainer().querySelector('form');
            form.addEventListener('submit', e => e.preventDefault());
        },

        preConfirm: async () => {
            const get = id => Swal.getPopup().querySelector(`#${id}`).value.trim();

            const tipo = get('tipo'); // tipo seleccionado (Libro, Tesis, Revista, etc.)

            // Definir prefijo según tipo
            const prefijos = {
                'Libro': 'LIB',
                'Tesis': 'TES',
                'Revista': 'REV',
                'Otro': 'MAT'
            };
            const prefijo = prefijos[tipo] || 'MAT';

            // Filtrar materiales del mismo tipo para contar
            const delTipo = materiales.filter(m => m.tipo === tipo);
            const numero = (delTipo.length + 1).toString().padStart(3, '0'); // ej: 001, 002, 003
            const codigoGenerado = `${prefijo}${numero}`;

            // Crear nuevo material
            const nuevoMaterial = {
                titulo: get('titulo'),
                autor: get('autor'),
                anio: get('anio'),
                idioma: get('idioma'),
                tipo: tipo,
                categoria: get('categoria'), // 🆕 Nuevo campo agregado
                codigo: codigoGenerado, // ← generado automáticamente
                ejemplares: parseInt(get('ejemplares')),
                disponible: true
            };

            if (!nuevoMaterial.titulo || !nuevoMaterial.autor) {
                Swal.showValidationMessage('⚠️ Todos los campos obligatorios deben llenarse');
                return false;
            }

            await fetch('../controllers/materiales.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoMaterial)
            });

            loadMaterials();

            Swal.fire({
                icon: 'success',
                title: 'Material registrado',
                text: `Código asignado: ${codigoGenerado}`,
                confirmButtonColor: '#2563eb'
            });
        }

    });
});

// ==============================
// ✏️ Editar material
// ==============================

async function editarMaterial(id) {
    const mat = materiales.find(m => m.id === id);
    if (!mat) return;

    Swal.fire({
        title: 'Editar Material',
        html: `
      <form id="editForm" class="form-grid">
        <input type="text" id="titulo" value="${mat.titulo}" placeholder="Título *" required class="form-input">
        <input type="text" id="autor" value="${mat.autor}" placeholder="Autor *" required class="form-input">
        <input type="number" id="anio" value="${mat.anio}" placeholder="Año de publicación *" required class="form-input">
        <select id="idioma" class="form-input">
          <option value="es" ${mat.idioma === 'es' ? 'selected' : ''}>Español</option>
          <option value="en" ${mat.idioma === 'en' ? 'selected' : ''}>Inglés</option>
          <option value="fr" ${mat.idioma === 'fr' ? 'selected' : ''}>Francés</option>
        </select>
        <input type="text" id="codigo" value="${mat.codigo}" placeholder="Código *" required class="form-input">
        <select id="tipo" class="form-input">
          <option value="Libro" ${mat.tipo === 'Libro' ? 'selected' : ''}>Libro</option>
          <option value="Tesis" ${mat.tipo === 'Tesis' ? 'selected' : ''}>Tesis</option>
          <option value="Revista" ${mat.tipo === 'Revista' ? 'selected' : ''}>Revista</option>
        </select>
        <input type="text" id="categoria" value="${mat.categoria}" placeholder="Categoría *" required class="form-input">
        <input type="number" id="ejemplares" value="${mat.ejemplares}" placeholder="Número de ejemplares *" min="0" required class="form-input">
      </form>
    `,
        width: 600,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: async () => {
            const get = id => Swal.getPopup().querySelector(`#${id}`).value.trim();
            const actualizado = {
                ...mat,
                titulo: get('titulo'),
                autor: get('autor'),
                anio: get('anio'),
                idioma: get('idioma'),
                codigo: get('codigo'),
                tipo: get('tipo'),
                categoria: get('categoria'),
                ejemplares: parseInt(get('ejemplares'))
            };

            if (!actualizado.titulo || !actualizado.autor || !actualizado.codigo) {
                Swal.showValidationMessage('⚠️ Todos los campos obligatorios deben llenarse');
                return false;
            }

            // Actualizar en la base de datos
            await fetch('../controllers/materiales.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, ...actualizado })
            });

            loadMaterials();

            Swal.fire('Actualizado', 'El material se modificó correctamente', 'success');
        }
    });
}

// ==============================
// 🗑️ Eliminar material
// ==============================

async function eliminarMaterial(id) {
    Swal.fire({
        title: '¿Eliminar material?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async res => {
        if (res.isConfirmed) {
            await fetch('../controllers/materiales.php', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id })
            });
            loadMaterials();
            Swal.fire('Eliminado', 'El material fue eliminado.', 'success');
        }
    });
}

// ==============================
// 👁️ Ver material
// ==============================

function verMaterial(id) {
    const mat = materiales.find(m => m.id === id);
    if (mat) {
        Swal.fire({
            title: mat.titulo,
            html: `
        <p><b>Autor:</b> ${mat.autor}</p>
        <p><b>Año:</b> ${mat.anio}</p>
        <p><b>Idioma:</b> ${mat.idioma}</p>
        <p><b>Código:</b> ${mat.codigo}</p>
        <p><b>Ejemplares:</b> ${mat.ejemplares}</p>
        <p><b>Tipo:</b> ${mat.tipo}</p>
        <p><b>Categoria:</b> ${mat.categoria}</p>
      `,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    }
}

// ==============================
// 🔢 Generar código automático
// ==============================

function generarCodigo(tipo) {
    const prefijos = { Libro: 'LIB', Tesis: 'TES', Revista: 'REV' };
    const count = materiales.filter(m => m.tipo === tipo).length + 1;
    return `${prefijos[tipo] || 'MAT'}${String(count).padStart(3, '0')}`;
}

document.getElementById('searchInput').addEventListener('input', loadMaterials);

loadMaterials();