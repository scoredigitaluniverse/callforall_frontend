import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProviderLanguage,
  providerT,
  setProviderLanguage,
  type ProviderLanguage,
} from '../i18n/translations';
import {
  getProviderApplication,
  getProviderMe,
  submitProviderApplication,
  updateProviderMeProfile,
} from '../api/providerApi';
import type { ProviderApplication, ProviderProfile } from '../types';
import { getProviderLandingPath, isApprovedProviderProfile } from '../utils/providerAccess';

const SERVICE_TYPE_OPTIONS = ['Electrician', 'Plumber', 'Carpenter', 'Painter'];

const ProviderKycPage = () => {
  const [language, setLanguage] = useState<ProviderLanguage>(getProviderLanguage());
  const t = providerT;
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [application, setApplication] = useState<ProviderApplication | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [experience, setExperience] = useState('0');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = (nextLanguage: ProviderLanguage) => {
    setProviderLanguage(nextLanguage);
    setLanguage(nextLanguage);
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        const [nextProfile, nextApplication] = await Promise.all([
          getProviderMe(),
          getProviderApplication(),
        ]);

        if (isApprovedProviderProfile(nextProfile)) {
          navigate('/dashboard', { replace: true });
          return;
        }

        if (nextApplication.status === 'pending') {
          navigate('/status', { replace: true });
          return;
        }

        setProfile(nextProfile);
        setApplication(nextApplication);
        setName(nextProfile.name || '');
        setCity(nextProfile.city || '');
        setAddress(nextProfile.address || '');
        setPincode(nextProfile.pincode || '');
        setServiceType(nextApplication.serviceType || '');
        setExperience(nextApplication.experienceYears ? String(nextApplication.experienceYears) : '0');
      } catch (error) {
        window.alert(error instanceof Error ? error.message : t('failedLoadProviderKyc'));
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    void loadState();
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !city.trim() || !serviceType.trim() || aadhaarNumber.trim().length !== 12) {
      window.alert(t('kycRequiredFieldsError'));
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProviderMeProfile({
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
      });

      await submitProviderApplication({
        serviceType: serviceType.trim(),
        experience: Number(experience) || 0,
        aadhaarNumber: aadhaarNumber.trim(),
      });

      const nextProfile = await getProviderMe();
      const nextApplication = await getProviderApplication();
      navigate(getProviderLandingPath({ profile: nextProfile, application: nextApplication }), {
        replace: true,
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t('failedSubmitKyc'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="provider-login-page provider-app-loading">{t('loadingKycForm')}</div>;
  }

  return (
    <div className="provider-login-page">
      <div className="provider-login-card provider-login-card-wide">
        <div className="provider-kyc-header">
          <div className="provider-kyc-language-tags">
            <button
              type="button"
              className={`provider-kyc-language-tag ${language === 'en' ? 'provider-kyc-language-tag-active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              {t('english')}
            </button>
            <button
              type="button"
              className={`provider-kyc-language-tag ${language === 'ta' ? 'provider-kyc-language-tag-active' : ''}`}
              onClick={() => handleLanguageChange('ta')}
            >
              {t('tamil')}
            </button>
          </div>

          <p className="provider-app-eyebrow">{t('providerOnboarding')}</p>
          <h1>{application?.canResubmit ? t('resubmitKyc') : t('completeKyc')}</h1>
          <p className="provider-app-muted">
            {t('kycDescription')}
          </p>
        </div>

        <form className="provider-app-form" onSubmit={handleSubmit}>
          <label className="provider-app-label">
            {t('fullName')}
            <input
              className="provider-app-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('fullNamePlaceholder')}
            />
          </label>

          <div className="provider-app-summary-grid">
            <label className="provider-app-label">
              {t('email')}
              <input
                className="provider-app-input provider-app-input-readonly"
                type="email"
                value={profile?.email || ''}
                disabled
              />
            </label>

            <label className="provider-app-label">
              {t('phone')}
              <input
                className="provider-app-input provider-app-input-readonly"
                type="text"
                value={profile?.phone || ''}
                disabled
              />
            </label>
          </div>

          <div className="provider-app-summary-grid">
            <label className="provider-app-label">
              {t('city')}
              <input
                className="provider-app-input"
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t('cityPlaceholder')}
              />
            </label>

            <label className="provider-app-label">
              {t('pincode')}
              <input
                className="provider-app-input"
                type="text"
                inputMode="numeric"
                value={pincode}
                onChange={(event) => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('pincodePlaceholder')}
              />
            </label>
          </div>

          <label className="provider-app-label">
            {t('address')}
            <input
              className="provider-app-input"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={t('addressPlaceholder')}
            />
          </label>

          <div className="provider-app-summary-grid">
            <label className="provider-app-label">
              {t('serviceType')}
              <input
                className="provider-app-input"
                list="provider-service-types"
                type="text"
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value)}
                placeholder={t('serviceTypePlaceholder')}
              />
              <datalist id="provider-service-types">
                {SERVICE_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>

            <label className="provider-app-label">
              {t('experienceInYears')}
              <input
                className="provider-app-input"
                type="number"
                min="0"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          <label className="provider-app-label">
            {t('aadhaarNumber')}
            <input
              className="provider-app-input"
              type="text"
              inputMode="numeric"
              value={aadhaarNumber}
              onChange={(event) =>
                setAadhaarNumber(event.target.value.replace(/\D/g, '').slice(0, 12))
              }
              placeholder="123412341234"
            />
          </label>

          <div className="provider-app-alert">
            {t('afterSubmissionPendingReview')}
          </div>

          <div className="provider-app-button-row">
            <button
              type="button"
              className="provider-app-button provider-app-button-secondary"
              onClick={() => navigate('/status', { replace: true })}
            >
              {t('viewStatus')}
            </button>
            <button
              type="submit"
              className="provider-app-button provider-app-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('submitting')
                : application?.canResubmit
                  ? t('resubmitForApproval')
                  : t('submitKyc')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderKycPage;
