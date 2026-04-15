import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getProviderMe } from '../api/providerApi';
import { clearProviderSession, getProviderToken, getStoredProviderProfile } from '../utils/providerStorage';

const ProviderSessionRoute = () => {
  const token = getProviderToken();
  const [isReady, setIsReady] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setIsAllowed(false);
        setIsReady(true);
        return;
      }

      const cachedProfile = getStoredProviderProfile();
      if (cachedProfile) {
        setIsAllowed(true);
        setIsReady(true);
        return;
      }

      try {
        await getProviderMe();
        setIsAllowed(true);
      } catch {
        clearProviderSession();
        setIsAllowed(false);
      } finally {
        setIsReady(true);
      }
    };

    void validateSession();
  }, [token]);

  if (!isReady) {
    return <div className="provider-app-shell provider-app-loading">Checking account...</div>;
  }

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProviderSessionRoute;
