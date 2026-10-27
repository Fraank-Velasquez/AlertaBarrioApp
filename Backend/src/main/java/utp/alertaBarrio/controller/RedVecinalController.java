package utp.alertaBarrio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.RedVecinalService;

import java.util.UUID;

@RestController
@RequestMapping("/api/red-vecinal")
public class RedVecinalController {
    private final RedVecinalService redVecinalService;

    public RedVecinalController(RedVecinalService redVecinalService) {
        this.redVecinalService = redVecinalService;
    }

    @PostMapping("/seguir/{seguidoId}")
    public ResponseEntity<Void> seguir(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID seguidoId) {
        redVecinalService.seguir(userDetails.getUsuarioId(), seguidoId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/seguir/{seguidoId}")
    public ResponseEntity<Void> dejarDeSeguir(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID seguidoId) {
        redVecinalService.dejarDeSeguir(userDetails.getUsuarioId(), seguidoId);
        return ResponseEntity.ok().build();
    }
}
