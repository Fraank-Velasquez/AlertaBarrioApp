package utp.alertaBarrio.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank
    @Size(max = 50)
    private String nombres;

    @NotBlank
    @Size(max = 50)
    private String apellidos;

    @NotBlank
    @Email
    @Size(max = 100)
    private String correo;

    @NotBlank
    @Size(min = 6, max = 255)
    private String contrasena;

    @Size(max = 100)
    private String sectorResidencia;

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getSectorResidencia() {
        return sectorResidencia;
    }

    public void setSectorResidencia(String sectorResidencia) {
        this.sectorResidencia = sectorResidencia;
    }
}
