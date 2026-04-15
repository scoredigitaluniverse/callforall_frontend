import { en } from './en';
import { ta } from './ta';

export const translations = {
  en,
  ta,
};

// Language utility function
export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || key;
};
