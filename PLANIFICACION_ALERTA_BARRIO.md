# Planificación del Proyecto AlertaBarrio

## 1. Análisis Actual

### 1.1 Estado del Código

| Componente | Estado | Observaciones |
|---|---|---|
| **Backend** | Parcialmente iniciado | Spring Boot 4.1.2 con Java 21, PostgreSQL + PostGIS, Hibernate Spatial configurado. Existen todas las entidades JPA mapeadas (Usuario, Rol, Incidente, CategoriaIncidente, EstadoIncidente, TipoVoto, Validacion, Reputacion, PreferenciaUsuario, UsuarioSeguidor, DirectorioEmergencia, IntervencionAutoridad). Todos los DAOs (interfaces JpaRepository) ya están creados. Falta: controllers, services, DTOs, security/JWT, WebSocket, lógica de negocio (consenso, geofencing, anti-duplicidad). |
| **Frontend** | Inicial/Template | Vite + React 19 instalado. Solo tiene `App.jsx` con template por defecto. No hay rutas, componentes, mapa Leaflet, autenticación, etc. |
| **Base de Datos** | Especificada | Script SQL completo en `integ/CREACION-DB-ALERTABARRIO (1).sql` con todas las tablas, índices GiST, trigger para inicialización 1:1, datos semilla. Diagrama ER disponible. |
| **Documentación/Planificación** | Completa | Documento técnico detallado con requerimientos, arquitectura, reglas de negocio (motor de consenso, reputación, geofencing, anti-duplicidad), pantallas (P01-P10), matriz RF/RNF, wireframes PNG en `integ/Wireframe Integrador I/`. |

### 1.2 Elementos Clave Identificados

**Reglas de Negocio Críticas:**
- **Motor de consenso:** $C_{incidente} = \frac{\sum (V_{positivos} \times R_{usuario})}{\sum V_{totales}} \times 100$. Promoción automática a `CONFIRMADO` si $C >= 75\%$ y total de validaciones >= 3.
- **Geofencing validación:** Solo usuarios dentro de 500m pueden votar (usar `ST_DWithin` con geography).
- **Anti-duplicidad:** Si existe incidente activo (PENDIENTE/CONFIRMADO) de misma categoría, dentro de 50m, en últimas 2 horas → no crear nuevo incidente, convertir a voto de confirmación.
- **Reputación gamificada:** +2 pts por validación acertada, peso ponderado según confiabilidad.
- **Autoridades (`ROLE_AUTHORITY`):** Confirmación inmediata y peso absoluto, pueden cerrar desde dashboard.

**Tecnologías:** Java 21, Spring Boot 4.1.2, Spring Data JPA, Hibernate Spatial, PostgreSQL 15+ PostGIS, JWT (falta agregar), WebSocket/STOMP (falta), React 19 + Vite, Leaflet.js (falta agregar), Tailwind CSS (sugerido).

## 2. Recomendación de Orden de Implementación

**Recomendado: Enfoque Backend-First con Modelo Dominio Sólido, luego Frontend por Pantallas Integradas**

Razón: Las reglas de negocio son complejas (espaciales, consenso, anti-duplicidad). Es mejor tener APIs validadas antes de conectar UI. Además, ya hay entidades/DAOs base.

Orden sugerido: **Fase 0 (Infra) → Fase 1 (Backend Core) → Fase 2 (Backend Lógica de Negocio) → Fase 3 (Frontend Base + Auth) → Fase 4 (Frontend Features por Flujo)**

## 3. Plan de Trabajo Detallado

### Fase 0: Infraestructura y Configuración (1-2 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **0.1 Configurar PostGIS** | Alta | Crear BD `alerta_barrio_db` con extensiones uuid-ossp y postgis. Ejecutar script `CREACION-DB-ALERTABARRIO (1).sql`. |
| **0.2 Ajustar config Backend** | Alta | Verificar `application.properties`. Añadir configuración para Hibernate Spatial si es necesario. Añadir dependencias faltantes (spring-boot-starter-security, jjwt, spring-boot-starter-websocket). |
| **0.3 Configurar Frontend** | Alta | Instalar dependencias: `leaflet`, `react-leaflet`, `react-router-dom`, `axios`, `sockjs-client`, `stompjs` (o `@stomp/stompjs`), `tailwindcss` + plugins. Configurar estructura de carpetas. |
| **0.4 Variables de entorno** | Media | Crear `.env.example` para backend/frontend. |

