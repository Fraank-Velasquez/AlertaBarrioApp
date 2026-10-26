package utp.alertaBarrio.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.Rol;

@Repository
public interface RolDao extends JpaRepository<Rol, UUID> {

    @Query("select r from Rol r where lower(r.nombreRol) = lower(:nombreRol)")
    Optional<Rol> buscarPorNombre(@Param("nombreRol") String nombreRol);
}
