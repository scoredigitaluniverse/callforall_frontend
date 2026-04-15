import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getApprovedProviderProfile } from '../api/providerApi';
import {
  clearProviderSession,
  getProviderToken,
  getStoredProviderProfile,
} from '../utils/providerStorage';
import { isApprovedProviderProfile } from '../utils/providerAccess';

const ProviderAppProtectedRoute = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const token = getProviderToken();

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setIsAllowed(false);
        setIsReady(true);
        return;
      }

      const cachedProfile = getStoredProviderProfile();
      if (cachedProfile && isApprovedProviderProfile(cachedProfile)) {
        setIsAllowed(true);
        setIsReady(true);
        return;
      }

      try {
        const profile = await getApprovedProviderProfile();
        setIsAllowed(isApprovedProviderProfile(profile));
      } catch {
        setIsAllowed(false);
      } finally {
        setIsReady(true);
      }
    };

    void validateSession();
  }, [token]);

  if (!isReady) {
    return <div className="provider-app-shell provider-app-loading">Checking provider access...</div>;
  }

  if (!isAllowed) {
    if (!token) {
      clearProviderSession();
      return <Navigate to="/login" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProviderAppProtectedRoute;
