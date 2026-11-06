package utp.alertaBarrio.exception;

import utp.alertaBarrio.dto.IncidenteDTO;

public class UbicacionCercanaException extends RuntimeException {
    private final IncidenteDTO incidente;
    private final double distanciaMetros;
    private final boolean mismoTipo;

    public UbicacionCercanaException(String mensaje, IncidenteDTO incidente, double distanciaMetros, boolean mismoTipo) {
        super(mensaje);
        this.incidente = incidente;
        this.distanciaMetros = distanciaMetros;
        this.mismoTipo = mismoTipo;
    }

    public IncidenteDTO getIncidente() {
        return incidente;
    }

    public double getDistanciaMetros() {
        return distanciaMetros;
    }

    public boolean isMismoTipo() {
        return mismoTipo;
    }
}
