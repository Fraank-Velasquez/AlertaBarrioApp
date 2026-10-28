package utp.alertaBarrio.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import utp.alertaBarrio.service.EvidenciaStorageService;

@Service
public class EvidenciaStorageServiceImpl implements EvidenciaStorageService {
    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final Map<String, String> EXTENSIONES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp");

    private final Path directorio;

    public EvidenciaStorageServiceImpl(
            @Value("${app.evidencias.storage-path:./uploads/evidencias}") String storagePath) {
        this.directorio = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @Override
    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("La evidencia de imagen no puede estar vacía");
        }
        if (archivo.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("La imagen no puede superar los 5 MB");
        }

        String contentType = archivo.getContentType();
        String extension = EXTENSIONES.get(contentType);
        if (extension == null) {
            throw new IllegalArgumentException("Solo se permiten imágenes JPG, PNG o WEBP");
        }

        String nombre = UUID.randomUUID() + extension;
        Path destino = directorio.resolve(nombre).normalize();
        if (!destino.getParent().equals(directorio)) {
            throw new IllegalStateException("Ruta de almacenamiento inválida");
        }

        try {
            Files.createDirectories(directorio);
            archivo.transferTo(destino);
            return "/api/public/evidencias/" + nombre;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo guardar la evidencia", ex);
        }
    }
}
