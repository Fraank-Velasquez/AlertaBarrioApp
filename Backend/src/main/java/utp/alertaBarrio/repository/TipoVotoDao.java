package utp.alertaBarrio.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.TipoVoto;

@Repository
public interface TipoVotoDao extends JpaRepository<TipoVoto, UUID> {

    @Query("select t from TipoVoto t where t.activo = true order by t.nombre")
    List<TipoVoto> listarActivos();

    @Query("select t from TipoVoto t where lower(t.nombre) = lower(:nombre)")
    Optional<TipoVoto> buscarPorNombre(@Param("nombre") String nombre);

    default Optional<TipoVoto> findByNombre(String nombre) {
        return buscarPorNombre(nombre);
    }
}
