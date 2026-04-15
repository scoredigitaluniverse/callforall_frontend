import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import RoomIcon from '@mui/icons-material/Room';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearClientSession,
  getClientSelectedCity,
  getStoredClientUser,
  setClientSelectedCity,
} from '../utils/clientStorage';

const CITY_OPTIONS = [
  { value: 'sivakasi', label: 'Sivakasi' },
  { value: 'virudhunagar', label: 'Virudhunagar' },
];

const getCityLabel = (cityKey) =>
  CITY_OPTIONS.find((item) => item.value === cityKey)?.label || 'Select City';

const isActivePath = (pathname, path) => {
  if (path === '/') {
    return pathname === '/' || pathname.startsWith('/category/');
  }

  return pathname === path;
};

const Navigation = ({ onSelectCity, overrideCity }) => {
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredClientUser());

  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsCityMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    const syncUser = () => setUser(getStoredClientUser());

    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  const selectedCity = overrideCity || getClientSelectedCity() || 'sivakasi';
  const displayName = user?.name || user?.email || user?.phone || 'Client';
  const avatarUrl = user?.avatar_url || '';

  const closeMenus = () => {
    setIsCityMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    closeMenus();
    navigate(path);
  };

  const handleLogout = () => {
    clearClientSession();
    closeMenus();
    navigate('/login', { replace: true });
  };

  const handleCitySelect = (cityKey) => {
    setClientSelectedCity(cityKey);
    setIsCityMenuOpen(false);
    if (typeof onSelectCity === 'function') {
      onSelectCity(cityKey);
    }
  };

  const navItems = [
    { label: 'Services', path: '/', icon: HomeIcon },
    { label: 'Bookings', path: '/bookings', icon: HistoryIcon },
  ];

  return (
    <header className="sticky top-0 z-[1100] border-b border-border bg-white" ref={navRef}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/Photos/icons/logo.jpeg"
            alt="Call For All"
            className="h-14 w-24 rounded-lg object-contain"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCityMenuOpen((current) => !current)}
              className="flex items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2"
            >
              <RoomIcon fontSize="small" style={{ color: overrideCity ? '#dc2626' : '#9ca3af' }} />
              <span className="text-sm font-medium">{getCityLabel(selectedCity)}</span>
              <ExpandMoreIcon fontSize="small" />
            </button>

            {isCityMenuOpen ? (
              <div className="absolute left-0 z-[1200] mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {CITY_OPTIONS.map((city) => (
                  <button
                    key={city.value}
                    type="button"
                    onClick={() => handleCitySelect(city.value)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavigate(item.path)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActivePath(location.pathname, item.path)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <MenuIcon fontSize="medium" />
            </button>

            {isMobileMenuOpen ? (
              <div className="absolute right-0 z-[1200] mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <item.icon fontSize="small" />
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNavigate('/profile')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <PersonIcon fontSize="small" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>

          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <PersonIcon fontSize="medium" />
              )}
            </button>

            {isProfileMenuOpen ? (
              <div className="absolute right-0 z-[1200] mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="border-b border-slate-200 pb-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email || user?.phone || 'Client account'}
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/profile')}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <PersonIcon fontSize="small" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/bookings')}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <HistoryIcon fontSize="small" />
                    Bookings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogoutIcon fontSize="small" />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
