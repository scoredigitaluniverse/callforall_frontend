const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const getAdminUser = <T,>() => readJson<T>(ADMIN_USER_KEY);

export const setAdminUser = (admin: unknown) => {
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
};

export const clearAdminAuth = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

export const isAdminAuthenticated = () => Boolean(getAdminToken());
