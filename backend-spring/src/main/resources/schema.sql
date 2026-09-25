-- Esquema del Taller de Reparacion. Se ejecuta en cada arranque, pero es idempotente:
-- CREATE TABLE IF NOT EXISTS no toca las tablas ni los datos que ya existan.

CREATE TABLE IF NOT EXISTS usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'TECNICO', 'CLIENTE') NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cliente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    documento VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT fk_cliente_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tecnico (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    CONSTRAINT fk_tecnico_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL COMMENT 'PC, Celular, Tablet, Otro',
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serial VARCHAR(100) UNIQUE,
    descripcion TEXT,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipo_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repuesto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reparacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipo_id BIGINT NOT NULL,
    tecnico_id BIGINT,
    falla_reportada TEXT NOT NULL,
    estado ENUM(
        'RECIBIDO',
        'EN_DIAGNOSTICO',
        'COTIZACION_PENDIENTE',
        'ESPERANDO_APROBACION',
        'EN_REPARACION',
        'FINALIZADA',
        'ENTREGADO',
        'RECHAZADO'
    ) NOT NULL DEFAULT 'RECIBIDO',
    fecha_ingreso DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME,
    observaciones TEXT,
    CONSTRAINT fk_reparacion_equipo FOREIGN KEY (equipo_id) REFERENCES equipo(id) ON DELETE CASCADE,
    CONSTRAINT fk_reparacion_tecnico FOREIGN KEY (tecnico_id) REFERENCES tecnico(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS diagnostico (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reparacion_id BIGINT NOT NULL UNIQUE,
    hallazgos TEXT NOT NULL,
    solucion_propuesta TEXT,
    fecha_diagnostico DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diagnostico_reparacion FOREIGN KEY (reparacion_id) REFERENCES reparacion(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cotizacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reparacion_id BIGINT NOT NULL UNIQUE,
    mano_obra DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    aprobada BOOLEAN,
    fecha_cotizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME,
    CONSTRAINT fk_cotizacion_reparacion FOREIGN KEY (reparacion_id) REFERENCES reparacion(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS detalle_cotizacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id BIGINT NOT NULL,
    repuesto_id BIGINT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_detcot_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizacion(id) ON DELETE CASCADE,
    CONSTRAINT fk_detcot_repuesto FOREIGN KEY (repuesto_id) REFERENCES repuesto(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS repuesto_reparacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reparacion_id BIGINT NOT NULL,
    repuesto_id BIGINT NOT NULL,
    cantidad_usada INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_reprep_reparacion FOREIGN KEY (reparacion_id) REFERENCES reparacion(id) ON DELETE CASCADE,
    CONSTRAINT fk_reprep_repuesto FOREIGN KEY (repuesto_id) REFERENCES repuesto(id) ON DELETE RESTRICT
);
