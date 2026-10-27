# AlertaBarrio — Documento de Contexto y Especificación Técnica de Proyecto

> **Propósito del Documento:** Proveer el contexto arquitectónico, funcional, geoespacial y de datos consolidado a partir de los avances de ingeniería de software para el desarrollo y generación de código en **OpenCode**.

---

## 1. Visión General del Proyecto

### 1.1 Nombre y Definición
* **Nombre:** AlertaBarrio
* **Tipo de Plataforma:** Aplicación Web Progresiva (*Mobile-First PWA*) para ciudadanos y *Dashboard Web de Escritorio* para autoridades distritales.
* **Dominio:** Respuesta comunitaria y monitoreo colaborativo en tiempo real ante incidencias urbanas y eventos hidrometeorológicos.
* **Zona Piloto:** Distritos de Castilla y Piura (Perú) — sectores críticos como Castilla Centro, El Indio, Tacna, Miraflores, Piura Centro y Veintiséis de Octubre.

### 1.2 Problemática a Resolver
1. **Falta de visibilidad hiperlocal e inmediata:** Ausencia de un canal en tiempo real para conocer el estado de transitabilidad de calles, inundaciones, desbordes, postes caídos o cables expuestos.
2. **Proliferación de alarmas falsas y desinformación:** Cadenas de redes sociales sin trazabilidad ni georreferenciación que generan pánico y movilización innecesaria de recursos.
3. **Colapso de canales oficiales y falta de articulación comunitaria:** Saturación de las líneas 105, 116 y SAMU en contingencias climáticas severas, junto con el desconocimiento de las líneas directas de Serenazgo, COED y cuadrillas operativas (EPS Grau, Enosa).

### 1.3 Propuesta de Valor y Modelo
* **Propuesta de Valor:** Transformar reportes ciudadanos dispersos en alertas geolocalizadas verificadas mediante un motor de consenso comunitario y reputación algorítmica, conectando directamente con las autoridades municipales de primera respuesta.
* **Modelo Operativo:** B2G (Business-to-Government) e institucional. La aplicación es de libre acceso ciudadano; las municipalidades y entidades gestoras acceden al panel analítico y módulo de despacho.

---

## 2. Stack Tecnológico y Arquitectura del Sistema

```
                      +---------------------------------------+
                      |               CLIENTES                |
                      |   - PWA Mobile-First (Leaflet + OSM)  |
                      |   - Dashboard Desktop (Admin / COED)  |
                      +-------------------+-------------------+
                                          |
                        HTTP / REST (JWT) | WebSockets (STOMP)
                                          v
                      +---------------------------------------+
                      |           BACKEND SERVICE             |
                      |          Java 17+ / Spring Boot 3     |
                      |   - Spring Data JPA + Hibernate Spatial
                      |   - Spring Security (JWT)             |
                      |   - Spring WebSocket                  |
                      |   - Motor de Consenso y Geofencing    |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |            BASE DE DATOS              |
                      |        PostgreSQL 15+ + PostGIS        |
                      |   - Consultas espaciales (ST_DWithin) |
                      |   - Índices GiST (Point 4326)         |
                      +---------------------------------------+
```

* **Backend:** Java 17+, Spring Boot 3 (Spring Web, Spring Data JPA, Spring Security, Spring WebSocket).
* **Base de Datos:** PostgreSQL 15+ con extensión espacial **PostGIS** habilitada.
* **Manejo Geoespacial:** `Hibernate Spatial` + `JTS (Java Topology Suite)` mapeando coordenadas como `org.locationtech.jts.geom.Point` bajo el estándar GPS WGS 84 (`SRID 4326`).
* **Frontend:** PWA (HTML5, JavaScript/TypeScript reactivo, Tailwind CSS o CSS modular), cliente Leaflet.js para mapas con capas OpenStreetMap, Service Workers para cacheo básico y comunicación bidireccional vía WebSocket/STOMP.
* **Seguridad y Normativa:** Autenticación Stateless basada en tokens JWT; estricto cumplimiento de la Ley N° 29733 (Ley de Protección de Datos Personales del Perú), prescindiendo de números de DNI o exposición de teléfonos privados.

---

## 3. Algoritmos y Reglas de Negocio Centrales

### 3.1 Motor de Consenso Comunitario ($C_{incidente}$)
Un incidente no se considera confirmado al momento de reportarse; nace en estado `PENDIENTE`.
* **Cálculo de Confianza:**
  $$C_{incidente} = \frac{\sum (V_{positivos} \times R_{usuario})}{\sum V_{totales}} \times 100$$
