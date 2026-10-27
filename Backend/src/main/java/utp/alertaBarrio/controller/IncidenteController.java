package utp.alertaBarrio.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.dto.CrearIncidenteRequest;
import utp.alertaBarrio.dto.IncidenteDTO;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.IncidenteService;

@RestController
@RequestMapping("/api/incidentes")
public class IncidenteController {
    private final IncidenteService incidenteService;

    public IncidenteController(IncidenteService incidenteService) {
        this.incidenteService = incidenteService;
    }

    @PostMapping
    public ResponseEntity<IncidenteDTO> crear(@AuthenticationPrincipal CustomUserDetails userDetails,
                                             @RequestBody CrearIncidenteRequest request) {
        IncidenteDTO dto = incidenteService.crearIncidente(request, userDetails.getUsuarioId());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/cercanos")
    public ResponseEntity<List<IncidenteDTO>> cercanos(@RequestParam double latitud,
                                                       @RequestParam double longitud,
                                                       @RequestParam(defaultValue = "1000") double radioMetros) {
        return ResponseEntity.ok(incidenteService.listarPorRadio(latitud, longitud, radioMetros));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidenteDTO> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(incidenteService.obtenerPorId(id));
    }
}
