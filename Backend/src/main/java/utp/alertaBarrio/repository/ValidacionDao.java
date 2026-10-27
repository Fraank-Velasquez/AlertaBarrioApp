package utp.alertaBarrio.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.Validacion;

@Repository
public interface ValidacionDao extends JpaRepository<Validacion, UUID> {

    @Query("""
            select v from Validacion v
            where v.incidente.incidenteId = :incidenteId
            order by v.fechaHoraEmision desc
            """)
    List<Validacion> listarPorIncidente(@Param("incidenteId") UUID incidenteId);

    @Query("""
            select v from Validacion v
            where v.usuario.usuarioId = :usuarioId
            order by v.fechaHoraEmision desc
            """)
    List<Validacion> listarPorUsuario(@Param("usuarioId") UUID usuarioId);

    @Query("""
            select count(v) > 0 from Validacion v
            where v.incidente.incidenteId = :incidenteId
            and v.usuario.usuarioId = :usuarioId
            """)
    boolean existeValidacion(
            @Param("incidenteId") UUID incidenteId,
            @Param("usuarioId") UUID usuarioId);

    boolean existsByIncidenteIncidenteIdAndUsuarioUsuarioId(UUID incidenteId, UUID usuarioId);
    List<Validacion> findByIncidenteIncidenteId(UUID incidenteId);
    long countByIncidenteIncidenteId(UUID incidenteId);
    java.util.Optional<Validacion> findByIncidenteIncidenteIdAndUsuarioUsuarioId(UUID incidenteId, UUID usuarioId);

    default boolean yaVoto(UUID incidenteId, UUID usuarioId) {
        return existeValidacion(incidenteId, usuarioId);
    }
}
