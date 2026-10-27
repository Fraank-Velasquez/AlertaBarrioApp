package utp.alertaBarrio.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ValidacionRequest {
    @NotNull
    private UUID incidenteId;

    @NotNull
    private UUID tipoVotoId;

    private String notaActualizacionRapida;

    private String fotoEvidenciaUrl;

    public UUID getIncidenteId() {
        return incidenteId;
    }

    public void setIncidenteId(UUID incidenteId) {
        this.incidenteId = incidenteId;
    }

    public UUID getTipoVotoId() {
        return tipoVotoId;
    }

    public void setTipoVotoId(UUID tipoVotoId) {
        this.tipoVotoId = tipoVotoId;
    }

    public String getNotaActualizacionRapida() {
        return notaActualizacionRapida;
    }

    public void setNotaActualizacionRapida(String notaActualizacionRapida) {
        this.notaActualizacionRapida = notaActualizacionRapida;
    }

    public String getFotoEvidenciaUrl() {
        return fotoEvidenciaUrl;
    }

    public void setFotoEvidenciaUrl(String fotoEvidenciaUrl) {
        this.fotoEvidenciaUrl = fotoEvidenciaUrl;
    }
}
