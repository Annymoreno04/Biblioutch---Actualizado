-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-04-2026 a las 01:19:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `biblioteca_utch`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `devoluciones`
--

CREATE TABLE `devoluciones` (
  `id` int(11) NOT NULL,
  `prestamo_id` int(11) NOT NULL,
  `usuario_cedula` varchar(20) DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `material` varchar(200) DEFAULT NULL,
  `tipo_prestamo` enum('Interno','Externo') DEFAULT NULL,
  `fecha_prestamo` date DEFAULT NULL,
  `fecha_devolucion_real` date NOT NULL,
  `hora_prestamo` time DEFAULT NULL,
  `hora_devolucion` time NOT NULL,
  `tiempo_uso` varchar(50) DEFAULT NULL,
  `dias_atraso` int(11) DEFAULT 0,
  `recibido_por` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `devoluciones`
--

INSERT INTO `devoluciones` (`id`, `prestamo_id`, `usuario_cedula`, `usuario`, `material`, `tipo_prestamo`, `fecha_prestamo`, `fecha_devolucion_real`, `hora_prestamo`, `hora_devolucion`, `tiempo_uso`, `dias_atraso`, `recibido_por`, `fecha_creacion`) VALUES
(29, 30, '123333', 'Carolina Quejada', 'Amor y paz', 'Externo', '2026-04-22', '2026-04-22', '10:28:00', '00:00:00', '1 día', 0, 'Administrador', '2026-04-22 15:30:21'),
(30, 31, '123333', 'Carolina Quejada', 'El encuentro', 'Interno', '2026-04-22', '2026-04-22', '10:30:00', '10:30:00', '1min', 0, 'Administrador', '2026-04-22 15:30:36'),
(31, 32, '123333', 'Carolina Quejada', 'El encuentro', 'Interno', '2026-04-22', '2026-04-24', '10:31:00', '10:33:00', '2 días 0h 2min', 2, 'Administrador', '2026-04-24 15:33:03'),
(32, 33, '123333', 'Carolina Quejada', 'Amor y paz', 'Externo', '2026-04-22', '2026-04-24', '10:32:00', '00:00:00', '2 días', 0, 'Administrador', '2026-04-24 15:33:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiales`
--

CREATE TABLE `materiales` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `autor` varchar(100) DEFAULT NULL,
  `anio` year(4) DEFAULT NULL,
  `idioma` varchar(50) DEFAULT NULL,
  `tipo` enum('Libro','Tesis','Revista','Otro') DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `ejemplares` int(11) DEFAULT 1,
  `disponible` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materiales`
--

INSERT INTO `materiales` (`id`, `codigo`, `titulo`, `autor`, `anio`, `idioma`, `tipo`, `categoria`, `ejemplares`, `disponible`, `fecha_creacion`) VALUES
(12, 'LIB001', 'Amor y paz', 'Andrea', '2005', 'es', 'Libro', 'Literatura', 10, 1, '2026-04-23 03:27:21'),
(13, 'TES001', 'El encuentro', 'Carolina', '2026', 'es', 'Tesis', 'Ciencia', 1, 1, '2026-04-22 15:29:52'),
(14, 'LIB002', 'El Quijote', 'Miguel de Cervantes', '2005', 'es', 'Libro', 'Ciencia', 6, 1, '2026-04-22 15:56:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamos`
--

CREATE TABLE `prestamos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `tipo_prestamo` enum('Interno','Externo') NOT NULL,
  `fecha_prestamo` date NOT NULL,
  `hora_prestamo` time NOT NULL,
  `fecha_devolucion` date NOT NULL,
  `estado` enum('Activo','Devuelto','Atrasado') DEFAULT 'Activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestamos`
--

INSERT INTO `prestamos` (`id`, `usuario_id`, `material_id`, `tipo_prestamo`, `fecha_prestamo`, `hora_prestamo`, `fecha_devolucion`, `estado`, `fecha_creacion`) VALUES
(30, 5, 12, 'Externo', '2026-04-22', '10:28:00', '2026-05-04', 'Devuelto', '2026-04-22 15:28:40'),
(31, 5, 13, 'Interno', '2026-04-22', '10:30:00', '2026-04-22', 'Devuelto', '2026-04-22 15:30:12'),
(32, 5, 13, 'Interno', '2026-04-22', '10:31:00', '2026-04-22', 'Devuelto', '2026-04-22 15:31:47'),
(33, 5, 12, 'Externo', '2026-04-22', '10:32:00', '2026-05-04', 'Devuelto', '2026-04-22 15:32:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_identificacion` varchar(20) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `sexo` enum('M','F') DEFAULT NULL,
  `tipo` enum('Estudiante','Docente','Administrativo','Externo') DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `semestre` varchar(10) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `codigo`, `nombre`, `tipo_identificacion`, `cedula`, `sexo`, `tipo`, `telefono`, `correo`, `carrera`, `semestre`, `cargo`, `fecha_creacion`) VALUES
(5, 'EST001', 'Carolina Quejada', 'CC', '123333', 'F', 'Estudiante', '32000000', 'caro@gmail.com', 'Psicología', '5', '', '2026-04-23 03:26:46'),
(6, 'EST002', 'Anny Moreno', 'CC', '1077425111', 'F', 'Estudiante', '3146156588', 'morenoleudoa@gmail.com', 'Ingeniería de Sistemas', '8', '', '2026-04-24 15:34:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_sistema`
--

CREATE TABLE `usuarios_sistema` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rol` enum('Administrador','Bibliotecario') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_sistema`
--

INSERT INTO `usuarios_sistema` (`id`, `username`, `password`, `nombre`, `rol`, `activo`, `fecha_creacion`) VALUES
(2, 'biblioutch', '$2y$10$abcdefghijklmnopqrstuv1234567890ABCDEFGHIJKLMNOP', 'Administrador', 'Administrador', 1, '2026-01-06 03:32:43'),
(3, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Administrador', 1, '2026-01-06 03:36:49');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `devoluciones`
--
ALTER TABLE `devoluciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prestamo_id` (`prestamo_id`);

--
-- Indices de la tabla `materiales`
--
ALTER TABLE `materiales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- Indices de la tabla `usuarios_sistema`
--
ALTER TABLE `usuarios_sistema`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `devoluciones`
--
ALTER TABLE `devoluciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `materiales`
--
ALTER TABLE `materiales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios_sistema`
--
ALTER TABLE `usuarios_sistema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `devoluciones`
--
ALTER TABLE `devoluciones`
  ADD CONSTRAINT `devoluciones_ibfk_1` FOREIGN KEY (`prestamo_id`) REFERENCES `prestamos` (`id`);

--
-- Filtros para la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD CONSTRAINT `prestamos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
