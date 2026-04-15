import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTranslation } from '../i18n/translations';

const BottomNav = ({ lang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = (key) => getTranslation(lang, key);
  const isTamil = lang === 'ta';

  const navItems = [
    { icon: WorkIcon, label: t('services'), path: '/' },
    { icon: HomeIcon, label: t('bookings') || 'Bookings', path: '/bookings' },
    { icon: PersonIcon, label: t('profile'), path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
      <div className="w-full max-w-7xl mx-auto flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === '/' && location.pathname.startsWith('/category/'));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? 'text-primary-600' : 'text-muted-foreground'
              }`}
            >
              <Icon fontSize="medium" color={isActive ? 'primary' : 'action'} />
              <span className={`text-xs font-medium ${isTamil ? 'font-tamil' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