* **Regla de Promoción Automática (RN-02):** Un incidente pasa automáticamente a estado `CONFIRMADO` si:
  $$C_{incidente} \ge 75\% \quad \text{y} \quad \text{Total de validaciones} \ge 3$$
* **Geofencing Estricto de Validación (RN-01):** Solo pueden emitir votos de confirmación (`CONFIRMAR`) o descarte (`YA_NO_OCURRE`, `INFO_INCORRECTA`) los usuarios ubicados en un radio $\le 500\text{ metros}$ del incidente, verificado en base de datos mediante:
  ```sql
  ST_DWithin(incidente.ubicacion, ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography, 500)
  ```

### 3.2 Sistema de Reputación del Usuario ($R_{usuario}$)
* **Métrica de Fiabilidad:**
  $$R_{usuario} = \left(\frac{\text{Reportes y Votos Coincidentes con el Consenso Final}}{\text{Total de Participaciones del Usuario}}\right) \times 100$$
* **Gamificación y Ponderación:**
  * Toda validación acertada otorga $+2\text{ pts}$ de experiencia.
  * Usuarios con mayor nivel y confiabilidad tienen un factor `peso_voto_ponderado` más alto al votar.
  * Cuentas de autoridades (`ROLE_AUTHORITY`) tienen confirmación inmediata y peso absoluto.

### 3.3 Regla Anti-Duplicidad Geoespacial (RN-07 / Observación Docente)
Para evitar que múltiples usuarios saturen el mapa creando pines duplicados para el mismo suceso en la misma manzana:
* **Criterio de Coincidencia:**
  * Misma `id_categoria`.
  * Estado activo (`PENDIENTE` o `CONFIRMADO`).
  * Distancia geográfica $\le 50\text{ metros}$ (`ST_DWithin`).
  * Ventana de tiempo de creación $\le 2\text{ horas}$.
* **Comportamiento:** Si un nuevo reporte cumple estas 4 condiciones, **el backend no genera una nueva entidad `incidente`**. En su lugar:
  1. Convierte automáticamente la acción en un voto favorable en la tabla `validacion` vinculado al incidente padre existente.
  2. Adjunta la foto o nota como evidencia complementaria.
  3. Retorna un mensaje amigable al usuario: *"Ya existe un reporte similar en esta ubicación; tu aporte fue sumado como confirmación"*.

### 3.4 Descarte y Cierre de Incidentes
Un incidente se marca como `DESESTIMADO` o `RESUELTO` si:
1. El consenso comunitario de descarte supera el 75%.
2. Un operador con credenciales `ROLE_AUTHORITY` lo cierra manualmente desde el panel de mando mediante una intervención registrada en `intervencion_autoridad`.

---

## 4. Modelo de Datos Físico (PostgreSQL + PostGIS)

El modelo está normalizado en 3NF con una separación nítida entre catálogos, entidades transaccionales y extensiones 1:1.

```
  +------------------+         +------------------+
  |       rol        |         | categoria_incid. |
  +------------------+         +------------------+
           | 1                          | 1
           | *                          | *
  +--------v---------+ 1             * +v-----------------+ 1        0..1 +------------------------+
  |     usuario      +----------------->|    incidente     +------------->| intervencion_autoridad |
  +--------+---------+                 +---+--------------+              +------------------------+
     1 | 1 | 1                             | 1
       |   |                               | *
       |   +-> 1:1 reputacion              |
       +-----> 1:1 preferencia_usuario     |
       |                                   |
       +-----> N:M usuario_seguidor        |
       |                                   |
       | *                               * |
  +----v-----------------------------------v---+
  |                 validacion                 |
  +--------------------------------------------+
```

