const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-orange-100 text-orange-700',
  deactivated: 'bg-slate-200 text-slate-700',
  pending: 'bg-amber-100 text-amber-700',
  due: 'bg-orange-100 text-orange-700',
  order_created: 'bg-blue-100 text-blue-700',
  waived: 'bg-slate-100 text-slate-700',
  requested: 'bg-amber-100 text-amber-700',
  created: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  on_the_way: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-violet-100 text-violet-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = String(status || 'unknown').trim().toLowerCase();
  const className = STATUS_COLORS[normalizedStatus] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {normalizedStatus.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
