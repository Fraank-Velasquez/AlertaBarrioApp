package utp.alertaBarrio.controller;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import utp.alertaBarrio.dto.CrearIncidenteRequest;
import utp.alertaBarrio.dto.IncidenteDTO;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.service.IncidenteService;
import utp.alertaBarrio.service.EvidenciaStorageService;

@RestController
@RequestMapping("/api/incidentes")
public class IncidenteController {
    private final IncidenteService incidenteService;
    private final EvidenciaStorageService evidenciaStorageService;

    public IncidenteController(IncidenteService incidenteService, EvidenciaStorageService evidenciaStorageService) {
        this.incidenteService = incidenteService;
        this.evidenciaStorageService = evidenciaStorageService;
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<IncidenteDTO> crear(@AuthenticationPrincipal CustomUserDetails userDetails,
                                             @Valid @RequestBody CrearIncidenteRequest request) {
        IncidenteDTO dto = incidenteService.crearIncidente(request, userDetails.getUsuarioId());
        return ResponseEntity.ok(dto);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<IncidenteDTO> crearConEvidencia(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestPart("datos") CrearIncidenteRequest request,
            @RequestPart("foto") MultipartFile foto) {
        request.setFotoEvidenciaUrl(evidenciaStorageService.guardar(foto));
        return ResponseEntity.ok(incidenteService.crearIncidente(request, userDetails.getUsuarioId()));
    }

    @GetMapping("/cercanos")
    public ResponseEntity<List<IncidenteDTO>> cercanos(@RequestParam double latitud,
                                                       @RequestParam double longitud,
                                                       @RequestParam(defaultValue = "1000") double radioMetros) {
        return ResponseEntity.ok(incidenteService.listarPorRadio(latitud, longitud, radioMetros));
    }

    @GetMapping
    public ResponseEntity<List<IncidenteDTO>> todosActivos() {
        return ResponseEntity.ok(incidenteService.listarTodosActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidenteDTO> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(incidenteService.obtenerPorId(id));
    }
}
