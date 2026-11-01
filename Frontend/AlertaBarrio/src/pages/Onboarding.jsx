import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Onboarding = () => {
  const navigate = useNavigate();

  const activarUbicacion = () => {
    localStorage.setItem('onboarding', 'done');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => navigate('/mapa'),
        () => navigate('/mapa')
      );
    } else {
      navigate('/mapa');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7FB', fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <header className="h-14 flex items-center justify-center" style={{ backgroundColor: '#004BC7' }}>
        <h1 className="text-xl font-extrabold tracking-tight text-white flex gap-1" style={{ letterSpacing: '-0.5px' }}>
          <Icon icon="material-symbols-light:motion-sensor-alert"
            width="30"
            height="30"
            color='#fefeff' /> AlertaBarrio
        </h1>
      </header>
      <div className="mx-auto w-full max-w-lg sm:max-w-2xl">
        <main className="flex flex-col gap-5" style={{ padding: '16px 16px 28px 16px' }}>
          <section
            className="rounded-[18px] p-3 shadow-[0_4px_14px_rgba(0,75,199,0.08)]"
            style={{ backgroundColor: '#EBF2FC' }}
          >
            <div
              className="w-full aspect-video rounded-xl overflow-hidden"
              style={{ aspectRatio: '16/9', borderRadius: '12px', background: 'linear-gradient(135deg, #c9dcff 0%, #e7f0ff 100%)' }}
            >
              <svg viewBox="0 0 640 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vecinos usando AlertaBarrio">
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cce9f8" />
                    <stop offset="100%" stopColor="#f5fbff" />
                  </linearGradient>
                  <linearGradient id="phone" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#173d69" />
                    <stop offset="100%" stopColor="#0d2b4e" />
                  </linearGradient>
                </defs>
                <rect width="640" height="360" fill="url(#bg)" />
                <path d="M0 292h640v68H0z" fill="#f3f5ef" />
                <path d="M0 286h640" stroke="#c6d6d5" strokeWidth="4" />

                <g transform="translate(235 62)">
                  <rect width="170" height="246" rx="22" fill="url(#phone)" />
                  <rect x="10" y="23" width="150" height="196" rx="12" fill="#f8fcff" />
                  <circle cx="85" cy="11" r="4" fill="#7fa0bd" />
                  <path d="M20 53l44-20 33 31 40-20 23 25v116H20z" fill="#d5e9f1" />
                  <path d="M23 127l37-28 35 19 39-39 36 36" fill="none" stroke="#7ab3c1" strokeWidth="6" />
                  <path d="M55 118c0-15 12-27 27-27s27 12 27 27c0 20-27 45-27 45s-27-25-27-45z" fill="#0756c9" />
                  <circle cx="82" cy="118" r="9" fill="#fff" />
                  <rect x="38" y="188" width="94" height="10" rx="5" fill="#d4e5ef" />
                  <rect x="55" y="230" width="60" height="7" rx="3.5" fill="#7fa0bd" />
                </g>
              </svg>
            </div>
          </section>

          <section className="text-center px-1">
            <h2 className="text-[26px] leading-[32px] font-black text-slate-900 tracking-[-0.6px] mb-2.5">
              ¡Bienvenido a la red de
              <br />
              tu Barrio!
            </h2>
            <p className="text-base leading-6 text-slate-600 px-2">
              Monitorea, valida y reporta incidencias en
              <br />
              tiempo real para mantener segura tu
              <br />
              Ciudad.
            </p>
          </section>

          <section
            className="rounded-[20px] border p-6 text-center flex flex-col items-center"
            style={{
              background: 'linear-gradient(180deg, #EDF4FF 0%, #E3EFFF 100%)',
              borderColor: '#D4E4FC',
              padding: '24px 20px 20px 20px'
            }}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full mb-4 relative"
              style={{ backgroundColor: '#D3E4FE' }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 21s7-6.1 7-12A7 7 0 0 0 5 9c0 5.9 7 12 7 12Z" fill="#004BC7" />
                <circle cx="12" cy="9" r="2.5" fill="#D3E4FE" />
              </svg>

            </div>

            <p className="text-[15px] leading-[22px] font-medium text-[#2A3B53] mb-5 px-2">
              Para registrar y mostrarte las alertas
              <br />
              activas en tu zona exacta, necesitamos
              <br />
              acceso a tu ubicación.
            </p>

            <button
              onClick={activarUbicacion}
              className="w-full h-[52px] rounded-[30px] text-white text-sm font-extrabold tracking-[0.3px] uppercase shadow-[0_6px_16px_rgba(0,75,199,0.28)]"
              style={{ backgroundColor: '#004BC7', letterSpacing: '0.3px' }}
            >
              ACTIVAR UBICACIÓN Y COMENZAR
            </button>

            <div className="w-full h-px my-4" style={{ backgroundColor: '#D7E3F5' }} />

            <div className="flex items-start gap-2 text-left mb-3 px-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 flex-shrink-0">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C11.45 17 11 16.55 11 16V12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12V16C13 16.55 12.55 17 12 17ZM13 9H11V7H13V9Z" fill="#4A5568" />
              </svg>
              <p className="text-[13px] leading-[18px] text-slate-600 text-center">
                Al continuar, permites el uso de
                <br />
                cookies esenciales de sesión y
                <br />
                geolocalización para mostrar
                <br />
                incidentes en tu zona.
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5 text-[13px] font-bold" style={{ color: '#004BC7' }}>
              <button className="underline">Términos de Servicio</button>
              <button className="underline">Política de Privacidad</button>
              <button className="underline">Aviso de Cookies</button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <article className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#EBF2FC' }}>
                <Icon icon="system-uicons:gps"
                  width="30"
                  height="30"
                  color='#1D4ED8' />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Visualiza alertas cercanas</p>
                <p className="text-xs leading-5 text-slate-600">
                  Consulta incidentes como inundaciones, postes caídos o vías bloqueadas en tu radio de cobertura.
                </p>
              </div>
            </article>

            <article className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#EBF2FC' }}>
                <Icon icon="material-symbols:diversity-3-rounded"
                  width="30"
                  height="30"
                  color='#1D4ED8' />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Valida con tu comunidad</p>
                <p className="text-xs leading-5 text-slate-600">
                  Confirma o descarta reportes para aumentar la confiabilidad comunitaria.
                </p>
              </div>
            </article>

            <article className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#EBF2FC' }}>
                <Icon icon="streamline-flex:steps-2-remix"
                  width="30"
                  height="30"
                  color='#1D4ED8' />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Reporta en 2 simples toques</p>
                <p className="text-xs leading-5 text-slate-600">
                  Sube foto, nota y ubicación GPS para alertar a tus vecinos de inmediato.
                </p>
              </div>
            </article>
          </section>

          <p className="text-center text-[11px] leading-4 text-slate-500 px-4">
            Tus datos de ubicación solo se utilizan para calcular distancias de seguridad y alertas comunitarias.
          </p>
        </main>
      </div>
    </div>
  );
};

export default Onboarding;
