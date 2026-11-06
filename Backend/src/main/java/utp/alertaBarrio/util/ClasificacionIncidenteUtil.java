package utp.alertaBarrio.util;

public final class ClasificacionIncidenteUtil {

    private ClasificacionIncidenteUtil() {
    }

    public static String normalizarDistrito(String distrito, String respaldo) {
        String valor = limpiar(distrito);
        if (valor != null) {
            return valor;
        }
        return limpiar(respaldo);
    }

    private static String limpiar(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim().replaceAll("\\s+", " ");
    }
}
