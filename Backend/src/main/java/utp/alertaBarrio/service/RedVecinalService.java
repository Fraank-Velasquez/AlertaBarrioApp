package utp.alertaBarrio.service;

import utp.alertaBarrio.model.UsuarioSeguidor;
import utp.alertaBarrio.model.UsuarioSeguidorId;

import java.util.UUID;

public interface RedVecinalService {
    void seguir(UUID seguidorId, UUID seguidoId);
    void dejarDeSeguir(UUID seguidorId, UUID seguidoId);
    boolean esSeguidor(UUID seguidorId, UUID seguidoId);
}
