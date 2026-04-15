import { Navigate, useLocation } from 'react-router-dom';
import {
  getClientToken,
  getStoredClientUser,
  isClientAuthenticated,
} from '../utils/clientStorage';

const ProtectedRoute = ({ children, isLoading = false }) => {
  const location = useLocation();
  const token = getClientToken();
  const isAuthenticated = isClientAuthenticated();
  const cachedUser = getStoredClientUser();
  const profileCompleted = Boolean(
    cachedUser?.profile_completed ?? cachedUser?.user?.profile_completed ?? true
  );
  const accountStatus = String(cachedUser?.accountStatus || cachedUser?.account_status || 'active')
    .trim()
    .toLowerCase();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!profileCompleted && location.pathname !== '/profile') {
    return <Navigate to="/profile?complete=1" replace />;
  }

  if (accountStatus !== 'active' && location.pathname !== '/profile') {
    return <Navigate to="/profile?status=1" replace />;
  }

  return children;
};

export default ProtectedRoute;
