import { useState } from 'react';
import {
  getProviderLanguage,
  providerT,
  setProviderLanguage,
  type ProviderLanguage,
} from '../i18n/translations';

const ProviderLanguagePage = () => {
  const [language, setLanguage] = useState<ProviderLanguage>(getProviderLanguage());
  const t = providerT;

  const handleLanguageChange = (nextLanguage: ProviderLanguage) => {
    setProviderLanguage(nextLanguage);
    setLanguage(nextLanguage);
  };

  return (
    <section className="provider-app-page">
      <div className="provider-app-page-header">
        <div>
          <p className="provider-app-eyebrow">{t('language')}</p>
          <h2>{t('chooseLanguage')}</h2>
          <p className="provider-app-muted">{t('languageDescription')}</p>
        </div>
      </div>

      <article className="provider-app-card provider-app-card-wide">
        <div className="provider-app-language-page-options">
          <button
            type="button"
            className={`provider-app-language-page-button ${language === 'en' ? 'provider-app-language-page-button-active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            {t('english')}
          </button>
          <button
            type="button"
            className={`provider-app-language-page-button ${language === 'ta' ? 'provider-app-language-page-button-active' : ''}`}
            onClick={() => handleLanguageChange('ta')}
          >
            {t('tamil')}
          </button>
        </div>
      </article>
    </section>
  );
};

export default ProviderLanguagePage;
