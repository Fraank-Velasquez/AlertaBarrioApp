package utp.alertaBarrio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class IncidenteDTO {
    private UUID incidenteId;
    private UUID usuarioId;
    private String autorNombre;
    private UUID categoriaId;
    private String categoriaNombre;
    private UUID estadoId;
    private String estadoNombre;
    private Double latitud;
    private Double longitud;
    private String descripcion;
    private String fotoEvidenciaUrl;
    private LocalDateTime fechaHoraReporte;
    private BigDecimal indiceConfianzaPorcentaje;
    private Integer conteoVotosPositivos;
    private Integer conteoVotosNegativos;
    private boolean duplicado;
    private String mensaje;

    public UUID getIncidenteId() {
        return incidenteId;
    }

    public void setIncidenteId(UUID incidenteId) {
        this.incidenteId = incidenteId;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getAutorNombre() {
        return autorNombre;
    }

    public void setAutorNombre(String autorNombre) {
        this.autorNombre = autorNombre;
    }

    public UUID getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(UUID categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getCategoriaNombre() {
        return categoriaNombre;
    }

    public void setCategoriaNombre(String categoriaNombre) {
        this.categoriaNombre = categoriaNombre;
    }

    public UUID getEstadoId() {
        return estadoId;
    }

    public void setEstadoId(UUID estadoId) {
        this.estadoId = estadoId;
    }

    public String getEstadoNombre() {
        return estadoNombre;
    }

    public void setEstadoNombre(String estadoNombre) {
        this.estadoNombre = estadoNombre;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFotoEvidenciaUrl() {
        return fotoEvidenciaUrl;
    }

    public void setFotoEvidenciaUrl(String fotoEvidenciaUrl) {
        this.fotoEvidenciaUrl = fotoEvidenciaUrl;
    }

    public LocalDateTime getFechaHoraReporte() {
        return fechaHoraReporte;
    }

    public void setFechaHoraReporte(LocalDateTime fechaHoraReporte) {
        this.fechaHoraReporte = fechaHoraReporte;
    }

    public BigDecimal getIndiceConfianzaPorcentaje() {
        return indiceConfianzaPorcentaje;
    }

    public void setIndiceConfianzaPorcentaje(BigDecimal indiceConfianzaPorcentaje) {
        this.indiceConfianzaPorcentaje = indiceConfianzaPorcentaje;
    }

    public Integer getConteoVotosPositivos() {
        return conteoVotosPositivos;
    }

    public void setConteoVotosPositivos(Integer conteoVotosPositivos) {
        this.conteoVotosPositivos = conteoVotosPositivos;
    }

    public Integer getConteoVotosNegativos() {
        return conteoVotosNegativos;
    }

    public void setConteoVotosNegativos(Integer conteoVotosNegativos) {
        this.conteoVotosNegativos = conteoVotosNegativos;
    }

    public boolean isDuplicado() {
        return duplicado;
    }

    public void setDuplicado(boolean duplicado) {
        this.duplicado = duplicado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
