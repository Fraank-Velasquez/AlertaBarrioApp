import { useState } from 'react';
import { Icon } from '@iconify/react';

const Directorio = () => {
  const [distrito, setDistrito] = useState('Castilla');
  const contactos = [
    {
      id: 1, entidad: 'Bomberos Piura', numero: '116', distrito: 'Piura', detalle: 'Compañía de Bomberos', color: 'bg-red-600', border: 'border-red-600',
      icon: <Icon icon="mdi:fire-hydrant"
        width="30"
        height="30"
        color='#ffffff' />
    },
    {
      id: 2, entidad: 'Policía Nacional', numero: '105', distrito: 'Piura', detalle: 'Central de Emergencias PNP', color: 'bg-slate-600', border: 'border-slate-600',
      icon: <Icon icon="material-symbols:local-police-outline"
        width="30"
        height="30"
        color='#ffffff' />
    },
    {
      id: 3, entidad: 'Serenazgo Piura', numero: '073-331-000', distrito: 'Piura', detalle: 'Unidad de Patrullaje Local', color: 'bg-amber-500', border: 'border-amber-500',
      icon: <Icon icon="material-symbols:detection-and-zone"
        width="30"
        height="30"
        color='#ffffff' />
    },
    {
      id: 4, entidad: 'SAMU', numero: '106', distrito: 'Piura', detalle: 'Ambulancias y Emergencias Médicas', color: 'bg-blue-700', border: 'border-blue-700',
      icon: <Icon icon="ic:baseline-local-hospital"
        width="30"
        height="30"
        color='#ffffff' />
    },
    {
      id: 5, entidad: 'Serenazgo Castilla', numero: '073-345-000', distrito: 'Castilla', detalle: 'Unidad de Patrullaje Local', color: 'bg-amber-500', border: 'border-amber-500',
      icon: <Icon icon="material-symbols:camera-outdoor"
        width="30"
        height="30"
        color='#ffffff' />
    },
  ];
  const filtrados = contactos.filter((contacto) => contacto.distrito === distrito);

  return (
    <div className="min-h-full bg-[#f5f7fa] px-4 pb-8 pt-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-start gap-3">
          <span className="mt-1 grid h-13 w-13 shrink-0 place-items-center rounded-full bg-red-50 text-2xl font-black text-red-600" aria-hidden="true">
            <Icon icon="streamline-cyber:contact-list-1"
              width="25"
              height="25"
              color='#2d2e30' />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-slate-900">Directorio de Emergencia</h1>
            <p className="mt-2 text-base leading-6 text-slate-600">Líneas directas y respuesta rápida - Castilla / Piura</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Selecciona tu distrito">
          {['Castilla', 'Piura'].map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setDistrito(option)}
              aria-pressed={distrito === option}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${distrito === option ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'
                }`}
            >
              {distrito === option}{option}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtrados.map((contacto) => (
            <a key={contacto.id} href={`tel:${contacto.numero.replace(/[^+\d]/g, '')}`} className={`block overflow-hidden rounded-2xl border-l-4 ${contacto.border} bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.07)] transition hover:shadow-md`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${contacto.color} text-2xl font-bold text-white`}>
                  {contacto.icon}
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">{contacto.entidad}</h2>
                  <p className="mt-1 text-sm text-slate-600">{contacto.detalle}</p>
                </div>
              </div>
              <span className={`mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full ${contacto.color} px-4 text-sm font-extrabold text-white`}>
                <Icon icon="zondicons:phone"
                  width="23"
                  height="23"
                  color='#ffffff' />{contacto.numero}
              </span>
            </a>
          ))}
        </div>

        <p className="mt-8 px-4 text-center text-sm leading-5 text-slate-500">
          Las llamadas de emergencia son gratuitas. Si puedes, proporciona tu ubicación y describe la situación.
        </p>
      </div>
    </div>
  );
};

export default Directorio;
