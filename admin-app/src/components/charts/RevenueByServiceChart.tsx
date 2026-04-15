import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type RevenueByServicePoint = {
  service: string;
  revenue: number;
};

type Props = {
  data: RevenueByServicePoint[];
};

const RevenueByServiceChart = ({ data }: Props) => {
  const hasData = data.some((item) => item.revenue > 0);

  return (
    <div className="h-72 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Revenue by service</h3>
        <span className="text-xs text-slate-500">Live data</span>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="service" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={56} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => [`INR ${value.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[calc(100%-2rem)] items-center justify-center text-sm text-slate-500">
          No revenue recorded yet.
        </div>
      )}
    </div>
  );
};

export default RevenueByServiceChart;
