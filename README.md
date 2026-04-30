# Sistema de Gestión de Préstamos Bibliográficos - UTCH

## Descripción

Este proyecto es un **Sistema de Gestión de Préstamos Bibliográficos** desarrollado para la **Biblioteca "Miguel A. Caicedo Mena"** de la **Universidad Tecnológica del Chocó (UTCH)**. Permite administrar de manera eficiente el registro de usuarios, el catálogo de materiales bibliográficos, el control de préstamos (internos y externos), las devoluciones con cálculo de atrasos, y la generación de reportes y estadísticas. Está diseñado para facilitar las operaciones diarias de la biblioteca en un entorno educativo.

El sistema utiliza una arquitectura web con backend en PHP y base de datos MySQL, proporcionando una interfaz amigable para el personal bibliotecario.

## Tecnologías Utilizadas

- **Backend**: PHP 8.2.12 con PDO para conexiones a base de datos.
- **Base de Datos**: MySQL/MariaDB 10.4.32 (con soporte UTF-8mb4).
- **Frontend**: HTML5, CSS3, JavaScript (vanilla).
- **Librerías JS**: SweetAlert2 para notificaciones.
- **Servidor**: XAMPP (Apache).
- **Herramientas Adicionales**: Git para control de versiones.

## Instalación

### Prerrequisitos
- XAMPP instalado (o cualquier servidor Apache con PHP y MySQL).
- PHP 8.2 o superior.
- MySQL/MariaDB 10.4 o superior.

### Pasos de Instalación
1. **Clona o descarga el proyecto** en tu directorio de proyectos (por ejemplo, `c:\xampp\htdocs\Proyectos\proyectob`).

2. **Configura la base de datos**:
   - Abre phpMyAdmin en XAMPP (http://localhost/phpmyadmin).
   - Crea una nueva base de datos llamada `biblioteca_utch` (o el nombre que prefieras).
   - Importa el archivo `biblioteca_utch.sql` para cargar el esquema y datos de prueba.
   - Alternativamente, ejecuta el script `database_schema.sql` para crear solo el esquema.

3. **Configura la conexión**:
   - Edita el archivo `controllers/conexion.php` y ajusta las credenciales de la base de datos si es necesario (usuario, contraseña, nombre de BD).

4. **Inicia el servidor**:
   - En XAMPP, inicia Apache y MySQL.
   - Accede al proyecto en tu navegador: `http://localhost/Proyectos/proyectob/index.html`.

5. **Credenciales de prueba**:
   - Usuario: admin (o verifica en la BD).
   - Contraseña: admin123 (o según los datos importados).

## Uso

1. **Inicio de Sesión**: Accede a `index.html` e ingresa con credenciales de administrador o bibliotecario.

2. **Dashboard**: Una vez logueado, verás el panel principal con estadísticas y navegación a módulos.

3. **Gestión de Usuarios**: Registra estudiantes, profesores y personal. Cada usuario recibe un código único (ej: EST001).

4. **Gestión de Materiales**: Agrega, edita o elimina libros, tesis, revistas, etc. Controla la disponibilidad de ejemplares.

5. **Préstamos**: Registra préstamos internos (en biblioteca) o externos, validando disponibilidad.

6. **Devoluciones**: Procesa devoluciones, calcula días de atraso y registra el tiempo de uso.

7. **Reportes**: Genera estadísticas y reportes sobre préstamos activos, materiales más prestados, etc.

### Flujo Típico
- Personal bibliotecario inicia sesión.
- Gestiona usuarios y materiales según necesidad.
- Registra préstamos y procesa devoluciones.
- Consulta reportes para análisis.

## Estructura del Proyecto

```
proyectob/
├── index.html                    # Página de login
├── controllers/                  # Controladores PHP (API REST)
│   ├── auth.php                  # Autenticación
│   ├── conexion.php              # Conexión a BD
│   ├── materiales.php            # CRUD de materiales
│   ├── prestamos.php             # Gestión de préstamos
│   ├── devoluciones.php          # Registro de devoluciones
│   ├── reportes.php              # Generación de reportes
│   ├── dashboard_stats.php       # Estadísticas del dashboard
│   ├── prestamos_activos.php     # Préstamos vigentes
│   ├── materiales_mas_prestados.php # Análisis de materiales
│   └── usuarios/                 # Subcarpeta para usuarios
│       ├── crear.php
│       ├── listar.php
│       ├── actualizar.php
│       └── eliminar.php
├── models/                       # Modelos de datos
│   ├── MaterialModel.php
│   ├── PrestamoModel.php
│   └── UsuarioModel.php
├── views/                        # Vistas HTML
│   ├── dashboard.html
│   ├── usuarios.html
│   ├── materiales.html
│   ├── prestamos.html
│   ├── devoluciones.html
│   └── reportes.html
├── css/                          # Estilos CSS
│   ├── login.css
│   ├── dashboard.css
│   ├── usuarios.css
│   ├── materiales.css
│   ├── prestamos.css
│   ├── devoluciones.css
│   └── reportes.css
├── js/                           # Scripts JavaScript
│   ├── login.js
│   ├── dashboard.js
│   ├── usuarios.js
│   ├── materiales.js
│   ├── prestamos.js
│   ├── devoluciones.js
│   └── reportes.js
├── images/                       # Imágenes (logos, íconos)
├── biblioteca_utch.sql           # Dump completo de BD con datos
└── database_schema.sql           # Esquema de BD
```

## Funcionalidades Clave

- **Autenticación Segura**: Login con contraseñas hasheadas (bcrypt).
- **Gestión de Usuarios**: CRUD completo con códigos únicos y búsqueda avanzada.
- **Catálogo de Materiales**: Control de inventario y disponibilidad.
- **Sistema de Préstamos**: Diferenciación interna/externa con validaciones.
- **Devoluciones**: Cálculo automático de atrasos y auditoría.
- **Reportes y Estadísticas**: Dashboard con KPIs y reportes personalizados.
- **Interfaz Responsiva**: Diseño amigable con notificaciones interactivas.

## Base de Datos

El esquema incluye 5 tablas principales:
- `usuarios_sistema`: Credenciales de acceso.
- `usuarios`: Miembros de la comunidad (estudiantes, profesores, etc.).
- `materiales`: Acervo bibliográfico.
- `prestamos`: Registros de préstamos.
- `devoluciones`: Historial de devoluciones.

Ejecuta `biblioteca_utch.sql` para datos de prueba.

## Contribución

1. Haz un fork del repositorio.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza commits descriptivos.
4. Envía un pull request.
