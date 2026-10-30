import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRequiredModal from './AuthRequiredModal';

const navigation = [
  { to: '/mapa', label: 'Mapa' },
  { to: '/feed', label: 'Alertas' },
  { to: '/reportar', label: 'Reportar' },
  { to: '/directorio', label: 'Emergencias' },
];

const BellIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21h4" />
  </svg>
);

const PersonIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const MenuIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[23px] w-[23px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

const RssIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" fill="currentColor" />
  </svg>
);

const MapIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);

const SirenIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18v-5a5 5 0 0 1 10 0v5" />
    <rect x="4" y="18" width="16" height="3" rx="1.5" />
    <path d="M12 4V2M4.9 6.9 3.5 5.5M19.1 6.9l1.4-1.4" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[23px] w-[23px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuState, setMenuState] = useState({ path: location.pathname, open: false });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const menuOpen = menuState.path === location.pathname && menuState.open;
  const isMap = location.pathname === '/mapa';
  const isReport = location.pathname === '/reportar';

  const cerrarMenu = () => setMenuState({ path: location.pathname, open: false });

  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className={`flex flex-col ${isMap ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
      {isMap ? (
        <header className="relative z-[1000] shrink-0 border-b border-[#D9DDE5] bg-[#F8F9FB]">
          <div className="mx-auto grid h-14 w-full max-w-[600px] grid-cols-[1fr_auto_1fr] items-center px-[18px]">
            <button
              type="button"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              onClick={() => setMenuState({ path: location.pathname, open: !menuOpen })}
              className="justify-self-start rounded-full p-1 text-[#555B66] hover:bg-black/5"
            >
              <MenuIcon />
            </button>
            <NavLink to="/" onClick={cerrarMenu} className="text-[20px] font-bold tracking-[-0.5px] text-[#0756C9]" aria-label="AlertaBarrio, inicio">
              AlertaBarrio
            </NavLink>
            <div className="flex items-center justify-self-end gap-[17px]">
              <NavLink to="/feed" onClick={cerrarMenu} aria-label="Ver alertas" className="text-[#424754] hover:opacity-70">
                <BellIcon />
              </NavLink>
              <NavLink to={user ? '/perfil' : '/login'} onClick={cerrarMenu} aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'} className="grid h-[33px] w-[33px] place-items-center rounded-full bg-[#DCE8FC] text-[#45566F] hover:bg-[#cfe0fb]">
                <PersonIcon />
              </NavLink>
            </div>
          </div>
          {menuOpen && (
            <nav aria-label="Navegación móvil" className="absolute inset-x-0 top-full z-[1100] border-b border-slate-200 bg-white p-3 shadow-lg">
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
      ) : (
        <header className="relative z-[1000] shrink-0 border-b border-slate-200 bg-white">
          <div className="mx-auto hidden min-h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:flex sm:px-6">
            <NavLink to="/" className="flex shrink-0 items-center gap-2.5" aria-label="AlertaBarrio, inicio">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-lg font-black text-white"></span>
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
              aria-label={isReport ? 'Volver' : (menuOpen ? 'Cerrar menú' : 'Abrir menú')}
              aria-expanded={isReport ? undefined : menuOpen}
              onClick={isReport ? () => navigate('/mapa') : () => setMenuState({ path: location.pathname, open: !menuOpen })}
              className="justify-self-start rounded-full p-2 text-xl leading-none hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {isReport ? '←' : (menuOpen ? '×' : '☰')}
            </button>
            <NavLink to="/" onClick={cerrarMenu} className="text-base font-bold tracking-tight" aria-label="AlertaBarrio, inicio">
              AlertaBarrio
            </NavLink>
            <div className="flex justify-self-end">
              <NavLink to="/feed" onClick={cerrarMenu} aria-label="Ver alertas" className="rounded-full p-2 hover:bg-white/10"><BellIcon /></NavLink>
              {!isReport && <NavLink to={user ? '/perfil' : '/login'} onClick={cerrarMenu} aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'} className="rounded-full p-2 hover:bg-white/10"><PersonIcon /></NavLink>}
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
      )}

      <main className={`min-h-0 flex-1 ${isMap ? 'overflow-hidden' : isReport ? 'pb-0 sm:pb-0' : 'pb-20 sm:pb-0'}`}>
        <Outlet />
      </main>

      {!isReport && <nav aria-label="Navegación móvil inferior" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[1000] grid grid-cols-5 items-center border-t border-[#E4E6EB] bg-white px-2 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] sm:hidden">
        <NavLink to="/feed" className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <RssIcon /><span>Feed</span>
        </NavLink>
        <NavLink to="/mapa" className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <MapIcon /><span>Maps</span>
        </NavLink>
        <NavLink
          to="/reportar"
          aria-label="Reportar una alerta"
          className="mobile-create-button"
          onClick={(event) => {
            if (!user) {
              event.preventDefault();
              setAuthModalOpen(true);
            }
          }}
        >
          <PlusCircleIcon />
        </NavLink>
        <NavLink to="/directorio" className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <SirenIcon /><span className="text-center leading-tight">emergencias</span>
        </NavLink>
        <NavLink to={user ? '/perfil' : '/login'} className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}>
          <PersonIcon /><span>Perfil</span>
        </NavLink>
      </nav>}

      <AuthRequiredModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default AppLayout;
