package utp.alertaBarrio.service;

import utp.alertaBarrio.dto.IntervencionRequest;
import utp.alertaBarrio.model.Incidente;

import java.util.UUID;

public interface AutoridadService {
    Incidente marcarResuelto(UUID incidenteId, UUID autoridadId, IntervencionRequest request);
    Incidente cambiarEstado(UUID incidenteId, UUID estadoId);
}
