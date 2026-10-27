import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Mapa = () => {
  const { user } = useAuth();
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
    <div className="h-screen w-full relative">
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
                <Link to={`/incidente/${inc.incidenteId}`} className="text-blue-600">Ver detalle</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute top-2 left-2 right-2 flex gap-2 z-[1000]">
        <Link to="/feed" className="bg-white px-3 py-1 rounded shadow text-sm">Feed</Link>
        <Link to="/directorio" className="bg-white px-3 py-1 rounded shadow text-sm">Emergencias</Link>
        {user?.rol === 'AUTORIDAD' && <Link to="/admin" className="bg-white px-3 py-1 rounded shadow text-sm">Dashboard</Link>}
        {user ? <Link to="/reportar" className="bg-red-600 text-white px-3 py-1 rounded shadow text-sm">Reportar</Link> : <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded shadow text-sm">Ingresar</Link>}
      </div>
      {user && (
        <Link to="/reportar" className="absolute bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg z-[1000]">+</Link>
      )}
    </div>
  );
};

export default Mapa;
