package utp.alertaBarrio.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.model.UsuarioSeguidor;
import utp.alertaBarrio.model.UsuarioSeguidorId;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.repository.UsuarioSeguidorDao;
import utp.alertaBarrio.service.RedVecinalService;

import java.util.UUID;

@Service
public class RedVecinalServiceImpl implements RedVecinalService {
    private final UsuarioSeguidorDao usuarioSeguidorDao;
    private final UsuarioDao usuarioDao;

    public RedVecinalServiceImpl(UsuarioSeguidorDao usuarioSeguidorDao, UsuarioDao usuarioDao) {
        this.usuarioSeguidorDao = usuarioSeguidorDao;
        this.usuarioDao = usuarioDao;
    }

    @Override
    @Transactional
    public void seguir(UUID seguidorId, UUID seguidoId) {
        if (seguidorId.equals(seguidoId)) {
            throw new RuntimeException("No puedes seguirte a ti mismo");
        }
        Usuario seguidor = usuarioDao.findById(seguidorId).orElseThrow();
        Usuario seguido = usuarioDao.findById(seguidoId).orElseThrow();
        UsuarioSeguidorId id = new UsuarioSeguidorId(seguidorId, seguidoId);
        if (!usuarioSeguidorDao.existsById(id)) {
            UsuarioSeguidor relacion = UsuarioSeguidor.builder()
                    .id(id)
                    .seguidor(seguidor)
                    .seguido(seguido)
                    .build();
            usuarioSeguidorDao.save(relacion);
        }
    }

    @Override
    @Transactional
    public void dejarDeSeguir(UUID seguidorId, UUID seguidoId) {
        UsuarioSeguidorId id = new UsuarioSeguidorId(seguidorId, seguidoId);
        usuarioSeguidorDao.deleteById(id);
    }

    @Override
    public boolean esSeguidor(UUID seguidorId, UUID seguidoId) {
        UsuarioSeguidorId id = new UsuarioSeguidorId(seguidorId, seguidoId);
        return usuarioSeguidorDao.existsById(id);
    }
}
