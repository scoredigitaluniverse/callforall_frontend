import { BarChart3, CreditCard, LogOut, Package, ShieldCheck, Users, Wrench } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearAdminAuth } from '../utils/adminAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: BarChart3 },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Providers', to: '/providers', icon: Wrench },
  { label: 'Bookings', to: '/bookings', icon: Package },
  { label: 'Payments', to: '/payments', icon: CreditCard },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAdminAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary-600 p-3 text-white">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">CFA Admin</p>
                <p className="text-sm text-slate-500">Standalone Console</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Admin App</p>
                <h1 className="text-2xl font-bold text-slate-900">
                  {NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))?.label || 'Dashboard'}
                </h1>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 lg:hidden"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
