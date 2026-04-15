import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type BookingsByCityPoint = {
  city: string;
  bookings: number;
};

type Props = {
  data: BookingsByCityPoint[];
};

const BookingsByCityChart = ({ data }: Props) => (
  <div className="h-72 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">Bookings by city</h3>
      <span className="text-xs text-slate-500">Sample regional split</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 40, right: 10, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis dataKey="city" type="category" tickLine={false} axisLine={false} width={80} />
        <Tooltip />
        <Bar dataKey="bookings" fill="#0f766e" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default BookingsByCityChart;
