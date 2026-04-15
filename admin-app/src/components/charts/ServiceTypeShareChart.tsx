import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export type ServiceTypeSlice = {
  service: string;
  bookings: number;
};

type Props = {
  data: ServiceTypeSlice[];
};

const COLORS = ['#1d4ed8', '#16a34a', '#f97316', '#a855f7', '#0d9488'];

const ServiceTypeShareChart = ({ data }: Props) => {
  const hasData = data.length > 0;

  return (
    <div className="h-72 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Bookings by service type</h3>
        <span className="text-xs text-slate-500">Live data</span>
      </div>

      {hasData ? (
        <div className="flex h-full items-center justify-between gap-4">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="bookings"
                nameKey="service"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.service} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1 text-xs">
            {data.map((entry, index) => (
              <div key={entry.service} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-700">{entry.service}</span>
                </div>
                <span className="font-semibold text-slate-900">{entry.bookings}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(100%-2rem)] items-center justify-center text-sm text-slate-500">
          No service-type booking split available yet.
        </div>
      )}
    </div>
  );
};

export default ServiceTypeShareChart;
