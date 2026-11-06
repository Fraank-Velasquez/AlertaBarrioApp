import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Mapa from './pages/Mapa';
import Reportar from './pages/Reportar';
import Feed from './pages/Feed';
import DetalleIncidente from './pages/DetalleIncidente';
import DashboardAutoridad from './pages/DashboardAutoridad';
import Directorio from './pages/Directorio';
import Perfil from './pages/Perfil';
import AppLayout from './components/AppLayout';
import Onboarding from './pages/Onboarding';
import AccesoDenegado from './pages/AccesoDenegado';
import { esRolAutoridad } from './utils/roles';

const Cargando = ({ texto = 'Cargando...' }) => (
  <div className="grid min-h-[100dvh] place-items-center bg-slate-100 text-sm font-semibold text-slate-500">{texto}</div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Cargando />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthorityRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Cargando texto="Cargando panel..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!esRolAutoridad(user.rol)) return <AccesoDenegado />;
  return children;
};

const CitizenOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Cargando />;
  if (user && esRolAutoridad(user.rol)) return <Navigate to="/admin" replace />;
  return children;
};

const Start = () => {
  const [destino, setDestino] = useState(null);

  useEffect(() => {
    let active = true;
    const irAOnboarding = () => {
      if (active) setDestino('/onboarding');
    };

    if (!navigator.geolocation) {
      irAOnboarding();
      return () => { active = false; };
    }

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          if (active) setDestino(status.state === 'granted' ? '/mapa' : '/onboarding');
        })
        .catch(irAOnboarding);
    } else {
      irAOnboarding();
    }

    return () => { active = false; };
  }, []);

  if (!destino) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-white text-sm text-slate-500">
        Cargando...
      </div>
    );
  }

  return <Navigate to={destino} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CitizenOnlyRoute><Start /></CitizenOnlyRoute>} />
      <Route path="/onboarding" element={<CitizenOnlyRoute><Onboarding /></CitizenOnlyRoute>} />
      <Route path="/login" element={<CitizenOnlyRoute><Login /></CitizenOnlyRoute>} />
      <Route path="/register" element={<CitizenOnlyRoute><Register /></CitizenOnlyRoute>} />
      <Route path="/acceso-denegado" element={<AccesoDenegado />} />
      <Route path="/admin" element={<AuthorityRoute><DashboardAutoridad /></AuthorityRoute>} />
      <Route element={<CitizenOnlyRoute><AppLayout /></CitizenOnlyRoute>}>
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/reportar" element={<PrivateRoute><Reportar /></PrivateRoute>} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/incidente/:id" element={<DetalleIncidente />} />
        <Route path="/directorio" element={<Directorio />} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
