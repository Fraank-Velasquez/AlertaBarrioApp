import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { Icon } from '@iconify/react';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DISTRITOS_PIURA } from '../constants/distritosPiura';
import { resolveMediaUrl } from '../utils/media';
import { esRolAutoridad } from '../utils/roles';
import AccesoDenegado from './AccesoDenegado';

const PIURA = [-5.19449, -80.63282];
const GRID_GRADOS = 0.0045;
const REFRESCO_MS = 20000;

const UNIDADES_SUGERIDAS = [
  'Serenazgo',
  'Patrullero',
  'Bomberos',
  'Defensa Civil',
  'COED Piura',
  'Minsa',
  'Empresa de agua',
  'Empresa eléctrica',
];

const sinAcentos = (valor = '') => valor
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const estadoInfo = (nombre = '') => {
  const normalizado = sinAcentos(nombre);
  if (normalizado.includes('resuelt') || normalizado.includes('atendid')) {
    return { etiqueta: 'Resuelto', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  }
  if (normalizado.includes('revision')) {
    return { etiqueta: 'En revisión', badge: 'border-amber-200 bg-amber-50 text-amber-800' };
  }
  if (normalizado.includes('confirm')) {
    return { etiqueta: 'Confirmado', badge: 'border-blue-200 bg-blue-50 text-blue-700' };
  }
  if (normalizado.includes('rechaz') || normalizado.includes('descar') || normalizado.includes('falsa')) {
    return { etiqueta: 'Rechazado', badge: 'border-rose-200 bg-rose-50 text-rose-700' };
  }
  return { etiqueta: nombre || 'Pendiente', badge: 'border-slate-200 bg-slate-50 text-slate-600' };
};

const esEstadoActivo = (incidente) => {
  const normalizado = sinAcentos(incidente.estadoNombre || '');
  return normalizado.includes('pendiente') || normalizado.includes('revision') || normalizado.includes('confirm');
};

const esResuelto = (incidente) => {
  const normalizado = sinAcentos(incidente.estadoNombre || '');
  return normalizado.includes('resuelt') || normalizado.includes('atendid');
};

const formatearFecha = (valor) => {
  if (!valor) return 'Sin fecha';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'Sin fecha';
  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AjustarVista = ({ puntos }) => {
  const map = useMap();

  useEffect(() => {
    if (!puntos.length) return;
    const latitudes = puntos.map((punto) => punto.latitud);
    const longitudes = puntos.map((punto) => punto.longitud);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    if (minLat === maxLat && minLng === maxLng) {
      map.setView([minLat, minLng], 14);
      return;
    }
    map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [28, 28], maxZoom: 14 });
  }, [map, puntos]);

  return null;
};

const colorCalor = (celda) => {
  if (celda.count >= 8) return '#b91c1c';
  if (celda.count >= 6) return '#dc2626';
  if (celda.count >= 5) return '#ea580c';
  return '#f59e0b';
};