### Fase 1: Backend Core - DTOs, Seguridad, Auth (2-3 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **1.1 DTOs base** | Alta | Crear DTOs: `UsuarioDTO`, `AuthRequest/Response`, `IncidenteDTO`, `ValidacionDTO`, etc. Usar records o clases con validación (Bean Validation). |
| **1.2 Configuración Security + JWT** | Alta | Implementar `SecurityConfig`, `JwtTokenProvider`, `JwtAuthenticationFilter`, `UserDetailsService`. Roles `CIUDADANO`, `AUTORIDAD`. BCrypt para contraseñas. |
| **1.3 Auth Controller/Service** | Alta | Endpoints: `POST /auth/register`, `POST /auth/login`. Al registrar, rol por defecto CIUDADANO. Trigger ya crea reputación/preferencia. |
| **1.4 Exception handling** | Alta | `@ControllerAdvice` con manejo de errores, validaciones, 403/401. |
| **1.5 Mappers** | Media | Crear mappers (MapStruct o manual) para convertir Entity <-> DTO. |

### Fase 2: Backend - Catálogos, Incidentes y Lógica Espacial (3-4 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **2.1 Catálogos** | Alta | Endpoints para `rol`, `categoria-incidente`, `estado-incidente`, `tipo-voto`, `directorio-emergencia`. GET públicos donde aplique. |
| **2.2 Servicio Geoespacial** | Alta | Crear `GeometryUtil` para crear Point con SRID 4326. Crear `GeofencingService` con método para validar si usuario está dentro de radio usando lógica PostGIS. |
| **2.3 Crear Incidente (con anti-duplicidad)** | Crítica | Implementar lógica RN-07: buscar duplicado con `ST_DWithin` (50m), misma categoría, estados PENDIENTE/CONFIRMADO, últimos 2h. Si existe → crear validación CONFIRMAR automática, sumar evidencia. Si no existe → crear incidente en PENDIENTE. |
| **2.4 Listado/Feed de Incidentes** | Alta | Endpoint con filtros: por radio (500m/1km/distrito), por categoría, por estado. Usar `ST_DWithin` con geography. Ordenar por fecha desc. Incluir conteo de vecinos/votos. |
| **2.5 Detalle de Incidente** | Alta | Obtener incidente con validaciones, autor, categoría, estado, ubicación. |
| **2.6 Motor de Consenso** | Crítica | Servicio para calcular $C_{incidente}$ al emitir validación. Aplicar pesos según reputación/rol. Si $C>=75%$ y >=3 validaciones → pasar a CONFIRMADO. Actualizar contadores. |

### Fase 3: Backend - Validaciones, Autoridades, WebSocket (2-3 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **3.1 Emitir Validación** | Crítica | Validar: usuario autenticado, no ser el autor, no haber votado antes (constraint unique), estar dentro de 500m del incidente. Aplicar peso según rol/reputación. Otorgar puntos si aplica. Recalcular consenso. |
| **3.2 Sistema de Reputación** | Alta | Actualizar reputación al cerrar/resolver incidente o por acierto. Calcular porcentaje confiabilidad y acierto. Actualizar nivel (gamificación). |
| **3.3 Módulo Autoridades (Dashboard)** | Alta | Endpoints restringidos a `ROLE_AUTHORITY`. Cambiar estado, crear `intervencion_autoridad` (unidad, mensaje), marcar RESUELTO. Confirmación inmediata. |
| **3.4 Red Vecinal** | Media | Seguir/dejar de seguir usuarios. Listar seguidos. Priorizar alertas de seguidos. |
| **3.5 WebSocket/STOMP** | Alta | Configurar `WebSocketConfig`. Emitir eventos: nuevo incidente, nuevo voto, cambio de estado, intervención autoridad. Para feed en tiempo real y dashboard. |
| **3.6 Directorio Emergencias** | Baja | CRUD/listado filtrable por distrito. |

