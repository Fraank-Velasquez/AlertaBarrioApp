import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';

const AccesoDenegado = () => {
  const { user } = useAuth();

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_10px_40px_rgba(15,23,42,0.10)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600">
          <Icon icon="material-symbols-light:shield-lock-outline" width="38" height="38" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Esta sección está restringida únicamente a autoridades locales.
          {user ? ' Tu cuenta no tiene los permisos necesarios.' : ' Inicia sesión con una cuenta de autoridad para continuar.'}
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link to="/mapa" className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800">
            Volver al mapa
          </Link>
          {user ? (
            <Link to="/feed" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              Ver alertas
            </Link>
          ) : (
            <Link to="/login" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              Iniciar sesión
            </Link>
          )}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Código de error: 403
        </p>
      </div>
    </div>
  );
};

export default AccesoDenegado;
