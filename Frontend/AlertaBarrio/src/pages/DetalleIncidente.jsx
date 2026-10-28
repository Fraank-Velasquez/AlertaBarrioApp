import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../utils/media';

const DetalleIncidente = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [incidente, setIncidente] = useState(null);
  const [tipoVotos, setTipoVotos] = useState([]);
  const [tipoVotoId, setTipoVotoId] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api.get(`/incidentes/${id}`).then((res) => setIncidente(res.data));
    api.get('/public/catalogos/tipos-voto').then((res) => setTipoVotos(res.data));
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  }, [id]);

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
      api.get(`/incidentes/${id}`).then((res) => setIncidente(res.data));
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al votar');
    }
  };

  if (!incidente) return <div className="mx-auto max-w-lg p-6 text-sm font-medium text-slate-500">Cargando alerta…</div>;

  const confianza = Math.min(100, Math.max(0, Number(incidente.indiceConfianzaPorcentaje) || 0));

  return (
    <div className="min-h-full bg-[#f5f7fa] px-4 py-5">
      <div className="mx-auto max-w-lg space-y-4">
        <section className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
          <span className="text-3xl" aria-hidden="true">⚠</span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold uppercase leading-tight">Incidente reportado</p>
            <h1 className="mt-1 text-sm font-semibold">{incidente.categoriaNombre}</h1>
          </div>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase">{incidente.estadoNombre}</span>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-extrabold text-slate-900">Estado de la alerta</h2>
            <span className="text-xl font-extrabold text-emerald-600">{confianza}%</span>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-200" aria-label={`${confianza}% de confianza`}>
            <span className="h-full bg-emerald-500" style={{ width: `${confianza}%` }} />
            <span className="h-full flex-1 bg-red-500" />
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
          <h2 className="font-extrabold text-slate-900">¿Qué ocurre en tu zona?</h2>
          <p className="mt-1 text-sm text-slate-600">Tu confirmación ayuda a mantener informada a la comunidad.</p>

          {user ? (
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
