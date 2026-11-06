package utp.alertaBarrio.util;

import java.text.Normalizer;
import java.util.Locale;

public final class ConfiabilidadUtil {

    private ConfiabilidadUtil() {
    }

    public static boolean esVotoConfirmacion(String nombreTipoVoto) {
        if (nombreTipoVoto == null) {
            return false;
        }
        String nombre = sinAcentos(nombreTipoVoto);
        return nombre.startsWith("CONFIRMAR") || nombre.equals("CONFIRMADO");
    }

    public static boolean esEstadoConfirmado(String nombreEstado) {
        return contiene(nombreEstado, "CONFIRM");
    }

    public static boolean esEstadoResuelto(String nombreEstado) {
        return contiene(nombreEstado, "RESUELT") || contiene(nombreEstado, "ATENDID");
    }

    public static boolean esEstadoEnRevision(String nombreEstado) {
        return contiene(nombreEstado, "REVISION");
    }

    public static boolean esEstadoRechazado(String nombreEstado) {
        return contiene(nombreEstado, "RECHAZ") || contiene(nombreEstado, "DESCAR")
                || contiene(nombreEstado, "FALSA") || contiene(nombreEstado, "INVALID")
                || contiene(nombreEstado, "ANULAD");
    }

    public static boolean esResultadoPositivo(String nombreEstado) {
        return esEstadoConfirmado(nombreEstado) || esEstadoResuelto(nombreEstado);
    }

    public static boolean esEstadoVisibleComunidad(String nombreEstado) {
        return contiene(nombreEstado, "PENDIENTE") || esEstadoEnRevision(nombreEstado)
                || esEstadoConfirmado(nombreEstado);
    }

    private static boolean contiene(String valor, String texto) {
        return valor != null && sinAcentos(valor).contains(texto);
    }

    private static String sinAcentos(String valor) {
        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}", "")
                .toUpperCase(Locale.ROOT);
    }
}

