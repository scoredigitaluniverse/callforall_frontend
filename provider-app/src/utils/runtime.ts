const LOCAL_BACKEND_URL = 'https://call-for-all-backend.onrender.com';
const PRODUCTION_BACKEND_URL = 'https://call-for-all-backend.onrender.com';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isLocalRuntime = () => {
  if (typeof window === 'undefined') {
    return import.meta.env.DEV;
  }

  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

const defaultBackendUrl = isLocalRuntime()
  ? LOCAL_BACKEND_URL
  : PRODUCTION_BACKEND_URL;

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || defaultBackendUrl;
export const BACKEND_URL = trimTrailingSlash(rawBackendUrl);

const normalizeApiBaseUrl = (value: string) => {
  const trimmed = trimTrailingSlash(value);
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${BACKEND_URL}/api`;

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);
