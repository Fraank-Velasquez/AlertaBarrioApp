import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Mapa = () => {
  const [position, setPosition] = useState([-5.19449, -80.63282]);
  const [incidentes, setIncidentes] = useState([]);
  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState(null);
  const [error, setError] = useState(false);

  async function cargarIncidentes(lat, lng) {
    try {
      const res = await api.get(`/incidentes/cercanos?latitud=${lat}&longitud=${lng}&radioMetros=1000`);
      setIncidentes(res.data);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
    }
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        cargarIncidentes(pos.coords.latitude, pos.coords.longitude);
      },
      () => cargarIncidentes(-5.19449, -80.63282)
    );
  }, []);

  const crearIcono = (categoria = '') => {
    const nombre = categoria.toLowerCase();
    const esIncendio = nombre.includes('incend');
    const esInundacion = nombre.includes('inund');
    const esVia = nombre.includes('vía') || nombre.includes('via') || nombre.includes('poste') || nombre.includes('cable');
    const color = esIncendio ? '#e3262d' : esInundacion ? '#0751c8' : esVia ? '#f5a000' : '#2b66e8';
    const simbolo = esIncendio ? '♨' : esInundacion ? '◉' : esVia ? '!' : '•';

    return L.divIcon({
      className: '',
      html: `<span class="incident-marker" style="background:${color}">${simbolo}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidentes.map((inc) => (
          <Marker
            key={inc.incidenteId}
            position={[inc.latitud, inc.longitud]}
            icon={crearIcono(inc.categoriaNombre)}
            eventHandlers={{ click: () => setIncidenteSeleccionado(inc) }}
          >
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] bg-gradient-to-b from-white/95 to-white/80 px-4 py-2 shadow-sm backdrop-blur">
        <p className="text-sm font-bold text-slate-800">⌖ &nbsp;Piura, Perú</p>
        <p className="mt-0.5 text-xs text-slate-500">Alertas comunitarias cercanas</p>
      </div>

      {error && (
        <p role="alert" className="absolute left-4 right-4 top-16 z-[600] mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 shadow-sm">
          No se pudieron actualizar las alertas. El mapa sigue disponible.
        </p>
      )}

      {incidenteSeleccionado && (
        <section className="absolute inset-x-4 bottom-20 z-[600] mx-auto max-w-lg rounded-2xl border-l-4 border-red-500 bg-white p-4 shadow-xl" aria-label="Alerta seleccionada">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-50 text-lg text-red-600" aria-hidden="true">⚑</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-900">{incidenteSeleccionado.categoriaNombre}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-600">{incidenteSeleccionado.descripcion || incidenteSeleccionado.estadoNombre}</p>
            </div>
            <button type="button" onClick={() => setIncidenteSeleccionado(null)} aria-label="Cerrar alerta" className="-mr-1 -mt-1 px-2 text-xl leading-7 text-slate-500">×</button>
          </div>
          <div className="mt-3">
            <Link to={`/incidente/${incidenteSeleccionado.incidenteId}`} className="block rounded-lg bg-blue-700 py-2.5 text-center text-xs font-extrabold text-white">
              Ver detalles y validar
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Mapa;