const MapaCalor = ({ incidentes, seleccionado, onSeleccionar }) => {
  const puntos = useMemo(() => incidentes.filter((incidente) => (
    typeof incidente.latitud === 'number' && typeof incidente.longitud === 'number'
  )), [incidentes]);

  const celdas = useMemo(() => {
    const agrupadas = new Map();
    for (const incidente of puntos) {
      const fila = Math.floor(incidente.latitud / GRID_GRADOS);
      const columna = Math.floor(incidente.longitud / GRID_GRADOS);
      const clave = `${fila}:${columna}`;
      const celda = agrupadas.get(clave) || { count: 0, latitud: 0, longitud: 0 };
      celda.count += 1;
      celda.latitud += incidente.latitud;
      celda.longitud += incidente.longitud;
      agrupadas.set(clave, celda);
    }

    return [...agrupadas.values()]
      .filter((celda) => celda.count > 3)
      .map((celda) => ({
        ...celda,
        latitud: celda.latitud / celda.count,
        longitud: celda.longitud / celda.count,
      }));
  }, [puntos]);

  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-200 sm:h-[430px]">
      <MapContainer center={PIURA} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarVista puntos={puntos} />

        {celdas.map((celda) => (
          <Circle
            key={`calor-${celda.latitud}-${celda.longitud}`}
            center={[celda.latitud, celda.longitud]}
            radius={Math.min(1500, 220 + celda.count * 70)}
            pathOptions={{ stroke: false, fillColor: colorCalor(celda), fillOpacity: 0.18 }}
          >
            <Tooltip direction="top">
              Zona con {celda.count} alertas registradas
            </Tooltip>
          </Circle>
        ))}

        {celdas.map((celda) => (
          <Circle
            key={`nucleo-${celda.latitud}-${celda.longitud}`}
            center={[celda.latitud, celda.longitud]}
            radius={Math.min(700, 120 + celda.count * 30)}
            pathOptions={{ stroke: false, fillColor: colorCalor(celda), fillOpacity: 0.30 }}
          />
        ))}

        {puntos.map((incidente) => {
          const activo = seleccionado?.incidenteId === incidente.incidenteId;
          return (
            <CircleMarker
              key={incidente.incidenteId}
              center={[incidente.latitud, incidente.longitud]}
              radius={activo ? 10 : 7}
              pathOptions={{
                color: activo ? '#0f172a' : '#ffffff',
                weight: activo ? 3 : 2,
                fillColor: '#1d4ed8',
                fillOpacity: 0.95,
              }}
              eventHandlers={{ click: () => onSeleccionar(incidente) }}
            >
              <Tooltip direction="top">
                <span className="font-bold">{incidente.categoriaNombre}</span>
                <br />
                {incidente.distrito || 'Sin distrito'}
                <br />
                {estadoInfo(incidente.estadoNombre).etiqueta}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

const TarjetaKpi = ({ icono, etiqueta, valor, detalle, tono }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{etiqueta}</p>
        <p className="mt-1 text-2xl font-extrabold leading-none text-slate-900">{valor}</p>
        {detalle && <p className="mt-1 text-xs font-medium text-slate-500">{detalle}</p>}
      </div>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tono}`} aria-hidden="true">
        <Icon icon={icono} width="25" height="25" />
      </span>
    </div>
  </div>
);

const Toast = ({ feedback, onClose }) => {
  const esError = feedback.tipo === 'error';
  const esInfo = feedback.tipo === 'info';

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[2000] w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-6">
      <div
        role={esError ? 'alert' : 'status'}
        className={`pointer-events-auto w-full max-w-sm rounded-xl border bg-white p-3 shadow-2xl ${esError ? 'border-red-200' : esInfo ? 'border-blue-200' : 'border-emerald-200'}`}
      >
        <div className="flex items-start gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${esError ? 'bg-red-50 text-red-600' : esInfo ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <Icon
              icon={esError ? 'material-symbols:error-outline' : esInfo ? 'material-symbols:info-outline' : 'material-symbols:check-circle-outline'}
              width="22"
              height="22"
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0 flex-1">
            {feedback.titulo && <p className="text-sm font-extrabold text-slate-900">{feedback.titulo}</p>}
            <p className={`text-sm leading-5 text-slate-600 ${feedback.titulo ? 'mt-0.5' : 'font-semibold'}`}>{feedback.texto}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar mensaje"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon icon="material-symbols:close" width="18" height="18" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardAutoridad = () => {
  const { user, loading: cargandoSesion, logout } = useAuth();
  const navigate = useNavigate();
  const [incidentes, setIncidentes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [sinPermiso, setSinPermiso] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [distrito, setDistrito] = useState('TODOS');
  const [categoria, setCategoria] = useState('TODAS');
  const [estado, setEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [unidad, setUnidad] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [accionando, setAccionando] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const montado = useRef(true);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setActualizando(true);
    try {
      const respuesta = await api.get('/admin/incidentes');
      if (!montado.current) return;
      const lista = Array.isArray(respuesta.data) ? respuesta.data : [];
      setIncidentes(lista);
      setSeleccionado((previo) => {
        if (!previo) return previo;
        return lista.find((incidente) => incidente.incidenteId === previo.incidenteId) || previo;
      });
      setSinPermiso(false);
    } catch (error) {
      if (!montado.current) return;
      if (error.response?.status === 403) {
        setSinPermiso(true);
        return;
      }
      setFeedback({ tipo: 'error', texto: error.response?.data?.mensaje || 'No se pudieron cargar los incidentes.' });
    } finally {
      if (montado.current) {
        setCargandoInicial(false);
        setActualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    const inicial = window.setTimeout(() => cargar(true), 0);
    api.get('/public/catalogos/estados')
      .then((respuesta) => {
        if (montado.current) setEstados(Array.isArray(respuesta.data) ? respuesta.data : []);
      })
      .catch(() => { });

    const intervalo = window.setInterval(() => cargar(true), REFRESCO_MS);
    const alVolver = () => {
      if (document.visibilityState === 'visible') cargar(true);
    };
    document.addEventListener('visibilitychange', alVolver);

    return () => {
      montado.current = false;
      window.clearTimeout(inicial);
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [cargar]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(null), feedback.tipo === 'error' ? 6000 : 4500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const estadoResuelto = useMemo(() => estados.find((item) => sinAcentos(item.nombre).includes('resuelt')), [estados]);

  const distritosDisponibles = useMemo(() => {
    const nombres = new Set(DISTRITOS_PIURA);
    incidentes.forEach((incidente) => {
      if (incidente.distrito) nombres.add(incidente.distrito);
    });
    return [...nombres].sort((a, b) => a.localeCompare(b, 'es'));
  }, [incidentes]);

  const estadosDisponibles = useMemo(() => {
    const nombres = new Set(incidentes.map((incidente) => incidente.estadoNombre).filter(Boolean));
    return [...nombres].sort((a, b) => a.localeCompare(b, 'es'));
  }, [incidentes]);

  const categoriasDisponibles = useMemo(() => {
    const nombres = new Set(incidentes.map((incidente) => incidente.categoriaNombre).filter(Boolean));
    return [...nombres].sort((a, b) => a.localeCompare(b, 'es'));
  }, [incidentes]);

  const filtrados = useMemo(() => {
    const termino = sinAcentos(busqueda.trim());
    return incidentes.filter((incidente) => {
      const coincideDistrito = distrito === 'TODOS' || incidente.distrito === distrito;
      const coincideCategoria = categoria === 'TODAS' || incidente.categoriaNombre === categoria;
      const coincideEstado = estado === 'TODOS'
        || String(incidente.estadoId) === String(estado)
        || incidente.estadoNombre === estado;
      const coincideTexto = !termino || sinAcentos([
        incidente.categoriaNombre,
        incidente.autorNombre,
        incidente.descripcion,
        incidente.distrito,
      ].filter(Boolean).join(' ')).includes(termino);
      return coincideDistrito && coincideCategoria && coincideEstado && coincideTexto;
    });
  }, [busqueda, categoria, distrito, estado, incidentes]);

  const resumen = useMemo(() => {
    const activos = incidentes.filter(esEstadoActivo);
    return {
      total: incidentes.length,
      activos: activos.length,
      revision: incidentes.filter((incidente) => sinAcentos(incidente.estadoNombre || '').includes('revision')).length,
      confirmados: incidentes.filter((incidente) => sinAcentos(incidente.estadoNombre || '').includes('confirm')).length,
      resueltos: incidentes.filter(esResuelto).length,
    };
  }, [incidentes]);

  if (cargandoSesion) {
    return <div className="grid min-h-[100dvh] place-items-center bg-slate-100 text-sm font-semibold text-slate-500">Cargando panel…</div>;
  }

  if (!user || !esRolAutoridad(user.rol) || sinPermiso) {
    return <AccesoDenegado />;
  }

  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  const seleccionar = (incidente) => {
    setSeleccionado(incidente);
    setUnidad('');
    setMensaje('');
    setFeedback(null);
  };

  const limpiarFiltros = () => {
    setDistrito('TODOS');
    setCategoria('TODAS');
    setEstado('TODOS');
    setBusqueda('');
  };

  const ejecutar = async (accion, textoExito) => {
    if (!seleccionado || accionando) return;
    setAccionando(true);
    setFeedback(null);
    try {
      await accion();
      await cargar(true);
      setFeedback({ tipo: 'ok', texto: textoExito });
    } catch (error) {
      setFeedback({ tipo: 'error', texto: error.response?.data?.mensaje || 'No se pudo completar la acción.' });
    } finally {
      setAccionando(false);
    }
  };

  const despachar = () => {
    ejecutar(
      () => api.post(`/admin/incidentes/${seleccionado.incidenteId}/despachar`, {
        unidadDespachada: unidad.trim(),
        mensajeComunicadoOficial: mensaje.trim() || null,
      }),
      `Unidad despachada. ${seleccionado.categoriaNombre} quedó en revisión.`,
    );
  };

  const resolver = () => {
    ejecutar(
      () => api.post(`/admin/incidentes/${seleccionado.incidenteId}/resolver`, {
        unidadDespachada: unidad.trim(),
        mensajeComunicadoOficial: mensaje.trim() || null,
      }),
      'Incidente resuelto. El estado se actualizará en el feed comunitario.',
    );
  };

  const estadoSeleccionado = sinAcentos(seleccionado?.estadoNombre || '');
  const yaEstaEnRevision = estadoSeleccionado.includes('revision');
  const yaEstaResuelto = estadoSeleccionado.includes('resuelt') || estadoSeleccionado.includes('atendid');

  const solicitarDespacho = () => {
    if (yaEstaResuelto) {
      setFeedback({
        tipo: 'info',
        titulo: 'El incidente ya está resuelto',
        texto: 'Este incidente ya fue marcado como resuelto. No es necesario volver a despacharlo ni cambiar su estado.',
      });
      return;
    }
    if (yaEstaEnRevision) {
      setFeedback({
        tipo: 'info',
        titulo: 'El incidente ya está en revisión',
        texto: 'Este incidente ya fue derivado y se encuentra en estado "En revisión". No es necesario volver a despacharlo.',
      });
      return;
    }
    if (!unidad.trim()) {
      setFeedback({ tipo: 'error', texto: 'Debe indicar la unidad que será despachada.' });
      return;
    }
    setFeedback(null);
    setConfirmacion({
      tipo: 'despachar',
      titulo: 'Confirmar despacho',
      mensaje: 'El incidente pasará al estado "En revisión" y se registrará la unidad despachada.',
      textoConfirmar: 'Sí, despachar',
      tono: 'bg-[#1D4ED8] hover:bg-blue-800',
    });
  };

  const solicitarResolucion = () => {
    if (yaEstaResuelto) {
      setFeedback({
        tipo: 'info',
        titulo: 'El incidente ya está resuelto',
        texto: 'Este incidente ya fue marcado como resuelto. No es necesario volver a cambiar su estado.',
      });
      return;
    }
    if (!unidad.trim()) {
      setFeedback({ tipo: 'error', texto: 'Indica la unidad responsable antes de resolver.' });
      return;
    }
    setFeedback(null);
    setConfirmacion({
      tipo: 'resolver',
      titulo: 'Confirmar resolución',
      mensaje: 'El incidente pasará al estado "Resuelto". Esta acción actualizará el estado en el feed comunitario.',
      textoConfirmar: 'Sí, marcar como resuelto',
      tono: 'bg-emerald-600 hover:bg-emerald-700',
    });
  };

  const confirmarAccion = async () => {
    if (!confirmacion || accionando) return;
    const tipo = confirmacion.tipo;
    setConfirmacion(null);
    if (tipo === 'despachar') {
      await despachar();
    } else {
      await resolver();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <header className="bg-[#1D4ED8] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl ">
              <Icon icon="material-symbols-light:motion-sensor-alert" width="35" height="35" color="#ffffff" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-200">Alerta Barrio</p>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Panel de Autoridades</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/25 px-3 py-2 text-xs font-bold text-white">
              {[user.nombres, user.apellidos].filter(Boolean).join(' ') || user.correo}
            </span>
            <button type="button" onClick={cerrarSesion} className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-[#0b2c5e] transition hover:bg-blue-50">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:px-6 lg:py-6">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <TarjetaKpi icono="mdi:note-multiple" etiqueta="Registros" valor={resumen.total} detalle="Histórico total" tono="bg-slate-100 text-slate-700" />
          <TarjetaKpi icono="material-symbols:siren-open-rounded" etiqueta="Activos" valor={resumen.activos} detalle="Pendientes, revisión o confirmados" tono="bg-blue-50 text-blue-700" />
          <TarjetaKpi icono="icon-park-outline:eyes" etiqueta="En revisión" valor={resumen.revision} detalle="Atendidos por autoridad" tono="bg-amber-50 text-amber-700" />
          <TarjetaKpi icono="iconmind:assert-pass-outline-bold" etiqueta="Confirmados" valor={resumen.confirmados} detalle="Validados por la comunidad" tono="bg-indigo-50 text-indigo-700" />
          <TarjetaKpi icono="carbon:status-resolved" etiqueta="Resueltos" valor={resumen.resueltos} detalle="Atendidos y cerrados" tono="bg-emerald-50 text-emerald-700" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Filtros de gestión</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Filtra los registros por distrito, tipo de incidente, estado o texto.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                Mostrando {filtrados.length} de {incidentes.length}
              </span>
              <button type="button" onClick={() => cargar(true)} disabled={actualizando}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                {actualizando ? 'Actualizando…' : 'Actualizar ahora'}
              </button>
              <button type="button" onClick={limpiarFiltros} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block text-xs font-bold text-slate-600">
              Distrito
              <select value={distrito} onChange={(event) => setDistrito(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue-600 focus-visible:outline-none">
                <option value="TODOS">Todos los distritos</option>
                {distritosDisponibles.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
              </select>
            </label>

            <label className="block text-xs font-bold text-slate-600">
              Tipo de incidente
              <select value={categoria} onChange={(event) => setCategoria(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue-600 focus-visible:outline-none">
                <option value="TODAS">Todos los tipos</option>
                {categoriasDisponibles.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
              </select>
            </label>

            <label className="block text-xs font-bold text-slate-600">
              Estado
              <select value={estado} onChange={(event) => setEstado(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue-600 focus-visible:outline-none">
                <option value="TODOS">Todos los estados</option>
                {estadosDisponibles.map((nombre) => <option key={nombre} value={nombre}>{estadoInfo(nombre).etiqueta}</option>)}
              </select>
            </label>

            <label className="block text-xs font-bold text-slate-600">
              Buscar
              <span className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white px-3 focus-within:border-blue-600">
                <Icon icon="material-symbols-light:search" width="19" height="19" className="text-slate-400" aria-hidden="true" />
                <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Categoría, autor, descripción…"
                  className="w-full border-0 bg-transparent px-2 py-2.5 text-sm font-normal text-slate-800 focus-visible:outline-none placeholder:text-slate-400" />
              </span>
            </label>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Mapa de incidentes</h2>
                <p className="text-xs font-medium text-slate-500">Visualización de alertas según los filtros aplicados.</p>
              </div>
            </div>
            <MapaCalor incidentes={filtrados} seleccionado={seleccionado} onSeleccionar={seleccionar} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-5 xl:self-start">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Atención y despacho</h2>
              {seleccionado && (
                <button type="button" onClick={() => setSeleccionado(null)} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100">
                  Limpiar
                </button>
              )}
            </div>

            {!seleccionado ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                <Icon icon="material-symbols-light:touch-app-outline" width="34" height="34" className="mx-auto text-slate-400" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-slate-700">Selecciona un incidente</p>
                <p className="mt-1 text-xs text-slate-500">Haz clic en un marcador del mapa o en una fila de la tabla para gestionarlo.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-1 text-[11px] font-extrabold tracking-wide ${estadoInfo(seleccionado.estadoNombre).badge}`}>
                      {estadoInfo(seleccionado.estadoNombre).etiqueta}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {seleccionado.distrito || 'Sin distrito'}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">{seleccionado.categoriaNombre}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {formatearFecha(seleccionado.fechaHoraReporte)} · Reportado por {seleccionado.autorNombre}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {seleccionado.descripcion || 'El vecino no agregó detalles adicionales.'}
                  </p>
                  {seleccionado.fotoEvidenciaUrl && (
                    <img src={resolveMediaUrl(seleccionado.fotoEvidenciaUrl)} alt="Evidencia del incidente"
                      className="mt-3 max-h-40 w-full rounded-xl object-cover" />
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 px-2 py-2">
                      <p className="text-[11px] font-bold text-slate-500">Confianza</p>
                      <p className="text-sm font-extrabold text-slate-900">{Math.round(Number(seleccionado.indiceConfianzaPorcentaje) || 0)}%</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 px-2 py-2">
                      <p className="text-[11px] font-bold text-emerald-700">Confirman</p>
                      <p className="text-sm font-extrabold text-emerald-800">{seleccionado.conteoVotosPositivos || 0}</p>
                    </div>
                    <div className="rounded-lg bg-rose-50 px-2 py-2">
                      <p className="text-[11px] font-bold text-rose-700">Rechazan</p>
                      <p className="text-sm font-extrabold text-rose-800">{seleccionado.conteoVotosNegativos || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Unidad a despachar
                    <input list="unidades-sugeridas" value={unidad} onChange={(event) => setUnidad(event.target.value)}
                      placeholder="Serenazgo, Bomberos, Patrullero"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue-600 focus-visible:outline-none" />
                    <datalist id="unidades-sugeridas">
                      {UNIDADES_SUGERIDAS.map((nombre) => <option key={nombre} value={nombre} />)}
                    </datalist>
                  </label>

                  <label className="mt-2 block text-xs font-bold text-slate-700">
                    Comunicado oficial (opcional)
                    <textarea value={mensaje} onChange={(event) => setMensaje(event.target.value)} rows={3}
                      placeholder="Mensaje que verá la comunidad…"
                      className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue-600 focus-visible:outline-none" />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={solicitarDespacho} disabled={accionando}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60">
                      Despachar y marcar en revisión
                    </button>
                    <button type="button" onClick={solicitarResolucion} disabled={accionando || !estadoResuelto}
                      className="rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                      Marcar como incidente resuelto
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Registro de incidentes</h2>
              <p className="text-xs font-medium text-slate-500">Tabla central filtrada por distrito, tipo de incidente y estado.</p>
            </div>
            {cargandoInicial && <span className="text-xs font-bold text-blue-700">Cargando registros…</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#3B82F6] text-[12px] tracking-wide text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-extrabold">Incidente</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Distrito</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Estado</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Confianza</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Reportado</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Votos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {cargandoInicial ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Cargando incidentes…</td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="text-sm font-bold text-slate-700">No hay incidentes que coincidan con los filtros.</p>
                      <button type="button" onClick={limpiarFiltros} className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Limpiar filtros</button>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((incidente) => {
                    const estadoActual = estadoInfo(incidente.estadoNombre);
                    const activo = seleccionado?.incidenteId === incidente.incidenteId;
                    return (
                      <tr
                        key={incidente.incidenteId}
                        onClick={() => seleccionar(incidente)}
                        className={`cursor-pointer transition ${activo ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{incidente.categoriaNombre}</p>
                          <p className="text-xs font-medium text-slate-500">{incidente.autorNombre}</p>
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{incidente.descripcion || 'Sin descripción'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-600">{incidente.distrito || 'Sin distrito'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-extrabold tracking-wide ${estadoActual.badge}`}>
                            {estadoActual.etiqueta}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, Number(incidente.indiceConfianzaPorcentaje) || 0))}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{Math.round(Number(incidente.indiceConfianzaPorcentaje) || 0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-600">{formatearFecha(incidente.fechaHoraReporte)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">
                          <span className="text-emerald-700">+{incidente.conteoVotosPositivos || 0}</span>
                          <span className="text-slate-300"> / </span>
                          <span className="text-rose-700">-{incidente.conteoVotosNegativos || 0}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {feedback && <Toast feedback={feedback} onClose={() => setFeedback(null)} />}

      {confirmacion && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmar-cambio-titulo"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
                <Icon icon="material-symbols:help-outline" width="24" height="24" aria-hidden="true" />
              </span>
              <div>
                <h2 id="confirmar-cambio-titulo" className="text-lg font-extrabold text-slate-900">{confirmacion.titulo}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{confirmacion.mensaje}</p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p><span className="font-bold">Incidente:</span> {seleccionado?.categoriaNombre || 'Sin categoría'}</p>
              <p><span className="font-bold">Distrito:</span> {seleccionado?.distrito || 'Sin distrito'}</p>
              <p><span className="font-bold">Estado actual:</span> {estadoInfo(seleccionado?.estadoNombre).etiqueta}</p>
              <p><span className="font-bold">Unidad:</span> {unidad.trim() || 'No indicada'}</p>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmacion(null)}
                disabled={accionando}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAccion}
                disabled={accionando}
                className={`rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmacion.tono}`}
              >
                {accionando ? 'Procesando…' : confirmacion.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAutoridad;
