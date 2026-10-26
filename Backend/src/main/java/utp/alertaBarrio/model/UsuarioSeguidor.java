package utp.alertaBarrio.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "usuario_seguidor")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioSeguidor {

    @EmbeddedId
    private UsuarioSeguidorId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("seguidorId")
    @JoinColumn(name = "seguidor_id", nullable = false)
    private Usuario seguidor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("seguidoId")
    @JoinColumn(name = "seguido_id", nullable = false)
    private Usuario seguido;

    @CreationTimestamp
    @jakarta.persistence.Column(name = "fecha_seguimiento", nullable = false, updatable = false)
    private LocalDateTime fechaSeguimiento;
}
