package utp.alertaBarrio.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.DirectorioEmergencia;

@Repository
public interface DirectorioEmergenciaDao extends JpaRepository<DirectorioEmergencia, UUID> {

    @Query("""
            select d from DirectorioEmergencia d
            where d.activo = true and lower(d.distrito) = lower(:distrito)
            order by d.entidadOficial
            """)
    List<DirectorioEmergencia> listarActivosPorDistrito(@Param("distrito") String distrito);
}
