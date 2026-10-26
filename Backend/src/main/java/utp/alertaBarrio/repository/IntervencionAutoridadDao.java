package utp.alertaBarrio.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.IntervencionAutoridad;

@Repository
public interface IntervencionAutoridadDao extends JpaRepository<IntervencionAutoridad, UUID> {

    @Query("""
            select i from IntervencionAutoridad i
            join fetch i.incidente
            join fetch i.usuario
            where i.incidente.incidenteId = :incidenteId
            """)
    Optional<IntervencionAutoridad> buscarPorIncidente(@Param("incidenteId") UUID incidenteId);
}
