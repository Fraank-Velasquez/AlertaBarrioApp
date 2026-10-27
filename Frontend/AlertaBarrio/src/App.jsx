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
import Onboarding from './pages/Onboarding';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const onboardingDone = localStorage.getItem('onboarding') === 'done';
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/reportar" element={<PrivateRoute><Reportar /></PrivateRoute>} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/incidente/:id" element={<DetalleIncidente />} />
      <Route path="/directorio" element={<Directorio />} />
      <Route path="/admin" element={<DashboardAutoridad />} />
      <Route path="/" element={<Navigate to={onboardingDone ? '/mapa' : '/onboarding'} />} />
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
