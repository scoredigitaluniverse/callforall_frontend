import FlashOnIcon from '@mui/icons-material/FlashOn';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ConstructionIcon from '@mui/icons-material/Construction';

const iconMap = {
  Zap: FlashOnIcon,
  Droplet: WaterDropIcon,
  Hammer: ConstructionIcon,
};

const ServiceCard = ({ service, lang }) => {
  const Icon = iconMap[service.icon];

  return (
    <div className="flex-shrink-0 w-36 cursor-pointer group">
      <div className="relative overflow-hidden rounded-xl shadow-card group-hover:shadow-lg transition-shadow">
        <img src={service.image} alt={service.name[lang]} className="w-full h-32 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
          <div className="flex items-center gap-2 text-white">
            <Icon fontSize="small" />
            <span className={`text-sm font-semibold ${lang === 'ta' ? 'font-tamil' : ''}`}>
              {service.name[lang]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
