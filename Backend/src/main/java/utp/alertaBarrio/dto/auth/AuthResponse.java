package utp.alertaBarrio.dto.auth;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UUID usuarioId;
    private String nombres;
    private String apellidos;
    private String correo;
    private String rol;

    public AuthResponse(String token, UUID usuarioId, String nombres, String apellidos, String correo, String rol) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.correo = correo;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public String getNombres() {
        return nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }
}
