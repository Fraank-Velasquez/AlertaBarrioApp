package utp.alertaBarrio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PerfilPublicoDTO {
    private UUID usuarioId;
    private String nombre;
    private String sectorResidencia;
    private String fotoAvatarUrl;
    private LocalDateTime fechaRegistro;
    private Integer nivelReputacion;
    private BigDecimal porcentajeConfiabilidad;
    private long seguidores;
    private long siguiendo;
    private boolean siguiendoUsuario;

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getSectorResidencia() { return sectorResidencia; }
    public void setSectorResidencia(String sectorResidencia) { this.sectorResidencia = sectorResidencia; }
    public String getFotoAvatarUrl() { return fotoAvatarUrl; }
    public void setFotoAvatarUrl(String fotoAvatarUrl) { this.fotoAvatarUrl = fotoAvatarUrl; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public Integer getNivelReputacion() { return nivelReputacion; }
    public void setNivelReputacion(Integer nivelReputacion) { this.nivelReputacion = nivelReputacion; }
    public BigDecimal getPorcentajeConfiabilidad() { return porcentajeConfiabilidad; }
    public void setPorcentajeConfiabilidad(BigDecimal porcentajeConfiabilidad) { this.porcentajeConfiabilidad = porcentajeConfiabilidad; }
    public long getSeguidores() { return seguidores; }
    public void setSeguidores(long seguidores) { this.seguidores = seguidores; }
    public long getSiguiendo() { return siguiendo; }
    public void setSiguiendo(long siguiendo) { this.siguiendo = siguiendo; }
    public boolean isSiguiendoUsuario() { return siguiendoUsuario; }
    public void setSiguiendoUsuario(boolean siguiendoUsuario) { this.siguiendoUsuario = siguiendoUsuario; }
}
