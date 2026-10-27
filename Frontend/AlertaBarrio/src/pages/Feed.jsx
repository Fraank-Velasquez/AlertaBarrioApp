import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const RADIO_INICIAL = 1000;

const Feed = () => {
  const [incidentes, setIncidentes] = useState([]);
  const [lat, setLat] = useState(-5.19449);
  const [lng, setLng] = useState(-80.63282);
  const [radio, setRadio] = useState(RADIO_INICIAL);
  const [categoria, setCategoria] = useState('Todos');
  const [error, setError] = useState(false);
  const filtros = ['Todos', 'Inundación', 'Postes/Cables'];

  async function cargar(la, lo, r) {
    try {
      const res = await api.get(`/incidentes/cercanos?latitud=${la}&longitud=${lo}&radioMetros=${r}`);
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
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        cargar(pos.coords.latitude, pos.coords.longitude, RADIO_INICIAL);
      },
      () => cargar(-5.19449, -80.63282, RADIO_INICIAL)
    );
  }, []);

  const cambiarRadio = (r) => {
    setRadio(r);
    cargar(lat, lng, r);
  };

  const incidentesVisibles = incidentes.filter((incidente) => (
    categoria === 'Todos' || incidente.categoriaNombre?.toLowerCase().includes(categoria === 'Postes/Cables' ? 'poste' : categoria.toLowerCase())
  ));

  return (
    <div className="min-h-full bg-[#f5f7fa]">
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-[#f7f8fa]/95 px-4 pb-3 pt-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-blue-700">AlertaBarrio</h1>
              <p className="mt-0.5 text-xs font-semibold text-slate-600">Castilla, Piura <span aria-hidden="true">⌄</span></p>
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
                {filtro}
              </button>
            ))}
            <div className="ml-auto flex shrink-0 gap-1">
              <button type="button" onClick={() => cambiarRadio(500)} aria-pressed={radio === 500} className={`rounded-full px-3 py-2 text-xs font-bold ${radio === 500 ? 'bg-blue-100 text-blue-800' : 'bg-white text-slate-500'}`}>500 m</button>
              <button type="button" onClick={() => cambiarRadio(1000)} aria-pressed={radio === 1000} className={`rounded-full px-3 py-2 text-xs font-bold ${radio === 1000 ? 'bg-blue-100 text-blue-800' : 'bg-white text-slate-500'}`}>1 km</button>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          {error ? (
            <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 text-sm text-amber-900 shadow-sm">
              <p className="font-bold">No se pudieron cargar las alertas.</p>
              <p className="mt-1">Comprueba tu conexión e inténtalo nuevamente.</p>
              <button type="button" onClick={() => cargar(lat, lng, radio)} className="mt-3 rounded-lg bg-amber-100 px-3 py-2 font-bold text-amber-900 hover:bg-amber-200">
                Reintentar
              </button>
            </div>
          ) : incidentesVisibles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
              <span className="text-3xl text-blue-700" aria-hidden="true">⌖</span>
              <p className="mt-3 font-bold text-slate-800">No hay alertas en esta categoría</p>
              <p className="mt-1 text-sm text-slate-500">Prueba otro filtro o amplía el radio de búsqueda.</p>
            </div>
          ) : incidentesVisibles.map((inc) => {
            const confianza = Math.min(100, Math.max(0, Number(inc.indiceConfianzaPorcentaje) || 0));
            const confirmado = inc.estadoNombre?.toLowerCase().includes('confirm');
            const iniciales = (inc.autorNombre || 'Vecino').split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

            return (
              <Link
                to={`/incidente/${inc.incidenteId}`}
                key={inc.incidenteId}
                className="block overflow-hidden rounded-2xl border-l-4 border-blue-600 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)] transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-800">{iniciales}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{inc.autorNombre || 'Vecino de la zona'}</p>
                      <p className="text-xs text-slate-500">Alerta comunitaria</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">Ver detalle</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${confirmado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                    {inc.estadoNombre || 'En revisión'}
                  </span>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    {confianza}% confianza
                  </span>
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-500">Radio de consulta: {radio} m</p>
                <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900">{inc.categoriaNombre || 'Incidente reportado'}</h2>
                {inc.descripcion && <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">{inc.descripcion}</p>}

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
