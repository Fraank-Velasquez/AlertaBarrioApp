package utp.alertaBarrio.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.dto.ActualizarPerfilRequest;
import utp.alertaBarrio.dto.ActualizarPreferenciasRequest;
import utp.alertaBarrio.dto.PerfilDTO;
import utp.alertaBarrio.dto.PerfilPublicoDTO;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.PerfilService;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {
    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public ResponseEntity<PerfilDTO> obtener(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(perfilService.obtener(userDetails.getUsuarioId()));
    }

    @PatchMapping
    public ResponseEntity<PerfilDTO> actualizar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        return ResponseEntity.ok(perfilService.actualizar(userDetails.getUsuarioId(), request));
    }

    @PutMapping("/preferencias")
    public ResponseEntity<PerfilDTO> actualizarPreferencias(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ActualizarPreferenciasRequest request) {
        return ResponseEntity.ok(perfilService.actualizarPreferencias(userDetails.getUsuarioId(), request));
    }

    @GetMapping("/publico/{usuarioId}")
    public ResponseEntity<PerfilPublicoDTO> obtenerPublico(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID usuarioId) {
        return ResponseEntity.ok(perfilService.obtenerPublico(
                usuarioId, userDetails == null ? null : userDetails.getUsuarioId()));
    }
}
