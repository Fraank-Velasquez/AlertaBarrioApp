package utp.alertaBarrio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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

@Entity
@Table(name = "validacion", uniqueConstraints = @UniqueConstraint(
        name = "uq_incidente_usuario", columnNames = {"incidente_id", "usuario_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Validacion {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "validacion_id", nullable = false, updatable = false)
    private UUID validacionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incidente_id", nullable = false)
    private Incidente incidente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_voto", nullable = false)
    private TipoVoto tipoVoto;

    @Column(name = "peso_voto_ponderado", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pesoVotoPonderado = new BigDecimal("1.00");

    @Column(name = "nota_actualizacion_rapida", columnDefinition = "TEXT")
    private String notaActualizacionRapida;

    @Column(name = "foto_evidencia_url", columnDefinition = "TEXT")
    private String fotoEvidenciaUrl;

    @CreationTimestamp
    @Column(name = "fecha_hora_emision", nullable = false, updatable = false)
    private LocalDateTime fechaHoraEmision;

    @Column(name = "otorga_puntos_experiencia", nullable = false)
    @Builder.Default
    private Boolean otorgaPuntosExperiencia = false;
}
