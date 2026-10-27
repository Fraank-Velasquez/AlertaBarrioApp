import { useEffect, useState } from 'react';
import api from '../services/api';

const Directorio = () => {
  const [distrito, setDistrito] = useState('Piura');
  const [contactos, setContactos] = useState([]);

  useEffect(() => {
    // Usamos datos estáticos basados en requerimientos
    setContactos([
      { id: 1, entidad: 'Bomberos', numero: '116', distrito: 'Piura' },
      { id: 2, entidad: 'Policía Nacional', numero: '105', distrito: 'Piura' },
      { id: 3, entidad: 'Serenazgo', numero: '073-331-000', distrito: 'Piura' },
      { id: 4, entidad: 'SAMU', numero: '106', distrito: 'Piura' },
      { id: 5, entidad: 'Serenazgo', numero: '073-345-000', distrito: 'Castilla' },
    ]);
  }, []);

  const filtrados = contactos.filter((c) => c.distrito === distrito);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-3">Directorio de Emergencias</h1>
        <select className="w-full border p-2 mb-3" value={distrito} onChange={(e) => setDistrito(e.target.value)}>
          <option value="Piura">Piura</option>
          <option value="Castilla">Castilla</option>
        </select>
        {filtrados.map((c) => (
          <a key={c.id} href={`tel:${c.numero}`} className="block bg-white p-3 rounded shadow mb-2">
            <div className="flex justify-between">
              <strong>{c.entidad}</strong>
              <span className="text-blue-600">{c.numero}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Directorio;
