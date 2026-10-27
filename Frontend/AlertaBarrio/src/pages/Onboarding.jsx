import { useNavigate } from 'react-router-dom';

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
        <h1 className="text-xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.5px' }}>
          AlertaBarrio
        </h1>
      </header>

      <main className="px-4 pt-4 pb-7 flex flex-col gap-5" style={{ padding: '16px 16px 28px 16px' }}>
        <section
          className="rounded-[18px] p-3 shadow-[0_4px_14px_rgba(0,75,199,0.08)]"
          style={{ backgroundColor: '#EBF2FC' }}
        >
          <span
            className="inline-block text-xs font-bold text-slate-900 mb-2.5"
            style={{ fontSize: '12px', fontWeight: '700' }}
          >
            Bienvenida e Inicio
          </span>
          <div
            className="w-full aspect-video rounded-xl overflow-hidden"
            style={{ aspectRatio: '16/9', borderRadius: '12px', background: 'linear-gradient(135deg, #c9dcff 0%, #e7f0ff 100%)' }}
          >
            <svg viewBox="0 0 640 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dbe8ff" />
                  <stop offset="100%" stopColor="#f1f6ff" />
                </linearGradient>
              </defs>
              <rect width="640" height="360" fill="url(#bg)" />
              <g stroke="#9bb7ff" strokeWidth="6" opacity="0.4">
                <line x1="0" y1="280" x2="640" y2="280" />
              </g>
              <circle cx="160" cy="240" r="14" fill="#1d4ed8" opacity="0.9" />
              <circle cx="320" cy="220" r="16" fill="#dc2626" opacity="0.95" />
              <circle cx="460" cy="250" r="12" fill="#059669" opacity="0.9" />
              <rect x="90" y="150" width="120" height="90" rx="14" fill="#ffffff" opacity="0.9" />
              <rect x="110" y="170" width="80" height="10" rx="5" fill="#cbd5f5" />
              <rect x="110" y="190" width="60" height="10" rx="5" fill="#e2e8f0" />
              <rect x="110" y="210" width="70" height="10" rx="5" fill="#e2e8f0" />
              <circle cx="520" cy="150" r="34" fill="#ffffff" stroke="#dbeafe" strokeWidth="8" />
              <path d="M520 126v12m0 24v12m-24-24h12m24 0h12" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
              <path d="M508 138l24 24m-24 0l24-24" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        </section>

        <section className="text-center px-1">
          <h2 className="text-[26px] leading-[32px] font-black text-slate-900 tracking-[-0.6px] mb-2.5">
            ¡Bienvenido a tu la red de
            <br />
            tu Barrio!
          </h2>
          <p className="text-base leading-6 text-slate-600 px-2">
            Monitorea, valida y reporta incidencias en
            <br />
            tiempo real para mantener seguro tu
            <br />
            vecindario.
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
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative"
            style={{ backgroundColor: '#D3E4FE' }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8.5C10.62 8.5 9.5 9.62 9.5 11C9.5 12.38 10.62 13.5 12 13.5C13.38 13.5 14.5 12.38 14.5 11C14.5 9.62 13.38 8.5 12 8.5ZM12 21C10.73 21 9.54 20.75 8.47 20.29C7.4 19.83 6.45 19.19 5.64 18.36C4.81 17.55 4.17 16.6 3.71 15.53C3.25 14.46 3 13.27 3 12C3 7.86 6.5 4.43 10.96 4.01C11.64 3.93 12.36 3.93 13.04 4.01C17.5 4.43 21 7.86 21 12C21 13.27 20.75 14.46 20.29 15.53C19.83 16.6 19.19 17.55 18.36 18.36C17.55 19.19 16.6 19.83 15.53 20.29C14.46 20.75 13.27 21 12 21ZM12 6C11.3 6 10.62 6.07 9.97 6.2C6.61 6.88 4 9.17 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 9.17 17.39 6.88 14.03 6.2C13.38 6.07 12.7 6 12 6Z" fill="#004BC7" />
              <circle cx="12" cy="11" r="2.5" fill="#004BC7" />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#004BC7' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="white" />
              </svg>
            </span>
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
            <p className="text-[13px] leading-[18px] text-slate-600">
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
            <span style={{ color: '#94a3b8' }}>•</span>
            <button className="underline">Política de Privacidad</button>
            <span style={{ color: '#94a3b8' }}>•</span>
            <button className="underline">Aviso de Cookies</button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <article className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#EBF2FC' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#004BC7" />
              </svg>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C6.34 13 4 14.34 4 16V18H12V16C12 14.34 9.66 13 8 13ZM16 13C14.67 13 12.86 13.53 12.02 14.4C12.73 15.36 13.2 16.33 13.2 17.5V18H20V16C20 14.34 17.66 13 16 13Z" fill="#004BC7" />
              </svg>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#004BC7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Reporta en 3 simples toques</p>
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
  );
};

export default Onboarding;
