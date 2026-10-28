import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pestana, setPestana] = useState('reportes');
  const [notificaciones, setNotificaciones] = useState(true);
  const [avisosVecinos, setAvisosVecinos] = useState(true);

  const perfil = useMemo(() => {
    const nombre = [user?.nombres, user?.apellidos].filter(Boolean).join(' ') || 'Vecino';
    return {
      nombre,
      iniciales: nombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase(),
      sector: user?.sectorResidencia || 'Zona no registrada',
      avatar: user?.fotoAvatarUrl || null,
      seguidores: user?.seguidores,
      siguiendo: user?.siguiendo,
      nivel: user?.nivelReputacion,
      confiabilidad: user?.porcentajeConfiabilidad,
      reportes: user?.cantReportesCreados,
      validaciones: user?.cantValidacionesEmitidas,
      reportesRecientes: user?.reportesRecientes || [],
      validacionesRecientes: user?.validacionesRecientes || [],
      vecinosSeguidos: user?.vecinosSeguidos || [],
    };
  }, [user]);

  const cerrarSesion = () => {
    logout();
    navigate('/login');
  };

  const valor = (dato) => dato === undefined || dato === null ? '—' : dato;
  const elementos = pestana === 'reportes'
    ? perfil.reportesRecientes
    : pestana === 'validaciones' ? perfil.validacionesRecientes : perfil.vecinosSeguidos;

  return (
    <div className="min-h-full bg-[#f5f7fa] px-4 py-6">
      <div className="mx-auto max-w-lg space-y-4">
        <section className="rounded-2xl bg-white p-5 text-center shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          {perfil.avatar ? (
            <img src={perfil.avatar} alt={`Foto de ${perfil.nombre}`} className="mx-auto h-20 w-20 rounded-full border-4 border-blue-50 object-cover" />
          ) : (
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-blue-50 bg-blue-100 text-2xl font-extrabold text-blue-800">
              {perfil.iniciales}
            </span>
          )}
          <h1 className="mt-3 text-lg font-bold text-slate-900">{perfil.nombre}</h1>
          <p className="mt-1 text-sm text-slate-600">⌖ {perfil.sector}</p>
          <div className="mt-2 flex justify-center gap-4 text-sm font-bold text-slate-700">
            <span>{valor(perfil.seguidores)} Seguidores</span>
            <span aria-hidden="true">•</span>
            <span>{valor(perfil.siguiendo)} Siguiendo</span>
          </div>
          <button type="button" className="mt-4 w-full rounded-full border border-slate-500 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50">
            Editar Perfil
          </button>
        </section>

        <section className="rounded-2xl border-l-4 border-blue-700 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold text-slate-900">Nivel {valor(perfil.nivel)}</p>
              <p className="text-sm text-slate-600">Confiabilidad Comunitaria</p>
            </div>
            <span className="text-2xl text-blue-700" aria-hidden="true">⬟</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-700" style={{ width: `${Math.min(100, Number(perfil.confiabilidad) || 0)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {perfil.confiabilidad === undefined ? 'La reputación estará disponible cuando el backend exponga el resumen del usuario.' : `${perfil.confiabilidad}% de confiabilidad`}
          </p>
        </section>

        <div className="flex rounded-lg bg-[#dfe2e5] p-1" role="tablist" aria-label="Actividad del usuario">
          {[
            ['reportes', `Mis Reportes (${valor(perfil.reportes)})`],
            ['validaciones', `Validaciones (${valor(perfil.validaciones)})`],
            ['vecinos', 'Vecinos Seguidos'],
          ].map(([id, label]) => (
            <button type="button" role="tab" aria-selected={pestana === id} key={id} onClick={() => setPestana(id)} className={`flex-1 rounded-md px-2 py-3 text-xs font-bold ${pestana === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>

        <section className="space-y-2">
          {elementos.length === 0 ? (
            <div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
              {pestana === 'reportes' && perfil.reportes === undefined && 'Tus reportes aparecerán aquí cuando el backend exponga el historial de incidentes del usuario.'}
              {pestana === 'validaciones' && perfil.validaciones === undefined && 'Tus validaciones aparecerán aquí cuando el backend exponga tu actividad.'}
              {pestana === 'vecinos' && 'No hay vecinos seguidos disponibles todavía.'}
            </div>
          ) : elementos.map((item) => (
            <article key={item.id || item.incidenteId} className="rounded-2xl border-l-4 border-amber-500 bg-white p-4 shadow-sm">
              <p className="font-bold text-slate-800">{item.titulo || item.categoriaNombre || 'Actividad comunitaria'}</p>
              {item.estadoNombre && <p className="mt-1 text-sm text-slate-600">{item.estadoNombre}</p>}
              {item.fecha && <p className="mt-1 text-sm text-slate-500">{item.fecha}</p>}
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Ajustes de red</h2>
          <div className="flex items-center justify-between border-b border-slate-100 py-4">
            <div><p className="text-base text-slate-800">Mi Zona de Cobertura</p><p className="text-sm text-slate-600">{perfil.sector} <span>(Radio configurable)</span></p></div>
            <button type="button" className="text-xs font-extrabold text-blue-700">EDITAR</button>
          </div>
          <label className="flex items-center justify-between border-b border-slate-100 py-4 text-base text-slate-800">
            Notificaciones de Alertas
            <input type="checkbox" checked={notificaciones} onChange={(event) => setNotificaciones(event.target.checked)} className="h-5 w-10 cursor-pointer accent-blue-700" />
          </label>
          <label className="flex items-center justify-between py-4 text-base text-slate-800">
            Avisos de Vecinos que Sigo
            <input type="checkbox" checked={avisosVecinos} onChange={(event) => setAvisosVecinos(event.target.checked)} className="h-5 w-10 cursor-pointer accent-blue-700" />
          </label>
          <p className="text-xs text-slate-500">Las preferencias se guardarán cuando el backend exponga la actualización de preferencias.</p>
        </section>

        <hr className="border-slate-300" />

        <section className="rounded-2xl bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Legal y transparencia</h2>
          {['Términos y Condiciones de Uso', 'Política de Privacidad y Datos Personales', 'Política de Cookies y Almacenamiento'].map((item) => (
            <button type="button" key={item} className="flex w-full items-center justify-between border-b border-slate-100 py-4 text-left text-base text-slate-800 last:border-0">
              <span>{item}</span><span className="text-xl text-slate-500" aria-hidden="true">›</span>
            </button>
          ))}
        </section>

        <button type="button" onClick={cerrarSesion} className="w-full py-4 text-sm font-semibold text-red-600">Cerrar sesión</button>
      </div>
    </div>
  );
};

export default Perfil;
