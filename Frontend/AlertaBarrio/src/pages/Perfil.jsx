import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import PerfilUsuarioModal from '../components/PerfilUsuarioModal';
import { DISTRITOS_PIURA } from '../constants/distritosPiura';

const emptyPreferences = {
  radioCoberturaGeografica: 1000,
  recibirAlertasGlobales: true,
  recibirAlertasVecinos: true,
};

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value))
  : 'Fecha no disponible';

const Perfil = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [pestana, setPestana] = useState('reportes');
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombres: '', apellidos: '', sectorResidencia: '', fotoAvatarUrl: '' });
  const [preferencias, setPreferencias] = useState(emptyPreferences);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busquedaVecinos, setBusquedaVecinos] = useState('');
  const [vecinoSeleccionado, setVecinoSeleccionado] = useState(null);

  const cargarPerfil = async () => {
    setCargando(true);
    setMensaje(null);
    try {
      const { data } = await api.get('/perfil');
      setPerfil(data);
      setForm({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        sectorResidencia: data.sectorResidencia || '',
        fotoAvatarUrl: data.fotoAvatarUrl || '',
      });
      setPreferencias(data.preferencias || emptyPreferences);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate('/login', { replace: true, state: { mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.' } });
        return;
      }
      const detalle = error.response?.data?.mensaje;
      setMensaje({
        tipo: 'error',
        texto: detalle || 'No se pudo cargar tu perfil. Comprueba tu conexión e inténtalo nuevamente.',
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarPerfil(); }, []);

  const nombre = perfil ? `${perfil.nombres || ''} ${perfil.apellidos || ''}`.trim() : 'Vecino';
  const iniciales = useMemo(() => nombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase(), [nombre]);
  const actividad = perfil
    ? pestana === 'reportes' ? perfil.reportesRecientes : pestana === 'validaciones' ? perfil.validacionesRecientes : perfil.vecinosSeguidos
    : [];

  const cerrarSesion = () => {
    logout();
    navigate('/login');
  };

  const guardarPerfil = async (event) => {
    event.preventDefault();
    setGuardando(true);
    try {
      const { data } = await api.patch('/perfil', form);
      setPerfil(data);
      setEditando(false);
      updateUser({ ...user, ...data });
      setMensaje({ tipo: 'ok', texto: 'Perfil actualizado correctamente.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo actualizar el perfil.' });
    } finally {
      setGuardando(false);
    }
  };

  const guardarPreferencias = async (next) => {
    setPreferencias(next);
    try {
      const { data } = await api.put('/perfil/preferencias', next);
      setPerfil(data);
      setPreferencias(data.preferencias || next);
      setMensaje({ tipo: 'ok', texto: 'Preferencias guardadas.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudieron guardar las preferencias.' });
      cargarPerfil();
    }
  };

  const dejarDeSeguir = async (usuarioId) => {
    try {
      await api.delete(`/red-vecinal/seguir/${usuarioId}`);
      setPerfil((actual) => ({
        ...actual,
        siguiendo: Math.max(0, actual.siguiendo - 1),
        vecinosSeguidos: actual.vecinosSeguidos.filter((vecino) => vecino.usuarioId !== usuarioId),
      }));
      setMensaje({ tipo: 'ok', texto: 'Dejaste de seguir al vecino.' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.response?.data?.mensaje || 'No se pudo actualizar el seguimiento.' });
    }
  };

  if (cargando) {
    return <div className="grid min-h-full place-items-center bg-[#f5f7fa] p-6 text-sm text-slate-500">Cargando perfil...</div>;
  }

  if (!perfil) {
    return (
      <div className="min-h-full bg-[#f5f7fa] p-6 text-center">
        <p className="text-sm text-red-600">{mensaje?.texto}</p>
        <button type="button" onClick={cargarPerfil} className="mt-4 rounded-full bg-blue-700 px-5 py-2 text-sm font-bold text-white">Reintentar</button>
      </div>
    );
  }

  const confianza = Math.min(100, Math.max(0, Number(perfil.porcentajeConfiabilidad) || 0));

  return (
    <div className="min-h-full bg-[#f5f7fa] px-4 py-6">
      <div className="mx-auto max-w-lg space-y-4">
        {mensaje && <div role="status" className={`rounded-xl px-4 py-3 text-sm ${mensaje.tipo === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{mensaje.texto}</div>}

        <section className="rounded-2xl bg-white p-5 text-center shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          {perfil.fotoAvatarUrl ? (
            <img src={resolveMediaUrl(perfil.fotoAvatarUrl)} alt={`Foto de ${nombre}`} className="mx-auto h-20 w-20 rounded-full border-4 border-blue-50 object-cover" />
          ) : (
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-blue-50 bg-blue-100 text-2xl font-extrabold text-blue-800">{iniciales}</span>
          )}
          {!editando ? (
            <>
              <h1 className="mt-3 text-lg font-bold text-slate-900">{nombre}</h1>
              <p className="mt-1 text-sm text-slate-600">⌖ {perfil.sectorResidencia || 'Zona no registrada'}</p>
              <p className="mt-1 text-xs text-slate-500">{perfil.correo} · Miembro desde {formatDate(perfil.fechaRegistro)}</p>
              <div className="mt-3 flex justify-center gap-4 text-sm font-bold text-slate-700">
                <span>{perfil.seguidores} Seguidores</span><span aria-hidden="true">•</span><span>{perfil.siguiendo} Siguiendo</span>
              </div>
              <button type="button" onClick={() => setEditando(true)} className="mt-4 w-full rounded-full border border-slate-500 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50">Editar perfil</button>
            </>
          ) : (
            <form onSubmit={guardarPerfil} className="mt-4 space-y-3 text-left">
              {[
                ['nombres', 'Nombres'], ['apellidos', 'Apellidos'], ['fotoAvatarUrl', 'URL de avatar'],
              ].map(([campo, label]) => (
                <label key={campo} className="block text-xs font-bold text-slate-600">
                  {label}
                  <input value={form[campo]} onChange={(event) => setForm({ ...form, [campo]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800" />
                </label>
              ))}
              <label className="block text-xs font-bold text-slate-600">
                Distrito de residencia
                <select value={form.sectorResidencia} onChange={(event) => setForm({ ...form, sectorResidencia: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800">
                  <option value="" disabled>Indique su distrito de residencia</option>
                  {form.sectorResidencia && !DISTRITOS_PIURA.includes(form.sectorResidencia) && <option value={form.sectorResidencia}>{form.sectorResidencia}</option>}
                  {DISTRITOS_PIURA.map((distrito) => <option key={distrito} value={distrito}>{distrito}</option>)}
                </select>
              </label>
              <div className="flex gap-2">
                <button disabled={guardando} className="flex-1 rounded-full bg-blue-700 py-3 text-sm font-bold text-white disabled:opacity-60">{guardando ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" onClick={() => setEditando(false)} className="flex-1 rounded-full border border-slate-400 py-3 text-sm font-bold text-slate-700">Cancelar</button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-2xl border-l-4 border-blue-700 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xl font-extrabold text-slate-900">Nivel {perfil.nivelReputacion ?? '—'}</p><p className="text-sm text-slate-600">Confiabilidad comunitaria</p></div><span className="text-2xl text-blue-700" aria-hidden="true">⬟</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-700" style={{ width: `${confianza}%` }} /></div>
          <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{confianza}% de confiabilidad</span><span>{perfil.experienciaPts ?? 0} pts de experiencia</span></div>
          <p className="mt-1 text-xs text-slate-500">Acierto en validaciones: {perfil.porcentajeAcierto ?? 0}%</p>
        </section>

        <div className="flex rounded-lg bg-[#dfe2e5] p-1" role="tablist" aria-label="Actividad del usuario">
          {[['reportes', `Mis reportes (${perfil.cantReportesCreados ?? 0})`], ['validaciones', `Validaciones (${perfil.cantValidacionesEmitidas ?? 0})`], ['vecinos', 'Vecinos seguidos']].map(([id, label]) => (
            <button type="button" role="tab" aria-selected={pestana === id} key={id} onClick={() => setPestana(id)} className={`flex-1 rounded-md px-2 py-3 text-xs font-bold ${pestana === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}>{label}</button>
          ))}
        </div>

        <section className="space-y-2">
          {actividad.length === 0 && <div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500">Todavía no hay actividad para mostrar.</div>}
          {pestana === 'reportes' && actividad.map((item) => <button type="button" onClick={() => navigate(`/incidente/${item.incidenteId}`)} key={item.incidenteId} className="block w-full rounded-2xl border-l-4 border-amber-500 bg-white p-4 text-left shadow-sm"><p className="font-bold text-slate-800">{item.categoriaNombre}</p><p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.descripcion || 'Sin descripción'}</p><p className="mt-1 text-xs text-slate-500">{item.estadoNombre} · {formatDate(item.fechaHoraReporte)}</p></button>)}
          {pestana === 'validaciones' && actividad.map((item) => <button type="button" onClick={() => navigate(`/incidente/${item.incidenteId}`)} key={item.validacionId} className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm"><p className="font-bold text-slate-800">{item.tipoVoto}</p><p className="mt-1 text-xs text-slate-500">{formatDate(item.fechaHoraEmision)}</p></button>)}
          {pestana === 'vecinos' && (
            <div className="space-y-3">
              <label className="relative block">
                <span className="sr-only">Buscar vecinos seguidos</span>
                <input value={busquedaVecinos} onChange={(event) => setBusquedaVecinos(event.target.value)} placeholder="Buscar entre tus vecinos seguidos..." className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-600" />
              </label>
              {actividad
                .filter((item) => item.nombre?.toLowerCase().includes(busquedaVecinos.toLowerCase()))
                .map((item) => (
                  <article key={item.usuarioId} className="rounded-2xl border-l-4 border-blue-600 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {item.fotoAvatarUrl
                        ? <img src={resolveMediaUrl(item.fotoAvatarUrl)} alt="" className="h-11 w-11 rounded-full object-cover" />
                        : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-100 font-bold text-blue-800">{item.nombre?.slice(0, 2).toUpperCase()}</span>}
                      <button type="button" onClick={() => setVecinoSeleccionado(item.usuarioId)} className="min-w-0 flex-1 text-left">
                        <p className="truncate font-bold text-slate-800">{item.nombre}</p>
                        <p className="truncate text-xs text-slate-500">{item.sectorResidencia || 'Zona no registrada'}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Nivel {item.nivelReputacion ?? '—'} · {item.cantReportesCreados ?? 0} reportes · {item.cantValidacionesEmitidas ?? 0} validaciones
                        </p>
                      </button>
                    </div>
                    <button type="button" onClick={() => dejarDeSeguir(item.usuarioId)} className="mt-3 w-full rounded-lg border border-slate-300 bg-slate-100 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-200">Siguiendo ✓</button>
                  </article>
                ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Ajustes de red</h2>
          <label className="flex items-center justify-between border-b border-slate-100 py-4 text-base text-slate-800">Notificaciones de alertas<input type="checkbox" checked={preferencias.recibirAlertasGlobales} onChange={(event) => guardarPreferencias({ ...preferencias, recibirAlertasGlobales: event.target.checked })} className="h-5 w-10 accent-blue-700" /></label>
          <label className="flex items-center justify-between py-4 text-base text-slate-800">Avisos de vecinos que sigo<input type="checkbox" checked={preferencias.recibirAlertasVecinos} onChange={(event) => guardarPreferencias({ ...preferencias, recibirAlertasVecinos: event.target.checked })} className="h-5 w-10 accent-blue-700" /></label>
        </section>

        <button type="button" onClick={cerrarSesion} className="w-full py-4 text-sm font-semibold text-red-600">Cerrar sesión</button>
      </div>
      {vecinoSeleccionado && <PerfilUsuarioModal usuarioId={vecinoSeleccionado} onClose={() => setVecinoSeleccionado(null)} />}
    </div>
  );
};

export default Perfil;
