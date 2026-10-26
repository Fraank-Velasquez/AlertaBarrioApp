package utp.alertaBarrio.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.Reputacion;

@Repository
public interface ReputacionDao extends JpaRepository<Reputacion, UUID> {

    @Query("select r from Reputacion r join fetch r.usuario where r.usuarioId = :usuarioId")
    Optional<Reputacion> buscarConUsuario(@Param("usuarioId") UUID usuarioId);
}
