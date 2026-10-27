import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthRequiredModal from '../components/AuthRequiredModal';

const PIURA = [-5.19449, -80.63282];

const DEMO_INCIDENTES = [
  {
    incidenteId: 'demo-fire',
    esDemo: true,
    categoriaNombre: 'Incendio',
    estadoNombre: 'Activo',
    descripcion: 'Se reporta humo y fuego en una vivienda de la zona.',
    indiceConfianzaPorcentaje: 78,
    latitud: PIURA[0] - 0.0028,
    longitud: PIURA[1] - 0.0042,
  },
  {
    incidenteId: 'demo-warning-1',
    esDemo: true,
    categoriaNombre: 'Calle cerrada',
    estadoNombre: 'En evaluación',
    descripcion: 'Se reporta la av. Luis Montero cerrada temporalmente.',
    indiceConfianzaPorcentaje: 72,
    latitud: PIURA[0] - 0.0021,
    longitud: PIURA[1] + 0.0034,
  },
  {
    incidenteId: 'demo-warning-2',
    esDemo: true,
    categoriaNombre: 'Poste caído',
    estadoNombre: 'Confirmado',
    descripcion: 'Poste de alumbrado caído sobre la vereda.',
    indiceConfianzaPorcentaje: 81,
    latitud: PIURA[0] + 0.0027,
    longitud: PIURA[1] + 0.0068,
  },
  {
    incidenteId: 'demo-warning-3',
    esDemo: true,
    categoriaNombre: 'Vía bloqueada',
    estadoNombre: 'En evaluación',
    descripcion: 'Material de construcción obstruye la calle.',
    indiceConfianzaPorcentaje: 64,
    latitud: PIURA[0] + 0.0049,
    longitud: PIURA[1] - 0.0036,
  },
  {
    incidenteId: 'demo-flood',
    esDemo: true,
    categoriaNombre: 'Inundación',
    estadoNombre: 'Activo',
    descripcion: 'Acumulación de agua por lluvias en la vía principal.',
    indiceConfianzaPorcentaje: 69,
    latitud: PIURA[0] + 0.0081,
    longitud: PIURA[1] + 0.0059,
  },
];

const HEAT_POINTS = [
  { offset: [-0.0034, -0.0058], size: 200, type: 'high' },
  { offset: [-0.0022, -0.0042], size: 150, type: 'high' },
  { offset: [0.0036, 0.0084], size: 190, type: 'low' },
];

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

