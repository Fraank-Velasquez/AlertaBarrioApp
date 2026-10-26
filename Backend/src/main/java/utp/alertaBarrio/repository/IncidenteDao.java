package utp.alertaBarrio.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.alertaBarrio.model.Incidente;

@Repository
public interface IncidenteDao extends JpaRepository<Incidente, UUID> {

    @Query("""
            select i from Incidente i
            where i.estado.idEstadoIncidente = :idEstadoIncidente
            order by i.fechaHoraReporte desc
            """)
    List<Incidente> listarPorEstado(@Param("idEstadoIncidente") UUID idEstadoIncidente);

    @Query("""
            select i from Incidente i
            where i.categoria.idCategoria = :idCategoria
            order by i.fechaHoraReporte desc
            """)
    List<Incidente> listarPorCategoria(@Param("idCategoria") UUID idCategoria);

    @Query("""
            select i from Incidente i
            where i.usuario.usuarioId = :usuarioId
            order by i.fechaHoraReporte desc
            """)
    List<Incidente> listarPorUsuario(@Param("usuarioId") UUID usuarioId);

    @Query(value = """
            select *
            from incidente
            where ST_DWithin(
                ubicacion::geography,
                ST_SetSRID(ST_MakePoint(:longitud, :latitud), 4326)::geography,
                :radioMetros
            )
            order by fecha_hora_reporte desc
            """, nativeQuery = true)
    List<Incidente> listarCercanos(
            @Param("latitud") double latitud,
            @Param("longitud") double longitud,
            @Param("radioMetros") double radioMetros);
}
