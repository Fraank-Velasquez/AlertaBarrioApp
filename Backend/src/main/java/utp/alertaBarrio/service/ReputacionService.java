package utp.alertaBarrio.service;

import java.math.BigDecimal;
import java.util.UUID;
import utp.alertaBarrio.model.Reputacion;

public interface ReputacionService {

    Reputacion obtenerOCrear(UUID usuarioId);

    Reputacion recalcular(UUID usuarioId);

    void recalcularPorIncidente(UUID incidenteId);

    BigDecimal pesoVoto(UUID usuarioId);
}
