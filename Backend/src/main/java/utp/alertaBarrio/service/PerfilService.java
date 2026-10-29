package utp.alertaBarrio.service;

import java.util.UUID;
import utp.alertaBarrio.dto.ActualizarPerfilRequest;
import utp.alertaBarrio.dto.ActualizarPreferenciasRequest;
import utp.alertaBarrio.dto.PerfilDTO;
import utp.alertaBarrio.dto.PerfilPublicoDTO;

public interface PerfilService {
    PerfilDTO obtener(UUID usuarioId);
    PerfilDTO actualizar(UUID usuarioId, ActualizarPerfilRequest request);
    PerfilDTO actualizarPreferencias(UUID usuarioId, ActualizarPreferenciasRequest request);
    PerfilPublicoDTO obtenerPublico(UUID usuarioId, UUID visitanteId);
}
