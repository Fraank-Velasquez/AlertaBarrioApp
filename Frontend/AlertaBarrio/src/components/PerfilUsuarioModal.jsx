import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../utils/media';

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value))
  : 'Fecha no disponible';

const PerfilUsuarioModal = ({ usuarioId, nombreInicial, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    api.get(`/perfil/publico/${usuarioId}`)
      .then(({ data }) => { if (activo) setPerfil(data); })
      .catch(() => { if (activo) setError('No se pudo cargar el perfil del vecino.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [usuarioId]);

  const alternarSeguimiento = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActualizando(true);
    try {
      const siguiendo = perfil.siguiendoUsuario;
      await (siguiendo
        ? api.delete(`/red-vecinal/seguir/${usuarioId}`)
        : api.post(`/red-vecinal/seguir/${usuarioId}`));
      setPerfil((actual) => ({
        ...actual,
        siguiendoUsuario: !siguiendo,
        seguidores: actual.seguidores + (siguiendo ? -1 : 1),
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || 'No se pudo actualizar el seguimiento.');
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="perfil-usuario-titulo" className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 id="perfil-usuario-titulo" className="text-base font-extrabold text-slate-900">Perfil del vecino</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar perfil" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-lg text-slate-600">×</button>
        </div>
        {cargando && <p className="py-10 text-center text-sm text-slate-500">Cargando perfil...</p>}
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {perfil && (
          <div className="mt-5 text-center">
            {perfil.fotoAvatarUrl
              ? <img src={resolveMediaUrl(perfil.fotoAvatarUrl)} alt={`Foto de ${perfil.nombre}`} className="mx-auto h-20 w-20 rounded-full object-cover" />
              : <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue-100 text-xl font-extrabold text-blue-800">{(perfil.nombre || nombreInicial || 'V').split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()}</span>}
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">{perfil.nombre || nombreInicial}</h3>
            <p className="mt-1 text-sm text-slate-600">{perfil.sectorResidencia || 'Zona no registrada'}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-slate-50 p-3"><strong className="block text-lg text-slate-900">{perfil.seguidores}</strong><span className="text-slate-500">Seguidores</span></div>
              <div className="rounded-xl bg-slate-50 p-3"><strong className="block text-lg text-slate-900">{perfil.siguiendo}</strong><span className="text-slate-500">Siguiendo</span></div>
            </div>
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-left text-sm text-slate-700">
              <p>Registrado desde <strong>{formatDate(perfil.fechaRegistro)}</strong></p>
              <p className="mt-1">Nivel de confiabilidad: <strong>{perfil.porcentajeConfiabilidad ?? '—'}%</strong></p>
              <p className="mt-1">Nivel de reputación: <strong>{perfil.nivelReputacion ?? '—'}</strong></p>
            </div>
            <button type="button" disabled={actualizando || user?.usuarioId === perfil.usuarioId} onClick={alternarSeguimiento} className={`mt-4 w-full rounded-lg py-3 text-sm font-extrabold transition disabled:opacity-60 ${perfil.siguiendoUsuario || user?.usuarioId === perfil.usuarioId ? 'border border-slate-300 bg-slate-100 text-slate-700' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
              {user?.usuarioId === perfil.usuarioId ? 'Este es tu perfil' : actualizando ? 'Actualizando...' : perfil.siguiendoUsuario ? 'Siguiendo ✓' : 'Seguir'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default PerfilUsuarioModal;