### 4.1 Script DDL Completo
```sql
-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tablas Maestras / Catálogos
CREATE TABLE rol (
    id_rol UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NOT NULL,
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

-- 3. Entidad Central Usuario y Extensiones (1:1)
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

-- 4. Red Vecinal (M:N)
CREATE TABLE usuario_seguidor (
    seguidor_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    seguido_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    fecha_seguimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguido_id),
    CONSTRAINT chk_no_auto_seguimiento CHECK (seguidor_id <> seguido_id)
);

-- 5. Transacciones de Incidentes y Validaciones
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

-- 6. Trigger para Inicialización 1:1 de Usuario
CREATE OR REPLACE FUNCTION trg_crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO reputacion (usuario_id) VALUES (NEW.usuario_id);
    INSERT INTO preferencia_usuario (usuario_id) VALUES (NEW.usuario_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuario_extensiones
AFTER INSERT ON usuario
FOR EACH ROW
EXECUTE FUNCTION trg_crear_perfil_usuario();

-- 7. Datos Semilla Básicos
INSERT INTO rol (nombre_rol, descripcion) VALUES
('CIUDADANO', 'Vecino registrado que reporta y valida'),
('AUTORIDAD', 'Operador distrital (Serenazgo, Bomberos, COED)');

INSERT INTO categoria_incidente (nombre, detalles) VALUES
('INUNDACION', 'Vías anegadas o ingreso de agua a viviendas'),
('DANO_ESTRUCTURAL', 'Colapso de muros, veredas o puentes'),
('VIA_BLOQUEADA', 'Árboles caídos, desmontes o zanjas abiertas'),
('POSTE_CAIDO', 'Cables cortados de media/alta tensión o postes inclinados'),
('INCENDIO', 'Fuego estructural o deflagración de gas'),
('OTRO', 'Otras incidencias urbanas no catalogadas');

INSERT INTO estado_incidente (nombre, detalles) VALUES
('PENDIENTE', 'Alerta recién reportada'),
('EN_REVISION', 'Alerta con votos en proceso'),
('CONFIRMADO', 'Consenso >= 75% con >= 3 votos'),
('RESUELTO', 'Atendido por autoridad o reportado drenado'),
('DESESTIMADO', 'Descartado por la comunidad o falsa alarma');

INSERT INTO tipo_voto (nombre, detalles) VALUES
('CONFIRMAR', 'Valida que el incidente sigue activo'),
('YA_NO_OCURRE', 'Indica que el peligro fue resuelto o ya drenó'),
('INFO_INCORRECTA', 'Marca el reporte como inexacto o falso');
```

---

## 5. Matriz de Requerimientos Atomizada

