import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { getOrders } from '../api/adminApi';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, normalizeOrder, toText } from '../utils/formatters';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const response = await getOrders();
        if (!isMounted) return;

        setBookings((Array.isArray(response) ? response : []).map(normalizeOrder));
      } catch (nextError) {
        if (!isMounted) return;
        setError(nextError instanceof Error ? nextError.message : 'Failed to load bookings');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = bookings; // later: filter by range on createdAt

    if (!query) return base;

    return base.filter((booking) =>
      [booking.id, booking.client, booking.provider, booking.service]
        .map((value) => toText(value).toLowerCase())
        .join(' ')
        .includes(query)
    );
  }, [bookings, search, range]);

  const handleExportCSV = () => {
    if (!filteredBookings.length) {
      window.alert('No bookings to export for the selected filters.');
      return;
    }

    const header = ['Booking ID', 'Client', 'Provider', 'Service', 'Status', 'Created at'];
    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.client,
      booking.provider,
      booking.service,
      booking.status,
      formatDateTime(booking.createdAt),
    ]);

    const csvContent = [header, ...rows]
      .map((columns) =>
        columns
          .map((value) => {
            const text = toText(value).replace(/"/g, '""');
            return `"${text}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!filteredBookings.length) {
      window.alert('No bookings to export for the selected filters.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(12);
    doc.text('Bookings report', 14, 16);

    const startY = 24;
    const colX = [14, 60, 110, 160, 200, 240];

    const header = ['Booking', 'Client', 'Provider', 'Service', 'Status', 'Created'];
    header.forEach((text, index) => {
      doc.text(text, colX[index], startY);
    });

    let rowY = startY + 6;
    filteredBookings.forEach((booking) => {
      const row = [
        toText(booking.id),
        toText(booking.client),
        toText(booking.provider),
        toText(booking.service),
        toText(booking.status),
        formatDateTime(booking.createdAt),
      ];

      row.forEach((text, index) => {
        doc.text(String(text).slice(0, 24), colX[index], rowY);
      });

      rowY += 6;
      if (rowY > 190) {
        doc.addPage();
        rowY = 20;
      }
    });

    doc.save('bookings.pdf');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bookings Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Filter recent bookings and export them as CSV or PDF.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span>Time period</span>
              <select
                value={range}
                onChange={(event) => setRange(event.target.value as '7d' | '30d' | 'all')}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary-600"
            placeholder="Search by booking, client, provider, or service"
          />
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Booking</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : null}

              {!loading && filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              ) : null}

              {!loading && filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">{booking.id}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    <div>{booking.client}</div>
                    <div className="text-xs text-slate-500">{booking.clientPhone}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{booking.provider}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{booking.service}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(booking.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BookingsPage;
