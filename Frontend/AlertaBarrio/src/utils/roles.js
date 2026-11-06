export const ROLES_AUTORIDAD = ['AUTORIDAD', 'ADMIN'];

export const esRolAutoridad = (rol) => ROLES_AUTORIDAD.includes(String(rol || '').trim().toUpperCase());
