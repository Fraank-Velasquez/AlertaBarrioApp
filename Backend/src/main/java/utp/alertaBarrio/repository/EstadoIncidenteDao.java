package utp.alertaBarrio.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.EstadoIncidente;

@Repository
public interface EstadoIncidenteDao extends JpaRepository<EstadoIncidente, UUID> {

    @Query("select e from EstadoIncidente e where e.activo = true order by e.nombre")
    List<EstadoIncidente> listarActivos();

    @Query("select e from EstadoIncidente e where lower(e.nombre) = lower(:nombre)")
    Optional<EstadoIncidente> buscarPorNombre(@Param("nombre") String nombre);
}
