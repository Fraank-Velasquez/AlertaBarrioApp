import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Reportar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api.get('/public/catalogos/categorias').then((res) => setCategorias(res.data));
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
        <h1 className="text-lg font-bold mb-4">Reportar incidente</h1>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Categoría</label>
          <select className="w-full border p-2 mb-3" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
            <option value="">Seleccionar</option>
            {categorias.map((c) => (
              <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
            ))}
          </select>
          <label className="block mb-2">Descripción (opcional)</label>
          <textarea className="w-full border p-2 mb-3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <p className="text-xs text-gray-600 mb-3">GPS: {lat ? `${lat}, ${lng}` : 'Obteniendo ubicación...'}</p>
          <button className="w-full bg-red-600 text-white p-2 rounded" disabled={!lat || !lng}>Publicar alerta</button>
        </form>
        {mensaje && <p className="mt-3 text-sm">{mensaje}</p>}
      </div>
    </div>
  );
};

export default Reportar;