const crearIconoCalor = (tipo, size) => {
  const inner = tipo === 'high' ? 'rgba(217,125,125,0.55)' : 'rgba(155,221,170,0.55)';
  const outer = tipo === 'high' ? 'rgba(217,125,125,0.24)' : 'rgba(155,221,170,0.24)';

  return L.divIcon({
    className: '',
    html: `<span class="heat-blob" style="background:radial-gradient(circle, ${inner} 0%, ${outer} 46%, transparent 72%)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const distanciaMetros = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const Recenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [map, position]);
  return null;
};

const Mapa = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [position, setPosition] = useState(PIURA);
  const [incidentes, setIncidentes] = useState([]);
  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState(null);
  const [alertaVisible, setAlertaVisible] = useState(true);
  const [tiposVoto, setTiposVoto] = useState([]);
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    api.get('/public/catalogos/tipos-voto').then((res) => setTiposVoto(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const cargarIncidentes = async (lat, lng) => {
      try {
        const res = await api.get(`/incidentes/cercanos?latitud=${lat}&longitud=${lng}&radioMetros=1000`);
        setIncidentes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setIncidentes([]);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        cargarIncidentes(coords[0], coords[1]);
      },
      () => cargarIncidentes(PIURA[0], PIURA[1]),
      { timeout: 5000 }
    );
  }, []);

  const marcadores = incidentes.length > 0 ? incidentes : DEMO_INCIDENTES;
  const alerta = incidenteSeleccionado || marcadores[0];
  const esDemo = Boolean(alerta?.esDemo);
  const distancia = alerta ? distanciaMetros(position[0], position[1], alerta.latitud, alerta.longitud) : 350;
  const distanciaTexto = distancia >= 1000 ? `${(distancia / 1000).toFixed(1)}km` : `${distancia}m`;
  const titulo = esDemo
    ? 'Calle cerrada a 350m de ti'
    : `${alerta?.categoriaNombre || 'Incidencia'} a ${distanciaTexto} de ti`;
  const descripcion = alerta?.descripcion || alerta?.estadoNombre || 'Se reporta una incidencia en tu zona.';
  const detalleHref = esDemo ? '/feed' : `/incidente/${alerta?.incidenteId}`;

  const seleccionar = (incidente) => {
    setIncidenteSeleccionado(incidente);
    setAlertaVisible(true);
    setAviso('');
  };

  const confirmar = async () => {
    setAviso('');
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (esDemo) {
      navigate('/feed');
      return;
    }
    const tipo = tiposVoto.find((t) => /confirm/i.test(t.nombre)) || tiposVoto[0];
    if (!tipo) {
      navigate(`/incidente/${alerta.incidenteId}`);
      return;
    }
    try {
      setConfirmando(true);
      await api.post('/validaciones/con-ubicacion', {
        incidenteId: alerta.incidenteId,
        tipoVotoId: tipo.idTipoVoto,
        latitud: position[0],
        longitud: position[1],
        notaActualizacionRapida: null,
        fotoEvidenciaUrl: null,
      });
      setAviso('Alerta confirmada. Gracias por validar.');
    } catch (e) {
      setAviso(e.response?.data?.mensaje || 'No se pudo confirmar la alerta.');
    } finally {
      setConfirmando(false);
    }
  };

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
        <span className="flex h-[25px] items-center whitespace-nowrap rounded-full bg-[#EFF4FD] px-3 text-xs font-bold text-[#0756C9]">
          Confiabilidad : 4.8 ★
        </span>
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

          {HEAT_POINTS.map((punto) => (
            <Marker
              key={`heat-${punto.type}-${punto.offset.join(',')}`}
              position={[position[0] + punto.offset[0], position[1] + punto.offset[1]]}
              icon={crearIconoCalor(punto.type, punto.size)}
              interactive={false}
              zIndexOffset={-1000}
              opacity={0.95}
            />
          ))}

          {marcadores.map((incidente) => (
            <Marker
              key={incidente.incidenteId}
              position={[incidente.latitud, incidente.longitud]}
              icon={crearIconoMarcador(incidente.categoriaNombre)}
              zIndexOffset={200}
              eventHandlers={{ click: () => seleccionar(incidente) }}
            />
          ))}
        </MapContainer>

        {alertaVisible && alerta && (
          <section
            className="absolute inset-x-4 z-20 overflow-hidden rounded-[14px] border-l-[3px] border-[#E52424] bg-white p-3 shadow-[0_4px_18px_rgba(0,0,0,0.12)]"
            style={{ bottom: '96px', minHeight: '160px' }}
            aria-label="Alerta cercana"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FDE9E9] text-[#E52424]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 11 18-5v12L3 14v-3Z" />
                  <path d="M11.6 16.2a3 3 0 1 1-5.2-3" />
                  <path d="M3 11v3" />
                </svg>
              </span>
              <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap pt-1 text-[16px] font-bold leading-[21px] text-[#202124]">
                {titulo}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true);
                    return;
                  }
                  setAlertaVisible(false);
                }}
                aria-label="Cerrar alerta"
                className="-mr-1 -mt-1 p-1 text-[#424754]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="ml-12 mt-px text-[13px] leading-[18px] text-[#454B5A]">{descripcion}</p>
            <p className="ml-12 mt-0.5 text-[13px] leading-[18px] text-[#454B5A]">¿Puedes confirmar el estado actual?</p>

            {aviso && <p className="ml-12 mt-1 text-[11px] font-semibold text-[#0756C9]">{aviso}</p>}

            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={confirmar}
                disabled={confirmando}
                className="h-[33px] rounded-lg bg-[#E52424] text-xs font-bold text-white transition hover:bg-[#C91D1D] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {confirmando ? 'Confirmando...' : 'Confirmar'}
              </button>
              <Link
                to={detalleHref}
                className="grid h-[33px] place-items-center rounded-lg bg-[#E1E3E5] text-xs font-bold text-[#424754] transition hover:bg-[#D2D5D9]"
              >
                Ver detalles
              </Link>
            </div>
          </section>
        )}
      </div>

      <AuthRequiredModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Mapa;
