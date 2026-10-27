import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Mapa from './pages/Mapa';
import Reportar from './pages/Reportar';
import Feed from './pages/Feed';
import DetalleIncidente from './pages/DetalleIncidente';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/reportar" element={<PrivateRoute><Reportar /></PrivateRoute>} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/incidente/:id" element={<DetalleIncidente />} />
      <Route path="/" element={<Navigate to="/mapa" />} />
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
