package utp.alertaBarrio.service;

import org.springframework.web.multipart.MultipartFile;

public interface EvidenciaStorageService {
    String guardar(MultipartFile archivo);
}
