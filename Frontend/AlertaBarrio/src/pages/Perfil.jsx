import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nombre = [user?.nombres, user?.apellidos].filter(Boolean).join(' ') || 'Vecino';
  const iniciales = nombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

  const cerrarSesion = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-full bg-[#f5f7fa] px-4 py-6">
      <div className="mx-auto max-w-lg space-y-4">
        <section className="rounded-2xl bg-white p-5 text-center shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-blue-50 bg-blue-100 text-2xl font-extrabold text-blue-800">
            {iniciales}
          </span>
          <h1 className="mt-3 text-lg font-bold text-slate-900">{nombre}</h1>
          {user?.sectorResidencia && <p className="mt-1 text-sm text-slate-600">⌖ {user.sectorResidencia}</p>}
          <p className="mt-1 text-sm text-slate-600">{user?.correo}</p>
        </section>

        <section className="rounded-2xl border-l-4 border-blue-700 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cuenta vecinal</p>
          <p className="mt-2 text-base font-bold text-slate-900">{user?.rol === 'AUTORIDAD' ? 'Cuenta de autoridad' : 'Miembro de AlertaBarrio'}</p>
          <p className="mt-1 text-sm text-slate-600">Participa reportando y validando alertas de tu comunidad.</p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.07)]">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Accesos rápidos</h2>
          <div className="mt-3 divide-y divide-slate-100">
            <button type="button" onClick={() => navigate('/feed')} className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-slate-800">
              Mis alertas comunitarias <span className="text-lg text-slate-400" aria-hidden="true">›</span>
            </button>
            <button type="button" onClick={() => navigate('/directorio')} className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-slate-800">
              Emergencias y contactos <span className="text-lg text-slate-400" aria-hidden="true">›</span>
            </button>
          </div>
        </section>

        <button type="button" onClick={cerrarSesion} className="w-full py-4 text-sm font-semibold text-red-600">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Perfil;
