import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DetalleIncidente = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [incidente, setIncidente] = useState(null);
  const [tipoVotos, setTipoVotos] = useState([]);
  const [tipoVotoId, setTipoVotoId] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api.get(`/incidentes/${id}`).then((res) => setIncidente(res.data));
    api.get('/public/catalogos/tipos-voto').then((res) => setTipoVotos(res.data));
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  }, [id]);

  const votar = async () => {
    setMensaje('');
    try {
      await api.post('/validaciones/con-ubicacion', {
        incidenteId: id,
        tipoVotoId,
        latitud: lat,
        longitud: lng,
        notaActualizacionRapida: null,
        fotoEvidenciaUrl: null,
      });
      setMensaje('Voto emitido correctamente');
      api.get(`/incidentes/${id}`).then((res) => setIncidente(res.data));
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al votar');
    }
  };

  if (!incidente) return <div className="p-4">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
        <h1 className="text-lg font-bold">{incidente.categoriaNombre}</h1>
        <p className="text-sm text-gray-600">{incidente.estadoNombre}</p>
        <p className="mt-2">{incidente.descripcion}</p>
        <p className="text-xs mt-2">Confianza: {incidente.indiceConfianzaPorcentaje}% (+{incidente.conteoVotosPositivos} / -{incidente.conteoVotosNegativos})</p>
        <p className="text-xs text-gray-500 mt-1">Por: {incidente.autorNombre}</p>

        {user && (
          <div className="mt-4">
            <label className="block mb-2">Votar</label>
            <select className="w-full border p-2 mb-2" value={tipoVotoId} onChange={(e) => setTipoVotoId(e.target.value)}>
              <option value="">Seleccionar</option>
              {tipoVotos.map((t) => (
                <option key={t.idTipoVoto} value={t.idTipoVoto}>{t.nombre}</option>
              ))}
            </select>
            <button onClick={votar} disabled={!tipoVotoId || !lat} className="w-full bg-blue-600 text-white p-2 rounded">Emitir voto (dentro 500m)</button>
          </div>
        )}
        {!user && <p className="mt-3 text-sm text-gray-600">Inicia sesión para votar</p>}
        {mensaje && <p className="mt-2 text-sm">{mensaje}</p>}
      </div>
    </div>
  );
};

export default DetalleIncidente;
