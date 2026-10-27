package utp.alertaBarrio.security;

import java.util.Optional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.repository.UsuarioDao;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UsuarioDao usuarioDao;

    public CustomUserDetailsService(UsuarioDao usuarioDao) {
        this.usuarioDao = usuarioDao;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Usuario> usuarioOpt = usuarioDao.findByCorreo(username);
        Usuario usuario = usuarioOpt.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return new CustomUserDetails(
                usuario.getUsuarioId(),
                usuario.getCorreo(),
                usuario.getContrasenaHash(),
                usuario.getRol().getNombreRol(),
                Boolean.TRUE.equals(usuario.getActivo()));
    }
}
