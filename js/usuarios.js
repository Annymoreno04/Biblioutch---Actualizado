// ================== AUTENTICACIÓN ==================
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

// ================== CONFIG API ==================
const API = '../controllers/usuarios/';

// ================== ELEMENTOS DOM ==================
const usersTableBody = document.getElementById('usersTable');
const userCountElement = document.getElementById('userCount');
const searchUserInput = document.getElementById('searchUserInput');
const pagination = document.getElementById('pagination');
const showFormBtn = document.getElementById('showFormBtn');

// ================== PAGINACIÓN ==================
let currentPage = 1;
const rowsPerPage = 5;

// ================== UTILIDADES ==================
function filterAndPaginateUsers(users) {
    const searchTerm = searchUserInput.value.toLowerCase();
    const filtered = users.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm) ||
        u.cedula.toLowerCase().includes(searchTerm) ||
        u.codigo.toLowerCase().includes(searchTerm)
    );

    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);
    const start = (currentPage - 1) * rowsPerPage;
    return {
        paginated: filtered.slice(start, start + rowsPerPage),
        total: filtered.length
    };
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
    loadUsers();
}

// ================== LISTAR USUARIOS ==================
async function loadUsers() {
    const res = await fetch(API + 'listar.php');
    const usuarios = await res.json();

    const { paginated, total } = filterAndPaginateUsers(usuarios);
    userCountElement.textContent = total;

    if (!paginated.length) {
        usersTableBody.innerHTML = `<tr><td colspan="10" class="empty-message">No hay usuarios</td></tr>`;
        pagination.innerHTML = '';
        return;
    }

    usersTableBody.innerHTML = paginated.map(u => `
        <tr>
            <td><strong>${u.codigo}</strong></td>
            <td>${u.nombre}</td>
            <td>${u.tipo_identificacion}</td>
            <td>${u.cedula}</td>
            <td>${u.sexo}</td>
            <td>${u.tipo}</td>
            <td>${u.telefono}</td>
            <td>${u.correo}</td>
            <td>${u.tipo === 'Estudiante'
                ? `${u.carrera || 'N/A'} - Sem ${u.semestre || 'N/A'}`
                : u.cargo || 'N/A'}</td>
            <td class="actions">
                <button class="action-btn view" onclick="verUsuario(${u.id})" title="Ver">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                </button>
                <button class="action-btn edit" onclick="editarUsuario(${u.id})" title="Editar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="action-btn delete" onclick="eliminarUsuario(${u.id})" title="Eliminar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(total);
}

searchUserInput.addEventListener('input', () => {
    currentPage = 1;
    loadUsers();
});

// ================== CREAR USUARIO ==================
showFormBtn.addEventListener('click', () => {
    Swal.fire({
        title: 'Registrar Nuevo Usuario',
        html: `
            <form id="swalAddForm" class="form-grid">
                <input type="text" id="nombre" placeholder="Nombre completo *" required class="form-input">
                <select id="tipoIdentificacion" class="form-input" required>
                    <option value="" disabled selected>Tipo de Identificación *</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="Pasaporte">Pasaporte</option>
                </select>
                <input type="text" id="identificacion" placeholder="Identificación *" required class="form-input">
                <select id="sexo" class="form-input" required>
                    <option value="" disabled selected>Sexo *</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                </select>
                <select id="tipo" class="form-input" required>
                    <option value="" disabled selected>Tipo de Usuario *</option>
                    <option value="Estudiante">Estudiante</option>
                    <option value="Docente">Docente</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Externo">Externo</option>
                </select>
                <input type="tel" id="telefono" placeholder="Teléfono/Número *" required class="form-input">
                <input type="email" id="correo" placeholder="Correo Electrónico *" required class="form-input">

                <div id="estudianteFields" class="estudiante-fields hidden">
                    <select id="carrera" class="form-input">
                        <option value="" disabled selected>Programa Académico</option>
                        <option value="Ingeniería Civil">Ingeniería Civil</option>
                        <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                        <option value="Derecho">Derecho</option>
                        <option value="Comunicación Social">Comunicación Social</option>
                        <option value="Contaduría Pública">Contaduría Pública</option>
                        <option value="Arquitectura">Arquitectura</option>
                        <option value="Psicología">Psicología</option>
                        <option value="Enfermería">Enfermería</option>
                        <option value="Administración de Empresas">Administración de Empresas</option>
                        <option value="Licenciatura en Educación Infantil">Licenciatura en Educación Infantil</option>
                        <option value="Medicina Veterinaria">Medicina Veterinaria</option>
                        <option value="Nutrición y Dietética">Nutrición y Dietética</option>
                    </select>
                    <input type="number" id="semestre" placeholder="Semestre (1-10)" min="1" max="10" class="form-input">
                </div>
                <div id="otrosFields" class="otros-fields hidden">
                    <input type="text" id="cargo" placeholder="Cargo/Ocupación" class="form-input">
                </div>
            </form>
        `,
        width: 700,
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        didOpen: () => {
            const tipoSelect = Swal.getPopup().querySelector('#tipo');
            const estudianteFields = Swal.getPopup().querySelector('#estudianteFields');
            const otrosFields = Swal.getPopup().querySelector('#otrosFields');

            const toggleFields = () => {
                const tipo = tipoSelect.value;
                estudianteFields.classList.toggle('hidden', tipo !== 'Estudiante');
                otrosFields.classList.toggle('hidden', tipo === 'Estudiante');
            };

            tipoSelect.addEventListener('change', toggleFields);
            toggleFields();
        },
        preConfirm: async () => {
            const get = id => Swal.getPopup().querySelector(`#${id}`).value.trim();

            const data = {
                nombre: get('nombre'),
                tipoIdentificacion: get('tipoIdentificacion'),
                cedula: get('identificacion'),
                sexo: get('sexo'),
                tipo: get('tipo'),
                telefono: get('telefono'),
                correo: get('correo'),
                carrera: get('carrera'),
                semestre: get('semestre'),
                cargo: get('cargo')
            };

            if (!data.nombre || !data.tipoIdentificacion || !data.cedula || !data.sexo || !data.tipo || !data.telefono || !data.correo) {
                Swal.showValidationMessage('Complete todos los campos obligatorios');
                return false;
            }

            if (data.tipo === 'Estudiante' && (!data.carrera || !data.semestre)) {
                Swal.showValidationMessage('Complete los campos de estudiante');
                return false;
            }

            if (data.tipo !== 'Estudiante' && !data.cargo) {
                Swal.showValidationMessage('Complete el cargo');
                return false;
            }

            const res = await fetch(API + 'crear.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const json = await res.json();
            if (!json.success) {
                Swal.showValidationMessage('Error al registrar: ' + (json.message || 'Desconocido'));
                return false;
            }

            Swal.fire('Registrado', `Código asignado: ${json.codigo}`, 'success');
            loadUsers();
        }
    });
});

