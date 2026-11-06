package utp.alertaBarrio.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.Reputacion;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.model.Validacion;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.ReputacionDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.repository.ValidacionDao;
import utp.alertaBarrio.service.ReputacionService;
import utp.alertaBarrio.util.ConfiabilidadUtil;

@Service
public class ReputacionServiceImpl implements ReputacionService {

    private static final int XP_REPORTE = 10;
    private static final int XP_VALIDACION = 5;
    private static final int XP_REPORTE_CONFIRMADO = 20;
    private static final int PUNTOS_POR_NIVEL = 100;
    private static final int CONFIANZA_INICIAL = 50;
    private static final int DELTA_CONFIANZA = 2;
    private static final BigDecimal CIEN = new BigDecimal("100");
    private static final BigDecimal PESO_MINIMO = new BigDecimal("0.5");
    private static final BigDecimal RANGO_PESO = new BigDecimal("1.5");

    private final ReputacionDao reputacionDao;
    private final UsuarioDao usuarioDao;
    private final IncidenteDao incidenteDao;
    private final ValidacionDao validacionDao;

    public ReputacionServiceImpl(ReputacionDao reputacionDao, UsuarioDao usuarioDao,
                                 IncidenteDao incidenteDao, ValidacionDao validacionDao) {
        this.reputacionDao = reputacionDao;
        this.usuarioDao = usuarioDao;
        this.incidenteDao = incidenteDao;
        this.validacionDao = validacionDao;
    }

    @Override
    @Transactional
    public Reputacion obtenerOCrear(UUID usuarioId) {
        return reputacionDao.findById(usuarioId).orElseGet(() -> {
            Usuario usuario = usuarioDao.findById(usuarioId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            return reputacionDao.save(Reputacion.builder().usuario(usuario).build());
        });
    }

    @Override
    @Transactional
    public Reputacion recalcular(UUID usuarioId) {
        Reputacion reputacion = obtenerOCrear(usuarioId);
        List<Incidente> reportes = incidenteDao.listarPorUsuario(usuarioId);
        List<Validacion> validaciones = validacionDao.listarPorUsuario(usuarioId);

        int reportesConfirmados = 0;
        for (Incidente reporte : reportes) {
            if (ConfiabilidadUtil.esResultadoPositivo(reporte.getEstado().getNombre())) {
                reportesConfirmados++;
            }
        }

        int aciertos = 0;
        int desaciertos = 0;
        for (Validacion validacion : validaciones) {
            Boolean correcto = evaluarValidacion(validacion);
            if (correcto == null) {
                continue;
            }
            if (correcto) {
                aciertos++;
            } else {
                desaciertos++;
            }
        }

        int experiencia = reportes.size() * XP_REPORTE
                + validaciones.size() * XP_VALIDACION
                + reportesConfirmados * XP_REPORTE_CONFIRMADO;
        int confianza = CONFIANZA_INICIAL + (aciertos - desaciertos) * DELTA_CONFIANZA;
        confianza = Math.max(0, Math.min(100, confianza));

        reputacion.setExperienciaPts(experiencia);
        reputacion.setNivelReputacion(1 + experiencia / PUNTOS_POR_NIVEL);
        reputacion.setPorcentajeConfiabilidad(BigDecimal.valueOf(confianza).setScale(2, RoundingMode.HALF_UP));
        reputacion.setCantReportesCreados(reportes.size());
        reputacion.setCantValidacionesEmitidas(validaciones.size());

        int evaluadas = aciertos + desaciertos;
        BigDecimal acierto = evaluadas == 0
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(aciertos).multiply(CIEN)
                        .divide(BigDecimal.valueOf(evaluadas), 2, RoundingMode.HALF_UP);
        reputacion.setPorcentajeAcierto(acierto);

        return reputacionDao.save(reputacion);
    }

    @Override
    @Transactional
    public void recalcularPorIncidente(UUID incidenteId) {
        Optional<Incidente> incidente = incidenteDao.findById(incidenteId);
        if (incidente.isEmpty()) {
            return;
        }

        Set<UUID> usuarios = new HashSet<>();
        usuarios.add(incidente.get().getUsuario().getUsuarioId());
        for (Validacion validacion : validacionDao.findByIncidenteIncidenteId(incidenteId)) {
            usuarios.add(validacion.getUsuario().getUsuarioId());
        }
        usuarios.forEach(this::recalcular);
    }

    @Override
    @Transactional
    public BigDecimal pesoVoto(UUID usuarioId) {
        BigDecimal confianza = obtenerOCrear(usuarioId).getPorcentajeConfiabilidad();
        BigDecimal base = confianza == null ? BigDecimal.valueOf(CONFIANZA_INICIAL) : confianza;
        BigDecimal peso = PESO_MINIMO.add(base.multiply(RANGO_PESO).divide(CIEN, 4, RoundingMode.HALF_UP));
        return peso.setScale(2, RoundingMode.HALF_UP);
    }

    private Boolean evaluarValidacion(Validacion validacion) {
        String estado = validacion.getIncidente().getEstado().getNombre();
        boolean votoPositivo = ConfiabilidadUtil.esVotoConfirmacion(validacion.getTipoVoto().getNombre());
        if (ConfiabilidadUtil.esResultadoPositivo(estado)) {
            return votoPositivo;
        }
        if (ConfiabilidadUtil.esEstadoRechazado(estado)) {
            return !votoPositivo;
        }
        return null;
    }
}
