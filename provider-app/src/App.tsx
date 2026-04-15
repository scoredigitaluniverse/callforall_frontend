import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { getProviderApplication, getProviderMe } from './api/providerApi';
import ProviderAppLayout from './components/ProviderAppLayout';
import ProviderAppProtectedRoute from './components/ProviderAppProtectedRoute';
import ProviderSessionRoute from './components/ProviderSessionRoute';
import ProviderActiveJobPage from './pages/ProviderActiveJobPage';
import ProviderApplicationStatusPage from './pages/ProviderApplicationStatusPage';
import ProviderBookingRequestsPage from './pages/ProviderBookingRequestsPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import ProviderKycPage from './pages/ProviderKycPage';
import ProviderLanguagePage from './pages/ProviderLanguagePage';
import ProviderLoginPage from './pages/ProviderLoginPage';
import ProviderOtpPage from './pages/ProviderOtpPage';
import ProviderQuotationPage from './pages/ProviderQuotationPage';
import { getProviderLandingPath } from './utils/providerAccess';
import { clearProviderSession, getProviderToken, setProviderToken } from './utils/providerStorage';

const ProviderHomeRedirect = () => {
  const token = getProviderToken();
  const [target, setTarget] = useState<string | null>(token ? null : '/login');

  useEffect(() => {
    const resolveTarget = async () => {
      if (!token) {
        setTarget('/login');
        return;
      }

      try {
        const profile = await getProviderMe();
        const application = await getProviderApplication();
        setTarget(getProviderLandingPath({ profile, application }));
      } catch {
        clearProviderSession();
        setTarget('/login');
      }
    };

    void resolveTarget();
  }, [token]);

  if (!target) {
    return <div className="provider-app-shell provider-app-loading">Loading your account...</div>;
  }

  return <Navigate to={target} replace />;
};

const ProviderOAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      clearProviderSession();
      navigate('/login', { replace: true });
      return;
    }

    setProviderToken(token);

    const finishOAuthLogin = async () => {
      try {
        const profile = await getProviderMe();
        const application = await getProviderApplication();
        navigate(getProviderLandingPath({ profile, application }), { replace: true });
      } catch (error) {
        console.error('provider oauth login sync error', error);
        clearProviderSession();
        navigate('/login', { replace: true });
      }
    };

    void finishOAuthLogin();
  }, [navigate]);

  return <div className="provider-app-shell provider-app-loading">Logging you in...</div>;
};

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <Routes>
      <Route path="/" element={<ProviderHomeRedirect />} />
      <Route path="/login" element={<ProviderLoginPage />} />
      <Route path="/otp" element={<ProviderOtpPage />} />
      <Route path="/oauth-success" element={<ProviderOAuthRedirect />} />

      <Route element={<ProviderSessionRoute />}>
        <Route path="/kyc" element={<ProviderKycPage />} />
        <Route path="/status" element={<ProviderApplicationStatusPage />} />
      </Route>

      <Route element={<ProviderAppProtectedRoute />}>
        <Route element={<ProviderAppLayout />}>
          <Route path="/dashboard" element={<ProviderDashboardPage />} />
          <Route path="/requests" element={<ProviderBookingRequestsPage />} />
          <Route path="/active" element={<ProviderActiveJobPage />} />
          <Route path="/quotation" element={<ProviderQuotationPage />} />
          <Route path="/language" element={<ProviderLanguagePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