| Código | Módulo | Descripción Funcional | Tipo / Prioridad | Criterio de Aceptación |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01.1** | Onboarding | Carrusel interactivo de bienvenida de 3 pasos en el primer ingreso. | Funcional / Baja | Carga fluida, transicionable y con opción de omitir. |
| **RF-01.2** | Onboarding | Solicitud explícita de permisos GPS al navegador móvil. | Funcional / Baja | Prompt nativo antes de cargar el mapa. |
| **RF-01.3** | Onboarding | Asignación de coordenada distrital por defecto (modo explorador) si se rechaza el GPS. | Funcional / Baja | Carga Piura/Castilla centro sin bloquear acceso al mapa. |
| **RF-02.1** | Auth | Registro de usuarios con nombres, apellidos, correo y contraseña encriptada (BCrypt). | Funcional / Alta | Almacenamiento seguro y generación de token JWT. |
| **RF-02.2** | Auth | Autenticación y mantenimiento persistente de sesión mediante JWT en headers. | Funcional / Alta | Sin reingreso de credenciales al recargar la PWA. |
| **RF-02.3** | Auth | Restricción de creación de incidentes a usuarios no autenticados. | Funcional / Alta | Despliega modal de inicio de sesión si es visitante. |
| **RF-02.4** | Auth | Bloqueo de botones de validación comunitaria a usuarios no identificados. | Funcional / Alta | Deshabilita botones en feed y detalle para invitados. |
| **RF-03.1** | Reporte | Selección obligatoria de tipología desde cuadrícula de 6 categorías. | Funcional / Alta | No avanza al paso 2 sin seleccionar categoría. |
| **RF-03.2** | Reporte | Captura automática de coordenadas lat/lon en segundo plano. | Funcional / Alta | Objeto GeoJSON `Point` incluido en el payload. |
| **RF-03.3** | Reporte | Adjunto opcional de evidencia fotográfica desde cámara o galería. | Funcional / Alta | Imagen comprimida en cliente a un tamaño $< 1\text{ MB}$. |
| **RF-03.4** | Reporte | Campo de texto opcional para detalles adicionales de la incidencia. | Funcional / Alta | Permite envío tanto con texto como vacío. |
| **RF-04.1** | Feed | Listado cronológico de incidentes vigentes en vista tipo muro. | Funcional / Alta | Incidentes ordenados del más reciente al más antiguo. |
| **RF-04.2** | Feed | Filtro de incidentes por radio de distancia (500m, 1km, distrito). | Funcional / Alta | Oculta incidentes fuera del radio seleccionado. |
| **RF-04.3** | Feed | Filtro mediante chips de categoría temática. | Funcional / Alta | Filtra instantáneamente la lista por tipo de alerta. |
| **RF-04.4** | Feed | Contador en tiempo real de vecinos activos en el radio elegido. | Funcional / Alta | Sincronizado vía WebSocket. |
| **RF-05.1** | Admin | Dashboard web restringido exclusivamente a usuarios con rol `AUTORIDAD`. | Funcional / Alta | Ciudadano recibe HTTP 403 Forbidden. |
| **RF-05.2** | Admin | Capa de mapa de calor dinámico basada en la densidad de reportes en PostGIS. | Funcional / Alta | Proyección de zonas rojas de alta concentración. |
| **RF-05.3** | Admin | Filtros en panel por distrito y gravedad de incidente. | Funcional / Alta | Filtrado reactivo de tablas y mapa de despacho. |
| **RF-05.4** | Admin | Cambio de estado de incidente a "Atendido Oficial" con registro de unidad. | Funcional / Alta | Crea registro en `intervencion_autoridad` y actualiza pin en tiempo real. |
| **RF-06.1** | Directorio | Lista segmentada de teléfonos de auxilio oficial (Bomberos, Serenazgo, SAMU, etc.). | Funcional / Media | Vista de tarjetas con logo y descripción. |
| **RF-06.2** | Directorio | Filtro de contactos oficiales por distrito (Piura / Castilla). | Funcional / Media | Cambia dinámicamente los teléfonos según jurisdicción. |
| **RF-06.3** | Directorio | Marcado telefónico nativo al tocar un contacto (`tel:XXXXXX`). | Funcional / Media | Abre la aplicación de llamadas del smartphone de inmediato. |
| **RF-07.1** | Red Vecinal | Capacidad de seguir a otros usuarios o cuentas oficiales para priorizar alertas. | Funcional / Media | Botón [+ Seguir] / [✓ Siguiendo] en feed y perfil. |
| **RF-07.2** | Perfil | Visualización del nivel de reputación gamificado. | Funcional / Baja | Muestra insignia de nivel (ej. Nivel 4). |
| **RF-07.3** | Perfil | Indicador de porcentaje de confiabilidad y porcentaje de acierto. | Funcional / Baja | Actualizado al resolverse las alertas votadas. |
| **RF-07.4** | Perfil | Historial cronológico de votos y validaciones emitidas por el usuario. | Funcional / Baja | Lista con badges de acierto o puntos ganados (+2 pts). |
| **RNF-01** | Rendimiento | Propagación de nuevas alertas y cambios de estado vía WebSockets en $\le 3\text{ s}$. | No Funcional / Alta | Verificable en logs de WebSocket STOMP. |
| **RNF-02** | Accesibilidad | Interfaz Mobile-First adaptada a resoluciones de 360px a 428px con áreas táctiles $\ge 48\text{px}$. | No Funcional / Media | Auditoría Google Lighthouse $\ge 90/100$. |
| **RNF-03** | Rendimiento DB | Latencia de consultas geoespaciales `ST_DWithin` $< 200\text{ ms}$ en percentil 95. | No Funcional / Alta | Optimizado con índices GiST sobre la columna `ubicacion`. |
| **RES-01** | Normativa | Cumplimiento estricto de la Ley N° 29733 de Datos Personales de Perú. | Restricción / Alta | Prohibido registrar o exigir números de DNI. |

---

## 6. Mapeo de Vistas y Pantallas del Sistema

