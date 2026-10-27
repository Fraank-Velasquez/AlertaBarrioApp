package utp.alertaBarrio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.dto.ValidacionRequest;
import utp.alertaBarrio.model.Validacion;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.ValidacionService;

@RestController
@RequestMapping("/api/validaciones")
public class ValidacionController {
    private final ValidacionService validacionService;

    public ValidacionController(ValidacionService validacionService) {
        this.validacionService = validacionService;
    }

    @PostMapping
    public ResponseEntity<Validacion> emitir(@AuthenticationPrincipal CustomUserDetails userDetails,
                                             @RequestBody ValidacionRequest request) {
        Validacion validacion = validacionService.emitirValidacion(request, userDetails.getUsuarioId());
        return ResponseEntity.ok(validacion);
    }
}
