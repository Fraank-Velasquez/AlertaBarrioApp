import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
const Reportar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [precision, setPrecision] = useState(null);
  const [direccion, setDireccion] = useState(null);
  const [cargandoDireccion, setCargandoDireccion] = useState(false);
  const [foto, setFoto] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
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
        setPrecision(pos.coords.accuracy);
      },
      () => setMensaje('Activa el permiso de ubicación para poder reportar un incidente.'),
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (lat === null || lng === null) return undefined;

    const controller = new AbortController();
    setCargandoDireccion(true);
    setDireccion(null);

    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lng),
      zoom: '18',
      addressdetails: '1',
      'accept-language': 'es',
    });

    fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo resolver la dirección');
        return response.json();
      })
      .then((data) => {
        const address = data.address || {};
        const calle = [address.road, address.house_number].filter(Boolean).join(' ');
        const distrito = address.city_district
          || address.municipality
          || address.county
          || address.suburb
          || address.town
          || address.city;

        if (!calle && !distrito) throw new Error('La ubicación no tiene una dirección legible');
        setDireccion({ calle: calle || 'Ubicación sin calle identificada', distrito: distrito || 'Distrito no identificado' });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setDireccion({
            calle: `Coordenadas ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            distrito: 'Dirección no disponible',
          });
        }
      })
      .finally(() => setCargandoDireccion(false));

    return () => controller.abort();
  }, [lat, lng]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEnviando(true);
    try {
      const datos = {
        categoriaId,
        descripcion,
        latitud: lat,
        longitud: lng,
      };
      const formulario = new FormData();
      formulario.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
      formulario.append('foto', foto);
      const res = await api.post('/incidentes', formulario);
      navigate('/feed', {
        state: {
          toast: res.data.duplicado
            ? 'El incidente de este tipo ya se encuentra registrado en esta ubicación.'
            : 'Incidente registrado correctamente.',
        },
      });
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al reportar');
      setEnviando(false);
    }
  };

  if (!user) return <div className="p-4">Debes iniciar sesión para reportar</div>;

  const CameraIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h3l1.5-2h7L17 7h3v12H4V7Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );

  const LocationIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );

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
                const icono = nombre.toLowerCase().includes('inund') ? <Icon icon="entypo:water"
                  width="25"
                  height="25"
                  color='#045bd6' />
                  : nombre.toLowerCase().includes('daño') || nombre.toLowerCase().includes('estruct') ? <Icon icon="carbon:earthquake"
                    width="25"
                    height="25"
                    color='#045bd6' />
                    : nombre.toLowerCase().includes('vía') || nombre.toLowerCase().includes('calle') ? <Icon icon="proicons:road-barrier"
                      width="25"
                      height="25"
                      color='#045bd6' />
                      : nombre.toLowerCase().includes('poste') || nombre.toLowerCase().includes('cable') ? <Icon icon="pinhead:utility-pole"
                        width="25"
                        height="25"
                        color='#045bd6' />
                        : nombre.toLowerCase().includes('incend') ? <Icon icon="carbon:fire"
                          width="25"
                          height="25"
                          color='#045bd6' /> : <Icon icon="carbon:warning-other"
                            width="25"
                            height="25"
                            color='#045bd6' />;

                return (
                  <button
                    type="button"
                    key={categoria.idCategoria}
                    onClick={() => setCategoriaId(String(categoria.idCategoria))}
                    aria-pressed={activa}
                    className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition ${activa ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300'
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
            <div className="rounded-lg border-2 border-[#c2c7d8] bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#2d67e8] text-white"><LocationIcon /></span>
                <div>
                  <p className="text-lg font-bold leading-7 text-slate-900">
                    {cargandoDireccion ? 'Consultando ubicación…' : direccion?.calle || 'Ubicación detectada'}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">
                    {direccion?.distrito || (lat !== null ? 'Resolviendo distrito…' : 'Esperando ubicación…')}
                  </p>
                  {precision !== null && (
                    <p className="mt-0.5 text-xs font-bold text-blue-700">⌾ Precisión {Math.round(precision)}m</p>
                  )}
                </div>
              </div>
            </div>

            <label htmlFor="foto-evidencia" className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c2c7d8] bg-white text-center text-[#4d5365] transition hover:border-blue-500">
              <CameraIcon />
              <span className="mt-2 text-base">{foto ? foto.name : 'Añadir foto ( obligatorio )'}</span>
              <input id="foto-evidencia" type="file" accept="image/*" className="sr-only" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
            </label>

            <label htmlFor="descripcion-incidente" className="mt-5 block text-base font-bold text-slate-800">
              Detalles adicionales del incidente
              <textarea
                id="descripcion-incidente"
                className="mt-2 min-h-32 w-full resize-y rounded-lg border-2 border-[#c2c7d8] bg-white p-3 text-base font-normal text-slate-800 outline-none placeholder:text-slate-500 focus:border-blue-600"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente la situación observada…"
              />
            </label>

            <button type="submit" disabled={!lat || !lng || !foto || enviando} className="mt-10 w-full rounded-full bg-blue-700 py-4 text-base font-extrabold uppercase text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {enviando ? 'Registrando…' : 'Continuar'}
            </button>
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
