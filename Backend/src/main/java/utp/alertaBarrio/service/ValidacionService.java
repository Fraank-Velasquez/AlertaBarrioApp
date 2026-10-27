package utp.alertaBarrio.service;

import utp.alertaBarrio.dto.ValidacionRequest;
import utp.alertaBarrio.model.Validacion;

import java.util.UUID;

public interface ValidacionService {
    Validacion emitirValidacion(ValidacionRequest request, UUID usuarioId);
}
