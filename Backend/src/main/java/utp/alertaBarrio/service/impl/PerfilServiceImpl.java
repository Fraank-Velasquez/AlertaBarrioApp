package utp.alertaBarrio.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.dto.ActualizarPerfilRequest;
import utp.alertaBarrio.dto.ActualizarPreferenciasRequest;
import utp.alertaBarrio.dto.PerfilDTO;
import utp.alertaBarrio.dto.PerfilPublicoDTO;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.PreferenciaUsuario;
import utp.alertaBarrio.model.Reputacion;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.model.UsuarioSeguidor;
import utp.alertaBarrio.model.Validacion;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.PreferenciaUsuarioDao;
import utp.alertaBarrio.repository.ReputacionDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.repository.UsuarioSeguidorDao;
import utp.alertaBarrio.repository.ValidacionDao;
import utp.alertaBarrio.service.PerfilService;

@Service
public class PerfilServiceImpl implements PerfilService {
    private final UsuarioDao usuarioDao;
    private final ReputacionDao reputacionDao;
    private final PreferenciaUsuarioDao preferenciaDao;
    private final IncidenteDao incidenteDao;
    private final ValidacionDao validacionDao;
    private final UsuarioSeguidorDao seguidorDao;

    public PerfilServiceImpl(
            UsuarioDao usuarioDao,
            ReputacionDao reputacionDao,
            PreferenciaUsuarioDao preferenciaDao,
            IncidenteDao incidenteDao,
            ValidacionDao validacionDao,
            UsuarioSeguidorDao seguidorDao) {
        this.usuarioDao = usuarioDao;
        this.reputacionDao = reputacionDao;
        this.preferenciaDao = preferenciaDao;
        this.incidenteDao = incidenteDao;
        this.validacionDao = validacionDao;
        this.seguidorDao = seguidorDao;
    }

    @Override
    @Transactional(readOnly = true)
    public PerfilDTO obtener(UUID usuarioId) {
        return construirPerfil(usuarioActivo(usuarioId));
    }

    @Override
    @Transactional
    public PerfilDTO actualizar(UUID usuarioId, ActualizarPerfilRequest request) {
        Usuario usuario = usuarioActivo(usuarioId);
        usuario.setNombres(request.getNombres().trim());
        usuario.setApellidos(request.getApellidos().trim());
        usuario.setSectorResidencia(normalizar(request.getSectorResidencia()));
        usuario.setFotoAvatarUrl(normalizar(request.getFotoAvatarUrl()));
        return construirPerfil(usuarioDao.save(usuario));
    }

