-- ============================================================================
-- PROYECTO: AlertaBarrio
-- MOTOR: PostgreSQL con extensión PostGIS
-- ============================================================================
CREATE DATABASE alerta_barrio_db

-- 1. Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. ================= TABLAS =================

CREATE TABLE rol (
    id_rol UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE categoria_incidente (
    id_categoria UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    detalles VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE estado_incidente (
    id_estado_incidente UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    detalles VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tipo_voto (
    id_tipo_voto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    detalles VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE directorio_emergencia (
    id_directorio UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_oficial VARCHAR(150) NOT NULL,
    numero_contacto VARCHAR(20) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    icono_entidad VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. ================= ENTIDAD USUARIO Y EXTENSIONES (1:1) =================

CREATE TABLE usuario (
    usuario_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_rol UUID NOT NULL REFERENCES rol(id_rol) ON DELETE RESTRICT,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    sector_residencia VARCHAR(100),
    foto_avatar_url TEXT,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reputacion (
    usuario_id UUID PRIMARY KEY REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    nivel_reputacion INT NOT NULL DEFAULT 1,
    porcentaje_confiabilidad DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    experiencia_pts INT NOT NULL DEFAULT 0,
    porcentaje_acierto DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    cant_reportes_creados INT NOT NULL DEFAULT 0,
    cant_validaciones_emitidas INT NOT NULL DEFAULT 0
);

CREATE TABLE preferencia_usuario (
    usuario_id UUID PRIMARY KEY REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    radio_cobertura_geografica DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    recibir_alertas_globales BOOLEAN NOT NULL DEFAULT TRUE,
    recibir_alertas_vecinos BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. ================= RED VECINAL (M:N RECURSIVA) =================

CREATE TABLE usuario_seguidor (
    seguidor_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    seguido_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    fecha_seguimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguido_id),
    CONSTRAINT chk_no_auto_seguimiento CHECK (seguidor_id <> seguido_id)
);

-- 5. ================= MÓDULO DE INCIDENTES Y VALIDACIONES =================

CREATE TABLE incidente (
    incidente_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    id_categoria UUID NOT NULL REFERENCES categoria_incidente(id_categoria) ON DELETE RESTRICT,
    id_estado_incidente UUID NOT NULL REFERENCES estado_incidente(id_estado_incidente) ON DELETE RESTRICT,
    ubicacion GEOMETRY(Point, 4326) NOT NULL,
    descripcion TEXT,
    foto_evidencia_url TEXT,
    fecha_hora_reporte TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    indice_confianza_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    conteo_votos_positivos INT NOT NULL DEFAULT 0,
    conteo_votos_negativos INT NOT NULL DEFAULT 0
);

-- Índice espacial para geofencing (ST_DWithin <= 500m)
CREATE INDEX idx_incidente_ubicacion ON incidente USING GIST (ubicacion);

CREATE TABLE validacion (
    validacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidente_id UUID NOT NULL REFERENCES incidente(incidente_id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    id_tipo_voto UUID NOT NULL REFERENCES tipo_voto(id_tipo_voto) ON DELETE RESTRICT,
    peso_voto_ponderado DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    nota_actualizacion_rapida TEXT,
    foto_evidencia_url TEXT,
    fecha_hora_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    otorga_puntos_experiencia BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_incidente_usuario UNIQUE (incidente_id, usuario_id)
);

CREATE TABLE intervencion_autoridad (
    intervencion_autoridad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidente_id UUID NOT NULL UNIQUE REFERENCES incidente(incidente_id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    unidad_despachada VARCHAR(150),
    mensaje_comunicado_oficial TEXT,
    fecha_hora_despacho TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. ================= AUTOMATIZACIÓN (TRIGGER INSERCIÓN 1:1) =================

CREATE OR REPLACE FUNCTION inicializar_extensiones_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO reputacion (usuario_id, nivel_reputacion, porcentaje_confiabilidad, experiencia_pts)
    VALUES (NEW.usuario_id, 1, 50.00, 0);

    INSERT INTO preferencia_usuario (usuario_id, radio_cobertura_geografica, recibir_alertas_globales, recibir_alertas_vecinos)
    VALUES (NEW.usuario_id, 1000.00, TRUE, TRUE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_crear_reputacion_preferencias
AFTER INSERT ON usuario
FOR EACH ROW
EXECUTE FUNCTION inicializar_extensiones_usuario();

-- 7. ================= DATOS INICIALES =================

INSERT INTO rol (nombre_rol, descripcion) VALUES
('CIUDADANO', 'Vecino registrado que reporta y valida'),
('AUTORIDAD', 'Operador distrital (Serenazgo, Bomberos, COED)');

INSERT INTO categoria_incidente (nombre, detalles) VALUES
('INUNDACION', 'Vías inundadas o anegamiento que afecta viviendas'),
('DANO_ESTRUCTURAL', 'Colapso de muros, puentes o veredas'),
('VIA_BLOQUEADA', 'Árboles caídos, escombros o vías intransitables'),
('POSTE_CAIDO', 'Cables expuestos, chispas o postes inclinados'),
('INCENDIO', 'Fuego estructural o de vegetación urbana'),
('OTRO', 'Otros incidentes urbanos');

INSERT INTO estado_incidente (nombre, detalles) VALUES
('PENDIENTE', 'Reporte creado, a la espera de validaciones'),
('EN_REVISION', 'Tiene votos iniciales pero no alcanza umbral'),
('CONFIRMADO', 'Consenso >= 75% con al menos 3 confirmaciones'),
('RESUELTO', 'Solucionado o atendido por autoridad oficial'),
('DESESTIMADO', 'Falsa alarma o reporte descartado por la comunidad');

INSERT INTO tipo_voto (nombre, detalles) VALUES
('CONFIRMAR', 'Valida que el incidente sigue ocurriendo'),
('YA_NO_OCURRE', 'Declara que el incidente ya fue solucionado o drenó'),
('INFO_INCORRECTA', 'Marca el reporte como falsa alarma o dato falso');
