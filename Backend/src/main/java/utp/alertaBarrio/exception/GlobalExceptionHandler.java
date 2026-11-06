package utp.alertaBarrio.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("mensaje", ex.getMessage() == null ? "Acceso denegado" : ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(UbicacionCercanaException.class)
    public ResponseEntity<Map<String, Object>> handleUbicacionCercana(UbicacionCercanaException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("codigo", "UBICACION_CERCANA");
        error.put("mensaje", ex.getMessage());
        error.put("distanciaMetros", ex.getDistanciaMetros());
        error.put("mismoTipo", ex.isMismoTipo());
        error.put("incidente", ex.getIncidente());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("mensaje", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("mensaje", "Datos de entrada inválidos");
        return ResponseEntity.badRequest().body(error);
    }
}
