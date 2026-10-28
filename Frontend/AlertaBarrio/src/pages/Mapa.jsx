import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

const PIURA = [-5.19449, -80.63282];

const fireSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 2c1.5 4-1.5 5.5-1.5 8.5 0 1.4 1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-.7-.2-1.3-.5-1.9 2.7 1.6 4.5 4.4 4.5 7.4a7 7 0 0 1-14 0c0-4.2 3-6.3 4-9.5.4-1.3.8-2.9 2.5-4.5Z"/></svg>';

const warningSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

const floodSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2.5S5.5 9.1 5.5 14a6.5 6.5 0 0 0 13 0C18.5 9.1 12 2.5 12 2.5Z"/></svg>';

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

const Recenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [map, position]);
  return null;
};

const Mapa = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(PIURA);
  const [incidentes, setIncidentes] = useState([]);

  useEffect(() => {
    const cargarIncidentes = async () => {
      try {
        const res = await api.get('/incidentes');
        setIncidentes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setIncidentes([]);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        cargarIncidentes();
      },
      () => cargarIncidentes(),
      { timeout: 5000 }
    );
  }, []);

  return (
    <div className="mx-auto flex h-full w-full max-w-[600px] flex-col bg-white">
      <div className="flex h-[39px] shrink-0 items-center justify-between border-b border-[#E4E6EB] bg-white px-[15px]">
        <div className="flex items-center gap-[7px] text-[14px] text-[#454B5A]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[17px] w-[17px] text-[#0756C9]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Castilla, Piura</span>
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
