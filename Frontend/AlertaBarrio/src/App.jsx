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

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
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
      <Route path="/" element={<Start />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppLayout />}>
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/reportar" element={<PrivateRoute><Reportar /></PrivateRoute>} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/incidente/:id" element={<DetalleIncidente />} />
        <Route path="/directorio" element={<Directorio />} />
        <Route path="/admin" element={<DashboardAutoridad />} />
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
