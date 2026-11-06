package utp.alertaBarrio.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.Validacion;
import utp.alertaBarrio.repository.EstadoIncidenteDao;
import utp.alertaBarrio.repository.ValidacionDao;
import utp.alertaBarrio.util.ConfiabilidadUtil;

@Service
public class IncidenteConfianzaService {

    private static final BigDecimal UMBRAL_CONFIANZA = new BigDecimal("75.00");
    private static final int MINIMO_VOTOS = 3;

    private final ValidacionDao validacionDao;
    private final EstadoIncidenteDao estadoIncidenteDao;

    public IncidenteConfianzaService(ValidacionDao validacionDao, EstadoIncidenteDao estadoIncidenteDao) {
        this.validacionDao = validacionDao;
        this.estadoIncidenteDao = estadoIncidenteDao;
    }

    @Transactional
    public boolean recalcular(Incidente incidente) {
        List<Validacion> votos = validacionDao.findByIncidenteIncidenteId(incidente.getIncidenteId());

        int positivos = 0;
        int negativos = 0;
        BigDecimal pesoPositivo = BigDecimal.ZERO;
        BigDecimal pesoNegativo = BigDecimal.ZERO;

        for (Validacion voto : votos) {
            BigDecimal peso = voto.getPesoVotoPonderado() == null ? BigDecimal.ONE : voto.getPesoVotoPonderado();
            if (ConfiabilidadUtil.esVotoConfirmacion(voto.getTipoVoto().getNombre())) {
                positivos++;
                pesoPositivo = pesoPositivo.add(peso);
            } else {
                negativos++;
                pesoNegativo = pesoNegativo.add(peso);
            }
        }

        incidente.setConteoVotosPositivos(positivos);
        incidente.setConteoVotosNegativos(negativos);

        BigDecimal pesoTotal = pesoPositivo.add(pesoNegativo);
        BigDecimal confianza = pesoTotal.signum() == 0
                ? BigDecimal.ZERO
                : pesoPositivo.multiply(new BigDecimal("100")).divide(pesoTotal, 2, RoundingMode.HALF_UP);
        incidente.setIndiceConfianzaPorcentaje(confianza);

        boolean yaConfirmado = ConfiabilidadUtil.esEstadoConfirmado(incidente.getEstado().getNombre());
        if (!yaConfirmado && votos.size() >= MINIMO_VOTOS && confianza.compareTo(UMBRAL_CONFIANZA) >= 0) {
            Optional<EstadoIncidente> confirmado = estadoIncidenteDao.findByNombre("CONFIRMADO");
            if (confirmado.isPresent()) {
                incidente.setEstado(confirmado.get());
                return true;
            }
        }
        return false;
    }
}
