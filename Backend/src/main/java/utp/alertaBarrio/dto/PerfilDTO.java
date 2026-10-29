package utp.alertaBarrio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PerfilDTO {
    private UUID usuarioId;
    private String nombres;
    private String apellidos;
    private String correo;
    private String sectorResidencia;
    private String fotoAvatarUrl;
    private LocalDateTime fechaRegistro;
    private String rol;
    private Integer nivelReputacion;
    private BigDecimal porcentajeConfiabilidad;
    private Integer experienciaPts;
    private BigDecimal porcentajeAcierto;
    private Integer cantReportesCreados;
    private Integer cantValidacionesEmitidas;
    private long seguidores;
    private long siguiendo;
    private PreferenciasDTO preferencias;
    private List<ActividadReporteDTO> reportesRecientes;
    private List<ActividadValidacionDTO> validacionesRecientes;
    private List<VecinoDTO> vecinosSeguidos;

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getSectorResidencia() { return sectorResidencia; }
    public void setSectorResidencia(String sectorResidencia) { this.sectorResidencia = sectorResidencia; }
    public String getFotoAvatarUrl() { return fotoAvatarUrl; }
    public void setFotoAvatarUrl(String fotoAvatarUrl) { this.fotoAvatarUrl = fotoAvatarUrl; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Integer getNivelReputacion() { return nivelReputacion; }
    public void setNivelReputacion(Integer nivelReputacion) { this.nivelReputacion = nivelReputacion; }
    public BigDecimal getPorcentajeConfiabilidad() { return porcentajeConfiabilidad; }
    public void setPorcentajeConfiabilidad(BigDecimal porcentajeConfiabilidad) { this.porcentajeConfiabilidad = porcentajeConfiabilidad; }
    public Integer getExperienciaPts() { return experienciaPts; }
    public void setExperienciaPts(Integer experienciaPts) { this.experienciaPts = experienciaPts; }
    public BigDecimal getPorcentajeAcierto() { return porcentajeAcierto; }
    public void setPorcentajeAcierto(BigDecimal porcentajeAcierto) { this.porcentajeAcierto = porcentajeAcierto; }
    public Integer getCantReportesCreados() { return cantReportesCreados; }
    public void setCantReportesCreados(Integer cantReportesCreados) { this.cantReportesCreados = cantReportesCreados; }
    public Integer getCantValidacionesEmitidas() { return cantValidacionesEmitidas; }
    public void setCantValidacionesEmitidas(Integer cantValidacionesEmitidas) { this.cantValidacionesEmitidas = cantValidacionesEmitidas; }
    public long getSeguidores() { return seguidores; }
    public void setSeguidores(long seguidores) { this.seguidores = seguidores; }
    public long getSiguiendo() { return siguiendo; }
    public void setSiguiendo(long siguiendo) { this.siguiendo = siguiendo; }
    public PreferenciasDTO getPreferencias() { return preferencias; }
    public void setPreferencias(PreferenciasDTO preferencias) { this.preferencias = preferencias; }
    public List<ActividadReporteDTO> getReportesRecientes() { return reportesRecientes; }
    public void setReportesRecientes(List<ActividadReporteDTO> reportesRecientes) { this.reportesRecientes = reportesRecientes; }
    public List<ActividadValidacionDTO> getValidacionesRecientes() { return validacionesRecientes; }
    public void setValidacionesRecientes(List<ActividadValidacionDTO> validacionesRecientes) { this.validacionesRecientes = validacionesRecientes; }
    public List<VecinoDTO> getVecinosSeguidos() { return vecinosSeguidos; }
    public void setVecinosSeguidos(List<VecinoDTO> vecinosSeguidos) { this.vecinosSeguidos = vecinosSeguidos; }

    public static class PreferenciasDTO {
        private BigDecimal radioCoberturaGeografica;
        private Boolean recibirAlertasGlobales;
        private Boolean recibirAlertasVecinos;
        public BigDecimal getRadioCoberturaGeografica() { return radioCoberturaGeografica; }
        public void setRadioCoberturaGeografica(BigDecimal value) { this.radioCoberturaGeografica = value; }
        public Boolean getRecibirAlertasGlobales() { return recibirAlertasGlobales; }
        public void setRecibirAlertasGlobales(Boolean value) { this.recibirAlertasGlobales = value; }
        public Boolean getRecibirAlertasVecinos() { return recibirAlertasVecinos; }
        public void setRecibirAlertasVecinos(Boolean value) { this.recibirAlertasVecinos = value; }
    }

    public static class ActividadReporteDTO {
        private UUID incidenteId;
        private String categoriaNombre;
        private String estadoNombre;
        private String descripcion;
        private LocalDateTime fechaHoraReporte;
        public UUID getIncidenteId() { return incidenteId; }
        public void setIncidenteId(UUID value) { this.incidenteId = value; }
        public String getCategoriaNombre() { return categoriaNombre; }
        public void setCategoriaNombre(String value) { this.categoriaNombre = value; }
        public String getEstadoNombre() { return estadoNombre; }
        public void setEstadoNombre(String value) { this.estadoNombre = value; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String value) { this.descripcion = value; }
        public LocalDateTime getFechaHoraReporte() { return fechaHoraReporte; }
        public void setFechaHoraReporte(LocalDateTime value) { this.fechaHoraReporte = value; }
    }

    public static class ActividadValidacionDTO {
        private UUID validacionId;
        private UUID incidenteId;
        private String tipoVoto;
        private LocalDateTime fechaHoraEmision;
        public UUID getValidacionId() { return validacionId; }
        public void setValidacionId(UUID value) { this.validacionId = value; }
        public UUID getIncidenteId() { return incidenteId; }
        public void setIncidenteId(UUID value) { this.incidenteId = value; }
        public String getTipoVoto() { return tipoVoto; }
        public void setTipoVoto(String value) { this.tipoVoto = value; }
        public LocalDateTime getFechaHoraEmision() { return fechaHoraEmision; }
        public void setFechaHoraEmision(LocalDateTime value) { this.fechaHoraEmision = value; }
    }

    public static class VecinoDTO {
        private UUID usuarioId;
        private String nombre;
        private String sectorResidencia;
        private String fotoAvatarUrl;
        private Integer nivelReputacion;
        private Integer cantReportesCreados;
        private Integer cantValidacionesEmitidas;
        private long seguidores;
        private long siguiendo;
        public UUID getUsuarioId() { return usuarioId; }
        public void setUsuarioId(UUID value) { this.usuarioId = value; }
        public String getNombre() { return nombre; }
        public void setNombre(String value) { this.nombre = value; }
        public String getSectorResidencia() { return sectorResidencia; }
        public void setSectorResidencia(String value) { this.sectorResidencia = value; }
        public String getFotoAvatarUrl() { return fotoAvatarUrl; }
        public void setFotoAvatarUrl(String value) { this.fotoAvatarUrl = value; }
        public Integer getNivelReputacion() { return nivelReputacion; }
        public void setNivelReputacion(Integer value) { this.nivelReputacion = value; }
        public Integer getCantReportesCreados() { return cantReportesCreados; }
        public void setCantReportesCreados(Integer value) { this.cantReportesCreados = value; }
        public Integer getCantValidacionesEmitidas() { return cantValidacionesEmitidas; }
        public void setCantValidacionesEmitidas(Integer value) { this.cantValidacionesEmitidas = value; }
        public long getSeguidores() { return seguidores; }
        public void setSeguidores(long value) { this.seguidores = value; }
        public long getSiguiendo() { return siguiendo; }
        public void setSiguiendo(long value) { this.siguiendo = value; }
    }
}
