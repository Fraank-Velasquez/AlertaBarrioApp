package utp.alertaBarrio.service;

import java.util.List;
import utp.alertaBarrio.dto.CrearIncidenteRequest;
import utp.alertaBarrio.dto.IncidenteDTO;

public interface IncidenteService {
    IncidenteDTO crearIncidente(CrearIncidenteRequest request, java.util.UUID usuarioId);
    List<IncidenteDTO> listarPorRadio(double latitud, double longitud, double radioMetros);
    List<IncidenteDTO> listarTodosActivos();
    IncidenteDTO obtenerPorId(java.util.UUID incidenteId);
}
