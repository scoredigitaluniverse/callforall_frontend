import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/adminAuth';

const ProtectedRoute = () => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
