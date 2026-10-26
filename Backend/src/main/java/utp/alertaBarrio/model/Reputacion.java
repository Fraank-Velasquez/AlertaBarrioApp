package utp.alertaBarrio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reputacion")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reputacion {

    @Id
    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "nivel_reputacion", nullable = false)
    @Builder.Default
    private Integer nivelReputacion = 1;

    @Column(name = "porcentaje_confiabilidad", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal porcentajeConfiabilidad = new BigDecimal("50.00");

    @Column(name = "experiencia_pts", nullable = false)
    @Builder.Default
    private Integer experienciaPts = 0;

    @Column(name = "porcentaje_acierto", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal porcentajeAcierto = new BigDecimal("0.00");

    @Column(name = "cant_reportes_creados", nullable = false)
    @Builder.Default
    private Integer cantReportesCreados = 0;

    @Column(name = "cant_validaciones_emitidas", nullable = false)
    @Builder.Default
    private Integer cantValidacionesEmitidas = 0;
}
