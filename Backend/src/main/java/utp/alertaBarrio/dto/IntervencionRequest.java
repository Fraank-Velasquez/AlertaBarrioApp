package utp.alertaBarrio.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class IntervencionRequest {
    @NotBlank
    private String unidadDespachada;

    private String mensajeComunicadoOficial;

    public String getUnidadDespachada() {
        return unidadDespachada;
    }

    public void setUnidadDespachada(String unidadDespachada) {
        this.unidadDespachada = unidadDespachada;
    }

    public String getMensajeComunicadoOficial() {
        return mensajeComunicadoOficial;
    }

    public void setMensajeComunicadoOficial(String mensajeComunicadoOficial) {
        this.mensajeComunicadoOficial = mensajeComunicadoOficial;
    }
}