// ================== VER USUARIO ==================
async function verUsuario(id) {
    const res = await fetch(API + 'listar.php');
    const usuarios = await res.json();
    const u = usuarios.find(x => x.id == id);

    if (!u) return Swal.fire('No encontrado', '', 'error');

    Swal.fire({
        title: u.nombre,
        html: `
            <p><b>Código:</b> ${u.codigo}</p>
            <p><b>Tipo ID:</b> ${u.tipo_identificacion || '-'}</p>
            <p><b>Identificación:</b> ${u.cedula}</p>
            <p><b>Sexo:</b> ${u.sexo}</p>
            <p><b>Tipo Usuario:</b> ${u.tipo}</p>
            <p><b>Teléfono:</b> ${u.telefono}</p>
            <p><b>Correo:</b> ${u.correo}</p>
            <p><b>Programa/Cargo:</b> ${u.tipo === 'Estudiante' ? (u.carrera || '-') + ' - Sem ' + (u.semestre || '-') : (u.cargo || '-')}</p>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
    });
}

// ================== EDITAR ==================
async function editarUsuario(id) {
    const res = await fetch(API + 'listar.php');
    const usuarios = await res.json();
    const u = usuarios.find(x => x.id == id);
    
    if (!u) {
        Swal.fire('Usuario no encontrado', '', 'error');
        return;
    }

    const htmlForm = `
      <form id="swalEditForm" class="form-grid">
        <input type="text" id="nombre" value="${u.nombre}" placeholder="Nombre completo *" required class="form-input">
        <select id="tipoIdentificacion" class="form-input" required>
            <option value="CC" ${u.tipo_identificacion === 'CC' ? 'selected' : ''}>Cédula de Ciudadanía (CC)</option>
            <option value="TI" ${u.tipo_identificacion === 'TI' ? 'selected' : ''}>Tarjeta de Identidad (TI)</option>
            <option value="CE" ${u.tipo_identificacion === 'CE' ? 'selected' : ''}>Cédula de Extranjería (CE)</option>
            <option value="Pasaporte" ${u.tipo_identificacion === 'Pasaporte' ? 'selected' : ''}>Pasaporte</option>
        </select>
        <input type="text" id="identificacion" value="${u.cedula}" placeholder="Identificación *" required class="form-input">
        <select id="sexo" class="form-input" required>
            <option value="M" ${u.sexo === 'M' ? 'selected' : ''}>Masculino</option>
            <option value="F" ${u.sexo === 'F' ? 'selected' : ''}>Femenino</option>
            <option value="Otro" ${u.sexo === 'Otro' ? 'selected' : ''}>Otro</option>
        </select>
        <select id="tipo" class="form-input" required>
            <option value="Estudiante" ${u.tipo === 'Estudiante' ? 'selected' : ''}>Estudiante</option>
            <option value="Docente" ${u.tipo === 'Docente' ? 'selected' : ''}>Docente</option>
            <option value="Administrativo" ${u.tipo === 'Administrativo' ? 'selected' : ''}>Administrativo</option>
            <option value="Externo" ${u.tipo === 'Externo' ? 'selected' : ''}>Externo</option>
        </select>
        <input type="tel" id="telefono" value="${u.telefono}" placeholder="Teléfono/Número *" required class="form-input">
        <input type="email" id="correo" value="${u.correo}" placeholder="Correo Electrónico *" required class="form-input">

        <div id="estudianteFields" class="modal-estudiante-fields" style="${u.tipo === 'Estudiante' ? '' : 'display:none;'}">
            <select id="carrera" class="form-input">
                <option value="Ingeniería Civil" ${u.carrera === 'Ingeniería Civil' ? 'selected' : ''}>Ingeniería Civil</option>
                <option value="Ingeniería de Sistemas" ${u.carrera === 'Ingeniería de Sistemas' ? 'selected' : ''}>Ingeniería de Sistemas</option>
                <option value="Derecho" ${u.carrera === 'Derecho' ? 'selected' : ''}>Derecho</option>
                <option value="Comunicación Social" ${u.carrera === 'Comunicación Social' ? 'selected' : ''}>Comunicación Social</option>
                <option value="Contaduría Pública" ${u.carrera === 'Contaduría Pública' ? 'selected' : ''}>Contaduría Pública</option>
                <option value="Arquitectura" ${u.carrera === 'Arquitectura' ? 'selected' : ''}>Arquitectura</option>
                <option value="Psicología" ${u.carrera === 'Psicología' ? 'selected' : ''}>Psicología</option>
                <option value="Enfermería" ${u.carrera === 'Enfermería' ? 'selected' : ''}>Enfermería</option>
                <option value="Administración de Empresas" ${u.carrera === 'Administración de Empresas' ? 'selected' : ''}>Administración de Empresas</option>
                <option value="Licenciatura en Educación Infantil" ${u.carrera === 'Licenciatura en Educación Infantil' ? 'selected' : ''}>Licenciatura en Educación Infantil</option>
                <option value="Medicina Veterinaria" ${u.carrera === 'Medicina Veterinaria' ? 'selected' : ''}>Medicina Veterinaria</option>
                <option value="Nutrición y Dietética" ${u.carrera === 'Nutrición y Dietética' ? 'selected' : ''}>Nutrición y Dietética</option>
            </select>
            <input type="number" id="semestre" value="${u.semestre || ''}" placeholder="Semestre (1-10)" min="1" max="10" class="form-input">
        </div>
        <div id="otrosFields" class="modal-otros-fields" style="${u.tipo !== 'Estudiante' ? '' : 'display:none;'}">
            <input type="text" id="cargo" value="${u.cargo || ''}" placeholder="Cargo/Ocupación" class="form-input">
        </div>
      </form>
    `;

    Swal.fire({
        title: 'Editar Usuario',
        html: htmlForm,
        width: 700,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar cambios',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const container = Swal.getHtmlContainer();
            const tipoSel = container.querySelector('#tipo');
            const estFields = container.querySelector('#estudianteFields');
            const otFields = container.querySelector('#otrosFields');

            function update() {
                const val = tipoSel.value;
                if (val === 'Estudiante') {
                    estFields.style.display = '';
                    otFields.style.display = 'none';
                } else {
                    estFields.style.display = 'none';
                    otFields.style.display = '';
                }
            }
            tipoSel && tipoSel.addEventListener('change', update);
        },
        preConfirm: async () => {
            const get = id => Swal.getPopup().querySelector(`#${id}`).value.trim();
            const nombre = get('nombre');
            const tipoIdentificacion = Swal.getPopup().querySelector('#tipoIdentificacion').value;
            const cedula = get('identificacion');
            const sexo = Swal.getPopup().querySelector('#sexo').value;
            const tipo = Swal.getPopup().querySelector('#tipo').value;
            const telefono = get('telefono');
            const correo = get('correo');

            const carrera = Swal.getPopup().querySelector('#carrera') ? Swal.getPopup().querySelector('#carrera').value : '';
            const semestre = Swal.getPopup().querySelector('#semestre') ? Swal.getPopup().querySelector('#semestre').value : '';
            const cargo = Swal.getPopup().querySelector('#cargo') ? Swal.getPopup().querySelector('#cargo').value : '';

            if (!nombre || !tipo || !tipoIdentificacion || !cedula || !sexo || !telefono || !correo) {
                Swal.showValidationMessage('Por favor, complete todos los campos requeridos (*).');
                return false;
            }

            if (tipo === 'Estudiante' && (!carrera || !semestre)) {
                Swal.showValidationMessage('Complete los campos de estudiante (Carrera y Semestre).');
                return false;
            }

            if (tipo !== 'Estudiante' && !cargo) {
                Swal.showValidationMessage('Complete el campo Cargo/Ocupación.');
                return false;
            }

            const data = {
                id: u.id,
                nombre,
                tipoIdentificacion,
                cedula,
                sexo,
                tipo,
                telefono,
                correo,
                carrera: tipo === 'Estudiante' ? carrera : '',
                semestre: tipo === 'Estudiante' ? semestre : '',
                cargo: tipo !== 'Estudiante' ? cargo : ''
            };

            try {
                const response = await fetch(API + 'actualizar.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const json = await response.json();
                
                if (!json.success) {
                    Swal.showValidationMessage('Error al actualizar: ' + (json.message || 'Desconocido'));
                    return false;
                }

                Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
                loadUsers();
            } catch (error) {
                Swal.showValidationMessage('Error de conexión: ' + error.message);
                return false;
            }
        }
    });
}

