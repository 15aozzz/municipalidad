-- ======================================================
-- BASE DE DATOS: MUNICIPALIDAD DE YAU
-- PARA XAMPP (MySQL / MariaDB)
-- ======================================================
CREATE DATABASE IF NOT EXISTS municipalidad_yau
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE municipalidad_yau;

-- ======================================================
-- TABLA: usuarios (ciudadanos y personal)
-- ======================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,   -- En producción se guarda hasheado con bcrypt
    rol ENUM('ciudadano', 'staff', 'admin') DEFAULT 'ciudadano',
    telefono VARCHAR(15),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- TABLA: tramites
-- ======================================================
CREATE TABLE tramites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,                     -- Opcional (si el ciudadano está registrado)
    dni VARCHAR(8) NOT NULL,                 -- Siempre se guarda el DNI del solicitante
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
    certeza DECIMAL(5,2) DEFAULT 0.00,       -- Porcentaje de confianza del modelo
    accion_sugerida VARCHAR(255) DEFAULT '',
    estado ENUM('pendiente', 'en_proceso', 'atendido', 'rechazado') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    asignado_a INT NULL,                     -- ID del staff que lo atiende
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_dni (dni),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad)
);

-- ======================================================
-- DATOS DE PRUEBA (MOCKS REALISTAS)
-- ======================================================
-- Contraseñas: en este ejemplo van en texto plano. En el backend usarás bcrypt.

-- Usuarios
INSERT INTO usuarios (dni, nombres, apellidos, email, password, rol, telefono, direccion) VALUES
('00000001', 'Admin', 'Sistema', 'admin@yau.gob.pe', 'admin123', 'admin', '999999999', 'Palacio Municipal'),
('12345678', 'Ana', 'Quispe', 'ana.quispe@yau.gob.pe', 'staff123', 'staff', '987654321', 'Mesa de Partes'),
('87654321', 'Roberto', 'Chávez', 'roberto.chavez@yau.gob.pe', 'staff123', 'staff', '912345678', 'Defensa Civil'),
('10485721', 'Juan', 'Pérez', 'juan.perez@gmail.com', 'ciudadano123', 'ciudadano', '955123456', 'Av. Aviación 1234'),
('42918472', 'María', 'López', 'maria.lopez@hotmail.com', 'ciudadano123', 'ciudadano', '955654321', 'Jr. Huánuco 567');

-- Trámites de ejemplo
INSERT INTO tramites (usuario_id, dni, asunto, descripcion, prioridad, certeza, accion_sugerida, estado, asignado_a) VALUES
(
    (SELECT id FROM usuarios WHERE dni = '10485721'),
    '10485721',
    'Colapso de alcantarillado en Av. Aviación',
    'Inundación por alcantarillado atorado en la cuadra 12, afecta comercios y tránsito.',
    'Alta', 95.4, 'Derivar a Defensa Civil y Saneamiento', 'pendiente',
    (SELECT id FROM usuarios WHERE dni = '87654321')
),
(
    (SELECT id FROM usuarios WHERE dni = '42918472'),
    '42918472',
    'Solicitud de licencia de funcionamiento - Galería Gamarra',
    'Requisitos técnicos para puesto de venta de prendas en Jr. Huánuco 890.',
    'Media', 89.1, 'Derivar a Desarrollo Económico', 'en_proceso',
    (SELECT id FROM usuarios WHERE dni = '12345678')
),
(
    NULL,
    '44556677',
    'Emergencia por incendio en galería Gamarra',
    'Incendio en el centro comercial, se necesita apoyo urgente de bomberos.',
    'Alta', 98.7, 'Alertar a bomberos y Defensa Civil', 'en_proceso',
    (SELECT id FROM usuarios WHERE dni = '87654321')
);

-- ======================================================
-- VISTA ÚTIL: tramites_completos
-- ======================================================
CREATE OR REPLACE VIEW tramites_completos AS
SELECT 
    t.id,
    t.dni,
    COALESCE(CONCAT(u.nombres, ' ', u.apellidos), 'No registrado') AS solicitante,
    t.asunto,
    t.descripcion,
    t.prioridad,
    t.certeza,
    t.accion_sugerida,
    t.estado,
    t.fecha_creacion,
    CONCAT(staff.nombres, ' ', staff.apellidos) AS asignado_a
FROM tramites t
LEFT JOIN usuarios u ON t.usuario_id = u.id
LEFT JOIN usuarios staff ON t.asignado_a = staff.id;