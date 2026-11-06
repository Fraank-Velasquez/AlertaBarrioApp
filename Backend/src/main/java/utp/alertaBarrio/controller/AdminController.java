package utp.alertaBarrio.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.dto.IncidenteDTO;
import utp.alertaBarrio.dto.IntervencionRequest;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.AutoridadService;
import utp.alertaBarrio.service.IncidenteService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('AUTORIDAD', 'ADMIN')")
public class AdminController {
    private final AutoridadService autoridadService;
    private final IncidenteService incidenteService;

    public AdminController(AutoridadService autoridadService, IncidenteService incidenteService) {
        this.autoridadService = autoridadService;
        this.incidenteService = incidenteService;
    }

    @GetMapping("/incidentes")
    public ResponseEntity<List<IncidenteDTO>> listar() {
        return ResponseEntity.ok(incidenteService.listarTodos());
    }

    @PostMapping("/incidentes/{id}/despachar")
    public ResponseEntity<IncidenteDTO> despachar(@PathVariable UUID id,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails,
                                                  @RequestBody IntervencionRequest request) {
        Incidente incidente = autoridadService.despachar(id, userDetails.getUsuarioId(), request);
        return ResponseEntity.ok(incidenteService.obtenerPorId(incidente.getIncidenteId()));
    }

    @PostMapping("/incidentes/{id}/resolver")
    public ResponseEntity<IncidenteDTO> resolver(@PathVariable UUID id,
                                                 @AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @RequestBody IntervencionRequest request) {
        Incidente incidente = autoridadService.marcarResuelto(id, userDetails.getUsuarioId(), request);
        return ResponseEntity.ok(incidenteService.obtenerPorId(incidente.getIncidenteId()));
    }

    @PutMapping("/incidentes/{id}/estado")
    public ResponseEntity<IncidenteDTO> cambiarEstado(@PathVariable UUID id, @RequestParam UUID estadoId) {
        Incidente incidente = autoridadService.cambiarEstado(id, estadoId);
        return ResponseEntity.ok(incidenteService.obtenerPorId(incidente.getIncidenteId()));
    }
}
