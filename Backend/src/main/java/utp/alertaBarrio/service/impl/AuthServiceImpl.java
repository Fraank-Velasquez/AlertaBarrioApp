package utp.alertaBarrio.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.dto.auth.AuthResponse;
import utp.alertaBarrio.dto.auth.LoginRequest;
import utp.alertaBarrio.dto.auth.RegisterRequest;
import utp.alertaBarrio.model.Rol;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.repository.RolDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.security.CustomUserDetails;
import utp.alertaBarrio.security.JwtTokenProvider;
import utp.alertaBarrio.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {
    private final UsuarioDao usuarioDao;
    private final RolDao rolDao;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(UsuarioDao usuarioDao, RolDao rolDao, PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.usuarioDao = usuarioDao;
        this.rolDao = rolDao;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioDao.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        Rol rolCiudadano = rolDao.findByNombreRol("CIUDADANO")
                .orElseThrow(() -> new RuntimeException("Rol CIUDADANO no encontrado"));

        Usuario usuario = Usuario.builder()
                .rol(rolCiudadano)
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .correo(request.getCorreo())
                .contrasenaHash(passwordEncoder.encode(request.getContrasena()))
                .sectorResidencia(request.getSectorResidencia())
                .activo(true)
                .build();

        Usuario saved = usuarioDao.save(usuario);

        CustomUserDetails userDetails = new CustomUserDetails(
                saved.getUsuarioId(),
                saved.getCorreo(),
                saved.getContrasenaHash(),
                saved.getRol().getNombreRol(),
                true);

        String token = tokenProvider.generateToken(userDetails);
        return new AuthResponse(token, saved.getUsuarioId(), saved.getNombres(), saved.getApellidos(),
                saved.getCorreo(), saved.getRol().getNombreRol());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getContrasena()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userDetails);

        Usuario usuario = usuarioDao.findByCorreo(userDetails.getUsername()).orElseThrow();
        return new AuthResponse(token, usuario.getUsuarioId(), usuario.getNombres(), usuario.getApellidos(),
                usuario.getCorreo(), usuario.getRol().getNombreRol());
    }
}
