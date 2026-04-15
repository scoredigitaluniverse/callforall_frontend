const CLIENT_TOKEN_KEY = 'client_token';
const CLIENT_AUTHENTICATED_KEY = 'client_authenticated';
const CLIENT_USER_KEY = 'client_user';
const CLIENT_LANGUAGE_KEY = 'client_language';
const CLIENT_CITY_KEY = 'client_selected_city';
const CLIENT_TEMP_PHONE_KEY = 'client_temp_phone';
const CLIENT_TEMP_EMAIL_KEY = 'client_temp_email';

const readJson = (key) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const getClientToken = () => localStorage.getItem(CLIENT_TOKEN_KEY);

export const setClientToken = (token) => {
  localStorage.setItem(CLIENT_TOKEN_KEY, token);
};

export const isClientAuthenticated = () =>
  localStorage.getItem(CLIENT_AUTHENTICATED_KEY) === 'true';

export const setClientAuthenticated = (value) => {
  localStorage.setItem(CLIENT_AUTHENTICATED_KEY, value ? 'true' : 'false');
};

export const getStoredClientUser = () => readJson(CLIENT_USER_KEY);

export const setStoredClientUser = (user) => {
  localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(user));
};

export const clearClientSession = () => {
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_AUTHENTICATED_KEY);
  localStorage.removeItem(CLIENT_USER_KEY);
};

export const getClientLanguage = () => localStorage.getItem(CLIENT_LANGUAGE_KEY) || 'en';

export const setClientLanguage = (language) => {
  localStorage.setItem(CLIENT_LANGUAGE_KEY, language);
};

export const getClientSelectedCity = () => localStorage.getItem(CLIENT_CITY_KEY);

export const setClientSelectedCity = (cityKey) => {
  localStorage.setItem(CLIENT_CITY_KEY, cityKey);
};

export const getClientTempPhone = () => localStorage.getItem(CLIENT_TEMP_PHONE_KEY);

export const setClientTempPhone = (phone) => {
  localStorage.setItem(CLIENT_TEMP_PHONE_KEY, phone);
  localStorage.removeItem(CLIENT_TEMP_EMAIL_KEY);
};

export const getClientTempEmail = () => localStorage.getItem(CLIENT_TEMP_EMAIL_KEY);

export const setClientTempEmail = (email) => {
  localStorage.setItem(CLIENT_TEMP_EMAIL_KEY, email);
  localStorage.removeItem(CLIENT_TEMP_PHONE_KEY);
};

export const clearClientTempTargets = () => {
  localStorage.removeItem(CLIENT_TEMP_PHONE_KEY);
  localStorage.removeItem(CLIENT_TEMP_EMAIL_KEY);
};
