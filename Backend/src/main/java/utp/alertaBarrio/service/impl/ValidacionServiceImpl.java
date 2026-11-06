package utp.alertaBarrio.service.impl;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.dto.ValidacionRequest;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.TipoVoto;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.model.Validacion;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.TipoVotoDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.repository.ValidacionDao;
import utp.alertaBarrio.service.ReputacionService;
import utp.alertaBarrio.service.ValidacionService;

@Service
public class ValidacionServiceImpl implements ValidacionService {
    private final ValidacionDao validacionDao;
    private final IncidenteDao incidenteDao;
    private final UsuarioDao usuarioDao;
    private final TipoVotoDao tipoVotoDao;
    private final ReputacionService reputacionService;
    private final IncidenteConfianzaService incidenteConfianzaService;

    public ValidacionServiceImpl(ValidacionDao validacionDao, IncidenteDao incidenteDao, UsuarioDao usuarioDao,
                                 TipoVotoDao tipoVotoDao, ReputacionService reputacionService,
                                 IncidenteConfianzaService incidenteConfianzaService) {
        this.validacionDao = validacionDao;
        this.incidenteDao = incidenteDao;
        this.usuarioDao = usuarioDao;
        this.tipoVotoDao = tipoVotoDao;
        this.reputacionService = reputacionService;
        this.incidenteConfianzaService = incidenteConfianzaService;
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
                .pesoVotoPonderado(reputacionService.pesoVoto(usuarioId))
                .notaActualizacionRapida(nota)
                .fotoEvidenciaUrl(foto)
                .otorgaPuntosExperiencia(true)
                .build();

        Validacion saved = validacionDao.save(validacion);

        boolean confirmadoAhora = incidenteConfianzaService.recalcular(incidente);
        incidenteDao.save(incidente);

        if (confirmadoAhora) {
            reputacionService.recalcularPorIncidente(incidente.getIncidenteId());
        } else {
            reputacionService.recalcular(usuarioId);
        }

        return saved;
    }
}
