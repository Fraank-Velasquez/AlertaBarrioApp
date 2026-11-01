import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PIURA = [-5.19449, -80.63282];

const fireSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 2c1.5 4-1.5 5.5-1.5 8.5 0 1.4 1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-.7-.2-1.3-.5-1.9 2.7 1.6 4.5 4.4 4.5 7.4a7 7 0 0 1-14 0c0-4.2 3-6.3 4-9.5.4-1.3.8-2.9 2.5-4.5Z"/></svg>';

const warningSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

const floodSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2.5S5.5 9.1 5.5 14a6.5 6.5 0 0 0 13 0C18.5 9.1 12 2.5 12 2.5Z"/></svg>';

const userLocationSvg = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="m10.95 11.173l-1.046-1.046q-.146-.146-.344-.156q-.199-.01-.364.156q-.165.165-.165.357t.165.357l1.188 1.194q.243.242.566.242t.566-.242l3.338-3.339q.146-.146.156-.347t-.156-.366q-.165-.166-.357-.166t-.357.166zm8.146-.877q0 1.279-.572 2.613q-.572 1.333-1.458 2.632q-.885 1.3-1.981 2.494T12.92 20.21q-.198.173-.442.26t-.479.086t-.47-.077q-.234-.077-.432-.25q-1.067-.981-2.164-2.185q-1.096-1.203-1.99-2.493t-1.468-2.633t-.572-2.622q0-3.173 2.066-5.234Q9.037 3 12 3t5.03 2.062q2.066 2.061 2.066 5.234"/></svg>';

const getTipoMarcador = (categoria = '') => {
  const nombre = categoria.toLowerCase();
  if (nombre.includes('incend') || nombre.includes('fuego') || nombre.includes('humo')) return 'fire';
  if (nombre.includes('inund') || nombre.includes('agua') || nombre.includes('lluv') || nombre.includes('desborde')) return 'flood';
  return 'warning';
};

const crearIconoMarcador = (categoria) => {
  const tipo = getTipoMarcador(categoria);
  const size = tipo === 'fire' ? 29 : 35;
  const svg = tipo === 'fire' ? fireSvg : tipo === 'flood' ? floodSvg : warningSvg;

  return L.divIcon({
    className: '',
    html: `<span class="map-marker map-marker--${tipo}" style="width:${size}px;height:${size}px">${svg}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const crearIconoUbicacion = () => L.divIcon({
  className: '',
  html: `<span class="map-marker map-marker--user" style="width:40px;height:40px">${userLocationSvg}</span>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const Recenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [map, position]);
  return null;
};

const Mapa = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [position, setPosition] = useState(PIURA);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  const [distrito, setDistrito] = useState('Piura');

  useEffect(() => {
    let activo = true;
    const cargarIncidentes = async () => {
      try {
        const res = await api.get('/incidentes');
        setIncidentes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setIncidentes([]);
      }
    };

    const cargarDistrito = async () => {
      if (!isAuthenticated) {
        setDistrito('Piura');
        return;
      }

      try {
        const respuesta = await api.get('/perfil');
        if (activo) setDistrito(respuesta.data.sectorResidencia || user?.sectorResidencia || 'Piura');
      } catch {
        if (activo) setDistrito(user?.sectorResidencia || 'Piura');
      }
    };

    cargarDistrito();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setUbicacionUsuario(coords);
        cargarIncidentes();
      },
      () => cargarIncidentes(),
      { timeout: 5000 }
    );

    return () => {
      activo = false;
    };
  }, [isAuthenticated, user?.sectorResidencia]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[600px] flex-col bg-white">
      <div className="flex h-[39px] shrink-0 items-center justify-between border-b border-[#E4E6EB] bg-white px-[15px]">
        <div className="flex items-center gap-[7px] text-[14px] text-[#454B5A]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[17px] w-[17px] text-[#0756C9]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{distrito}, Piura</span>
        </div>
        <span className="text-xs font-semibold text-[#454B5A]">Incidentes registrados</span>
      </div>

      <div className="relative min-h-0 flex-1">
        <MapContainer
          center={position}
          zoom={14}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tint"
          />

          <Recenter position={position} />

          {ubicacionUsuario && (
            <Marker
              position={ubicacionUsuario}
              icon={crearIconoUbicacion()}
              zIndexOffset={500}
              interactive={false}
            />
          )}

          {incidentes.map((incidente) => (
            <Marker
              key={incidente.incidenteId}
              position={[incidente.latitud, incidente.longitud]}
              icon={crearIconoMarcador(incidente.categoriaNombre)}
              zIndexOffset={200}
              eventHandlers={{ click: () => navigate(`/incidente/${incidente.incidenteId}`) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Mapa;
