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
@Table(name = "preferencia_usuario")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciaUsuario {

    @Id
    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "radio_cobertura_geografica", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal radioCoberturaGeografica = new BigDecimal("1000.00");

    @Column(name = "recibir_alertas_globales", nullable = false)
    @Builder.Default
    private Boolean recibirAlertasGlobales = true;

    @Column(name = "recibir_alertas_vecinos", nullable = false)
    @Builder.Default
    private Boolean recibirAlertasVecinos = true;
}
