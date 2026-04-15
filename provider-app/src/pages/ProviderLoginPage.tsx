import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestProviderOTP } from '../api/providerApi';
import { setProviderLanguage } from '../i18n/translations';
import { BACKEND_URL } from '../utils/runtime';
import {
  getProviderTempEmail,
  getProviderToken,
  setProviderTempEmail,
} from '../utils/providerStorage';

const ProviderLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Keep initial login flow in English. Language switch is shown in KYC/menu.
    setProviderLanguage('en');

    if (getProviderToken()) {
      navigate('/', { replace: true });
      return;
    }

    const savedEmail = getProviderTempEmail();

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, [navigate]);

  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isEmailValid();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      window.alert('Enter a valid email address.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      setProviderTempEmail(email.trim().toLowerCase());

      await requestProviderOTP({ email: email.trim().toLowerCase() });

      navigate('/otp', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="provider-login-page">
      <div className="provider-login-card">
        <div>
          <p className="provider-app-eyebrow">Provider App</p>
          <h1>Sign in or sign up</h1>
          <p className="provider-app-muted">
            Use the same OTP flow as the client app. Existing providers go to their records, and
            new applicants continue to KYC and admin approval.
          </p>
        </div>

        <form className="provider-app-form" onSubmit={handleSubmit}>
          <label className="provider-app-label">
            Email
            <input
              className="provider-app-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="provider@example.com"
            />
          </label>

          {error ? <div className="provider-app-alert provider-app-alert-error">{error}</div> : null}

          <button
            type="submit"
            className="provider-app-button provider-app-button-primary"
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? 'Sending OTP...' : 'Continue with OTP'}
          </button>
        </form>

        <div className="provider-auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="provider-google-button"
          onClick={() => {
            window.location.href = `${BACKEND_URL}/auth/google`;
          }}
        >
          <svg className="provider-google-button-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default ProviderLoginPage;
