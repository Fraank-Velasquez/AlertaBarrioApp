import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Reportar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    api.get('/public/catalogos/categorias')
      .then((res) => setCategorias(res.data))
      .catch(() => setMensaje('No se pudieron cargar los tipos de incidente. Intenta nuevamente.'));

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => setMensaje('Activa el permiso de ubicación para poder reportar un incidente.'),
      { timeout: 10000 }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      await api.post('/incidentes', {
        categoriaId,
        descripcion,
        latitud: lat,
        longitud: lng,
        fotoEvidenciaUrl: null,
      });
      setMensaje('Incidente reportado correctamente');
      setTimeout(() => navigate('/mapa'), 1500);
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al reportar');
    }
  };

  if (!user) return <div className="p-4">Debes iniciar sesión para reportar</div>;

  return (
    <div className="min-h-full bg-[#f5f7fa] px-4 pb-8 pt-5">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex gap-2" aria-label={`Paso ${paso} de 2`}>
          <span className={`h-2 flex-1 rounded-full ${paso === 1 ? 'bg-blue-700' : 'bg-slate-200'}`} />
          <span className={`h-2 flex-1 rounded-full ${paso === 2 ? 'bg-blue-700' : 'bg-slate-200'}`} />
        </div>

        <h1 className="mb-6 text-2xl font-extrabold leading-tight tracking-tight text-slate-900">
          {paso === 1 ? 'Selecciona el tipo de incidencia' : 'Completa los detalles de la incidencia'}
        </h1>

        {mensaje && (
          <p role="status" className={`mb-4 rounded-xl border px-4 py-3 text-sm ${mensaje.includes('correctamente') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            {mensaje}
          </p>
        )}

        {paso === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {categorias.map((categoria) => {
                const activa = String(categoriaId) === String(categoria.idCategoria);
                const nombre = categoria.nombre || 'Incidente';
                const icono = nombre.toLowerCase().includes('inund') ? '◉'
                  : nombre.toLowerCase().includes('daño') || nombre.toLowerCase().includes('estruct') ? '▣'
                    : nombre.toLowerCase().includes('vía') || nombre.toLowerCase().includes('calle') ? '◩'
                      : nombre.toLowerCase().includes('poste') || nombre.toLowerCase().includes('cable') ? 'ϟ'
                        : nombre.toLowerCase().includes('incend') ? '♨' : '✳';

                return (
                  <button
                    type="button"
                    key={categoria.idCategoria}
                    onClick={() => setCategoriaId(String(categoria.idCategoria))}
                    aria-pressed={activa}
                    className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition ${
                      activa ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-3xl font-bold text-blue-700" aria-hidden="true">{icono}</span>
                    <span className="text-sm font-bold leading-5">{nombre}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setPaso(2)} disabled={!categoriaId} className="mt-8 w-full rounded-full bg-blue-700 py-4 text-base font-extrabold uppercase text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              Continuar
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rounded-xl border-2 border-slate-300 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-2xl text-blue-700" aria-hidden="true">⌖</span>
                <div>
                  <p className="font-bold text-slate-900">Ubicación actual</p>
                  <p className="mt-1 text-xs font-semibold text-blue-700">
                    {lat && lng
                      ? `GPS activo · ${lat.toFixed(5)}, ${lng.toFixed(5)}`
                      : !navigator.geolocation
                        ? 'Este navegador no permite obtener tu ubicación.'
                        : 'Esperando permiso de ubicación…'}
                  </p>
                </div>
              </div>
            </div>

            <label className="mt-5 block text-sm font-bold text-slate-800">
              Detalles adicionales del incidente
              <textarea
                className="mt-2 min-h-32 w-full resize-y rounded-lg border-2 border-slate-300 bg-white p-3 text-base font-normal text-slate-800 outline-none placeholder:text-slate-500 focus:border-blue-600"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente la situación observada…"
              />
            </label>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setPaso(1)} className="rounded-full border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700">
                Atrás
              </button>
              <button type="submit" disabled={!lat || !lng} className="rounded-full bg-blue-700 py-3 text-sm font-extrabold uppercase text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                Publicar alerta
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 border-t border-slate-300 pt-5 text-center">
          <Link to="/feed" className="block rounded-full bg-red-600 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-red-700">
            Ver alertas en vivo
          </Link>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            La ayuda comunitaria es complementaria y no reemplaza llamadas a emergencias
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reportar;
