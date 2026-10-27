import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [paso, setPaso] = useState(0);
  const navigate = useNavigate();

  const pasos = [
    {
      titulo: 'Reporta incidencias en tu barrio',
      descripcion: 'Informa sobre inundaciones, postes caídos, vías bloqueadas y más en tiempo real.',
    },
    {
      titulo: 'Valida con tu comunidad',
      descripcion: 'Tu voto cuenta. Solo vecinos cercanos pueden validar para evitar falsas alarmas.',
    },
    {
      titulo: 'Conecta con autoridades',
      descripcion: 'Alertas verificados llegan directamente a Serenazgo, Bomberos y COED.',
    },
  ];

  const siguiente = () => {
    if (paso < 2) {
      setPaso(paso + 1);
    } else {
      localStorage.setItem('onboarding', 'done');
      navigate('/mapa');
    }
  };

  const omitir = () => {
    localStorage.setItem('onboarding', 'done');
    navigate('/mapa');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={omitir} className="text-gray-500 text-sm">Omitir</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-48 h-48 bg-red-100 rounded-full mb-8 flex items-center justify-center">
          <div className="text-6xl">🚨</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{pasos[paso].titulo}</h1>
        <p className="text-gray-600 mb-8 max-w-xs">{pasos[paso].descripcion}</p>
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === paso ? 'bg-red-600' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
      <div className="p-6">
        <button onClick={siguiente} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold">
          {paso < 2 ? 'Siguiente' : 'Empezar'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
