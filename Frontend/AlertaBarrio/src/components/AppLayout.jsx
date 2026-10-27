import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/mapa', label: 'Mapa' },
  { to: '/feed', label: 'Alertas' },
  { to: '/reportar', label: 'Reportar' },
  { to: '/directorio', label: 'Emergencias' },
];

const BellIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21h4" />
  </svg>
);

const PersonIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuState, setMenuState] = useState({ path: location.pathname, open: false });
  const menuOpen = menuState.path === location.pathname && menuState.open;
  const isMap = location.pathname === '/mapa';

  const cerrarMenu = () => setMenuState({ path: location.pathname, open: false });

  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

  return (
    <div className={`flex flex-col ${isMap ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
      <header className="relative z-[1000] shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto hidden min-h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:flex sm:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5" aria-label="AlertaBarrio, inicio">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-lg font-black text-white">A</span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Alerta<span className="text-blue-700">Barrio</span>
            </span>
          </NavLink>

          <nav aria-label="Navegación principal" className="flex min-w-0 items-center gap-1 overflow-x-auto py-2">
            {navigation.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
            ))}
            {user?.rol === 'AUTORIDAD' && (
              <NavLink to="/admin" className={linkClass}>Autoridades</NavLink>
            )}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="max-w-32 truncate text-sm font-medium text-slate-600">
                  {user.nombres || user.correo}
                </span>
                <button onClick={cerrarSesion} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Salir
                </button>
              </>
            ) : (
              <NavLink to="/login" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">
                Iniciar sesión
              </NavLink>
            )}
          </div>
        </div>

        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center bg-blue-700 px-4 text-white sm:hidden">
          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuState({ path: location.pathname, open: !menuOpen })}
            className="justify-self-start rounded-full p-2 text-xl leading-none hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {menuOpen ? '×' : '☰'}
          </button>
          <NavLink to="/" onClick={cerrarMenu} className="text-base font-bold tracking-tight" aria-label="AlertaBarrio, inicio">
            AlertaBarrio
          </NavLink>
          <div className="flex justify-self-end">
            <NavLink to="/feed" onClick={cerrarMenu} aria-label="Ver alertas" className="rounded-full p-2 hover:bg-white/10"><BellIcon /></NavLink>
            <NavLink to={user ? '/perfil' : '/login'} onClick={cerrarMenu} aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'} className="rounded-full p-2 hover:bg-white/10"><PersonIcon /></NavLink>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Navegación móvil" className="absolute inset-x-0 top-full z-[1100] border-b border-slate-200 bg-white p-3 shadow-lg sm:hidden">
            {[...navigation, ...(user?.rol === 'AUTORIDAD' ? [{ to: '/admin', label: 'Autoridades' }] : [])].map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={cerrarMenu} className={({ isActive }) => `block rounded-lg px-4 py-3 text-sm font-semibold ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                {label}
              </NavLink>
            ))}
            {user && (
              <button onClick={cerrarSesion} className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                Cerrar sesión
              </button>
            )}
          </nav>
        )}
      </header>

      <main className={`min-h-0 flex-1 ${isMap ? 'overflow-hidden' : 'pb-20 sm:pb-0'}`}>
        <Outlet />
      </main>

      <nav aria-label="Navegación móvil inferior" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[1000] grid h-[68px] grid-cols-5 items-center border-t border-slate-100 bg-white px-2 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] sm:hidden">
        <NavLink to="/feed" className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <span aria-hidden="true">◔</span><span>Feed</span>
        </NavLink>
        <NavLink to="/mapa" className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <span aria-hidden="true">⌖</span><span>Maps</span>
        </NavLink>
        <NavLink to="/reportar" aria-label="Reportar una alerta" className="mobile-create-button">
          <span aria-hidden="true">＋</span>
        </NavLink>
        <NavLink to="/directorio" className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <span className="text-[11px] font-black tracking-widest" aria-hidden="true">SOS</span><span>Emergencias</span>
        </NavLink>
        <NavLink to={user ? '/perfil' : '/login'} className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <PersonIcon /><span>Perfil</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AppLayout;
