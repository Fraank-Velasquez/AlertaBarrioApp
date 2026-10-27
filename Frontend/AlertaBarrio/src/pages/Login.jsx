import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(correo, contrasena);
      navigate('/mapa');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Iniciar sesión - AlertaBarrio</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <input className="w-full border p-2 mb-2" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <input className="w-full border p-2 mb-4" type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
