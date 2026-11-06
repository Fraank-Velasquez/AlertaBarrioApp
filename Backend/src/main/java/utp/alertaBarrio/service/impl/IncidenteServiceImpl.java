package utp.alertaBarrio.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.dto.CrearIncidenteRequest;
import utp.alertaBarrio.dto.IncidenteDTO;
import utp.alertaBarrio.model.CategoriaIncidente;
import utp.alertaBarrio.exception.UbicacionCercanaException;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.repository.CategoriaIncidenteDao;
import utp.alertaBarrio.repository.EstadoIncidenteDao;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.service.IncidenteService;
import utp.alertaBarrio.service.ReputacionService;
import utp.alertaBarrio.util.ClasificacionIncidenteUtil;
import utp.alertaBarrio.util.GeometryUtil;

@Service
public class IncidenteServiceImpl implements IncidenteService {
    private static final double DISTANCIA_MINIMA_METROS = 40.0;

    private final IncidenteDao incidenteDao;
    private final UsuarioDao usuarioDao;
    private final CategoriaIncidenteDao categoriaIncidenteDao;
    private final EstadoIncidenteDao estadoIncidenteDao;
    private final ReputacionService reputacionService;

    public IncidenteServiceImpl(IncidenteDao incidenteDao, UsuarioDao usuarioDao,
                                CategoriaIncidenteDao categoriaIncidenteDao,
                                EstadoIncidenteDao estadoIncidenteDao,
                                ReputacionService reputacionService) {
        this.incidenteDao = incidenteDao;
        this.usuarioDao = usuarioDao;
        this.categoriaIncidenteDao = categoriaIncidenteDao;
        this.estadoIncidenteDao = estadoIncidenteDao;
        this.reputacionService = reputacionService;
    }

    @Override
    @Transactional
    public IncidenteDTO crearIncidente(CrearIncidenteRequest request, UUID usuarioId) {
        Usuario usuario = usuarioDao.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        CategoriaIncidente categoria = categoriaIncidenteDao.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        EstadoIncidente estadoPendiente = estadoIncidenteDao.findByNombre("PENDIENTE")
                .orElseThrow(() -> new RuntimeException("Estado PENDIENTE no encontrado"));

        List<UUID> estadosActivos = new ArrayList<>();
        estadoIncidenteDao.findByNombre("PENDIENTE").ifPresent(e -> estadosActivos.add(e.getIdEstadoIncidente()));
        estadoIncidenteDao.findByNombre("EN_REVISION").ifPresent(e -> estadosActivos.add(e.getIdEstadoIncidente()));
        estadoIncidenteDao.findByNombre("CONFIRMADO").ifPresent(e -> estadosActivos.add(e.getIdEstadoIncidente()));

        if (!estadosActivos.isEmpty()) {
            Optional<Incidente> cercano = incidenteDao.buscarMasCercano(
                    estadosActivos,
                    request.getLongitud(),
                    request.getLatitud(),
                    DISTANCIA_MINIMA_METROS);

            if (cercano.isPresent()) {
                Incidente incidenteExistente = cercano.get();
                boolean mismoTipo = incidenteExistente.getCategoria().getIdCategoria()
                        .equals(categoria.getIdCategoria());
                double distancia = GeometryUtil.distanciaMetros(
                        request.getLatitud(),
                        request.getLongitud(),
                        incidenteExistente.getUbicacion().getY(),
                        incidenteExistente.getUbicacion().getX());
                if (distancia < DISTANCIA_MINIMA_METROS) {
                    String mensaje = mismoTipo
                            ? "Ya existe una alerta del mismo tipo a " + Math.round(distancia)
                                    + " m de esta ubicación. Debes registrar la nueva alerta a por lo menos 40 m."
                            : "Ya existe una alerta a " + Math.round(distancia)
                                    + " m de esta ubicación. Debes registrar la nueva alerta a por lo menos 40 m.";
                    throw new UbicacionCercanaException(mensaje, mapToDTO(incidenteExistente), distancia, mismoTipo);
                }
            }
        }

        Incidente incidente = Incidente.builder()
                .usuario(usuario)
                .categoria(categoria)
                .estado(estadoPendiente)
                .ubicacion(GeometryUtil.createPoint(request.getLongitud(), request.getLatitud()))
                .descripcion(request.getDescripcion())
                .distrito(ClasificacionIncidenteUtil.normalizarDistrito(
                        request.getDistrito(), usuario.getSectorResidencia()))
                .fotoEvidenciaUrl(request.getFotoEvidenciaUrl())
                .indiceConfianzaPorcentaje(new BigDecimal("0.00"))
                .conteoVotosPositivos(0)
                .conteoVotosNegativos(0)
                .build();

        Incidente saved = incidenteDao.save(incidente);
        reputacionService.recalcular(usuarioId);
        IncidenteDTO resultado = mapToDTO(saved);
        resultado.setMensaje("Incidente registrado correctamente.");
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenteDTO> listarPorRadio(double latitud, double longitud, double radioMetros) {
        List<Incidente> incidentes = incidenteDao.listarPorRadio(longitud, latitud, radioMetros);
        return mapearIncidentes(incidentes);
    }

    private List<IncidenteDTO> mapearIncidentes(List<Incidente> incidentes) {
        List<IncidenteDTO> result = new ArrayList<>();
        for (Incidente i : incidentes) {
            result.add(mapToDTO(i));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenteDTO> listarTodos() {
        return mapearIncidentes(incidenteDao.findAllByOrderByFechaHoraReporteDesc());
    }

    @Override
    @Transactional(readOnly = true)
    public IncidenteDTO obtenerPorId(UUID incidenteId) {
        Incidente incidente = incidenteDao.findById(incidenteId)
                .orElseThrow(() -> new RuntimeException("Incidente no encontrado"));
        return mapToDTO(incidente);
    }

    private IncidenteDTO mapToDTO(Incidente i) {
        IncidenteDTO dto = new IncidenteDTO();
        dto.setIncidenteId(i.getIncidenteId());
        dto.setUsuarioId(i.getUsuario().getUsuarioId());
        dto.setAutorNombre(i.getUsuario().getNombres() + " " + i.getUsuario().getApellidos());
        dto.setCategoriaId(i.getCategoria().getIdCategoria());
        dto.setCategoriaNombre(i.getCategoria().getNombre());
        dto.setEstadoId(i.getEstado().getIdEstadoIncidente());
        dto.setEstadoNombre(i.getEstado().getNombre());
        if (i.getUbicacion() != null) {
            dto.setLongitud(i.getUbicacion().getX());
            dto.setLatitud(i.getUbicacion().getY());
        }
        dto.setDistrito(ClasificacionIncidenteUtil.normalizarDistrito(
                i.getDistrito(), i.getUsuario().getSectorResidencia()));
        dto.setDescripcion(i.getDescripcion());
        dto.setFotoEvidenciaUrl(i.getFotoEvidenciaUrl());
        dto.setFechaHoraReporte(i.getFechaHoraReporte());
        dto.setIndiceConfianzaPorcentaje(i.getIndiceConfianzaPorcentaje());
        dto.setConteoVotosPositivos(i.getConteoVotosPositivos());
        dto.setConteoVotosNegativos(i.getConteoVotosNegativos());
        dto.setDuplicado(false);
        return dto;
    }
}
