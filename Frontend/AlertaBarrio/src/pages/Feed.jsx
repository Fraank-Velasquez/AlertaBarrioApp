import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Feed = () => {
  const [incidentes, setIncidentes] = useState([]);
  const [lat, setLat] = useState(-5.19449);
  const [lng, setLng] = useState(-80.63282);
  const [radio, setRadio] = useState(1000);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        cargar(pos.coords.latitude, pos.coords.longitude, radio);
      },
      () => cargar(-5.19449, -80.63282, radio)
    );
  }, []);

  const cargar = async (la, lo, r) => {
    try {
      const res = await api.get(`/incidentes/cercanos?latitud=${la}&longitud=${lo}&radioMetros=${r}`);
      setIncidentes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const cambiarRadio = (r) => {
    setRadio(r);
    cargar(lat, lng, r);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-3">Feed comunitario</h1>
        <div className="flex gap-2 mb-3">
          <button onClick={() => cambiarRadio(500)} className={`px-3 py-1 rounded ${radio === 500 ? 'bg-blue-600 text-white' : 'bg-white'}`}>500m</button>
          <button onClick={() => cambiarRadio(1000)} className={`px-3 py-1 rounded ${radio === 1000 ? 'bg-blue-600 text-white' : 'bg-white'}`}>1km</button>
        </div>
        {incidentes.map((inc) => (
          <Link to={`/incidente/${inc.incidenteId}`} key={inc.incidenteId} className="block bg-white p-3 rounded shadow mb-2">
            <div className="flex justify-between">
              <strong>{inc.categoriaNombre}</strong>
              <span className="text-xs">{inc.estadoNombre}</span>
            </div>
            <p className="text-sm text-gray-600">{inc.descripcion}</p>
            <p className="text-xs mt-1">Confianza: {inc.indiceConfianzaPorcentaje}% | Votos: +{inc.conteoVotosPositivos} / -{inc.conteoVotosNegativos}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Feed;
