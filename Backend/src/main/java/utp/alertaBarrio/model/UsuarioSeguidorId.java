package utp.alertaBarrio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UsuarioSeguidorId implements Serializable {

    @Column(name = "seguidor_id")
    private UUID seguidorId;

    @Column(name = "seguido_id")
    private UUID seguidoId;
}
