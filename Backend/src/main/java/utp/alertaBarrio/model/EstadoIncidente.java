package utp.alertaBarrio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "estado_incidente")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadoIncidente {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id_estado_incidente", nullable = false, updatable = false)
    private UUID idEstadoIncidente;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(length = 150)
    private String detalles;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
