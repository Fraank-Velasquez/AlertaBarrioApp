import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '../utils/media';

const distanciaMetros = (lat1, lon1, lat2, lon2) => {
  const radioTierra = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return radioTierra * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const tiempoTranscurrido = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  const milisegundos = Date.now() - new Date(fecha).getTime();
  const minutos = Math.max(0, Math.floor(milisegundos / 60000));
  if (minutos < 1) return 'Hace unos segundos';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  return `Hace ${Math.floor(horas / 24)} d`;
};

const iconoCategoria = (nombre = '') => {
  const categoria = nombre.toLowerCase();
  if (categoria.includes('inund')) return '🌊';
  if (categoria.includes('poste') || categoria.includes('cable')) return '⚡';
  if (categoria.includes('incend')) return '🔥';
  if (categoria.includes('vía') || categoria.includes('calle')) return '🚧';
  return '✳';
};

const colorCategoria = (nombre = '') => {
  const categoria = nombre.toLowerCase();
  if (categoria.includes('poste') || categoria.includes('cable')) return 'border-amber-500';
  if (categoria.includes('incend')) return 'border-red-500';
  return 'border-red-500';
};

const Feed = () => {
  const [incidentes, setIncidentes] = useState([]);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [categoria, setCategoria] = useState('Todos');
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.toast) return undefined;
    setToast(location.state.toast);
    const timer = window.setTimeout(() => {
      setToast('');
      navigate(location.pathname, { replace: true, state: null });
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.state, navigate]);

  const cargar = async (la, lo, r) => {
    try {
      setCargando(true);
      const res = await api.get('/incidentes');
      setIncidentes(res.data);
      setError('');
    } catch (requestError) {
      console.error(requestError);
      setError('No se pudieron cargar las alertas. Comprueba tu conexión e inténtalo nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      cargar(null, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setCargando(true);
        cargar(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        cargar(null, null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (lat === null || lng === null) return undefined;
    const controller = new AbortController();
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lng),
      zoom: '14',
      addressdetails: '1',
      'accept-language': 'es',
    });

    fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo resolver la ubicación');
        return response.json();
      })
      .then((data) => {
        const address = data.address || {};
        const distrito = address.city_district || address.municipality || address.county
          || address.suburb || address.town || address.city;
        const ciudad = address.city || address.town || address.municipality;
        setUbicacion([distrito, ciudad && ciudad !== distrito ? ciudad : null].filter(Boolean).join(', '));
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setUbicacion(null);
      });

    return () => controller.abort();
  }, [lat, lng]);

  const filtros = useMemo(() => (
    ['Todos', ...new Set(incidentes.map((incidente) => incidente.categoriaNombre).filter(Boolean))]
  ), [incidentes]);

  const incidentesVisibles = incidentes.filter((incidente) => (
    categoria === 'Todos' || incidente.categoriaNombre === categoria
  ));

  return (
    <div className="min-h-full bg-[#f5f7fa]">
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-[#f7f8fa]/95 px-4 pb-3 pt-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-blue-700">AlertaBarrio</h1>
              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                {ubicacion || (lat === null ? 'Ubicación no disponible' : 'Detectando ubicación…')}
                <span aria-hidden="true">⌄</span>
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl text-blue-700 shadow-sm" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filtros.map((filtro) => (
              <button
                type="button"
                key={filtro}
                onClick={() => setCategoria(filtro)}
                aria-pressed={categoria === filtro}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  categoria === filtro ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:bg-blue-50'
                }`}
              >
                {filtro !== 'Todos' && <span aria-hidden="true">{iconoCategoria(filtro)} </span>}{filtro}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          {toast && (
            <div role="status" className="fixed inset-x-4 top-20 z-30 mx-auto max-w-lg rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white shadow-lg">
              {toast}
            </div>
          )}
          {error ? (
            <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 text-sm text-amber-900 shadow-sm">
              <p className="font-bold">{error}</p>
              <button type="button" onClick={() => cargar(lat, lng)} className="mt-3 rounded-lg bg-amber-100 px-3 py-2 font-bold hover:bg-amber-200">Reintentar</button>
            </div>
          ) : cargando ? (
            <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm font-semibold text-slate-500 shadow-sm">Cargando alertas cercanas…</div>
          ) : incidentesVisibles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
              <p className="font-bold text-slate-800">No hay alertas en esta categoría</p>
              <p className="mt-1 text-sm text-slate-500">Prueba otra categoría o vuelve a intentarlo más tarde.</p>
            </div>
          ) : incidentesVisibles.map((inc) => {
            const confianza = Math.min(100, Math.max(0, Number(inc.indiceConfianzaPorcentaje) || 0));
            const confirmado = inc.estadoNombre?.toLowerCase().includes('confirm');
            const iniciales = (inc.autorNombre || 'Vecino').split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
            const distancia = lat !== null && lng !== null && inc.latitud !== null && inc.longitud !== null
              ? Math.round(distanciaMetros(lat, lng, inc.latitud, inc.longitud))
              : null;

            return (
              <Link to={`/incidente/${inc.incidenteId}`} key={inc.incidenteId} className={`block overflow-hidden rounded-2xl border-l-4 ${colorCategoria(inc.categoriaNombre)} bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)] transition hover:shadow-md`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-extrabold text-blue-800">{iniciales}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{inc.autorNombre || 'Vecino de la zona'}</p>
                      <p className="text-xs text-slate-500">{inc.categoriaNombre || 'Incidente reportado'}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">Ver detalle</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${confirmado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                    {inc.estadoNombre || 'En revisión'}
                  </span>
                  {confianza > 0 && <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">{confianza}% confianza</span>}
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {distancia !== null ? `A ${distancia} m` : 'Distancia no disponible'} · {tiempoTranscurrido(inc.fechaHoraReporte)}
                </p>
                <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900">{inc.descripcion || inc.categoriaNombre || 'Incidente reportado'}</h2>
                {inc.fotoEvidenciaUrl && <img src={resolveMediaUrl(inc.fotoEvidenciaUrl)} alt="Evidencia del incidente" className="mt-3 max-h-56 w-full rounded-lg object-cover" />}

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200" aria-label={`${confianza}% de confianza`}>
                  <div className={`h-full rounded-full ${confirmado ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${confianza}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {inc.conteoVotosPositivos || 0} confirmaron · {inc.conteoVotosNegativos || 0} rechazaron
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Feed;
