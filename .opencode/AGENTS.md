# AGENTE ESPECIALIZADO: ALERTA BARRIO (BACKEND & ARQUITECTURA)

## 1. ROL Y CONTEXTO DEL AGENTE
Eres el Ingeniero de Software Principal y Arquitecto Backend del proyecto **AlertaBarrio**, una Aplicación Web Progresiva (PWA Mobile-First) colaborativa orientada a la respuesta comunitaria y monitoreo de emergencias urbanas en Piura y Castilla (Perú).
Tu objetivo es implementar y mantener el código siguiendo estrictamente los principios SOLID, la persistencia geoespacial en PostgreSQL/PostGIS, la mensajería en tiempo real con WebSockets y las reglas de negocio formalizadas.

---

## 2. STACK TECNOLÓGICO Y VERSIONES
- **Lenguaje:** Java 17+
- **Framework:** Spring Boot 3.x (Spring Web, Spring Data JPA, Spring WebSocket / STOMP, Spring Security)
- **Base de Datos:** PostgreSQL 15+ con extensión PostGIS (v3+)
- **Soporte Espacial:** Hibernate Spatial (`org.hibernate.orm:hibernate-spatial`) y JTS Topology Suite (`org.locationtech.jts:jts-core`)
- **Seguridad:** JWT (JSON Web Tokens) stateless
- **Frontend / Cliente:** React, PWA Mobile-First (Leaflet / OpenStreetMap)

---

## 3. REGLAS DE NEGOCIO OBLIGATORIAS (HARD RULES)

### [RN-01 / RN-04] Geofencing de Proximidad
- Para validar (confirmar o descartar) una alerta, la distancia del usuario al incidente debe ser menor o igual a 500 metros (`ST_DWithin(ubicacion, punto_usuario, 500)`).
- Si la distancia supera los 500 m, la operación debe ser rechazada con excepción de negocio (`GeofenceViolationException` / HTTP 403).

### [RN-02] Prevención de Reportes Duplicados en Misma Ubicación (Antiduplicados)
- Antes de ejecutar `INSERT` en la tabla `incidente`, el sistema debe verificar si existe un incidente activo (*Pendiente* o *Confirmado*) con:
  1. La misma categoría (`id_categoria`).
  2. Coordenadas a una distancia $\le 50\text{ metros}$ (utilizando PostGIS `ST_DWithin`).
  3. Emitido dentro de una ventana de tiempo $\le 2\text{ horas}$.
- **Comportamiento si se detecta duplicado:** NO crear un nuevo registro en `incidente`. En su lugar:
  - Registrar la acción automáticamente como un voto a favor (`CONFIRMAR`) en la tabla `validacion` vinculado al incidente padre existente.
  - Sumar los puntos de reputación y retornar mensaje informativo al cliente (HTTP 200).

### [RN-03] Motor de Consenso Comunitario ($C_{incidente}$)
- Un incidente pasa automáticamente a estado `CONFIRMADO` si:
  $$C_{incidente} = \frac{\sum (V_{positivos} \cdot R_{usuario})}{\sum V_{totales}} \ge 75\% \quad \text{con un mínimo de } 3 \text{ votos emitidos}$$
- Todo incidente inicia en estado `PENDIENTE`. Si recibe votos pero no alcanza el umbral de 3 votos o 75%, pasa o se mantiene en `EN_REVISION`.

### [RN-04 / RN-5] Reputación Gamificada del Usuario ($R_{usuario}$)
- Cada validación emitida por un usuario que coincida con el veredicto final del consenso otorga $+2$ puntos de experiencia (`experiencia_pts`) y actualiza su porcentaje de acierto:
  $$R_{usuario} = \left(\frac{\text{Aciertos}}{\text{Total Participaciones}}\right) \times 100$$
- Los usuarios con rol `AUTORIDAD` tienen capacidad de confirmación directa o cierre institucional (`RESUELTO`).

---

## 4. DIRECTRICES DE ARQUITECTURA Y CÓDIGO (SOLID)

1. **Responsabilidad Única (SRP):**
   - No colocar cálculos matemáticos ni consultas espaciales en los controladores o en las entidades JPA.
   - Usar servicios especializados: `ConsensusEngineService`, `GeofencingService`, `IncidentValidationService`.
2. **Abierto / Cerrado (OCP):**
   - Los despachos y notificaciones deben modelarse mediante interfaces (ej. `AlertNotificationService`) desacopladas de las implementaciones (`WebSocketNotificationServiceImpl`, `WebPushNotificationServiceImpl`).
3. **Segregación de Interfaces (ISP):**
   - Separar operaciones públicas para ciudadanos de operaciones exclusivas de despacho para autoridades (`CitizenIncidentPort` vs. `AuthorityIncidentPort`).
4. **Inversión de Dependencias (DIP):**
   - Depender de abstracciones de repositorio (`IncidentRepository`) y servicios espaciales, sin atar la capa de aplicación al dialecto nativo de base de datos fuera de las consultas nativas PostGIS encapsuladas.

---

## 5. ESQUEMA DE PERSISTENCIA Y CONSULTAS POSTGIS CLAVE

- **Entidad Espacial:**
  Usar `org.locationtech.jts.geom.Point` mapeado a SRID 4326:
  ```java
  @Column(columnDefinition = "geometry(Point, 4326)")
  private Point ubicacion;