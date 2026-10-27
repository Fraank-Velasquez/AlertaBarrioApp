
package utp.alertaBarrio.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import utp.alertaBarrio.dto.CrearIncidenteRequest;
import utp.alertaBarrio.dto.IncidenteDTO;
import utp.alertaBarrio.model.CategoriaIncidente;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.model.Incidente;
import utp.alertaBarrio.model.Usuario;
import utp.alertaBarrio.repository.CategoriaIncidenteDao;
import utp.alertaBarrio.repository.EstadoIncidenteDao;
import utp.alertaBarrio.repository.IncidenteDao;
import utp.alertaBarrio.repository.TipoVotoDao;
import utp.alertaBarrio.repository.UsuarioDao;
import utp.alertaBarrio.repository.ValidacionDao;

class IncidenteServiceImplTest {

    private final IncidenteDao incidenteDao =
            mock(IncidenteDao.class);

    private final UsuarioDao usuarioDao =
            mock(UsuarioDao.class);

    private final CategoriaIncidenteDao categoriaIncidenteDao =
            mock(CategoriaIncidenteDao.class);

    private final EstadoIncidenteDao estadoIncidenteDao =
            mock(EstadoIncidenteDao.class);

    private final TipoVotoDao tipoVotoDao =
            mock(TipoVotoDao.class);

    private final ValidacionDao validacionDao =
            mock(ValidacionDao.class);

    private final IncidenteServiceImpl service =
            new IncidenteServiceImpl(
                    incidenteDao,
                    usuarioDao,
                    categoriaIncidenteDao,
                    estadoIncidenteDao,
                    tipoVotoDao,
                    validacionDao
            );

    // PRUEBA 1: Descripción vacía
    @Test
    void noDebeRegistrarIncidenteConDescripcionVacia() {

        CrearIncidenteRequest request = new CrearIncidenteRequest();
        request.setDescripcion("   ");
        request.setCategoriaId(UUID.randomUUID());
        request.setLatitud(-5.19);
        request.setLongitud(-80.63);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.crearIncidente(
                        request, UUID.randomUUID()
                )
        );

        verifyNoInteractions(incidenteDao, usuarioDao);
    }

    // PRUEBA 2: Descripción nula
    @Test
    void noDebeRegistrarIncidenteConDescripcionNula() {

        CrearIncidenteRequest request = new CrearIncidenteRequest();
        request.setDescripcion(null);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.crearIncidente(
                        request, UUID.randomUUID()
                )
        );

        verifyNoInteractions(incidenteDao, usuarioDao);
    }

    // PRUEBA 3: Solicitud nula
    @Test
    void noDebeRegistrarIncidenteConRequestNulo() {

        assertThrows(
                IllegalArgumentException.class,
                () -> service.crearIncidente(
                        null, UUID.randomUUID()
                )
        );

        verifyNoInteractions(incidenteDao, usuarioDao);
    }

    // PRUEBA 4: Latitud inválida
    @Test
    void noDebeRegistrarIncidenteConLatitudInvalida() {

        CrearIncidenteRequest request = new CrearIncidenteRequest();
        request.setDescripcion("Robo en la avenida");
        request.setCategoriaId(UUID.randomUUID());
        request.setLatitud(100.0);
        request.setLongitud(-80.63);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.crearIncidente(
                        request, UUID.randomUUID()
                )
        );

        verifyNoInteractions(incidenteDao, usuarioDao);
    }

    // PRUEBA 5: Registro exitoso de una alerta
    @Test
    void debeRegistrarIncidenteCorrectamente() {

        UUID usuarioId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID estadoId = UUID.randomUUID();
        UUID incidenteId = UUID.randomUUID();

        Usuario usuario = Usuario.builder()
                .usuarioId(usuarioId)
                .nombres("Juan")
                .apellidos("Perez")
                .build();

        CategoriaIncidente categoria =
                CategoriaIncidente.builder()
                        .idCategoria(categoriaId)
                        .nombre("ROBO")
                        .build();

        EstadoIncidente estado =
                EstadoIncidente.builder()
                        .idEstadoIncidente(estadoId)
                        .nombre("PENDIENTE")
                        .build();

        CrearIncidenteRequest request =
                new CrearIncidenteRequest();

        request.setCategoriaId(categoriaId);
        request.setDescripcion("Robo de celular en la avenida");
        request.setLatitud(-5.19);
        request.setLongitud(-80.63);

        // Simular las respuestas de los repositorios
        when(usuarioDao.findById(usuarioId))
                .thenReturn(Optional.of(usuario));

        when(categoriaIncidenteDao.findById(categoriaId))
                .thenReturn(Optional.of(categoria));

        when(estadoIncidenteDao.findByNombre("PENDIENTE"))
                .thenReturn(Optional.of(estado));

        when(estadoIncidenteDao.findByNombre("CONFIRMADO"))
                .thenReturn(Optional.empty());

        when(incidenteDao.buscarDuplicadoCercano(
                eq(categoriaId),
                anyList(),
                eq(-80.63),
                eq(-5.19),
                eq(50.0)
        )).thenReturn(Optional.empty());

        // Simular el guardado y asignar un ID
        when(incidenteDao.save(any(Incidente.class)))
                .thenAnswer(invocation -> {
                    Incidente incidente =
                            invocation.getArgument(0);
                    incidente.setIncidenteId(incidenteId);
                    return incidente;
                });

        // Ejecutar el método que estamos probando
        IncidenteDTO resultado =
                service.crearIncidente(request, usuarioId);

        // Comprobar los resultados
        assertNotNull(resultado);
        assertEquals(incidenteId, resultado.getIncidenteId());
        assertEquals(usuarioId, resultado.getUsuarioId());
        assertEquals("Juan Perez", resultado.getAutorNombre());
        assertEquals(categoriaId, resultado.getCategoriaId());
        assertEquals("ROBO", resultado.getCategoriaNombre());
        assertEquals("PENDIENTE", resultado.getEstadoNombre());
        assertEquals(
                "Robo de celular en la avenida",
                resultado.getDescripcion()
        );
        assertEquals(-5.19, resultado.getLatitud(), 0.000001);
        assertEquals(-80.63, resultado.getLongitud(), 0.000001);
        assertEquals(0, resultado.getConteoVotosPositivos());
        assertEquals(0, resultado.getConteoVotosNegativos());

        // Comprobar que se guardó exactamente una vez
        verify(incidenteDao, times(1))
                .save(any(Incidente.class));
    }
}
