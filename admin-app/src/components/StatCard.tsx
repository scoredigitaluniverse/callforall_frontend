import { type LucideIcon } from 'lucide-react';

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}) => {
  const colorClass = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${colorClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>

        <div className="rounded-xl bg-white/70 p-3">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
