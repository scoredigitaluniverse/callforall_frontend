import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import LoginPage from './pages/LoginPage';
import PaymentsPage from './pages/PaymentsPage';
import ProvidersPage from './pages/ProvidersPage';
import UsersPage from './pages/UsersPage';
import { isAdminAuthenticated } from './utils/adminAuth';

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAdminAuthenticated() ? '/dashboard' : '/login'}
            replace
          />
        }
      />

      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
