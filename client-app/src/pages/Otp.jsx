import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { getMe, verifyOTP } from '../api/clientApi';
import { getTranslation } from '../i18n/translations';
import {
  clearClientSession,
  clearClientTempTargets,
  getClientTempEmail,
  getClientTempPhone,
  setClientAuthenticated,
  setStoredClientUser,
  setClientToken,
} from '../utils/clientStorage';

const Otp = ({ lang }) => {
  const [target, setTarget] = useState('');
  const [targetType, setTargetType] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);
  const isTamil = lang === 'ta';

  useEffect(() => {
    const tempMobile = getClientTempPhone();
    const tempEmail = getClientTempEmail();

    if (!tempMobile && !tempEmail) {
      navigate('/login', { replace: true });
      return;
    }

    if (tempMobile) {
      setTarget(tempMobile);
      setTargetType('phone');
    }

    if (tempEmail) {
      setTarget(tempEmail);
      setTargetType('email');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    try {
      const payload = targetType === 'phone'
        ? { phone: `+91${String(target || '').trim()}`, otp: otp.trim() }
        : { email: String(target || '').trim().toLowerCase(), otp: otp.trim() };

      const res = await verifyOTP(payload);

      setClientToken(res.token);
      setClientAuthenticated(true);
      clearClientTempTargets();
      const me = await getMe();
      setStoredClientUser(me);
      const accountStatus = String(me?.accountStatus || me?.account_status || 'active')
        .trim()
        .toLowerCase();

      if (accountStatus !== 'active') {
        navigate('/profile?status=1', { replace: true });
        return;
      }

      navigate(me?.profile_completed ? '/' : '/profile?complete=1', { replace: true });
    } catch (err) {
      clearClientSession();
      console.error(err);
      alert(err?.response?.data?.error || err?.response?.data?.message || 'Invalid or expired OTP');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-secondary-600" />
          </div>
          <h1 className={`text-2xl font-bold text-foreground mb-2 ${isTamil ? 'font-tamil' : ''}`}>
            {t('verifyOtp')}
          </h1>
          <p className={`text-muted-foreground ${isTamil ? 'font-tamil' : ''}`}>
            {t('otpSentTo')}{' '}
            {targetType === 'phone' ? '+91 ' + target : target}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-3 ${isTamil ? 'font-tamil' : ''}`}>
              {t('enterOtp')}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="input-field text-center text-3xl tracking-[1rem] py-5 font-bold"
              maxLength={6}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={otp.length !== 6}
            className={`btn-primary w-full ${isTamil ? 'font-tamil' : ''} ${otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {t('verify')}
          </button>

          <button
            type="button"
            className={`w-full text-primary-600 font-medium ${isTamil ? 'font-tamil' : ''}`}
          >
            {t('resendOtp')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Otp;
