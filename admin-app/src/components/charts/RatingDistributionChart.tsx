import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type RatingBucket = {
  label: string;
  count: number;
};

type Props = {
  data: RatingBucket[];
};

const RatingDistributionChart = ({ data }: Props) => {
  const hasData = data.some((bucket) => bucket.count > 0);

  return (
    <div className="h-72 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Rating distribution</h3>
        <span className="text-xs text-slate-500">Live data</span>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[calc(100%-2rem)] items-center justify-center text-sm text-slate-500">
          No ratings available yet.
        </div>
      )}
    </div>
  );
};

export default RatingDistributionChart;
