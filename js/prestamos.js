// ================= SESIÓN =================
const isLoggedIn = sessionStorage.getItem("isLoggedIn");
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!isLoggedIn || !currentUser) {
    window.location.href = "index.html";
}

document.getElementById("userName").textContent = currentUser.nombre;
document.getElementById("userRole").textContent = currentUser.rol;

document.getElementById("logoutBtn").addEventListener("click", () => {
    Swal.fire({
        title: "¿Cerrar sesión?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then(r => {
        if (r.isConfirmed) {
            sessionStorage.clear();
            window.location.href = "../index.html";
        }
    });
});

// ================= UTILIDADES =================
function obtenerFechaHoraColombia() {
    return new Date(new Date().toLocaleString("en-US", {
        timeZone: "America/Bogota"
    }));
}

function renderPagination(total) {
    const totalPages = Math.ceil(total / rowsPerPage);
    pagination.innerHTML = `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Anterior</button>
        <span class="pagination-info">${currentPage}/${totalPages}</span>
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Siguiente</button>
    `;
}

function agregarDiasHabiles(fecha, dias) {
    const [year, month, day] = fecha.split('-').map(Number);
    let f = new Date(year, month - 1, day, 12, 0, 0);

    let added = 0;

    // Comenzar desde el día siguiente
    while (added < dias) {
        f.setDate(f.getDate() + 1);
        const dayOfWeek = f.getDay();

        // Lunes (1) a Viernes (5)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            added++;
        }
    }


    const año = f.getFullYear();
    const mes = String(f.getMonth() + 1).padStart(2, '0');
    const dia = String(f.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
}

function parseFechaLocal(fechaStr) {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
}

// ================= API =================
const API = {
    prestamos: "../controllers/prestamos.php",
    materiales: "../controllers/materiales.php",
    usuariosList: "../controllers/usuarios/listar.php"
};

const rowsPerPage = 5;

