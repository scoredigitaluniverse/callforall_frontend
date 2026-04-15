import { useState } from 'react';
import { providerT } from '../i18n/translations';
import { toggleProviderAvailability, updateProviderProfile } from '../api/providerApi';
import {
  getStoredProviderAvailability,
  getStoredProviderProfile,
  setStoredProviderAvailability,
  setStoredProviderProfile,
} from '../utils/providerStorage';
import type { ProviderAvailability } from '../types';

const emptyAvailability: ProviderAvailability = {
  providerId: null,
  isOnline: false,
  lastUpdated: null,
  location: null,
};

const getCurrentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    const t = providerT;
    if (!navigator.geolocation) {
      reject(new Error(t('geolocationNotSupported')));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });

const formatDateTime = (value: string | null) => {
  const t = providerT;
  if (!value) return t('notAvailable');
  return new Date(value).toLocaleString();
};

const ProviderDashboardPage = () => {
  const t = providerT;
  const approvalStatusMap: Record<string, string> = {
    approved: t('approved'),
    pending: t('pendingReview'),
    rejected: t('rejected'),
  };
  const profile = getStoredProviderProfile();
  const [availability, setAvailability] = useState<ProviderAvailability>(
    getStoredProviderAvailability() || emptyAvailability
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basicPayment, setBasicPayment] = useState(profile?.basicPayment || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = await updateProviderProfile({
        name: profile?.name,
        city: profile?.city,
        address: profile?.address,
        pincode: profile?.pincode,
        basicPayment: Number(basicPayment),
      });
      setStoredProviderProfile(updatedProfile);
      window.alert('Basic payment saved!');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to save basic payment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async () => {
    setIsSubmitting(true);

    try {
      let nextAvailability: ProviderAvailability;

      if (!availability.isOnline) {
        const position = await getCurrentPosition();
        nextAvailability = await toggleProviderAvailability({
          isOnline: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } else {
        nextAvailability = await toggleProviderAvailability({
          isOnline: false,
        });
      }

      setAvailability(nextAvailability);
      setStoredProviderAvailability(nextAvailability);
      window.alert(
        nextAvailability.isOnline ? t('nowOnline') : t('nowOffline')
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t('unableUpdateAvailability'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="provider-app-page">
      <div className="provider-app-page-header">
        <div>
          <p className="provider-app-eyebrow">{t('dashboard')}</p>
          <h2>{t('dashboardRecords')}</h2>
        </div>
      </div>

      <div className="provider-app-card-grid">
        <article className="provider-app-card">
          <h3>{profile?.name || t('serviceProvider')}</h3>
          <p className="provider-app-muted">{profile?.email || t('notAvailable')}</p>

          <div className="provider-app-status-row">
            <span className="provider-app-status-label">{t('approvalStatus')}</span>
            <span className="provider-app-pill provider-app-pill-online">
              {approvalStatusMap[profile?.serviceProviderStatus || ''] || profile?.serviceProviderStatus || t('approved')}
            </span>
          </div>

          <div className="provider-app-status-row">
            <span className="provider-app-status-label">{t('phone')}</span>
            <span>{profile?.phone || t('notAvailable')}</span>
          </div>

          <div className="provider-app-status-row">
            <span className="provider-app-status-label">{t('city')}</span>
            <span>{profile?.city || t('notAvailable')}</span>
          </div>

          <div className="provider-app-status-row">
            <span className="provider-app-status-label">{t('basicPayment')}</span>
            <input
              type="text"
              value={basicPayment}
              onChange={(e) => setBasicPayment(e.target.value)}
              className="provider-app-input"
            />
          </div>

          <button
            type="button"
            className="provider-app-button provider-app-button-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('saving') : t('save')}
          </button>
        </article>

        <article className="provider-app-card">
          <h3>{t('availability')}</h3>
          <p className="provider-app-muted">{t('availabilityHint')}</p>

          <div className="provider-app-status-row">
            <span className="provider-app-status-label">{t('currentStatus')}</span>
            <span
              className={`provider-app-pill ${
                availability.isOnline ? 'provider-app-pill-online' : 'provider-app-pill-offline'
              }`}
            >
              {availability.isOnline ? t('online') : t('offline')}
            </span>
          </div>

          <div className="provider-app-status-row">
            <span className="provider-app-status-label">{t('lastUpdated')}</span>
            <span>{formatDateTime(availability.lastUpdated)}</span>
          </div>

          <div className="provider-app-status-row">
            <span className="provider-app-status-label">{t('location')}</span>
            <span>
              {availability.location
                ? `${availability.location.lat.toFixed(5)}, ${availability.location.lng.toFixed(5)}`
                : t('unavailable')}
            </span>
          </div>

          <button
            type="button"
            className="provider-app-button provider-app-button-primary"
            onClick={handleToggle}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('updating')
              : availability.isOnline
                ? t('goOffline')
                : t('goOnline')}
          </button>
        </article>
      </div>
    </section>
  );
};

export default ProviderDashboardPage;