// ================== ELIMINAR ==================
async function eliminarUsuario(id) {
    Swal.fire({
        title: '¿Eliminar usuario?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (res) => {
        if (res.isConfirmed) {
            try {
                const response = await fetch(API + 'eliminar.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                });

                const json = await response.json();
                
                if (json.success) {
                    Swal.fire('Eliminado', 'El usuario fue eliminado correctamente.', 'success');
                    loadUsers();
                } else {
                    Swal.fire('Error', 'No se pudo eliminar el usuario: ' + (json.message || 'Desconocido'), 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de conexión: ' + error.message, 'error');
            }
        }
    });
}

// ================== PDF ==================
document.getElementById('btnGenerarPDFUsuarios').addEventListener('click', async () => {
    const res = await fetch(API + 'listar.php');
    const usuarios = await res.json();
    if (!usuarios.length) return Swal.fire('Sin datos', '', 'warning');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.text('REPORTE DE USUARIOS', 140, 15, { align: 'center' });

    doc.autoTable({
        head: [['Nombre', 'ID', 'Tipo', 'Teléfono', 'Correo']],
        body: usuarios.map(u => [u.nombre, u.cedula, u.tipo, u.telefono, u.correo]),
        startY: 30
    });

    doc.save('Reporte_Usuarios.pdf');
});

// ================== INIT ==================
loadUsers();