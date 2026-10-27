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

import java.util.UUID;

@Service
public class AutoridadServiceImpl implements AutoridadService {
    private final IncidenteDao incidenteDao;
    private final UsuarioDao usuarioDao;
    private final EstadoIncidenteDao estadoIncidenteDao;
    private final IntervencionAutoridadDao intervencionAutoridadDao;

    public AutoridadServiceImpl(IncidenteDao incidenteDao, UsuarioDao usuarioDao,
                                EstadoIncidenteDao estadoIncidenteDao,
                                IntervencionAutoridadDao intervencionAutoridadDao) {
        this.incidenteDao = incidenteDao;
        this.usuarioDao = usuarioDao;
        this.estadoIncidenteDao = estadoIncidenteDao;
        this.intervencionAutoridadDao = intervencionAutoridadDao;
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

        IntervencionAutoridad intervencion = IntervencionAutoridad.builder()
                .incidente(incidente)
                .usuario(autoridad)
                .unidadDespachada(request.getUnidadDespachada())
                .mensajeComunicadoOficial(request.getMensajeComunicadoOficial())
                .build();
        intervencionAutoridadDao.save(intervencion);

        return incidenteDao.save(incidente);
    }

    @Override
    @Transactional
    public Incidente cambiarEstado(UUID incidenteId, UUID estadoId) {
        Incidente incidente = incidenteDao.findById(incidenteId)
                .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        EstadoIncidente estado = estadoIncidenteDao.findById(estadoId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        incidente.setEstado(estado);
        return incidenteDao.save(incidente);
    }
}
