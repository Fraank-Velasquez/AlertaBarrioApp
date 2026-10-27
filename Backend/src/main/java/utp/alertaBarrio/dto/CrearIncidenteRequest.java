package utp.alertaBarrio.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CrearIncidenteRequest {
    @NotNull
    private UUID categoriaId;

    private String descripcion;

    private String fotoEvidenciaUrl;

    @NotNull
    private Double latitud;

    @NotNull
    private Double longitud;

    public UUID getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(UUID categoriaId) {
        this.categoriaId = categoriaId;
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
}
