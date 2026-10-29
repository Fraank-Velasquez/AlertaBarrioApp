import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { DISTRITOS_PIURA } from '../constants/distritosPiura';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombres: '', apellidos: '', correo: '', contrasena: '', sectorResidencia: '' });
  const [error, setError] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear la cuenta. Verifica que el servidor esté disponible.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f5f7fa]">
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center bg-blue-700 px-4 text-white shadow-sm">
        <button type="button" onClick={() => navigate('/login')} aria-label="Volver a iniciar sesión" className="justify-self-start p-2 text-2xl leading-none">‹</button>
        <h1 className="text-base font-bold">Registro de Vecino</h1>
        <span className="justify-self-end p-2" aria-hidden="true"> </span>
      </header>

      <div className="mx-auto max-w-md px-4 pb-8 pt-6 sm:pt-10">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Únete a la red de tu Barrio</h2>
          <p className="mt-2 text-base leading-6 text-slate-600">Crea tu cuenta para reportar incidentes, validar alertas y proteger tu sector.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

          <label className="block text-xs font-bold text-slate-700">
            Nombres
            <input className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600" name="nombres" autoComplete="given-name" placeholder="Ej. Carlos" value={form.nombres} onChange={handleChange} required />
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Apellidos
            <input className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600" name="apellidos" autoComplete="family-name" placeholder="Ej. Mendoza" value={form.apellidos} onChange={handleChange} required />
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Correo Electrónico
            <input className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600" name="correo" type="email" autoComplete="email" placeholder="tu.correo@ejemplo.com" value={form.correo} onChange={handleChange} required />
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Distrito de residencia
            <select className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none focus:border-blue-600" name="sectorResidencia" autoComplete="address-level3" value={form.sectorResidencia} onChange={handleChange} required>
              <option value="" disabled>Indique su distrito de residencia</option>
              {DISTRITOS_PIURA.map((distrito) => <option key={distrito} value={distrito}>{distrito}</option>)}
            </select>
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Contraseña
            <span className="mt-1 flex h-12 items-center rounded-lg border border-slate-300 bg-white px-3 focus-within:border-blue-600">
              <input className="min-w-0 flex-1 bg-transparent text-base font-normal text-slate-900 outline-none placeholder:text-slate-400" name="contrasena" type={mostrarContrasena ? 'text' : 'password'} autoComplete="new-password" placeholder="Mínimo 8 caracteres" minLength={8} value={form.contrasena} onChange={handleChange} required />
              <button type="button" onClick={() => setMostrarContrasena((mostrar) => !mostrar)} aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="px-1 text-lg text-slate-500">
                {mostrarContrasena ? '◉' : '◎'}
              </button>
            </span>
          </label>

          <button type="submit" className="w-full rounded-lg bg-blue-700 py-3.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm transition hover:bg-blue-800">
            Crear Cuenta
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta? <Link to="/login" className="font-semibold text-blue-700 hover:underline">Inicia Sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