### Fase 4: Frontend Base, Auth, Onboarding (2-3 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **4.1 Estructura Frontend** | Alta | Carpetas: `components/`, `pages/`, `services/`, `context/`, `hooks/`, `utils/`, `assets/`. Configurar React Router. |
| **4.2 Layout y Navegación** | Alta | Bottom navigation móvil (Home/Mapa/Reportar/Directorio/Perfil). Ver wireframe Mobile.png y pantallas. |
| **4.3 Auth Context + API** | Alta | Contexto para usuario/sesión JWT (localStorage). Axios con interceptor para token. Páginas Login/Registro modal (P02). |
| **4.4 Onboarding** | Media | Carrusel 3 pasos (P01), solicitud GPS, modo explorador con coordenadas por defecto Piura/Castilla. Guardar flag en localStorage. |
| **4.5 Geolocalización** | Alta | Hook `useGeolocation` para obtener posición actual. Manejo de permisos. |

### Fase 5: Frontend - Mapa, Reporte, Feed (3-4 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **5.1 Mapa Principal (P03)** | Crítica | Integrar Leaflet + OpenStreetMap. Mostrar pines por categoría/estado con colores. Botón FAB (+) para reportar. Centrar en ubicación usuario. |
| **5.2 Flujo de Reporte (P04-P05)** | Crítica | Paso 1: selección de categoría (6 opciones). Paso 2: GPS automático, preview foto, descripción opcional, publicar. Validar auth antes de publicar. Manejar respuesta anti-duplicidad (mensaje amigable). |
| **5.3 Feed Comunitario (P06)** | Alta | Lista de incidentes con filtros por radio/chips categoría. Mostrar autor, reputación, botón seguir, barra de confianza, botones votar. Actualización en tiempo real vía WebSocket. |
| **5.4 Detalle de Alerta (P07)** | Alta | Vista detalle con foto, mapa pequeño, barra de consenso, timeline de validaciones, barra inferior para votar (solo autenticados y dentro de 500m). |
| **5.5 Conexión WebSocket** | Alta | Cliente STOMP para actualizar feed/mapa en tiempo real. |

### Fase 6: Frontend - Directorio, Perfil, Dashboard Autoridad (2-3 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **6.1 Directorio de Emergencias (P08)** | Media | Listado con filtro por distrito, `tel:` links. |
| **6.2 Perfil de Usuario (P09)** | Media | Badge nivel/reputación, métricas, historial de validaciones, seguidos, configuración radio. |
| **6.3 Dashboard Autoridades (P10)** | Alta | Vista desktop exclusiva ROLE_AUTORIDAD. Mapa de calor (usar datos de concentración), lista priorizada, modal asignar unidad/mensaje, marcar resuelto. Proteger ruta. |
| **6.4 Red Vecinal UI** | Media | Botones seguir/dejar seguir, lista de seguidos. |
| **6.5 Responsive/PWA** | Media | Ajustar a mobile-first 360-428px. Service worker básico si hay tiempo. Meta tags PWA. |

### Fase 7: Pruebas, Ajustes, Documentación (1-2 días)
| Tarea | Prioridad | Detalles |
|---|---|---|
| **7.1 Pruebas Backend** | Alta | Probar geofencing (500m), anti-duplicidad (50m/2h), motor de consenso (75% >=3), restricciones auth/roles. |
| **7.2 Pruebas Integración** | Alta | Flujo completo: registro → reporte → validación desde otro usuario en radio → promoción a CONFIRMADO. |
| **7.3 Ajustes UI/UX** | Media | Revisar wireframes, asegurar áreas táctiles >=48px, colores por categoría/estado. |
| **7.4 Documentación** | Media | Actualizar README con instrucciones setup (DB, backend, frontend). Documentar endpoints principales. |

## 4. Recomendaciones Técnicas

