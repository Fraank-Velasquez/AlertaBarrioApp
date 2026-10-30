package utp.alertaBarrio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.dto.ValidacionConUbicacionRequest;
import utp.alertaBarrio.dto.ValidacionRequest;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.ValidacionService;
import utp.alertaBarrio.service.impl.ValidacionServiceImpl;

@RestController
@RequestMapping("/api/validaciones")
public class ValidacionController {
    private final ValidacionService validacionService;

    public ValidacionController(ValidacionService validacionService) {
        this.validacionService = validacionService;
    }

    @PostMapping
    public ResponseEntity<Void> emitir(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody ValidacionRequest request) {
        validacionService.emitirValidacion(request, userDetails.getUsuarioId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/con-ubicacion")
    public ResponseEntity<Void> emitirConUbicacion(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody ValidacionConUbicacionRequest request) {
        ((ValidacionServiceImpl) validacionService).emitirValidacionConUbicacion(
                request.getIncidenteId(), request.getTipoVotoId(), request.getNotaActualizacionRapida(),
                request.getFotoEvidenciaUrl(), request.getLatitud(), request.getLongitud(), userDetails.getUsuarioId());
        return ResponseEntity.ok().build();
    }
}
