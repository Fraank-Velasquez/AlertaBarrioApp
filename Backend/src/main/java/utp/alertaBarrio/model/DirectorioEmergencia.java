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
@Table(name = "directorio_emergencia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DirectorioEmergencia {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id_directorio", nullable = false, updatable = false)
    private UUID idDirectorio;

    @Column(name = "entidad_oficial", nullable = false, length = 150)
    private String entidadOficial;

    @Column(name = "numero_contacto", nullable = false, length = 20)
    private String numeroContacto;

    @Column(nullable = false, length = 100)
    private String distrito;

    @Column(name = "icono_entidad", length = 255)
    private String iconoEntidad;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
