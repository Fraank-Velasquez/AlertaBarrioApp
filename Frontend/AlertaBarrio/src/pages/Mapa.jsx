import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Mapa = () => {
  const [position, setPosition] = useState([-5.19449, -80.63282]);
  const [incidentes, setIncidentes] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        cargarIncidentes(pos.coords.latitude, pos.coords.longitude);
      },
      () => cargarIncidentes(-5.19449, -80.63282)
    );
  }, []);

  const cargarIncidentes = async (lat, lng) => {
    try {
      const res = await api.get(`/incidentes/cercanos?latitud=${lat}&longitud=${lng}&radioMetros=1000`);
      setIncidentes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-full">
      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidentes.map((inc) => (
          <Marker key={inc.incidenteId} position={[inc.latitud, inc.longitud]}>
            <Popup>
              <div>
                <strong>{inc.categoriaNombre}</strong>
                <p>{inc.estadoNombre}</p>
                <p>Confianza: {inc.indiceConfianzaPorcentaje}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Mapa;
