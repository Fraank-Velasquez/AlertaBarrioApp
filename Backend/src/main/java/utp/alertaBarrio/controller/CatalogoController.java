package utp.alertaBarrio.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utp.alertaBarrio.model.CategoriaIncidente;
import utp.alertaBarrio.model.EstadoIncidente;
import utp.alertaBarrio.model.TipoVoto;
import utp.alertaBarrio.repository.CategoriaIncidenteDao;
import utp.alertaBarrio.repository.EstadoIncidenteDao;
import utp.alertaBarrio.repository.TipoVotoDao;

@RestController
@RequestMapping("/api/public/catalogos")
public class CatalogoController {
    private final CategoriaIncidenteDao categoriaIncidenteDao;
    private final EstadoIncidenteDao estadoIncidenteDao;
    private final TipoVotoDao tipoVotoDao;

    public CatalogoController(CategoriaIncidenteDao categoriaIncidenteDao, EstadoIncidenteDao estadoIncidenteDao,
                             TipoVotoDao tipoVotoDao) {
        this.categoriaIncidenteDao = categoriaIncidenteDao;
        this.estadoIncidenteDao = estadoIncidenteDao;
        this.tipoVotoDao = tipoVotoDao;
    }

    @GetMapping("/categorias")
    public List<CategoriaIncidente> categorias() {
        return categoriaIncidenteDao.listarActivas();
    }

    @GetMapping("/estados")
    public List<EstadoIncidente> estados() {
        return estadoIncidenteDao.listarActivos();
    }

    @GetMapping("/tipos-voto")
    public List<TipoVoto> tiposVoto() {
        return tipoVotoDao.listarActivos();
    }
}
