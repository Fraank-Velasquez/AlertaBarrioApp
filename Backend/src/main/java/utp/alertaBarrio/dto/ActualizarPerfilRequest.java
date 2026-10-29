package utp.alertaBarrio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ActualizarPerfilRequest {
    @NotBlank
    @Size(max = 50)
    private String nombres;
    @NotBlank
    @Size(max = 50)
    private String apellidos;
    @Size(max = 100)
    private String sectorResidencia;
    @Size(max = 500)
    private String fotoAvatarUrl;

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getSectorResidencia() { return sectorResidencia; }
    public void setSectorResidencia(String sectorResidencia) { this.sectorResidencia = sectorResidencia; }
    public String getFotoAvatarUrl() { return fotoAvatarUrl; }
    public void setFotoAvatarUrl(String fotoAvatarUrl) { this.fotoAvatarUrl = fotoAvatarUrl; }
}
