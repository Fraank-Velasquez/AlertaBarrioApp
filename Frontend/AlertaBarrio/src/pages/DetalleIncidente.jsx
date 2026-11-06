import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../utils/media';
import { Icon } from '@iconify/react';

const DetalleIncidente = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [incidente, setIncidente] = useState(null);
  const [tipoVotos, setTipoVotos] = useState([]);
  const [tipoVotoId, setTipoVotoId] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarIncidente = useCallback(async () => {
    try {
      const res = await api.get(`/incidentes/${id}`);
      setIncidente(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Acceso denegado. No tienes permisos para ver este incidente.');
      } else if (err.response?.status === 404) {
        setError('El incidente ya no está disponible.');
      } else {
        setError('No se pudo cargar la alerta. Inténtalo nuevamente.');
      }
    }
  }, [id]);

  useEffect(() => {
    const inicial = window.setTimeout(cargarIncidente, 0);
    api.get('/public/catalogos/tipos-voto').then((res) => setTipoVotos(res.data)).catch(() => {});
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
    return () => window.clearTimeout(inicial);
  }, [cargarIncidente]);

  useEffect(() => {
    const intervalo = window.setInterval(cargarIncidente, 20000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') cargarIncidente();
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [cargarIncidente]);

  const votar = async () => {
    setMensaje('');
    try {
      await api.post('/validaciones/con-ubicacion', {
        incidenteId: id,
        tipoVotoId,
        latitud: lat,
        longitud: lng,
        notaActualizacionRapida: null,
        fotoEvidenciaUrl: null,
      });
      setMensaje('Voto emitido correctamente');
      cargarIncidente();
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al votar');
    }
  };

  if (error) {
    return (
      <div className="grid min-h-full place-items-center bg-[#f5f7fa] px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
            <Icon icon="material-symbols-light:lock-outline" width="32" height="32" aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-lg font-extrabold text-slate-900">No se puede mostrar la alerta</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
          <Link to="/feed" className="mt-5 inline-block rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">Volver al feed</Link>
        </div>
      </div>
    );
  }

  if (!incidente) return <div className="mx-auto max-w-lg p-6 text-sm font-medium text-slate-500">Cargando alerta…</div>;

  const normalizado = (incidente.estadoNombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const resuelto = normalizado.includes('resuelt') || normalizado.includes('atendid');
  const rechazado = normalizado.includes('rechaz') || normalizado.includes('descar') || normalizado.includes('falsa');
  const cerrado = resuelto || rechazado;
  const confianza = Math.min(100, Math.max(0, Number(incidente.indiceConfianzaPorcentaje) || 0));

  return (
    <div className="min-h-full bg-[#f5f7fa] px-4 py-5">
      <div className="mx-auto max-w-lg space-y-4">
        <section className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
          <Icon icon="carbon:event-incident"
            width="35"
            height="30"
            color='#a10707' />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold uppercase leading-tight">Incidente reportado</p>
            <h1 className="mt-1 text-sm font-semibold text-[#333333]">{incidente.categoriaNombre}</h1>
          </div>
          <span className="shrink-0 rounded-full bg-white text-[#333333] px-2.5 py-1 text-[10px] font-extrabold uppercase">{incidente.estadoNombre}</span>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-extrabold text-slate-900">Estado de la alerta</h2>
            <span className="text-xl font-extrabold text-emerald-600">{confianza}%</span>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-200" aria-label={`${confianza}% de confianza`}>
            <span className="h-full bg-emerald-500" style={{ width: `${confianza}%` }} />
            <span className="h-full flex-1 bg-[#bc7171]" />
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-slate-500">
            {incidente.conteoVotosPositivos || 0} confirmaron, {incidente.conteoVotosNegativos || 0} rechazaron
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900">Descripción</h2>
          {incidente.fotoEvidenciaUrl && (
            <img src={resolveMediaUrl(incidente.fotoEvidenciaUrl)} alt="Evidencia del incidente" className="mt-3 max-h-72 w-full rounded-lg object-cover" />
          )}
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
            {incidente.descripcion || 'El vecino no agregó detalles adicionales.'}
          </p>
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
            Reportado por <span className="font-bold text-slate-700">{incidente.autorNombre || 'un vecino'}</span>
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-extrabold text-slate-900">¿Qué ocurre ahora en la zona?</h2>
          <p className="mt-1 text-sm text-slate-600">Tu confirmación ayuda a mantener informada a la comunidad.</p>

          {cerrado ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {resuelto ? 'Este incidente fue resuelto por la autoridad.' : 'Este incidente fue descartado por la autoridad.'}
              {' '}Ya no admite nuevas validaciones.
            </div>
          ) : user ? (
            <div className="mt-4">
              <label htmlFor="tipo-voto" className="mb-2 block text-xs font-bold text-slate-700">Selecciona tu validación</label>
              <select id="tipo-voto" className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm" value={tipoVotoId} onChange={(e) => setTipoVotoId(e.target.value)}>
                <option value="">Seleccionar estado</option>
                {tipoVotos.map((tipo) => (
                  <option key={tipo.idTipoVoto} value={tipo.idTipoVoto}>{tipo.nombre}</option>
                ))}
              </select>
              <button onClick={votar} disabled={!tipoVotoId || !lat || !lng} className="mt-3 w-full rounded-lg bg-blue-700 py-3 text-sm font-extrabold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                Emitir validación
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">La validación requiere estar dentro de 500 m del incidente.</p>
            </div>
          ) : (
            <Link to="/login" className="mt-4 block rounded-lg bg-blue-700 py-3 text-center text-sm font-extrabold text-white">
              Inicia sesión para validar
            </Link>
          )}

          {mensaje && <p role="status" className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-800">{mensaje}</p>}
        </section>
      </div>
    </div>
  );
};

export default DetalleIncidente;
