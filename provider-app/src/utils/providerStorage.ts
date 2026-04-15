import type { ProviderAvailability, ProviderBooking, ProviderProfile } from '../types';

const PROVIDER_TOKEN_KEY = 'provider_token';
const PROVIDER_PROFILE_KEY = 'provider_profile';
const PROVIDER_ACTIVE_BOOKING_KEY = 'provider_active_booking';
const PROVIDER_AVAILABILITY_KEY = 'provider_availability';
const PROVIDER_TEMP_EMAIL_KEY = 'provider_temp_email';
const PROVIDER_TEMP_PHONE_KEY = 'provider_temp_phone';

const readJson = <T>(key: string): T | null => {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getProviderToken = () => localStorage.getItem(PROVIDER_TOKEN_KEY);

export const setProviderToken = (token: string) => {
  localStorage.setItem(PROVIDER_TOKEN_KEY, token);
};

export const getStoredProviderProfile = () => readJson<ProviderProfile>(PROVIDER_PROFILE_KEY);

export const setStoredProviderProfile = (profile: ProviderProfile) => {
  writeJson(PROVIDER_PROFILE_KEY, profile);
};

export const getStoredProviderAvailability = () =>
  readJson<ProviderAvailability>(PROVIDER_AVAILABILITY_KEY);

export const setStoredProviderAvailability = (availability: ProviderAvailability) => {
  writeJson(PROVIDER_AVAILABILITY_KEY, availability);
};

export const getStoredActiveBooking = () => readJson<ProviderBooking>(PROVIDER_ACTIVE_BOOKING_KEY);

export const setStoredActiveBooking = (booking: ProviderBooking) => {
  writeJson(PROVIDER_ACTIVE_BOOKING_KEY, booking);
};

export const clearStoredActiveBooking = () => {
  localStorage.removeItem(PROVIDER_ACTIVE_BOOKING_KEY);
};

export const getProviderTempEmail = () => localStorage.getItem(PROVIDER_TEMP_EMAIL_KEY);

export const setProviderTempEmail = (email: string) => {
  localStorage.setItem(PROVIDER_TEMP_EMAIL_KEY, email);
};

export const getProviderTempPhone = () => localStorage.getItem(PROVIDER_TEMP_PHONE_KEY);

export const setProviderTempPhone = (phone: string) => {
  localStorage.setItem(PROVIDER_TEMP_PHONE_KEY, phone);
};

export const clearProviderTempTargets = () => {
  localStorage.removeItem(PROVIDER_TEMP_EMAIL_KEY);
  localStorage.removeItem(PROVIDER_TEMP_PHONE_KEY);
};

export const clearProviderSession = () => {
  localStorage.removeItem(PROVIDER_TOKEN_KEY);
  localStorage.removeItem(PROVIDER_PROFILE_KEY);
  localStorage.removeItem(PROVIDER_ACTIVE_BOOKING_KEY);
  localStorage.removeItem(PROVIDER_AVAILABILITY_KEY);
  localStorage.removeItem(PROVIDER_TEMP_EMAIL_KEY);
  localStorage.removeItem(PROVIDER_TEMP_PHONE_KEY);
};
