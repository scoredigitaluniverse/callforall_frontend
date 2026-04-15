import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProviderApplication,
  getProviderMe,
  verifyProviderOTP,
} from '../api/providerApi';
import { setProviderLanguage } from '../i18n/translations';
import { getProviderLandingPath } from '../utils/providerAccess';
import {
  clearProviderSession,
  clearProviderTempTargets,
  getProviderTempEmail,
  getProviderToken,
} from '../utils/providerStorage';

const ProviderOtpPage = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProviderLanguage('en');

    if (getProviderToken()) {
      navigate('/', { replace: true });
      return;
    }

    const email = getProviderTempEmail();

    if (!email) {
      navigate('/login', { replace: true });
      return;
    }

    setTarget(email);
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.trim().length !== 6) {
      window.alert('Enter the 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyProviderOTP({ email: target.trim().toLowerCase(), otp: otp.trim() });

      const profile = await getProviderMe();
      const application = await getProviderApplication();
      navigate(getProviderLandingPath({ profile, application }), { replace: true });
    } catch (error) {
      clearProviderSession();
      clearProviderTempTargets();
      window.alert(error instanceof Error ? error.message : 'Invalid or expired OTP.');
      navigate('/login', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="provider-login-page">
      <div className="provider-login-card">
        <div>
          <p className="provider-app-eyebrow">Provider App</p>
          <h1>Verify OTP</h1>
          <p className="provider-app-muted">
            We sent a 6-digit OTP to {target}.
          </p>
        </div>

        <form className="provider-app-form" onSubmit={handleSubmit}>
          <label className="provider-app-label">
            OTP
            <input
              className="provider-app-input provider-app-input-otp"
              type="tel"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              autoFocus
            />
          </label>

          <button
            type="submit"
            className="provider-app-button provider-app-button-primary"
            disabled={isSubmitting || otp.length !== 6}
          >
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProviderOtpPage;
