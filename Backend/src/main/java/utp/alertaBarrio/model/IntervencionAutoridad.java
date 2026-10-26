package utp.alertaBarrio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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
@Table(name = "intervencion_autoridad")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntervencionAutoridad {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "intervencion_autoridad_id", nullable = false, updatable = false)
    private UUID intervencionAutoridadId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incidente_id", nullable = false, unique = true)
    private Incidente incidente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "unidad_despachada", length = 150)
    private String unidadDespachada;

    @Column(name = "mensaje_comunicado_oficial", columnDefinition = "TEXT")
    private String mensajeComunicadoOficial;

    @CreationTimestamp
    @Column(name = "fecha_hora_despacho", nullable = false, updatable = false)
    private LocalDateTime fechaHoraDespacho;
}
