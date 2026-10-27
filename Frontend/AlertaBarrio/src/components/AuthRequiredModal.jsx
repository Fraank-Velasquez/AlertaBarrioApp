import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

const LockIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const legalContent = {
  terms: {
    title: 'Términos y Condiciones de Uso',
    body: 'Al utilizar AlertaBarrio te comprometes a reportar información veraz, respetar a los demás vecinos y no difundir alertas falsas. El uso indebido de la plataforma puede derivar en la suspensión de tu cuenta.',
  },
  privacy: {
    title: 'Política de Privacidad de Datos Personales',
    body: 'Tus datos personales y de ubicación son tratados conforme a la Ley N.º 29733, Ley de Protección de Datos Personales. Se utilizan únicamente para calcular distancias de seguridad y mostrarte alertas cercanas. No compartimos tu información con terceros sin tu consentimiento.',
  },
};

const AuthRequiredModal = ({ open, onClose }) => {
  if (!open) return null;
  return <AuthRequiredModalContent onClose={onClose} />;
};

const AuthRequiredModalContent = ({ onClose }) => {
  const navigate = useNavigate();
  const [aceptaTerminos, setAceptaTerminos] = useState(true);
  const [notificaciones, setNotificaciones] = useState(() => localStorage.getItem('pushOptIn') === 'true');
  const [legalDoc, setLegalDoc] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (legalDoc) setLegalDoc(null);
      else onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [legalDoc, onClose]);

  const cambiarTerminos = () => {
    const next = !aceptaTerminos;
    setAceptaTerminos(next);
    localStorage.setItem('cookieConsent', JSON.stringify(next));
  };

  const cambiarNotificaciones = () => {
    const next = !notificaciones;
    setNotificaciones(next);
    localStorage.setItem('pushOptIn', JSON.stringify(next));
  };

  const guardarConsentimientos = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(aceptaTerminos));
    localStorage.setItem('pushOptIn', JSON.stringify(notificaciones));
  };

  const irA = (ruta) => {
    guardarConsentimientos();
    onClose();
    navigate(ruta);
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center backdrop-blur-[5px]"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.40)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="max-h-[92dvh] w-full max-w-[420px] overflow-y-auto rounded-t-[24px] bg-white px-5 pb-6 pt-3"
        style={{ boxShadow: '0 -8px 30px rgba(0, 35, 102, 0.18)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-[5px] w-11 rounded-[4px] bg-[#CBD5E1]" />

        <div className="mb-6 text-center">
          <h2 id="auth-modal-title" className="mb-2.5 text-[22px] font-extrabold leading-7 text-[#0F172A]">
            Identifícate para participar
          </h2>
          <p className="mx-auto max-w-[320px] text-[14px] font-normal leading-5 text-[#475569]">
            Para confirmar alertas o publicar reportes vecinales, ingresa o crea tu cuenta para respaldar la veracidad comunitaria.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => irA('/register')}
            disabled={!aceptaTerminos}
            className="h-[50px] rounded-xl bg-[#004BC7] text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(0,75,199,0.22)] transition hover:bg-[#003CA0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Registrarme como nuevo vecino
          </button>
          <button
            type="button"
            onClick={() => irA('/login')}
            className="h-[50px] rounded-xl border-2 border-[#004BC7] bg-white text-[15px] font-bold text-[#004BC7] transition hover:bg-[#F4F7FB]"
          >
            Ya tengo cuenta - Iniciar Sesión
          </button>
        </div>

        <div className="mb-5 h-px w-full bg-[#E2E8F0]" />

        <div className="mb-5 flex flex-col gap-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="sr-only"
              checked={aceptaTerminos}
              onChange={cambiarTerminos}
            />
            <span
              aria-hidden="true"
              className={`mt-px grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition ${
                aceptaTerminos ? 'border-[#004BC7] bg-[#004BC7] text-white' : 'border-[#94A3B8] bg-white text-transparent'
              }`}
            >
              <CheckIcon />
            </span>
            <span className="text-[13.5px] font-normal leading-[19px] text-[#334155]">
              He leído y acepto los{' '}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setLegalDoc('terms');
                }}
                className="font-medium text-[#004BC7] hover:underline"
              >
                Términos y Condiciones de Uso
              </button>{' '}
              y la{' '}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setLegalDoc('privacy');
                }}
                className="font-medium text-[#004BC7] hover:underline"
              >
                Política de Privacidad de Datos Personales
              </button>
              .
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="sr-only"
              checked={notificaciones}
              onChange={cambiarNotificaciones}
            />
            <span
              aria-hidden="true"
              className={`mt-px grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition ${
                notificaciones ? 'border-[#004BC7] bg-[#004BC7] text-white' : 'border-[#94A3B8] bg-white text-transparent'
              }`}
            >
              <CheckIcon />
            </span>
            <span className="text-[13.5px] font-normal leading-[19px] text-[#334155]">
              Acepto recibir notificaciones push de emergencias en mi radio barrial.
            </span>
          </label>
        </div>

        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-4 py-3.5 text-[#475569]">
          <span className="mt-px shrink-0">
            <LockIcon />
          </span>
          <p className="text-[12.5px] font-normal leading-[18px]">
            AlertaBarrio utiliza cookies esenciales y geolocalización únicamente para calcular distancias de seguridad y mostrar alertas cercanas.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="block w-full py-1.5 text-center text-[14px] font-bold text-[#1E293B]"
        >
          Continuar explorando como visitante (Solo lectura)
        </button>
      </div>

      {legalDoc && (
        <div
          className="fixed inset-0 z-[1300] flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={(event) => {
            event.stopPropagation();
            setLegalDoc(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            className="mb-4 w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="legal-modal-title" className="text-base font-extrabold text-[#0F172A]">
              {legalContent[legalDoc].title}
            </h3>
            <p className="mt-3 text-[13px] leading-5 text-[#475569]">{legalContent[legalDoc].body}</p>
            <button
              type="button"
              onClick={() => setLegalDoc(null)}
              className="mt-4 w-full rounded-xl bg-[#004BC7] py-3 text-sm font-bold text-white"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthRequiredModal;
