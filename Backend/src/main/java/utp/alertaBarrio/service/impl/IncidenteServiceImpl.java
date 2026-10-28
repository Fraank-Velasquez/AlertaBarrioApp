package utp.alertaBarrio.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utp.alertaBarrio.dto.CrearIncidenteRequest;
import utp.alertaBarrio.dto.IncidenteDTO;
import utp.alertaBarrio.model.CategoriaIncidente;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.TipoVoto;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.model.Validacion;
import utp.alertaBarrio.repository.CategoriaIncidenteDao;
import utp.alertaBarrio.repository.EstadoIncidenteDao;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.TipoVotoDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.repository.ValidacionDao;
import utp.alertaBarrio.service.IncidenteService;
import utp.alertaBarrio.util.GeometryUtil;

@Service
public class IncidenteServiceImpl implements IncidenteService {
    private final IncidenteDao incidenteDao;
    private final UsuarioDao usuarioDao;
    private final CategoriaIncidenteDao categoriaIncidenteDao;
    private final EstadoIncidenteDao estadoIncidenteDao;
    private final TipoVotoDao tipoVotoDao;
    private final ValidacionDao validacionDao;

    public IncidenteServiceImpl(IncidenteDao incidenteDao, UsuarioDao usuarioDao,
                                CategoriaIncidenteDao categoriaIncidenteDao,
                                EstadoIncidenteDao estadoIncidenteDao,
                                TipoVotoDao tipoVotoDao,
                                ValidacionDao validacionDao) {
        this.incidenteDao = incidenteDao;
        this.usuarioDao = usuarioDao;
        this.categoriaIncidenteDao = categoriaIncidenteDao;
        this.estadoIncidenteDao = estadoIncidenteDao;
        this.tipoVotoDao = tipoVotoDao;
        this.validacionDao = validacionDao;
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
        estadoIncidenteDao.findByNombre("CONFIRMADO").ifPresent(e -> estadosActivos.add(e.getIdEstadoIncidente()));

        java.util.Optional<Incidente> duplicado = incidenteDao.buscarDuplicadoCercano(
                categoria.getIdCategoria(),
                estadosActivos,
                request.getLongitud(),
                request.getLatitud(),
                50.0);

        if (duplicado.isPresent()) {
            Incidente incidenteExistente = duplicado.get();
            TipoVoto tipoConfirmar = tipoVotoDao.findByNombre("CONFIRMAR")
                    .orElseThrow(() -> new RuntimeException("Tipo voto CONFIRMAR no encontrado"));

            boolean yaExistiaValidacion = validacionDao.existsByIncidenteIncidenteIdAndUsuarioUsuarioId(
                    incidenteExistente.getIncidenteId(), usuarioId);
            if (!yaExistiaValidacion) {
                Validacion validacion = Validacion.builder()
                        .incidente(incidenteExistente)
                        .usuario(usuario)
                        .tipoVoto(tipoConfirmar)
                        .pesoVotoPonderado(new BigDecimal("1.00"))
                        .fotoEvidenciaUrl(request.getFotoEvidenciaUrl())
                        .otorgaPuntosExperiencia(false)
                        .build();
                validacionDao.save(validacion);
                incidenteExistente.setConteoVotosPositivos(
                        incidenteExistente.getConteoVotosPositivos() == null ? 1 : incidenteExistente.getConteoVotosPositivos() + 1);
                incidenteDao.save(incidenteExistente);
            }

            IncidenteDTO resultado = mapToDTO(incidenteExistente);
            resultado.setDuplicado(true);
            resultado.setMensaje(yaExistiaValidacion
                    ? "Ya habías confirmado un reporte similar en esta ubicación."
                    : "Ya existe un reporte similar; tu aporte fue sumado como confirmación.");
            return resultado;
        }

        Incidente incidente = Incidente.builder()
                .usuario(usuario)
                .categoria(categoria)
                .estado(estadoPendiente)
                .ubicacion(GeometryUtil.createPoint(request.getLongitud(), request.getLatitud()))
                .descripcion(request.getDescripcion())
                .fotoEvidenciaUrl(request.getFotoEvidenciaUrl())
                .indiceConfianzaPorcentaje(new BigDecimal("0.00"))
                .conteoVotosPositivos(0)
                .conteoVotosNegativos(0)
                .build();

        Incidente saved = incidenteDao.save(incidente);
        IncidenteDTO resultado = mapToDTO(saved);
        resultado.setMensaje("Incidente registrado correctamente.");
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenteDTO> listarPorRadio(double latitud, double longitud, double radioMetros) {
        List<UUID> estadosActivos = estadosActivos();

        List<Incidente> incidentes = incidenteDao.listarPorRadio(estadosActivos, longitud, latitud, radioMetros);
        return mapearIncidentes(incidentes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenteDTO> listarTodosActivos() {
        List<Incidente> incidentes = incidenteDao.listarTodosActivos(estadosActivos());
        return mapearIncidentes(incidentes);
    }

    private List<UUID> estadosActivos() {
        List<UUID> estadosActivos = new ArrayList<>();
        estadoIncidenteDao.findByNombre("PENDIENTE").ifPresent(e -> estadosActivos.add(e.getIdEstadoIncidente()));
        estadoIncidenteDao.findByNombre("EN_REVISION").ifPresent(e -> estadosActivos.add(e.getIdEstadoIncidente()));
        estadoIncidenteDao.findByNombre("CONFIRMADO").ifPresent(e -> estadosActivos.add(e.getIdEstadoIncidente()));
        if (estadosActivos.isEmpty()) {
            throw new IllegalStateException("No hay estados activos configurados para mostrar incidentes");
        }
        return estadosActivos;
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
