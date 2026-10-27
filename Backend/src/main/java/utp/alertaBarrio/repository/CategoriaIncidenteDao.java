package utp.alertaBarrio.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.CategoriaIncidente;

@Repository
public interface CategoriaIncidenteDao extends JpaRepository<CategoriaIncidente, UUID> {

    @Query("select c from CategoriaIncidente c where c.activo = true order by c.nombre")
    List<CategoriaIncidente> listarActivas();

    @Query("select c from CategoriaIncidente c where lower(c.nombre) = lower(:nombre)")
    Optional<CategoriaIncidente> buscarPorNombre(@Param("nombre") String nombre);

    default Optional<CategoriaIncidente> findByNombre(String nombre) {
        return buscarPorNombre(nombre);
    }
}
