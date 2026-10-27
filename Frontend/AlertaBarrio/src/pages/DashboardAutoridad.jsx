import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardAutoridad = () => {
  const { user } = useAuth();
  const [incidentes, setIncidentes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [unidad, setUnidad] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargar();
    api.get('/public/catalogos/estados').then((res) => setEstados(res.data));
  }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/incidentes/cercanos?latitud=-5.19449&longitud=-80.63282&radioMetros=5000');
      setIncidentes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.rol !== 'AUTORIDAD') return <Navigate to="/mapa" />;

  const resolver = async () => {
    if (!seleccionado) return;
    try {
      await api.post(`/admin/incidentes/${seleccionado.incidenteId}/resolver`, {
        unidadDespachada: unidad,
        mensajeComunicadoOficial: mensaje,
      });
      cargar();
      setSeleccionado(null);
      setUnidad('');
      setMensaje('');
      alert('Incidente marcado como RESUELTO');
    } catch (e) {
      alert(e.response?.data?.mensaje || 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Dashboard de Autoridades - AlertaBarrio</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Incidentes prioritarios</h2>
            <div className="space-y-2 max-h-[70vh] overflow-auto">
              {incidentes.map((inc) => (
                <div
                  key={inc.incidenteId}
                  onClick={() => setSeleccionado(inc)}
                  className={`p-3 border rounded cursor-pointer ${seleccionado?.incidenteId === inc.incidenteId ? 'border-blue-600 bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between">
                    <strong>{inc.categoriaNombre}</strong>
                    <span className="text-xs">{inc.estadoNombre}</span>
                  </div>
                  <p className="text-sm text-gray-600">{inc.descripcion}</p>
                  <p className="text-xs">Confianza: {inc.indiceConfianzaPorcentaje}% | +{inc.conteoVotosPositivos}/-{inc.conteoVotosNegativos}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Atención / Despacho</h2>
            {seleccionado ? (
              <div>
                <p className="font-semibold">{seleccionado.categoriaNombre}</p>
                <p className="text-sm mb-2">{seleccionado.descripcion}</p>
                <p className="text-xs mb-3">Reporte por: {seleccionado.autorNombre}</p>
                <label className="block mb-1">Unidad despachada</label>
                <input className="w-full border p-2 mb-2" value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="Serenazgo, Bomberos, COED..." />
                <label className="block mb-1">Mensaje oficial</label>
                <textarea className="w-full border p-2 mb-3" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
                <button onClick={resolver} className="w-full bg-green-600 text-white p-2 rounded">Marcar como RESUELTO con intervención</button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Selecciona un incidente para atenderlo</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAutoridad;
