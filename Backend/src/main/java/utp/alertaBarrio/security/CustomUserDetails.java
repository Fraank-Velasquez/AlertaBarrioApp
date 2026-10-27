package utp.alertaBarrio.security;

import java.util.UUID;

public class CustomUserDetails implements org.springframework.security.core.userdetails.UserDetails {
    private UUID usuarioId;
    private String correo;
    private String contrasena;
    private String rolNombre;
    private boolean activo;

    public CustomUserDetails(UUID usuarioId, String correo, String contrasena, String rolNombre, boolean activo) {
        this.usuarioId = usuarioId;
        this.correo = correo;
        this.contrasena = contrasena;
        this.rolNombre = rolNombre;
        this.activo = activo;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public String getRolNombre() {
        return rolNombre;
    }

    @Override
    public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
        return java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + rolNombre));
    }

    @Override
    public String getPassword() {
        return contrasena;
    }

    @Override
    public String getUsername() {
        return correo;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
