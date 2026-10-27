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
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil';
import AppLayout from './components/AppLayout';
import Onboarding from './pages/Onboarding';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Inicio />} />
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
