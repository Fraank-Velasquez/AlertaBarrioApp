package utp.alertaBarrio.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.dto.IntervencionRequest;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.IntervencionAutoridad;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.repository.EstadoIncidenteDao;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.IntervencionAutoridadDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.service.AutoridadService;
import utp.alertaBarrio.service.ReputacionService;

import java.util.UUID;

@Service
public class AutoridadServiceImpl implements AutoridadService {
    private final IncidenteDao incidenteDao;
    private final UsuarioDao usuarioDao;
    private final EstadoIncidenteDao estadoIncidenteDao;
    private final IntervencionAutoridadDao intervencionAutoridadDao;
    private final ReputacionService reputacionService;

    public AutoridadServiceImpl(IncidenteDao incidenteDao, UsuarioDao usuarioDao,
                                EstadoIncidenteDao estadoIncidenteDao,
                                IntervencionAutoridadDao intervencionAutoridadDao,
                                ReputacionService reputacionService) {
        this.incidenteDao = incidenteDao;
        this.usuarioDao = usuarioDao;
        this.estadoIncidenteDao = estadoIncidenteDao;
        this.intervencionAutoridadDao = intervencionAutoridadDao;
        this.reputacionService = reputacionService;
    }

    @Override
    @Transactional
    public Incidente despachar(UUID incidenteId, UUID autoridadId, IntervencionRequest request) {
        Incidente incidente = incidenteDao.findById(incidenteId)
                .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        Usuario autoridad = usuarioDao.findById(autoridadId)
                .orElseThrow(() -> new RuntimeException("Autoridad no encontrada"));

        EstadoIncidente enRevision = estadoIncidenteDao.findByNombre("EN_REVISION").orElse(null);
        if (enRevision != null) {
            incidente.setEstado(enRevision);
        }

        guardarIntervencion(incidente, autoridad, request);
        Incidente actualizado = incidenteDao.save(incidente);
        reputacionService.recalcularPorIncidente(actualizado.getIncidenteId());
        return actualizado;
    }

    @Override
    @Transactional
    public Incidente marcarResuelto(UUID incidenteId, UUID autoridadId, IntervencionRequest request) {
        Incidente incidente = incidenteDao.findById(incidenteId)
                .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        Usuario autoridad = usuarioDao.findById(autoridadId)
                .orElseThrow(() -> new RuntimeException("Autoridad no encontrada"));

        EstadoIncidente resuelto = estadoIncidenteDao.findByNombre("RESUELTO")
                .orElseThrow(() -> new RuntimeException("Estado RESUELTO no encontrado"));
        incidente.setEstado(resuelto);

        guardarIntervencion(incidente, autoridad, request);
        Incidente actualizado = incidenteDao.save(incidente);
        reputacionService.recalcularPorIncidente(actualizado.getIncidenteId());
        return actualizado;
    }

    private void guardarIntervencion(Incidente incidente, Usuario autoridad, IntervencionRequest request) {
        IntervencionAutoridad intervencion = intervencionAutoridadDao
                .buscarPorIncidente(incidente.getIncidenteId())
                .orElseGet(() -> IntervencionAutoridad.builder()
                        .incidente(incidente)
                        .usuario(autoridad)
                        .build());
        intervencion.setUsuario(autoridad);
        if (request.getUnidadDespachada() != null && !request.getUnidadDespachada().isBlank()) {
            intervencion.setUnidadDespachada(request.getUnidadDespachada());
        }
        intervencion.setMensajeComunicadoOficial(request.getMensajeComunicadoOficial());
        intervencionAutoridadDao.save(intervencion);
    }

    @Override
    @Transactional
    public Incidente cambiarEstado(UUID incidenteId, UUID estadoId) {
        Incidente incidente = incidenteDao.findById(incidenteId)
                .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        EstadoIncidente estado = estadoIncidenteDao.findById(estadoId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        incidente.setEstado(estado);
        Incidente actualizado = incidenteDao.save(incidente);
        reputacionService.recalcularPorIncidente(actualizado.getIncidenteId());
        return actualizado;
    }
}
