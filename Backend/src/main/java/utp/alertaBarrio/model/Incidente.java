package utp.alertaBarrio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "incidente")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Incidente {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "incidente_id", nullable = false, updatable = false)
    private UUID incidenteId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria", nullable = false)
    private CategoriaIncidente categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estado_incidente", nullable = false)
    private EstadoIncidente estado;

    @Column(nullable = false, columnDefinition = "geometry(Point,4326)")
    private Point ubicacion;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "foto_evidencia_url", columnDefinition = "TEXT")
    private String fotoEvidenciaUrl;

    @CreationTimestamp
    @Column(name = "fecha_hora_reporte", nullable = false, updatable = false)
    private LocalDateTime fechaHoraReporte;

    @Column(name = "indice_confianza_porcentaje", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal indiceConfianzaPorcentaje = new BigDecimal("0.00");

    @Column(name = "conteo_votos_positivos", nullable = false)
    @Builder.Default
    private Integer conteoVotosPositivos = 0;

    @Column(name = "conteo_votos_negativos", nullable = false)
    @Builder.Default
    private Integer conteoVotosNegativos = 0;
}