    @Override
    @Transactional
    public PerfilDTO actualizarPreferencias(UUID usuarioId, ActualizarPreferenciasRequest request) {
        Usuario usuario = usuarioActivo(usuarioId);
        PreferenciaUsuario preferencias = preferenciaDao.findById(usuarioId)
                .orElseGet(() -> PreferenciaUsuario.builder().usuarioId(usuarioId).usuario(usuario).build());
        preferencias.setRadioCoberturaGeografica(request.getRadioCoberturaGeografica());
        preferencias.setRecibirAlertasGlobales(request.getRecibirAlertasGlobales());
        preferencias.setRecibirAlertasVecinos(request.getRecibirAlertasVecinos());
        preferenciaDao.save(preferencias);
        return construirPerfil(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public PerfilPublicoDTO obtenerPublico(UUID usuarioId, UUID visitanteId) {
        Usuario usuario = usuarioActivo(usuarioId);
        PerfilPublicoDTO dto = new PerfilPublicoDTO();
        dto.setUsuarioId(usuario.getUsuarioId());
        dto.setNombre(usuario.getNombres() + " " + usuario.getApellidos());
        dto.setSectorResidencia(usuario.getSectorResidencia());
        dto.setFotoAvatarUrl(usuario.getFotoAvatarUrl());
        dto.setFechaRegistro(usuario.getFechaRegistro());
        reputacionDao.findById(usuarioId).ifPresent(reputacion -> {
            dto.setNivelReputacion(reputacion.getNivelReputacion());
            dto.setPorcentajeConfiabilidad(reputacion.getPorcentajeConfiabilidad());
        });
        dto.setSeguidores(seguidorDao.listarSeguidores(usuarioId).size());
        dto.setSiguiendo(seguidorDao.listarSeguidos(usuarioId).size());
        dto.setSiguiendoUsuario(visitanteId != null
                && !visitanteId.equals(usuarioId)
                && seguidorDao.esSeguidor(visitanteId, usuarioId));
        return dto;
    }

    private PerfilDTO construirPerfil(Usuario usuario) {
        PerfilDTO dto = new PerfilDTO();
        dto.setUsuarioId(usuario.getUsuarioId());
        dto.setNombres(usuario.getNombres());
        dto.setApellidos(usuario.getApellidos());
        dto.setCorreo(usuario.getCorreo());
        dto.setSectorResidencia(usuario.getSectorResidencia());
        dto.setFotoAvatarUrl(usuario.getFotoAvatarUrl());
        dto.setFechaRegistro(usuario.getFechaRegistro());
        dto.setRol(usuario.getRol().getNombreRol());

        reputacionDao.findById(usuario.getUsuarioId()).ifPresent(reputacion -> aplicarReputacion(dto, reputacion));

        PreferenciaUsuario preferencias = preferenciaDao.findById(usuario.getUsuarioId())
                .orElseGet(() -> PreferenciaUsuario.builder().radioCoberturaGeografica(new java.math.BigDecimal("1000.00"))
                        .recibirAlertasGlobales(true).recibirAlertasVecinos(true).build());
        PerfilDTO.PreferenciasDTO preferenciasDTO = new PerfilDTO.PreferenciasDTO();
        preferenciasDTO.setRadioCoberturaGeografica(preferencias.getRadioCoberturaGeografica());
        preferenciasDTO.setRecibirAlertasGlobales(preferencias.getRecibirAlertasGlobales());
        preferenciasDTO.setRecibirAlertasVecinos(preferencias.getRecibirAlertasVecinos());
        dto.setPreferencias(preferenciasDTO);

        List<Incidente> reportes = incidenteDao.listarPorUsuario(usuario.getUsuarioId());
        dto.setReportesRecientes(reportes.stream().limit(20).map(this::mapReporte).collect(Collectors.toList()));
        List<Validacion> validaciones = validacionDao.listarPorUsuario(usuario.getUsuarioId());
        dto.setValidacionesRecientes(validaciones.stream().limit(20).map(this::mapValidacion).collect(Collectors.toList()));
        List<UsuarioSeguidor> seguidos = seguidorDao.listarSeguidos(usuario.getUsuarioId());
        List<UsuarioSeguidor> seguidores = seguidorDao.listarSeguidores(usuario.getUsuarioId());
        dto.setSiguiendo(seguidos.size());
        dto.setSeguidores(seguidores.size());
        dto.setVecinosSeguidos(seguidos.stream().map(this::mapVecino).collect(Collectors.toList()));
        return dto;
    }

    private void aplicarReputacion(PerfilDTO dto, Reputacion r) {
        dto.setNivelReputacion(r.getNivelReputacion());
        dto.setPorcentajeConfiabilidad(r.getPorcentajeConfiabilidad());
        dto.setExperienciaPts(r.getExperienciaPts());
        dto.setPorcentajeAcierto(r.getPorcentajeAcierto());
        dto.setCantReportesCreados(r.getCantReportesCreados());
        dto.setCantValidacionesEmitidas(r.getCantValidacionesEmitidas());
    }

    private PerfilDTO.ActividadReporteDTO mapReporte(Incidente incidente) {
        PerfilDTO.ActividadReporteDTO dto = new PerfilDTO.ActividadReporteDTO();
        dto.setIncidenteId(incidente.getIncidenteId());
        dto.setCategoriaNombre(incidente.getCategoria().getNombre());
        dto.setEstadoNombre(incidente.getEstado().getNombre());
        dto.setDescripcion(incidente.getDescripcion());
        dto.setFechaHoraReporte(incidente.getFechaHoraReporte());
        return dto;
    }

    private PerfilDTO.ActividadValidacionDTO mapValidacion(Validacion validacion) {
        PerfilDTO.ActividadValidacionDTO dto = new PerfilDTO.ActividadValidacionDTO();
        dto.setValidacionId(validacion.getValidacionId());
        dto.setIncidenteId(validacion.getIncidente().getIncidenteId());
        dto.setTipoVoto(validacion.getTipoVoto().getNombre());
        dto.setFechaHoraEmision(validacion.getFechaHoraEmision());
        return dto;
    }

    private PerfilDTO.VecinoDTO mapVecino(UsuarioSeguidor relacion) {
        Usuario vecino = relacion.getSeguido();
        PerfilDTO.VecinoDTO dto = new PerfilDTO.VecinoDTO();
        dto.setUsuarioId(vecino.getUsuarioId());
        dto.setNombre(vecino.getNombres() + " " + vecino.getApellidos());
        dto.setSectorResidencia(vecino.getSectorResidencia());
        dto.setFotoAvatarUrl(vecino.getFotoAvatarUrl());
        reputacionDao.findById(vecino.getUsuarioId()).ifPresent(reputacion -> {
            dto.setNivelReputacion(reputacion.getNivelReputacion());
            dto.setCantReportesCreados(reputacion.getCantReportesCreados());
            dto.setCantValidacionesEmitidas(reputacion.getCantValidacionesEmitidas());
        });
        dto.setSeguidores(seguidorDao.listarSeguidores(vecino.getUsuarioId()).size());
        dto.setSiguiendo(seguidorDao.listarSeguidos(vecino.getUsuarioId()).size());
        return dto;
    }

    private Usuario usuarioActivo(UUID usuarioId) {
        return usuarioDao.buscarActivoPorId(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private String normalizar(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
