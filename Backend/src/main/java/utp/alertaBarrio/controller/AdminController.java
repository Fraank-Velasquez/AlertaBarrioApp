package utp.alertaBarrio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.dto.IntervencionRequest;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.AutoridadService;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('AUTORIDAD')")
public class AdminController {
    private final AutoridadService autoridadService;

    public AdminController(AutoridadService autoridadService) {
        this.autoridadService = autoridadService;
    }

    @PostMapping("/incidentes/{id}/resolver")
    public ResponseEntity<Incidente> resolver(@PathVariable UUID id,
                                             @AuthenticationPrincipal CustomUserDetails userDetails,
                                             @RequestBody IntervencionRequest request) {
        Incidente incidente = autoridadService.marcarResuelto(id, userDetails.getUsuarioId(), request);
        return ResponseEntity.ok(incidente);
    }

    @PutMapping("/incidentes/{id}/estado")
    public ResponseEntity<Incidente> cambiarEstado(@PathVariable UUID id, @RequestParam UUID estadoId) {
        Incidente incidente = autoridadService.cambiarEstado(id, estadoId);
        return ResponseEntity.ok(incidente);
    }
}
