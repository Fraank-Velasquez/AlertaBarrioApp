package utp.alertaBarrio.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.PreferenciaUsuario;

@Repository
public interface PreferenciaUsuarioDao extends JpaRepository<PreferenciaUsuario, UUID> {

    @Query("select p from PreferenciaUsuario p where p.usuarioId = :usuarioId")
    Optional<PreferenciaUsuario> buscarPorUsuario(@Param("usuarioId") UUID usuarioId);
}
