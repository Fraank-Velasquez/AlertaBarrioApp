package utp.alertaBarrio.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.dto.ValidacionRequest;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.TipoVoto;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.model.Validacion;
import utp.alertaBarrio.repository.EstadoIncidenteDao;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.TipoVotoDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.repository.ValidacionDao;
import utp.alertaBarrio.service.ValidacionService;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;

@Service
public class ValidacionServiceImpl implements ValidacionService {
    private final ValidacionDao validacionDao;
    private final IncidenteDao incidenteDao;
    private final UsuarioDao usuarioDao;
    private final TipoVotoDao tipoVotoDao;
    private final EstadoIncidenteDao estadoIncidenteDao;
    private final GeometryFactory geometryFactory;

    public ValidacionServiceImpl(ValidacionDao validacionDao, IncidenteDao incidenteDao, UsuarioDao usuarioDao, TipoVotoDao tipoVotoDao, EstadoIncidenteDao estadoIncidenteDao, GeometryFactory geometryFactory) {
        this.validacionDao = validacionDao;
        this.incidenteDao = incidenteDao;
        this.usuarioDao = usuarioDao;
        this.tipoVotoDao = tipoVotoDao;
        this.estadoIncidenteDao = estadoIncidenteDao;
        this.geometryFactory = geometryFactory;
    }

    @Override
    @Transactional
    public Validacion emitirValidacion(ValidacionRequest request, UUID usuarioId) {
        return emitirValidacionConUbicacion(request.getIncidenteId(), request.getTipoVotoId(),
                request.getNotaActualizacionRapida(), request.getFotoEvidenciaUrl(), null, null, usuarioId);
    }

    @Transactional
    public Validacion emitirValidacionConUbicacion(UUID incidenteId, UUID tipoVotoId, String nota,
                                                   String foto, Double latitud, Double longitud, UUID usuarioId) {
        Incidente incidente = incidenteDao.findById(incidenteId)
                .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        Usuario usuario = usuarioDao.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        TipoVoto tipoVoto = tipoVotoDao.findById(tipoVotoId)
                .orElseThrow(() -> new RuntimeException("Tipo de voto no encontrado"));

        if (incidente.getUsuario().getUsuarioId().equals(usuarioId)) {
            throw new RuntimeException("No puedes validar tu propio reporte");
        }

        if (validacionDao.existsByIncidenteIncidenteIdAndUsuarioUsuarioId(incidente.getIncidenteId(), usuarioId)) {
            throw new RuntimeException("Ya has emitido un voto para este incidente");
        }

        // Geofencing estricto RN-01: solo dentro de 500m
        if (latitud != null && longitud != null) {
            Boolean dentro = incidenteDao.estaDentroDeRadio(incidenteId, longitud, latitud, 500.0);
            if (Boolean.FALSE.equals(dentro)) {
                throw new RuntimeException("Debes estar a menos de 500 metros del incidente para validar");
            }
        }

        Validacion validacion = Validacion.builder()
                .incidente(incidente)
                .usuario(usuario)
                .tipoVoto(tipoVoto)
                .pesoVotoPonderado(new BigDecimal("1.00"))
                .notaActualizacionRapida(nota)
                .fotoEvidenciaUrl(foto)
                .otorgaPuntosExperiencia(false)
                .build();

        Validacion saved = validacionDao.save(validacion);

        if (esVotoConfirmacion(tipoVoto.getNombre())) {
            incidente.setConteoVotosPositivos(incidente.getConteoVotosPositivos() == null ? 1 : incidente.getConteoVotosPositivos() + 1);
        } else {
            incidente.setConteoVotosNegativos(incidente.getConteoVotosNegativos() == null ? 1 : incidente.getConteoVotosNegativos() + 1);
        }

        int positivos = incidente.getConteoVotosPositivos() == null ? 0 : incidente.getConteoVotosPositivos();
        int negativos = incidente.getConteoVotosNegativos() == null ? 0 : incidente.getConteoVotosNegativos();
        int total = positivos + negativos;
        if (total > 0) {
            BigDecimal confianza = BigDecimal.valueOf((positivos * 100.0) / total).setScale(2, BigDecimal.ROUND_HALF_UP);
            incidente.setIndiceConfianzaPorcentaje(confianza);
            if (confianza.compareTo(new BigDecimal("75.00")) >= 0 && total >= 3) {
                estadoIncidenteDao.findByNombre("CONFIRMADO").ifPresent(incidente::setEstado);
            }
        }

        incidenteDao.save(incidente);
        return saved;
    }

    private boolean esVotoConfirmacion(String nombreTipoVoto) {
        return nombreTipoVoto != null
                && nombreTipoVoto.trim().toUpperCase().startsWith("CONFIRMAR");
    }
}
