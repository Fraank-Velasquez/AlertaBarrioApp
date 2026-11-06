package utp.alertaBarrio.util;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public class GeometryUtil {
    private static final int SRID = 4326;
    private static final double RADIO_TIERRA_METROS = 6371000.0;
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), SRID);

    private GeometryUtil() {
    }

    public static Point createPoint(double longitude, double latitude) {
        Point point = GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, latitude));
        point.setSRID(SRID);
        return point;
    }

    public static double distanciaMetros(double latitud1, double longitud1, double latitud2, double longitud2) {
        double deltaLatitud = Math.toRadians(latitud2 - latitud1);
        double deltaLongitud = Math.toRadians(longitud2 - longitud1);
        double latitud1Radianes = Math.toRadians(latitud1);
        double latitud2Radianes = Math.toRadians(latitud2);

        double a = Math.sin(deltaLatitud / 2) * Math.sin(deltaLatitud / 2)
                + Math.cos(latitud1Radianes) * Math.cos(latitud2Radianes)
                * Math.sin(deltaLongitud / 2) * Math.sin(deltaLongitud / 2);
        return 2 * RADIO_TIERRA_METROS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
