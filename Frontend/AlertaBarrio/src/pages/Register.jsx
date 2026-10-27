import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombres: '', apellidos: '', correo: '', contrasena: '', sectorResidencia: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/mapa');
    } catch (err) {
      setError('Error al registrar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Registro - AlertaBarrio</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <input className="w-full border p-2 mb-2" name="nombres" placeholder="Nombres" onChange={handleChange} />
        <input className="w-full border p-2 mb-2" name="apellidos" placeholder="Apellidos" onChange={handleChange} />
        <input className="w-full border p-2 mb-2" name="correo" placeholder="Correo" onChange={handleChange} />
        <input className="w-full border p-2 mb-2" name="contrasena" type="password" placeholder="Contraseña" onChange={handleChange} />
        <input className="w-full border p-2 mb-4" name="sectorResidencia" placeholder="Sector de residencia" onChange={handleChange} />
        <button className="w-full bg-green-600 text-white p-2 rounded">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;
