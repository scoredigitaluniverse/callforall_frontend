import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type BookingsOverTimePoint = {
  label: string;
  total: number;
};

type Props = {
  data: BookingsOverTimePoint[];
};

const BookingsOverTimeChart = ({ data }: Props) => {
  const hasData = data.length > 0;

  return (
    <div className="h-72 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Bookings over time</h3>
        <span className="text-xs text-slate-500">Live data</span>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip cursor={{ stroke: '#0f172a', strokeWidth: 1, opacity: 0.08 }} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#1d4ed8"
              fill="#bfdbfe"
              strokeWidth={2}
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[calc(100%-2rem)] items-center justify-center text-sm text-slate-500">
          No bookings yet for the selected period.
        </div>
      )}
    </div>
  );
};

export default BookingsOverTimeChart;