| ID | Nombre de Pantalla | Actor Principal | Componentes y Elementos Clave |
| :--- | :--- | :--- | :--- |
| **P01** | Onboarding / Permisos GPS | Visitante / Nuevo Usuario | Carrusel 3 pasos, botón activar GPS, link modo explorador, aviso cookies. |
| **P02** | Login / Registro (Modal) | Visitante | Formulario reactivo, inputs email/password, switch a registro, validaciones visuales. |
| **P03** | Live Map (Mapa Principal) | Ciudadano | Canvas Leaflet, pines de colores según categoría/estado, botón FAB (+) flotante, banner superior de proximidad. |
| **P04** | Reporte Paso 1 (Categoría) | Ciudadano | Cuadrícula de selección táctil de 6 categorías con iconos y contraste alto. |
| **P05** | Reporte Paso 2 (Detalle y GPS) | Ciudadano | Tarjeta de lectura GPS (coordenadas automáticas), preview de imagen cargada, campo opcional de descripción, botón "Publicar Alerta". |
| **P06** | Feed Comunitario en Vivo | Ciudadano | Barra de red activa (vecinos en 1 km), chips de categorías, tarjetas con datos del autor (reputación, botón Seguir), barra $C_{incidente}$ y botones rápidos de voto. |
| **P07** | Detalle de Alerta y Consenso | Ciudadano | Badge de estado, foto ampliada, barra porcentual de confianza, timeline con notas de vecinos, barra inferior fija para votar. |
| **P08** | Directorio de Emergencias | Ciudadano | Selector de distrito (Castilla / Piura), tarjetas con números rápidos de Bomberos (116), Serenazgo, PNP (105), EPS Grau y COED con trigger `tel:`. |
| **P09** | Perfil de Usuario y Red | Ciudadano | Badge de Nivel y Confiabilidad, métricas (reportes, votos, % acierto), tabs para revisar historial de votos, vecinos seguidos y ajustes de radio (500m / 1km). |
| **P10** | Dashboard de Autoridades | Autoridad (Serenazgo/COED) | Vista desktop (1440px), mapa de calor PostGIS, lista priorizada de incidentes confirmados, modal de asignación de unidad/cisterna y botón "Marcar Resuelto". |

---

## 7. Lineamientos de Implementación para OpenCode

Al generar o refactorizar código en el repositorio, OpenCode debe seguir estos patrones estructurales:

### 7.1 Principios SOLID Aplicados
1. **Single Responsibility (SRP):**
   * Separar `IncidenteService` (orquestación) de `ConsensoEngineService` (cálculo de $C_{incidente}$) y `GeofencingService` (consultas espaciales).
   * Mantener los controladores REST limpios; delegar la validación y transformación de DTOs en capas específicas.
2. **Open/Closed (OCP):**
   * Implementar una interfaz `NotificationChannel` (`WebSocketNotificationChannel`, `PushNotificationChannel`) para que el despacho de alertas pueda ampliarse sin tocar la lógica de negocio.
3. **Liskov Substitution (LSP):**
   * Abstraer el cálculo de peso de voto (`WeightCalculator`) admitiendo implementaciones como `CitizenWeightCalculator` o `AuthorityWeightCalculator`.
4. **Interface Segregation (ISP):**
   * Crear interfaces de servicio separadas para operaciones ciudadanas (`CitizenIncidentService`) y de mando municipal (`AuthorityIncidentService`).
5. **Dependency Inversion (DIP):**
   * El servicio de negocio interactúa con interfaces de repositorio (`IncidenteRepository`) y puertos de notificación, desacoplado de las implementaciones concretas de PostgreSQL o Leaflet.

### 7.2 Manejo de Tipos Geoespaciales en JPA
* Usar `org.locationtech.jts.geom.Point` con factoría `GeometryFactory(new PrecisionModel(), 4326)`.
* Para crear un punto:
  ```java
  GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
  Point point = geometryFactory.createPoint(new Coordinate(longitud, latitud));
  ```
* En repositorios Spring Data JPA, usar consultas nativas con soporte PostGIS:
  ```java
  @Query(value = "SELECT * FROM incidente i " +
                 "WHERE i.id_categoria = :categoriaId " +
                 "AND i.id_estado_incidente IN (:estadosActivos) " +
                 "AND i.fecha_hora_reporte >= NOW() - INTERVAL '2 hours' " +
                 "AND ST_DWithin(i.ubicacion, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)\\:\\:geography, :radioMetros) " +
                 "LIMIT 1", nativeQuery = true)
  Optional<Incidente> buscarDuplicadoCercano(
          @Param("categoriaId") UUID categoriaId,
          @Param("estadosActivos") List<UUID> estadosActivos,
          @Param("lon") double lon,
          @Param("lat") double lat,
          @Param("radioMetros") double radioMetros);
  ```

### 7.3 Estructura Recomendada de Paquetes
```text
com.alertabarrio
├── config               # Seguridad, WebSockets, PostGIS JPA config
├── controller           # Endpoints REST y STOMP WebSocket
├── dto                  # Request/Response DTOs
├── model                # Entidades JPA (Usuario, Incidente, Validacion, etc.)
├── repository           # Interfaces Spring Data JPA con PostGIS queries
├── service              # Lógica de negocio (Consenso, Geofencing, Incidentes)
│   ├── impl
│   └── ports
└── util                 # Conversores geométricos, cálculo de fórmulas
```