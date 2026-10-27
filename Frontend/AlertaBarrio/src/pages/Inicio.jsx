import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PIURA = { latitud: -5.19449, longitud: -80.63282 };

const features = [
  {
    icon: '⌖',
    title: 'Mapa de alertas',
    description: 'Ubica incidentes reportados cerca de ti y revisa su estado.',
    to: '/mapa',
    action: 'Explorar mapa',
    color: 'bg-blue-50 text-blue-800',
  },
  {
    icon: '◉',
    title: 'Feed comunitario',
    description: 'Entérate de lo que sucede en tu zona y valida alertas.',
    to: '/feed',
    action: 'Ver alertas',
    color: 'bg-amber-50 text-amber-800',
  },
  {
    icon: '＋',
    title: 'Reportar incidente',
    description: 'Comparte una situación para que tu comunidad esté informada.',
    to: '/reportar',
    action: 'Crear reporte',
    color: 'bg-rose-50 text-rose-800',
  },
  {
    icon: '☎',
    title: 'Directorio de emergencias',
    description: 'Encuentra teléfonos de ayuda para Piura y Castilla.',
    to: '/directorio',
    action: 'Ver contactos',
    color: 'bg-sky-50 text-sky-800',
  },
];

const Inicio = () => {
  const { user } = useAuth();
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const cargarAlertas = async (latitud, longitud) => {
      try {
        const response = await api.get(
          `/incidentes/cercanos?latitud=${latitud}&longitud=${longitud}&radioMetros=5000`
        );
        if (active) setIncidentes(response.data.slice(0, 3));
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => cargarAlertas(coords.latitude, coords.longitude),
        () => cargarAlertas(PIURA.latitud, PIURA.longitud),
        { timeout: 5000 }
      );
    } else {
      cargarAlertas(PIURA.latitud, PIURA.longitud);
    }

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-white text-slate-900">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-800">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Piura más conectada y segura
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              La seguridad de tu barrio empieza con estar <span className="text-blue-700">conectados.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Monitorea, valida y reporta incidencias en tiempo real para mantener seguro tu vecindario.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/mapa" className="rounded-xl bg-blue-700 px-5 py-3 font-extrabold text-white transition hover:bg-blue-800">
                Explorar mapa <span aria-hidden="true">→</span>
              </Link>
              <Link to="/reportar" className="rounded-xl border border-blue-200 bg-white px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50">
                Reportar un incidente
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              {user ? `Hola, ${user.nombres || 'vecino'}. Tu comunidad cuenta contigo.` : 'Una comunidad informada puede cuidarse mejor.'}
            </p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-5 shadow-lg shadow-blue-900/5 backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Tu comunidad</p>
                  <h2 className="mt-1 text-2xl font-extrabold">Alerta cerca, acción a tiempo</h2>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-100 text-2xl text-blue-700">⌖</span>
              </div>
              <div className="my-6 h-px bg-blue-100" />
              <ul className="space-y-5">
                <li className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-800">1</span>
                  <div><p className="font-bold">Infórmate</p><p className="mt-0.5 text-sm text-slate-500">Mira las alertas en el mapa y el feed.</p></div>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-800">2</span>
                  <div><p className="font-bold">Comparte</p><p className="mt-0.5 text-sm text-slate-500">Reporta incidentes con tu ubicación.</p></div>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-800">3</span>
                  <div><p className="font-bold">Colabora</p><p className="mt-0.5 text-sm text-slate-500">Ayuda a validar lo que ocurre en tu zona.</p></div>
                </li>
              </ul>
              <Link to="/directorio" className="mt-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-blue-50">
                ¿Necesitas ayuda urgente? <span className="text-blue-700">Contactos de emergencia →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-blue-700">Herramientas para tu comunidad</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">¿Qué necesitas hacer?</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-600">Accede rápido a las funciones de AlertaBarrio para mantenerte informado y ayudar a tus vecinos.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.to} to={feature.to} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl font-bold ${feature.color}`}>{feature.icon}</span>
              <h3 className="mt-5 text-lg font-extrabold text-slate-900">{feature.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{feature.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-extrabold text-blue-800">
                {feature.action}<span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-blue-700">Al día en tu zona</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Alertas recientes</h2>
            </div>
            <Link to="/feed" className="text-sm font-bold text-blue-800 hover:text-blue-950">Ver todas las alertas →</Link>
          </div>

          {loading && <p className="mt-6 text-sm text-slate-500">Buscando alertas cercanas...</p>}
          {!loading && error && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              No se pudieron cargar las alertas. Comprueba que el servidor esté disponible; puedes seguir usando el mapa y el directorio.
            </div>
          )}
          {!loading && !error && incidentes.length === 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              No hay alertas cercanas por ahora. Puedes consultar el <Link to="/mapa" className="font-bold text-blue-800 underline">mapa</Link> o reportar una situación.
            </div>
          )}
          {!loading && !error && incidentes.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {incidentes.map((incidente) => (
                <Link key={incidente.incidenteId} to={`/incidente/${incidente.incidenteId}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-extrabold text-slate-900">{incidente.categoriaNombre}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">{incidente.estadoNombre}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{incidente.descripcion || 'Sin descripción adicional.'}</p>
                  <p className="mt-4 text-xs font-semibold text-slate-500">
                    Confianza: {incidente.indiceConfianzaPorcentaje}% · Validaciones: +{incidente.conteoVotosPositivos}/-{incidente.conteoVotosNegativos}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-blue-950 px-5 py-7 text-center text-sm text-blue-100">
        AlertaBarrio · Información vecinal para una comunidad más segura
      </footer>
    </div>
  );
};

export default Inicio;
