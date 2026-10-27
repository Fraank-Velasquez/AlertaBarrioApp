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

        @Query(value = "SELECT * FROM incidente i " +
                "WHERE i.id_categoria = :categoriaId " +
                "AND i.id_estado_incidente IN (:estadosActivos) " +
                "AND i.fecha_hora_reporte >= NOW() - INTERVAL '2 hours' " +
                "AND ST_DWithin(i.ubicacion, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radioMetros) " +
                "ORDER BY i.fecha_hora_reporte DESC " +
                "LIMIT 1", nativeQuery = true)
        java.util.Optional<Incidente> buscarDuplicadoCercano(
                @Param("categoriaId") UUID categoriaId,
                @Param("estadosActivos") List<UUID> estadosActivos,
                @Param("lon") double lon,
                @Param("lat") double lat,
                @Param("radioMetros") double radioMetros);

        @Query(value = "SELECT * FROM incidente i " +
                "WHERE i.id_estado_incidente IN (:estadosActivos) " +
                "AND ST_DWithin(i.ubicacion, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radioMetros) " +
                "ORDER BY i.fecha_hora_reporte DESC", nativeQuery = true)
        List<Incidente> listarPorRadio(
                @Param("estadosActivos") List<UUID> estadosActivos,
                @Param("lon") double lon,
                @Param("lat") double lat,
                @Param("radioMetros") double radioMetros);
}
