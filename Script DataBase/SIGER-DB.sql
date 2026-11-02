-- SIGER - Esquema relacional inicial (PostgreSQL)
-- Ejecutar dentro de una base de datos previamente creada.
-- Este script no incluye datos reales ni evidencia de ejecución.

BEGIN;

CREATE TABLE rol (
    id_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE usuario (
    id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES rol(id_rol),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE evento (
    id_evento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_organizador BIGINT NOT NULL REFERENCES usuario(id_usuario),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    capacidad_maxima INTEGER NOT NULL CHECK (capacidad_maxima > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO'
        CHECK (estado IN ('PROGRAMADO', 'CANCELADO', 'FINALIZADO')),
    CONSTRAINT chk_evento_fechas CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE reserva (
    id_reserva BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    id_evento BIGINT NOT NULL REFERENCES evento(id_evento),
    fecha_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA'
        CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')),
    codigo_confirmacion VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE asistencia (
    id_asistencia BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva BIGINT NOT NULL UNIQUE REFERENCES reserva(id_reserva),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notificacion (
    id_notificacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_evento_organizador ON evento(id_organizador);
CREATE INDEX idx_reserva_usuario ON reserva(id_usuario);
CREATE INDEX idx_reserva_evento ON reserva(id_evento);
CREATE INDEX idx_notificacion_usuario ON notificacion(id_usuario);

INSERT INTO rol (nombre)
VALUES ('ADMINISTRADOR'), ('ORGANIZADOR'), ('PARTICIPANTE');

COMMIT;

-- VERIFICAR LAS RESTRICCIONES DE CADA TABLA
SELECT
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN (
      'rol',
      'usuario',
      'evento',
      'reserva',
      'asistencia',
      'notificacion'
  )
ORDER BY table_name, constraint_type;

-- VERIFICAR SI LOS ROLES SE ASIGNARON CORRECTAMENTE
SELECT * FROM rol;

