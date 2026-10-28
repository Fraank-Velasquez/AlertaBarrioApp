package utp.alertaBarrio.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/evidencias")
public class EvidenciaController {
    private final Path directorio;

    public EvidenciaController(
            @Value("${app.evidencias.storage-path:./uploads/evidencias}") String storagePath) {
        this.directorio = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @GetMapping("/{nombre:.+}")
    public ResponseEntity<Resource> obtener(@PathVariable String nombre) throws IOException {
        Path archivo = directorio.resolve(nombre).normalize();
        if (!archivo.getParent().equals(directorio) || !Files.exists(archivo)) {
            return ResponseEntity.notFound().build();
        }

        Resource recurso = new UrlResource(archivo.toUri());
        String contentType = Files.probeContentType(archivo);
        MediaType mediaType = contentType == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(contentType);
        return ResponseEntity.ok().contentType(mediaType).body(recurso);
    }
}
