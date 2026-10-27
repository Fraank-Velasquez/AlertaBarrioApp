package utp.alertaBarrio.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.Usuario;

@Repository
public interface UsuarioDao extends JpaRepository<Usuario, UUID> {

    @Query("select u from Usuario u join fetch u.rol where lower(u.correo) = lower(:correo)")
    Optional<Usuario> buscarPorCorreo(@Param("correo") String correo);

    default Optional<Usuario> findByCorreo(String correo) {
        return buscarPorCorreo(correo);
    }

    @Query("select u from Usuario u where u.activo = true and u.usuarioId = :usuarioId")
    Optional<Usuario> buscarActivoPorId(@Param("usuarioId") UUID usuarioId);
}