### Backend
- **Agregar dependencias faltantes al pom.xml:** `spring-boot-starter-security`, `spring-boot-starter-validation`, `spring-boot-starter-websocket`, `io.jsonwebtoken:jjwt-api/impl/jackson` (versión compatible con Java 21).
- **Configurar Hibernate Spatial:** Asegurar que dialecto funcione con PostGIS. Ya hay `hibernate-spatial` en deps.
- **Transacciones:** Usar `@Transactional` en servicios que modifiquen múltiples entidades (crear incidente + validación por anti-duplicidad, emitir validación + actualizar consenso + reputación).
- **Consultas Nativas:** Para `ST_DWithin` usar queries nativas como indica el doc técnico. Mapear resultados con cuidado.
- **DTOs:** No exponer entidades JPA directamente en APIs (evitar lazy loading issues). Usar DTOs con `@JsonView` o simplemente DTOs separados.
- **Seguridad:** Deshabilitar CSRF para APIs REST stateless. Configurar CORS para frontend.

### Frontend
- **Estructura de rutas:** `/onboarding`, `/mapa`, `/reporte`, `/feed`, `/alerta/:id`, `/directorio`, `/perfil`, `/dashboard` (protegida por rol).
- **Estado global:** Context API para auth + ubicación. Considerar Zustand si crece complejidad.
- **Mapas:** Leaflet requiere CSS. Importar `leaflet/dist/leaflet.css`. Configurar iconos correctamente.
- **Imágenes:** Comprimir en cliente antes de subir (objetivo <1MB según RF-03.3). Usar Canvas/FileReader.
- **WebSocket:** Reconexión automática, manejar desconexiones.
- **Validación:** Validar formularios en cliente, confiar en validación servidor.

### Base de Datos
- **Índices:** Ya existe índice GiST en `ubicacion`. Considerar índices adicionales: `incidente(fecha_hora_reporte)`, `validacion(incidente_id, usuario_id)`, `usuario(correo)`.
- **Datos semilla:** Ejecutar inserts de roles/categorías/estados/tipos voto del script SQL.
- **Usuario autoridad para pruebas:** Crear manualmente con rol AUTORIDAD.

## 5. Checklist de Inicio Inmediato

- [ ] **Paso 1:** Levantar PostgreSQL con PostGIS, crear BD y ejecutar script SQL
- [ ] **Paso 2:** Actualizar `pom.xml` con dependencias faltantes (security, validation, websocket, jwt)
- [ ] **Paso 3:** Configurar `application.properties` con credenciales BD correctas
- [ ] **Paso 4:** Crear estructura de paquetes backend: `config/`, `controller/`, `dto/`, `service/`, `service/impl/`, `security/`, `util/`, `exception/`
- [ ] **Paso 5:** Inicializar estructura frontend: carpetas, router, tailwind, dependencias mapa
- [ ] **Paso 6:** Implementar Auth (register/login/JWT) - base para todo lo demás
- [ ] **Paso 7:** Implementar crear incidente con anti-duplicidad - funcionalidad core

## 6. Archivos de Referencia

| Archivo | Uso |
|---|---|
| `integ/documento_de_contexto_y_especificaci_n_t_cnica.md` | Especificación completa - LEER SIEMPRE |
| `integ/CREACION-DB-ALERTABARRIO (1).sql` | Schema y datos semilla |
| `integ/Diagrama ER - DB -ALERTABARRIO (1).pdf` | Referencia visual (no se puede leer directo, pero útil) |
| `integ/Wireframe Integrador I/*.png` | UI/UX de todas las pantallas |
| `Backend/src/main/java/utp/alertaBarrio/model/*` | Entidades ya mapeadas correctamente |
| `Backend/src/main/java/utp/alertaBarrio/repository/*` | DAOs listos para usar |

## Conclusión

**Empezar por: BACKEND primero (Fase 0-3), enfocado en el core geoespacial.**

El proyecto está bien documentado. Lo más crítico son las reglas espaciales (geofencing, anti-duplicidad, ST_DWithin). Teniendo el backend funcional con estas reglas validadas, el frontend será más directo siguiendo los wireframes.

**Siguiente acción inmediata:** Configurar BD con PostGIS, añadir dependencias al backend, y empezar por Auth + GeofencingService.
