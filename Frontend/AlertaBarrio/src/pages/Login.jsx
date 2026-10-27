import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(correo, contrasena);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f5f7fa]">
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center bg-blue-700 px-4 text-white shadow-sm">
        <button type="button" onClick={() => navigate('/')} aria-label="Volver al inicio" className="justify-self-start p-2 text-2xl leading-none">‹</button>
        <h1 className="text-base font-bold">Iniciar Sesión</h1>
        <span className="justify-self-end p-2 text-lg" aria-hidden="true">♧</span>
      </header>

      <div className="mx-auto max-w-md px-4 pb-8 pt-6 sm:pt-12">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-3xl text-blue-700" aria-hidden="true">♙</span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Bienvenido de nuevo</h2>
          <p className="mt-2 text-base leading-6 text-slate-600">Ingresa tus credenciales para acceder a tus alertas y reputación vecinal.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <label className="block text-xs font-bold text-slate-700">
            Correo Electrónico
            <span className="mt-1 block rounded-lg border border-slate-300 bg-white px-3">
              <input
                className="h-12 w-full bg-transparent text-base font-normal text-slate-900 outline-none placeholder:text-slate-400"
                type="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </span>
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Contraseña
            <span className="mt-1 flex h-12 items-center rounded-lg border border-slate-300 bg-white px-3">
              <input
                className="min-w-0 flex-1 bg-transparent text-base font-normal text-slate-900 outline-none placeholder:text-slate-400"
                type={mostrarContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <button type="button" onClick={() => setMostrarContrasena((mostrar) => !mostrar)} aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="px-1 text-lg text-slate-500">
                {mostrarContrasena ? '◉' : '◎'}
              </button>
            </span>
          </label>

          <button type="submit" className="w-full rounded-lg bg-blue-700 py-3.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm transition hover:bg-blue-800">
            Iniciar Sesión
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-600">
          ¿No tienes una cuenta vecinal? <Link to="/register" className="font-semibold text-blue-700 hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
