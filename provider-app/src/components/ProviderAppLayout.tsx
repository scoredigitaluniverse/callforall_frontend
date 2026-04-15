import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { providerT } from '../i18n/translations';
import {
  clearProviderSession,
  getStoredProviderProfile,
} from '../utils/providerStorage';

const links = [
  { to: '/dashboard', labelKey: 'dashboard' },
  { to: '/requests', labelKey: 'requests' },
  { to: '/active', labelKey: 'activeJob' },
  { to: '/quotation', labelKey: 'quotation' },
  { to: '/language', labelKey: 'language' },
] as const;

const ProviderAppLayout = () => {
  const navigate = useNavigate();
  const profile = getStoredProviderProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = providerT;

  const handleLogout = () => {
    clearProviderSession();
    navigate('/login', { replace: true });
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <div className="provider-app-shell">
      <aside className="provider-app-sidebar">
        <div className="provider-app-mobile-topbar">
          <button
            type="button"
            className="provider-app-menu-toggle"
            onClick={handleMenuToggle}
            aria-expanded={menuOpen}
            aria-controls="provider-app-menu"
          >
            {t('menu')}
          </button>

          <div className="provider-app-brand">
            <span className="provider-app-brand-mark">P</span>
            <div>
              <h1>{t('providerApp')}</h1>
              <p>{profile?.name || profile?.email || t('serviceProvider')}</p>
            </div>
          </div>
        </div>

        <div
          id="provider-app-menu"
          className={`provider-app-sidebar-collapsible ${menuOpen ? 'provider-app-sidebar-collapsible-open' : ''}`}
        >
          <nav className="provider-app-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleMenuClose}
              className={({ isActive }) =>
                `provider-app-nav-link ${isActive ? 'provider-app-nav-link-active' : ''}`
              }
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
          </nav>

          <button
            type="button"
            className="provider-app-button provider-app-button-secondary"
            onClick={handleLogout}
          >
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="provider-app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default ProviderAppLayout;
