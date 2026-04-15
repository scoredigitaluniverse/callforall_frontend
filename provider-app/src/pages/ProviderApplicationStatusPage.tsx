import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderApplication, getProviderMe } from '../api/providerApi';
import { providerT } from '../i18n/translations';
import type { ProviderApplication, ProviderProfile } from '../types';
import { isApprovedProviderProfile } from '../utils/providerAccess';
import { clearProviderSession } from '../utils/providerStorage';

const formatDate = (value: string | null) => {
  const t = providerT;
  if (!value) return t('notAvailable');
  return new Date(value).toLocaleString();
};

const ProviderApplicationStatusPage = () => {
  const t = providerT;
  const statusLabelMap: Record<string, string> = {
    approved: t('approved'),
    pending: t('pendingReview'),
    rejected: t('rejected'),
    none: t('notSubmitted'),
  };

  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [application, setApplication] = useState<ProviderApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadState = async () => {
    setIsLoading(true);

    try {
      const [nextProfile, nextApplication] = await Promise.all([
        getProviderMe(),
        getProviderApplication(),
      ]);

      if (isApprovedProviderProfile(nextProfile) || nextApplication.status === 'approved') {
        navigate('/dashboard', { replace: true });
        return;
      }

      setProfile(nextProfile);
      setApplication(nextApplication);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t('failedLoadProviderStatus'));
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadState();
  }, []);

  const handleLogout = () => {
    clearProviderSession();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return <div className="provider-login-page provider-app-loading">{t('loadingApplicationStatus')}</div>;
  }

  return (
    <div className="provider-login-page">
      <div className="provider-login-card provider-login-card-wide">
        <div>
          <p className="provider-app-eyebrow">{t('providerStatus')}</p>
          <h1>{statusLabelMap[application?.status || 'none'] || t('applicationStatus')}</h1>
          <p className="provider-app-muted">
            {t('existingProvidersTrackStatus')}
          </p>
        </div>

        <div className={`provider-app-alert provider-app-alert-${application?.status || 'none'}`}>
          {application?.status === 'pending'
            ? t('kycPendingApproval')
            : application?.status === 'rejected'
              ? t('kycRejectedResubmit')
              : application?.status === 'none'
                ? t('kycNotSubmittedYet')
                : t('providerAccountActive')}
        </div>

        <div className="provider-app-card provider-app-card-flat">
          <h3>{t('accountRecord')}</h3>
          <div className="provider-app-detail-list">
            <div><span>{t('name')}</span><strong>{profile?.name || t('notSet')}</strong></div>
            <div><span>{t('email')}</span><strong>{profile?.email || t('notSet')}</strong></div>
            <div><span>{t('phone')}</span><strong>{profile?.phone || t('notSet')}</strong></div>
            <div><span>{t('city')}</span><strong>{profile?.city || t('notSet')}</strong></div>
          </div>
        </div>

        <div className="provider-app-card provider-app-card-flat">
          <h3>{t('kycRecord')}</h3>
          <div className="provider-app-detail-list">
            <div><span>{t('status')}</span><strong>{statusLabelMap[application?.status || 'none'] || t('unknown')}</strong></div>
            <div><span>{t('service')}</span><strong>{application?.serviceType || t('notSubmitted')}</strong></div>
            <div><span>{t('experience')}</span><strong>{application?.experienceYears ?? 0} {t('years')}</strong></div>
            <div><span>{t('aadhaar')}</span><strong>{application?.aadhaarSubmitted ? t('submitted') : t('notSubmitted')}</strong></div>
            <div><span>{t('created')}</span><strong>{formatDate(application?.createdAt || null)}</strong></div>
            <div><span>{t('updated')}</span><strong>{formatDate(application?.updatedAt || null)}</strong></div>
          </div>
        </div>

        <div className="provider-app-button-row">
          <button
            type="button"
            className="provider-app-button provider-app-button-secondary"
            onClick={() => void loadState()}
          >
            {t('refreshStatus')}
          </button>

          {application?.status === 'none' || application?.canResubmit ? (
            <button
              type="button"
              className="provider-app-button provider-app-button-primary"
              onClick={() => navigate('/kyc', { replace: true })}
            >
              {application?.canResubmit ? t('resubmitKyc') : t('completeKyc')}
            </button>
          ) : null}

          <button
            type="button"
            className="provider-app-button provider-app-button-secondary"
            onClick={handleLogout}
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderApplicationStatusPage;
