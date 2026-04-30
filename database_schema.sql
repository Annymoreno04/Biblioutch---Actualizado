-- Base de datos para el sistema de biblioteca Biblioutch
-- Universidad Tecnológica del Chocó

CREATE DATABASE IF NOT EXISTS biblioteca_utCH;
USE biblioteca_utCH;

-- Tabla para usuarios del sistema (administradores, bibliotecarios)
CREATE TABLE usuarios_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hash de contraseña
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('Administrador', 'Bibliotecario') NOT NULL,
    activo BOOLEAN DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para usuarios de la biblioteca (estudiantes, profesores, etc.)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo_identificacion VARCHAR(20),
    cedula VARCHAR(20) UNIQUE,
    sexo ENUM('M', 'F'),
    tipo ENUM('Estudiante', 'Docente', 'Administrativo', 'Externo'),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    carrera VARCHAR(100),
    semestre VARCHAR(10),
    cargo VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para materiales bibliográficos
CREATE TABLE materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100),
    anio YEAR,
    idioma VARCHAR(50),
    tipo ENUM('Libro', 'Tesis', 'Revista', 'Otro'),
    categoria VARCHAR(100),
    ejemplares INT DEFAULT 1,
    disponible BOOLEAN DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para préstamos
CREATE TABLE prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    material_id INT NOT NULL,
    tipo_prestamo ENUM('Interno', 'Externo') NOT NULL,
    fecha_prestamo DATE NOT NULL,
    hora_prestamo TIME NOT NULL,
    fecha_devolucion DATE NOT NULL,
    estado ENUM('Activo', 'Devuelto', 'Atrasado') DEFAULT 'Activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (material_id) REFERENCES materiales(id)
);

-- Tabla para devoluciones
CREATE TABLE devoluciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestamo_id INT NOT NULL,
    usuario_cedula VARCHAR(20),
    usuario VARCHAR(100),
    material VARCHAR(200),
    tipo_prestamo ENUM('Interno', 'Externo'),
    fecha_prestamo DATE,
    fecha_devolucion_real DATE NOT NULL,
    hora_prestamo TIME,
    hora_devolucion TIME NOT NULL,
    tiempo_uso VARCHAR(50),
    dias_atraso INT DEFAULT 0,
    recibido_por VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id)
);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios_sistema (username, password, nombre, rol) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Administrador');
-- Contraseña: password (hash de bcrypt)

-- Insertar usuario biblioutch
INSERT INTO usuarios_sistema (username, password, nombre, rol) VALUES
('biblioutch', '$2y$10$abcdefghijklmnopqrstuv1234567890ABCDEFGHIJKLMNOP', 'Bibliotecario', 'Bibliotecario');
-- Contraseña: biblioutch123 (hash de bcrypt)