const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiBaseUrl.replace(/\/api\/?$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
};