// ================= CARGAR PRÉSTAMOS =================
async function loadPrestamos(page = 1) {
    const search = document.getElementById("buscarPrestamo").value || "";

    try {
        const res = await fetch(API.prestamos);
        const data = await res.json();

        const all = Array.isArray(data) ? data : (data.data || []);
        window.prestamosCache = all;

        // Filtrar por búsqueda (cedula, nombre usuario o título material)
        const filtered = all.filter(p => {
            const q = search.toLowerCase();
            return (
                (p.usuario_cedula && p.usuario_cedula.toString().toLowerCase().includes(q)) ||
                (p.usuario && p.usuario.toLowerCase().includes(q)) ||
                (p.material && p.material.toLowerCase().includes(q))
            );
        });

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / rowsPerPage));
        page = Math.min(Math.max(1, page), pages);

        const start = (page - 1) * rowsPerPage;
        const pageItems = filtered.slice(start, start + rowsPerPage);

        const tbody = document.getElementById("prestamosTable");
        const pagination = document.getElementById("pagination");
        
        document.getElementById("prestamoCount").textContent = total;

        if (pageItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8">No hay préstamos</td></tr>`;
            pagination.innerHTML = "";
            return;
        }

        tbody.innerHTML = pageItems.map(p => {
            // Formatear fecha de préstamo en formato d/m/yyyy
            const fechaPrestamo = parseFechaLocal(p.fecha_prestamo);
            const fechaPrestamoFormat = `${fechaPrestamo.getDate()}/${fechaPrestamo.getMonth() + 1}/${fechaPrestamo.getFullYear()}`;


            // Formatear fecha de devolución si es externo
            let fechaDevolucionFormat = "En sala";
            if (p.tipo_prestamo === "Externo") {
                const fechaDevolucion = parseFechaLocal(p.fecha_devolucion);
                fechaDevolucionFormat = `${fechaDevolucion.getDate()}/${fechaDevolucion.getMonth() + 1}/${fechaDevolucion.getFullYear()}`;

            }

            // Determinar clase y texto del badge según estado
            const estadoBadge = p.estado === 'Activo'
                ? '<span class="badge badge-active">Activo</span>'
                : '<span class="badge badge-completed">Devuelto</span>';

            return `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.usuario_cedula || ''} ${p.usuario ? '- ' + p.usuario : ''}</td>
                    <td>${p.material || ''}</td>
                    <td>${p.tipo_prestamo}</td>
                    <td>${fechaPrestamoFormat}</td>
                    <td>${fechaDevolucionFormat}</td>
                    <td>${estadoBadge}</td>
                    <td class="actions">
                        <button class="action-btn view" onclick="verPrestamo(${p.id})" title="Ver">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" onclick="eliminarPrestamo(${p.id})" title="Eliminar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        pagination.innerHTML = `
            <button class="pagination-btn" ${page === 1 ? "disabled" : ""} onclick="loadPrestamos(${page - 1})">Anterior</button>
            <span class="pagination-info">${page} / ${pages}</span>
            <button class="pagination-btn" ${page === pages ? "disabled" : ""} onclick="loadPrestamos(${page + 1})">Siguiente</button>
        `;
    } catch (error) {
        console.error("Error cargando préstamos:", error);
        Swal.fire("Error", "No se pudieron cargar los préstamos", "error");
    }
}

// ================= VALIDAR POLÍTICA DE PRÉSTAMO =================
function validarPoliticaPrestamo(material, tipoPrestamo) {
    if (tipoPrestamo === "Externo") {
        if (material.tipo === "Tesis") {
            return {
                valido: false,
                mensaje: `⚠ Restricción de Préstamo\n\nLas TESIS solo pueden ser consultadas en sala mediante préstamo INTERNO.`,
            };
        }

        if (material.tipo === "Revista") {
            return {
                valido: false,
                mensaje: `⚠ Restricción de Préstamo\n\nLas REVISTAS solo pueden ser consultadas en sala mediante préstamo INTERNO.`,
            };
        }

        if (parseInt(material.ejemplares) === 1) {
            return {
                valido: false,
                mensaje: `⚠ Restricción de Préstamo\n\nEste es el último ejemplar disponible y debe permanecer en la biblioteca.`,
            };
        }
    }

    return { valido: true };
}

// ================= NUEVO PRÉSTAMO CON FORMULARIO COMPLETO =================
document.getElementById("btnAgregarPrestamo").addEventListener("click", async () => {
    // Variable global para el material seleccionado
    let materialSeleccionadoGlobal = null
    let usuarioValidoGlobal = null;

    // ✅ FUNCIÓN PARA OBTENER FECHA Y HORA ACTUALES EN TIEMPO REAL
    // REEMPLAZA la función completa por esta:
    const obtenerFechaHoraActual = () => {
        const now = new Date();
        const fechaFormateada = new Intl.DateTimeFormat("es-CO", {
            timeZone: "America/Bogota",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(now);

        // Solo para mostrar en el modal y mensajes
        const horaActual = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Bogota",
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(now);

        // Para guardar en la BD (formato 24h que MySQL espera)
        const horaGuardar = new Intl.DateTimeFormat("en-GB", {
            timeZone: "America/Bogota",
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(now);

        const fechaHoy = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Bogota'
        }).format(now);

        return { fechaFormateada, horaActual, horaGuardar, fechaHoy };
    };

    // ✅ Obtener fecha y hora inicial para mostrar en el modal
    const { fechaFormateada, horaActual, fechaHoy } = obtenerFechaHoraActual();

    Swal.fire({
        title: "Registrar Préstamo",
        html: `
            <form id="swalPrestamoForm" class="modal-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left;">
                <div style="grid-column:1/3;">
                    <input type="text" id="swalBuscarCedula" placeholder="Cédula del Usuario" class="form-input" style="width:100%;" />
                    <div id="swalUsuarioInfo" style="margin-top:6px;"></div>
                </div>
                
                <div style="grid-column:1/3;">
                    <input type="text" id="swalBuscarMaterial" placeholder="Buscar Material por Autor o Título" class="form-input" style="width:100%;" autocomplete="off" />
                    <div id="swalMaterialDropdown" style="display:none;border:1px solid #ddd;border-radius:4px;max-height:200px;overflow-y:auto;background:#fff;margin-top:4px;position:relative;z-index:9999;"></div>
                    <div id="swalMaterialInfo" style="margin-top:6px;"></div>
                </div>
                
                <div style="grid-column:1/3;">
                    <label style="display:block;margin-bottom:4px;font-weight:500;font-size:13px;">Tipo de Préstamo</label>
                    <select id="swalTipoPrestamo" class="form-input" style="width:100%;">
                        <option value="Externo">Externo</option>
                        <option value="Interno">Interno</option>
                    </select>
                </div>
                
                <div id="swalInfoAutomatica" style="grid-column:1/3;background:#f0f9ff;padding:12px;border-radius:8px;margin-top:8px;">
                    <p style="margin:0;color:#0369a1;font-weight:600;font-size:13px;">ℹ️ Fecha y hora automáticas</p>
                    <p id="swalFechaHoraDisplay" style="margin:4px 0 0 0;color:#0c4a6e;font-size:12px;">
                        <strong>Fecha:</strong> ${fechaFormateada}<br>
                        <strong>Hora:</strong> ${horaActual}
                    </p>
                    <div id="swalFechaDevInfo" style="margin-top:8px;padding-top:8px;border-top:1px solid #bae6fd;">
                    </div>
                </div>
            </form>
        `,
        width: 700,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Prestar",
        cancelButtonText: "Cancelar",
        didOpen: async () => {
            const container = Swal.getHtmlContainer();
            const cedulaInput = container.querySelector("#swalBuscarCedula");
            const usuarioInfoDiv = container.querySelector("#swalUsuarioInfo");
            const buscarMaterialInput = container.querySelector("#swalBuscarMaterial");
            const materialDropdown = container.querySelector("#swalMaterialDropdown");
            const materialInfoDiv = container.querySelector("#swalMaterialInfo");
            const tipoPrestamoSelect = container.querySelector("#swalTipoPrestamo");
            const fechaDevInfo = container.querySelector("#swalFechaDevInfo");
            const fechaHoraDisplay = container.querySelector("#swalFechaHoraDisplay");

            // ✅ ACTUALIZAR FECHA Y HORA CADA SEGUNDO EN TIEMPO REAL
            const intervaloActualizacion = setInterval(() => {
                const { fechaFormateada: fechaNueva, horaActual: horaNueva } = obtenerFechaHoraActual();
                fechaHoraDisplay.innerHTML = `
                    <strong>Fecha:</strong> ${fechaNueva}<br>
                    <strong>Hora:</strong> ${horaNueva}
                `;
            }, 1000); // Actualiza cada segundo

            // ✅ Limpiar intervalo cuando se cierre el modal
            const observer = new MutationObserver(() => {
                if (!document.body.contains(container)) {
                    clearInterval(intervaloActualizacion);
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            const actualizarFechaDevolucion = () => {
                const { fechaHoy: fechaActual } = obtenerFechaHoraActual();
                const tipo = tipoPrestamoSelect.value;
                if (tipo === "Externo") {
                    const fechaDev = agregarDiasHabiles(fechaActual, 8);
                    const fechaDevFormat = new Intl.DateTimeFormat("es-CO", {
                        timeZone: "America/Bogota",
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }).format(parseFechaLocal(fechaDev));

                    fechaDevInfo.innerHTML = `
                        <p style="margin:0;color:#0c4a6e;font-size:12px;">
                            <strong>📅 Fecha de devolución (8 días hábiles):</strong><br>
                            ${fechaDevFormat}
                        </p>
                    `;
                } else {
                    fechaDevInfo.innerHTML = `
                        <p style="margin:0;color:#0c4a6e;font-size:12px;">
                            <strong>⏱️ Préstamo en sala:</strong> Debe devolverse el mismo día (máximo 10 horas)
                        </p>
                    `;
                }
            };

            tipoPrestamoSelect.addEventListener("change", actualizarFechaDevolucion);
            actualizarFechaDevolucion();

            // ========== BUSCAR USUARIO POR CÉDULA ==========
            let timeoutUsuario = null;
            cedulaInput.addEventListener("input", async () => {
                clearTimeout(timeoutUsuario);
                const cedula = cedulaInput.value.trim();

                if (!cedula) {
                    usuarioInfoDiv.innerHTML = "";
                    usuarioValidoGlobal = null;
                    return;
                }

                usuarioInfoDiv.innerHTML = '<p style="color:#6b7280;margin:2px 0;">🔍 Buscando...</p>';

                timeoutUsuario = setTimeout(async () => {
                    try {
                        const res = await fetch(API.usuariosList);
                        const users = await res.json();

                        const u = (users || []).find(x => x.cedula && x.cedula.toString() === cedula.toString());

                        console.log("Usuario buscado (local):", u);

                        if (u) {
                            usuarioValidoGlobal = u;
                            usuarioInfoDiv.innerHTML = `
                                    <p style="margin:2px 0;color:#059669;"><strong>✓ Nombre:</strong> ${u.nombre}</p>
                                    <p style="margin:2px 0;"><strong>Tipo:</strong> ${u.tipo}</p>
                                `;
                        } else {
                            usuarioValidoGlobal = null;
                            usuarioInfoDiv.innerHTML = '<p style="color:#b91c1c;margin:2px 0;">✗ Usuario no encontrado</p>';
                        }
                    } catch (error) {
                        console.error("Error buscando usuario:", error);
                        usuarioValidoGlobal = null;
                        usuarioInfoDiv.innerHTML = '<p style="color:#b91c1c;margin:2px 0;">✗ Error al buscar usuario</p>';
                    }
                }, 500); // Espera 500ms después de que el usuario deje de escribir
            });

            // ========== BUSCAR MATERIAL ==========
            let timeoutMaterial = null;
            buscarMaterialInput.addEventListener("input", async (e) => {
                clearTimeout(timeoutMaterial);
                const valor = e.target.value.trim();

                if (valor.length === 0) {
                    materialDropdown.style.display = "none";
                    materialInfoDiv.innerHTML = "";
                    materialSeleccionadoGlobal = null;
                    return;
                }

                if (valor.length < 3) {
                    materialDropdown.innerHTML = `
                        <div style="padding:15px;text-align:center;color:#6b7280;">
                            <p style="margin:0;">Escribe al menos 3 caracteres para buscar</p>
                        </div>
                    `;
                    materialDropdown.style.display = "block";
                    return;
                }

                materialDropdown.innerHTML = `
                    <div style="padding:15px;text-align:center;color:#6b7280;">
                        <p style="margin:0;">🔍 Buscando materiales...</p>
                    </div>
                `;
                materialDropdown.style.display = "block";

                timeoutMaterial = setTimeout(async () => {
                    try {
                        const res = await fetch(API.materiales);
                        const materialesAll = await res.json();

                        const materiales = Array.isArray(materialesAll) ? materialesAll : (materialesAll.data || []);

                        const filtrados = (materiales || []).filter(m => {
                            const q = valor.toLowerCase();
                            return (
                                (m.titulo && m.titulo.toLowerCase().includes(q)) ||
                                (m.autor && m.autor.toLowerCase().includes(q)) ||
                                (m.codigo && m.codigo.toLowerCase().includes(q))
                            );
                        }).filter(m => parseInt(m.ejemplares) > 0);

                        if (filtrados.length > 0) {
                            materialDropdown.innerHTML = filtrados.map(m => `
                                <div style="padding:10px;border-bottom:1px solid #eee;cursor:pointer;transition:background 0.2s;" 
                                     class="material-option" 
                                     data-id="${m.id}"
                                     onmouseover="this.style.background='#f3f4f6'" 
                                     onmouseout="this.style.background='#fff'">
                                    <div><strong>${m.titulo}</strong></div>
                                    <div style="font-size:12px;color:#666;">Por: ${m.autor}</div>
                                    <div style="font-size:11px;color:#999;">${m.ejemplares} disponibles • ${m.tipo}</div>
                                </div>
                            `).join("");

                            // Asignar eventos de clic a cada opción
                            materialDropdown.querySelectorAll(".material-option").forEach(opt => {
                                opt.addEventListener("click", async () => {
                                    const materialId = opt.dataset.id;

                                    // Buscar el material completo en la lista ya descargada
                                    const material = (materiales || []).find(x => x.id && x.id.toString() === materialId.toString());
                                    if (material) {
                                        materialSeleccionadoGlobal = material;
                                        buscarMaterialInput.value = `${material.titulo} - ${material.autor}`;
                                        materialDropdown.style.display = "none";
                                        materialInfoDiv.innerHTML = `
                                            <p style="margin:2px 0;color:#2563eb;"><strong>✓ Título:</strong> ${material.titulo}</p>
                                            <p style="margin:2px 0;"><strong>Autor:</strong> ${material.autor}</p>
                                            <p style="margin:2px 0;"><strong>Tipo:</strong> ${material.tipo}</p>
                                            <p style="margin:2px 0;"><strong>Ejemplares disponibles:</strong> ${material.ejemplares}</p>
                                        `;
                                    }
                                });
                            });
                        } else {
                            materialDropdown.innerHTML = `
                                <div style="padding:20px;text-align:center;color:#999;">
                                    <p style="margin:0;font-weight:500;">No se encontraron resultados</p>
                                    <p style="margin:5px 0 0;font-size:13px;">No hay materiales disponibles que coincidan con "${valor}"</p>
                                </div>
                            `;
                        }

                        materialDropdown.style.display = "block";
                    } catch (error) {
                        console.error("Error buscando materiales:", error);
                        materialDropdown.innerHTML = `
                            <div style="padding:15px;text-align:center;color:#b91c1c;">
                                <p style="margin:0;">Error de conexión</p>
                            </div>
                        `;
                    }
                }, 500); // Espera 500ms después de que el usuario deje de escribir
            });

            // Cerrar dropdown al hacer clic fuera
            document.addEventListener("click", (e) => {
                if (!buscarMaterialInput.contains(e.target) && !materialDropdown.contains(e.target)) {
                    materialDropdown.style.display = "none";
                }
            });
        },
        preConfirm: async () => {
            const container = Swal.getPopup();
            const cedula = container.querySelector("#swalBuscarCedula").value.trim();
            const tipo = container.querySelector("#swalTipoPrestamo").value;

            if (!cedula) {
                Swal.showValidationMessage("Ingrese la cédula del usuario");
                return false;
            }

            if (!usuarioValidoGlobal) {
                Swal.showValidationMessage("Debe seleccionar un usuario válido");
                return false;
            }

            if (!materialSeleccionadoGlobal) {
                Swal.showValidationMessage("Debe seleccionar un material de la lista");
                return false;
            }

            if (parseInt(materialSeleccionadoGlobal.ejemplares) <= 0) {
                Swal.showValidationMessage(`No hay ejemplares disponibles del material "${materialSeleccionadoGlobal.titulo}"`);
                return false;
            }

            const validacion = validarPoliticaPrestamo(materialSeleccionadoGlobal, tipo);
            if (!validacion.valido) {
                Swal.showValidationMessage(validacion.mensaje);
                return false;
            }

            return { usuario: usuarioValidoGlobal, material: materialSeleccionadoGlobal, tipo };
        }
    }).then(async (result) => {
        if (!result.isConfirmed) return;

        const { usuario, material, tipo } = result.value;

        // ✅ OBTENER FECHA Y HORA EXACTAS AL MOMENTO DE CONFIRMAR EL PRÉSTAMO
        const { fechaHoy: fecha, horaActual: hora, horaGuardar } = obtenerFechaHoraActual();

        const fechaDev = tipo === "Externo" ? agregarDiasHabiles(fecha, 8) : fecha;

        try {
            console.log("Enviando datos (usuario_id):", {
                usuario_id: usuario.id,
                material_id: material.id,
                tipo_prestamo: tipo,
                fecha_prestamo: fecha,
                hora_prestamo: hora,
                fecha_devolucion: fechaDev
            }); // Debug

            const res = await fetch(API.prestamos, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    material_id: material.id,
                    tipo_prestamo: tipo,
                    fecha_prestamo: fecha,
                    hora_prestamo: horaGuardar,
                    fecha_devolucion: fechaDev
                })
            });

            const data = await res.json();
            console.log("Respuesta servidor:", data); // Debug

            if (data.error) {
                Swal.fire("Error", data.error || "No se pudo registrar el préstamo", "error");
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Préstamo registrado exitosamente",
                html: `
                    <p style="color:#0369a1;font-weight:600;">⏱️ Hora de entrega: ${hora}</p>
                    ${tipo === "Externo"
                        ? `<p style="color:#059669;font-weight:600;">📅 Fecha de devolución: ${new Intl.DateTimeFormat("es-CO", {
                            timeZone: "America/Bogota"
                        }).format(parseFechaLocal(fechaDev))
                        }</p>`
                        : '<p style="color:#0369a1;">Préstamo en sala - Máximo 10 horas</p>'
                    }
                `,
                confirmButtonColor: "#2563eb",
            });

            loadPrestamos();
        } catch (error) {
            console.error("Error al crear préstamo:", error);
            Swal.fire("Error", "No se pudo conectar con el servidor", "error");
        }
    });
});

// ================= ELIMINAR =================
async function eliminarPrestamo(id) {
    Swal.fire({
        title: "¿Eliminar préstamo?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Caneeeecelar",
        confirmButtonColor: "#dc2626"
    }).then(async r => {
        if (!r.isConfirmed) return;

        try {
            const res = await fetch(`${API.prestamos}?id=${id}`, { method: "DELETE" });

             const data = await res.json();
             console.log("Respuesta servidor (DELETE):", data); // Debug

             if (data.success === true) {
                 Swal.fire("Eliminado", "El préstamo fue eliminado correctamente", "success");
                  loadPrestamos();
           
            } else   {
                   Swal.fire("Error", data.error || "No se pudo eliminar el préstamo", "error");
        
            }   
           // console.log("Respuesta servidorxxx:", data); // Debug
          
            //Swal.fire("Eliminado", "El préstamo fue eliminado correctamente", "success");
        } catch (error) {
            console.error("Error al eliminar:", error);
            Swal.fire("Error", "No se pudo eliminar el préstamo", "error");
        }
    });
}

function verPrestamo(id) {
    const prestamo = window.prestamosCache?.find(p => p.id === id);

    if (!prestamo) {
        Swal.fire("No encontrado", "No se encontró la información del préstamo.", "error");
        return;
    }

    const fechaPrestamo = parseFechaLocal(prestamo.fecha_prestamo);
    const fechaPrestamoFormat = `${fechaPrestamo.getDate()}/${fechaPrestamo.getMonth() + 1}/${fechaPrestamo.getFullYear()}`;
    const fechaDevolucion = prestamo.tipo_prestamo === "Externo"
        ? parseFechaLocal(prestamo.fecha_devolucion)
        : null;
    const fechaDevolucionFormat = fechaDevolucion
        ? `${fechaDevolucion.getDate()}/${fechaDevolucion.getMonth() + 1}/${fechaDevolucion.getFullYear()}`
        : "En sala";

    Swal.fire({
        title: `Préstamo #${prestamo.id}`,
        html: `
            <p><strong>Usuario:</strong> ${prestamo.usuario_cedula || ''} ${prestamo.usuario ? '- ' + prestamo.usuario : ''}</p>
            <p><strong>Material:</strong> ${prestamo.material || 'N/A'}</p>
            <p><strong>Tipo de préstamo:</strong> ${prestamo.tipo_prestamo}</p>
            <p><strong>Fecha de préstamo:</strong> ${fechaPrestamoFormat}</p>
            <p><strong>Fecha de devolución:</strong> ${fechaDevolucionFormat}</p>
            <p><strong>Estado:</strong> ${prestamo.estado || 'N/A'}</p>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2563eb'
    });
}

// ================= GENERAR PDF =================
async function generarPDFPrestamos() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Título principal
        doc.setFontSize(18);
        doc.setTextColor(12, 51, 130); // Color azul oscuro
        doc.text("SISTEMA DE PRÉSTAMOS BIBLIOGRÁFICOS", 14, 15);

        // Subtítulo
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text("Universidad Tecnológica del Chocó - Diego Luis Córdoba", 14, 22);

        // Información general
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Reporte de Préstamos - ${new Date().toLocaleDateString('es-CO')}`, 14, 30);
        doc.text(`Generado por: ${currentUser.nombre} (${currentUser.rol})`, 14, 36);

        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 40, 196, 40);

        const res = await fetch("../controllers/prestamos.php");
        const data = await res.json();

        if (!data || !data.length || !Array.isArray(data)) {
            Swal.fire('Info', 'No hay préstamos para exportar', 'info');
            return;
        }

        // Preparar datos para la tabla
        const tableData = data.map(p => {
            // Formatear fechas
            const fechaPrestamo = parseFechaLocal(p.fecha_prestamo);
            const fechaPrestamoFormat = `${fechaPrestamo.getDate()}/${fechaPrestamo.getMonth() + 1}/${fechaPrestamo.getFullYear()}`;

            let fechaDevolucionFormat = "En sala";
            if (p.tipo_prestamo === "Externo") {
                const fechaDevolucion = parseFechaLocal(p.fecha_devolucion);
                fechaDevolucionFormat = `${fechaDevolucion.getDate()}/${fechaDevolucion.getMonth() + 1}/${fechaDevolucion.getFullYear()}`;
            }

            return [
                p.id,
                p.usuario_cedula || 'N/A',
                p.usuario || 'N/A',
                p.material || 'N/A',
                p.tipo_prestamo || 'N/A',
                fechaPrestamoFormat,
                fechaDevolucionFormat,
                p.estado || 'N/A'
            ];
        });

        // Crear tabla con autoTable
        doc.autoTable({
            startY: 45,
            head: [['ID', 'Cédula', 'Nombre Usuario', 'Material', 'Tipo', 'F. Préstamo', 'F. Devolución', 'Estado']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: 'linebreak'
            },
            headStyles: {
                backgroundColor: [12, 51, 130],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                backgroundColor: [245, 245, 245]
            },
            bodyStyles: {
                textColor: [0, 0, 0]
            }
        });

        // Pie de página
        const pageCount = doc.internal.pages.length - 1; // Resta 1 porque la primera página vacía no cuenta
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(`Página ${i} de ${pageCount}`, 195, 285, { align: 'right' });
            doc.text(`${new Date().toLocaleString('es-CO')}`, 14, 285);
        }

        // Descargar PDF
        doc.save(`prestamos_${new Date().toISOString().split('T')[0]}.pdf`);
        Swal.fire('Éxito', 'PDF generado correctamente', 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        Swal.fire('Error', 'No se pudo generar el PDF: ' + error.message, 'error');
    }
}

// Event listener para el botón
if (document.getElementById("btnGenerarPDFPrestamos")) {
    document.getElementById("btnGenerarPDFPrestamos").addEventListener("click", generarPDFPrestamos);
}

// ================= EVENTOS =================
document.getElementById("buscarPrestamo")
    .addEventListener("input", () => loadPrestamos());

loadPrestamos();