package utp.alertaBarrio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ActualizarPreferenciasRequest {
    @NotNull
    @DecimalMin("100")
    private BigDecimal radioCoberturaGeografica;
    @NotNull
    private Boolean recibirAlertasGlobales;
    @NotNull
    private Boolean recibirAlertasVecinos;

    public BigDecimal getRadioCoberturaGeografica() { return radioCoberturaGeografica; }
    public void setRadioCoberturaGeografica(BigDecimal value) { this.radioCoberturaGeografica = value; }
    public Boolean getRecibirAlertasGlobales() { return recibirAlertasGlobales; }
    public void setRecibirAlertasGlobales(Boolean value) { this.recibirAlertasGlobales = value; }
    public Boolean getRecibirAlertasVecinos() { return recibirAlertasVecinos; }
    public void setRecibirAlertasVecinos(Boolean value) { this.recibirAlertasVecinos = value; }
}
