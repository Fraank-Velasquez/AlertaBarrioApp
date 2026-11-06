import { useCallback, useEffect, useState } from 'react';
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

const userLocationSvg = '<svg viewBox="0 0 24 24" width="25" height=25"><path fill="currentColor" d="M11 21.95v-1q-3.125-.35-5.363-2.587T3.05 13h-1q-.425 0-.712-.288T1.05 12t.288-.712T2.05 11h1q.35-3.125 2.588-5.363T11 3.05v-1q0-.425.288-.712T12 1.05t.713.288t.287.712v1q3.125.35 5.363 2.588T20.95 11h1q.425 0 .713.288t.287.712t-.287.713t-.713.287h-1q-.35 3.125-2.587 5.363T13 20.95v1q0 .425-.288.713T12 22.95t-.712-.287T11 21.95m5.95-5Q19 14.9 19 12t-2.05-4.95T12 5T7.05 7.05T5 12t2.05 4.95T12 19t4.95-2.05m-7.775-2.125Q8 13.65 8 12t1.175-2.825T12 8t2.825 1.175T16 12t-1.175 2.825T12 16t-2.825-1.175"/></svg>';

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

  const refrescarIncidentes = useCallback(async () => {
    try {
      const res = await api.get('/incidentes');
      setIncidentes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setIncidentes([]);
    }
  }, []);

  useEffect(() => {
    let activo = true;

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
        refrescarIncidentes();
      },
      () => refrescarIncidentes(),
      { timeout: 5000 }
    );

    return () => {
      activo = false;
    };
  }, [isAuthenticated, user?.sectorResidencia, refrescarIncidentes]);

  useEffect(() => {
    const intervalo = window.setInterval(refrescarIncidentes, 20000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') refrescarIncidentes();
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [refrescarIncidentes]);

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
