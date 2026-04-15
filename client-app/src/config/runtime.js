export const LOCAL_BACKEND_URL = 'http://localhost:5000';
export const PRODUCTION_BACKEND_URL = 'https://call-for-all-backend.vercel.app';

const isLocalRuntime = () => {
  if (typeof window === 'undefined') {
    return import.meta.env.DEV;
  }

  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

const DEFAULT_BACKEND_URL = isLocalRuntime()
  ? LOCAL_BACKEND_URL
  : PRODUCTION_BACKEND_URL;
const DEFAULT_API_BASE_URL = `${DEFAULT_BACKEND_URL}/api`;

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const normalizeApiBaseUrl = (value) => {
  const trimmed = trimTrailingSlash(value);
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);
export const BACKEND_URL = trimTrailingSlash(rawBackendUrl || API_BASE_URL.replace(/\/api$/, ''));
