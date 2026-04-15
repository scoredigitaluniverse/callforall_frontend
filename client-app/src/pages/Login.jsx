import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';
import { requestOTP } from '../api/clientApi.js';
import { BACKEND_URL } from '../config/runtime';
import {
  getClientTempPhone,
  setClientLanguage,
  setClientTempPhone,
} from '../utils/clientStorage';

const Login = ({ lang, onLanguageChange }) => {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLang, setSelectedLang] = useState(lang || 'en');
  const navigate = useNavigate();
  const t = (key) => getTranslation(selectedLang, key);
  const isTamil = selectedLang === 'ta';

  useEffect(() => {
    const lastPhone = getClientTempPhone();

    if (lastPhone) {
      setContact(lastPhone);
    }
  }, []);

  const isPhoneValid = () => contact.length === 10 && /^\d{10}$/.test(contact);
  const isFormValid = isPhoneValid();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setClientTempPhone(contact);
    setError('');

    try {
      setLoading(true);
      const payload = { phone: '+91' + contact };

      await requestOTP(payload);
      navigate('/otp');
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value.replace(/\D/g, '').slice(0, 10));
  };

  const handleLanguageToggle = (newLang) => {
    setSelectedLang(newLang);
    setClientLanguage(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans antialiased">
      <div className="absolute inset-0 login-bg-watermark pointer-events-none" />
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 min-h-screen w-full flex">
        <div className="hidden lg:flex lg:w-[52%] p-8 xl:p-12">
          <div className="login-hero-card group w-full rounded-[32px] border border-white/30 bg-gradient-to-br from-[#0b3d91] via-[#1859b8] to-[#1d88d7] shadow-[0_28px_70px_rgba(14,56,132,0.32)] p-10 xl:p-12 text-white flex flex-col relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(255,255,255,0.22),transparent_43%),radial-gradient(circle_at_86%_85%,rgba(14,165,233,0.22),transparent_42%)] pointer-events-none" />
            <div className="absolute inset-0 login-hero-grid pointer-events-none" />
            <div className="absolute top-0 -left-1/2 h-full w-1/2 login-hero-shimmer pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <img
                src="/Photos/icons/logo.jpeg"
                alt="Call For All"
                className="h-11 w-20 object-contain rounded-lg bg-white/20 p-1"
              />
              <span className="text-xl font-semibold tracking-tight">Call For All</span>
            </div>

            <div className="relative z-10 mt-10 max-w-xl">
              <h2 className={`text-5xl font-bold leading-[1.12] ${isTamil ? 'font-tamil' : ''}`}>
                {t('heroHeadline')}
              </h2>
              <p className="mt-5 text-base leading-7 text-blue-50/90 max-w-[90%]">{t('heroSubtext')}</p>
            </div>

            <div className="relative z-10 mt-10 grid gap-3">
              <div className="rounded-2xl bg-white/12 border border-white/25 px-4 py-3 backdrop-blur-sm flex items-center gap-3 transition-all duration-300 hover:bg-white/16 hover:border-white/35">
                <ShieldCheck className="w-4 h-4 text-blue-100" />
                <p className="text-sm text-blue-50/95">Verified providers with trusted local service records.</p>
              </div>
              <div className="rounded-2xl bg-white/12 border border-white/25 px-4 py-3 backdrop-blur-sm flex items-center gap-3 transition-all duration-300 hover:bg-white/16 hover:border-white/35">
                <Zap className="w-4 h-4 text-blue-100" />
                <p className="text-sm text-blue-50/95">Fast booking confirmations and real-time updates.</p>
              </div>
              <div className="rounded-2xl bg-white/12 border border-white/25 px-4 py-3 backdrop-blur-sm flex items-center gap-3 transition-all duration-300 hover:bg-white/16 hover:border-white/35">
                <CheckCircle2 className="w-4 h-4 text-blue-100" />
                <p className="text-sm text-blue-50/95">Secure login with OTP for instant access.</p>
              </div>
            </div>

            <div className="relative z-10 mt-auto grid grid-cols-3 gap-3 pt-8">
              <div className="rounded-2xl bg-white/12 border border-white/25 p-4 transition-all duration-300 hover:bg-white/18 hover:-translate-y-0.5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-blue-100/80">Avg Response</p>
                <p className="mt-2 text-[2rem] font-bold leading-none">18m</p>
              </div>
              <div className="rounded-2xl bg-white/12 border border-white/25 p-4 transition-all duration-300 hover:bg-white/18 hover:-translate-y-0.5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-blue-100/80">Cities</p>
                <p className="mt-2 text-[2rem] font-bold leading-none">2+</p>
              </div>
              <div className="rounded-2xl bg-white/12 border border-white/25 p-4 transition-all duration-300 hover:bg-white/18 hover:-translate-y-0.5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-blue-100/80">Bookings</p>
                <p className="mt-2 text-[2rem] font-bold leading-none">12k+</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[48%] flex flex-col relative">
          <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8">
            <div className="w-full max-w-[470px] rounded-[30px] border border-slate-200 bg-white/90 backdrop-blur-sm shadow-[0_22px_55px_rgba(15,23,42,0.12)] p-6 sm:p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold tracking-[0.14em] uppercase text-slate-400">Secure Login</p>
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleLanguageToggle('en')}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        selectedLang === 'en'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('english') || 'English'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageToggle('ta')}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        selectedLang === 'ta'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('tamil') || 'Tamil'}
                    </button>
                  </div>
                </div>

                <h1 className={`text-3xl sm:text-4xl font-bold text-slate-900 mt-5 leading-tight ${isTamil ? 'font-tamil' : ''}`}>
                  {t('welcomeBack')}
                </h1>
                <p className="mt-3 text-sm text-slate-500 leading-6">
                  {t('loginSubtext') || 'Log in to manage your account and access your dashboard.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.08em]">
                    {t('phoneLabel') || 'Mobile Number'}
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-semibold border-r border-slate-200 pr-3">
                      +91
                    </div>

                    <input
                      type="tel"
                      value={contact}
                      onChange={handleContactChange}
                      placeholder={t('enterYourMobileNumber') || 'Enter your mobile number'}
                      maxLength={10}
                      className="block w-full pl-[74px] pr-4 py-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-base transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 placeholder:text-slate-300"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-500" />
                    {t('smsRates')}
                  </p>

                  {error && (
                    <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className={`w-full py-3.5 px-6 text-base font-semibold rounded-xl shadow-sm transition-colors ${
                    !loading && isFormValid
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {loading
                    ? (t('requestingOtp') || 'Requesting OTP...')
                    : (t('sendOtpToPhone') || 'Send OTP')}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-4 bg-white text-slate-400 font-bold tracking-widest">{t('or')}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-slate-300 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
                onClick={() => {
                  window.location.href = `${BACKEND_URL}/auth/google`;
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t('signInWithGoogle')}
              </button>
            </div>
          </div>

          <div className="p-6 flex justify-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-700 transition-colors">{t('privacy')}</a>
            <a href="#" className="hover:text-slate-700 transition-colors">{t('terms')}</a>
            <a href="#" className="hover:text-slate-700 transition-colors">{t('help')}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
