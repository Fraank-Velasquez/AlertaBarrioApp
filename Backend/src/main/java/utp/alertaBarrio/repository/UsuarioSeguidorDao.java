package utp.alertaBarrio.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.UsuarioSeguidor;
import utp.alertaBarrio.model.UsuarioSeguidorId;

@Repository
public interface UsuarioSeguidorDao extends JpaRepository<UsuarioSeguidor, UsuarioSeguidorId> {

    @Query("select s from UsuarioSeguidor s join fetch s.seguido where s.seguidor.usuarioId = :seguidorId")
    List<UsuarioSeguidor> listarSeguidos(@Param("seguidorId") UUID seguidorId);

    @Query("select s from UsuarioSeguidor s join fetch s.seguidor where s.seguido.usuarioId = :seguidoId")
    List<UsuarioSeguidor> listarSeguidores(@Param("seguidoId") UUID seguidoId);

    @Query("""
            select count(s) > 0 from UsuarioSeguidor s
            where s.seguidor.usuarioId = :seguidorId and s.seguido.usuarioId = :seguidoId
            """)
    boolean existeSeguimiento(@Param("seguidorId") UUID seguidorId, @Param("seguidoId") UUID seguidoId);
}
