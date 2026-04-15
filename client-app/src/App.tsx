import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { getMe } from './api/clientApi';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import Otp from './pages/Otp';
import Profile from './pages/Profile';
import ServiceCategoryPage from './pages/ServiceCategoryPage';
import ServicePage from './pages/ServicePage';
import {
  clearClientSession,
  getClientLanguage,
  getClientToken,
  isClientAuthenticated,
  setClientAuthenticated,
  setClientLanguage,
  setStoredClientUser,
  setClientToken,
} from './utils/clientStorage';

const OAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      clearClientSession();
      navigate('/login', { replace: true });
      return;
    }

    setClientToken(token);
    setClientAuthenticated(true);

    const finishOAuthLogin = async () => {
      try {
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
      } catch (error) {
        console.error('oauth login sync error', error);
        clearClientSession();
        navigate('/login', { replace: true });
      }
    };

    void finishOAuthLogin();
  }, [navigate]);

  return <div className="flex min-h-screen items-center justify-center">Logging you in...</div>;
};

function App() {
  const [language, setLanguageState] = useState(() => getClientLanguage());

  const handleLanguageSelect = (lang: string) => {
    setClientLanguage(lang);
    setLanguageState(lang);
  };

  const loginElement =
    getClientToken() && isClientAuthenticated() ? (
      <Navigate to="/" replace />
    ) : (
      <Login lang={language} onLanguageChange={handleLanguageSelect} />
    );

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ServicePage lang={language} />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={loginElement} />
        <Route path="/otp" element={<Otp lang={language} />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile lang={language} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category/:id"
          element={
            <ProtectedRoute>
              <ServiceCategoryPage lang={language} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings lang={language} />
            </ProtectedRoute>
          }
        />
        <Route path="/oauth-success" element={<OAuthRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
