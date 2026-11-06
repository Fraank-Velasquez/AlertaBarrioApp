package utp.alertaBarrio.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.repository.EstadoIncidenteDao;

@Configuration
public class EstadoIncidenteSeeder {

    @Bean
    public ApplicationRunner inicializarEstadosIncidente(EstadoIncidenteDao estadoIncidenteDao) {
        return args -> {
            asegurar(estadoIncidenteDao, "PENDIENTE", "Reporte pendiente de validación comunitaria");
            asegurar(estadoIncidenteDao, "EN_REVISION", "Reporte en revisión por la autoridad");
            asegurar(estadoIncidenteDao, "CONFIRMADO", "Reporte confirmado por la comunidad");
            asegurar(estadoIncidenteDao, "RESUELTO", "Reporte atendido y resuelto");
            asegurar(estadoIncidenteDao, "RECHAZADO", "Reporte descartado");
        };
    }

    private void asegurar(EstadoIncidenteDao dao, String nombre, String detalles) {
        dao.findByNombre(nombre).ifPresentOrElse(estado -> {
            if (!Boolean.TRUE.equals(estado.getActivo())) {
                estado.setActivo(true);
                dao.save(estado);
            }
        }, () -> dao.save(EstadoIncidente.builder()
                .nombre(nombre)
                .detalles(detalles)
                .activo(true)
                .build()));
    }
}
