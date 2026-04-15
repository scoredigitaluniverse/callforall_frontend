const LOCAL_BACKEND_URL = 'http://localhost:5000';
const PRODUCTION_BACKEND_URL = 'https://call-for-all-backend.vercel.app';

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

const normalizeApiBaseUrl = (value: string) => {
  const trimmed = trimTrailingSlash(value);
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${defaultBackendUrl}/api`;

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);
