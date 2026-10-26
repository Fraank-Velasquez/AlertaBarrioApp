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
@Table(name = "tipo_voto")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoVoto {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id_tipo_voto", nullable = false, updatable = false)
    private UUID idTipoVoto;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(length = 150)
    private String detalles;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
