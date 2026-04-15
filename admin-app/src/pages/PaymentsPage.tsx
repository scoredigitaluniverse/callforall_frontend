import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { getOrders } from '../api/adminApi';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDateTime, normalizeOrder, toText } from '../utils/formatters';

const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPayments = async () => {
      try {
        const response = await getOrders();
        if (!isMounted) return;

        setPayments((Array.isArray(response) ? response : []).map(normalizeOrder));
      } catch (nextError) {
        if (!isMounted) return;
        setError(nextError instanceof Error ? nextError.message : 'Failed to load payments');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = payments; // later: filter by range on createdAt

    if (!query) return base;

    return base.filter((payment) =>
      [payment.id, payment.client, payment.provider, payment.paymentMethod]
        .map((value) => toText(value).toLowerCase())
        .join(' ')
        .includes(query)
    );
  }, [payments, search, range]);

  const handleExportCSV = () => {
    if (!filteredPayments.length) {
      window.alert('No payments to export for the selected filters.');
      return;
    }

    const header = ['Transaction ID', 'Client', 'Provider', 'Amount', 'Method', 'Status', 'Created at'];
    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.client,
      payment.provider,
      formatCurrency(payment.total || payment.amount),
      payment.paymentMethod,
      payment.status,
      formatDateTime(payment.createdAt),
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
    link.setAttribute('download', 'payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!filteredPayments.length) {
      window.alert('No payments to export for the selected filters.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(12);
    doc.text('Payments report', 14, 16);

    const startY = 24;
    const colX = [14, 60, 110, 150, 190, 220, 260];

    const header = ['Transaction', 'Client', 'Provider', 'Amount', 'Method', 'Status', 'Created'];
    header.forEach((text, index) => {
      doc.text(text, colX[index], startY);
    });

    let rowY = startY + 6;
    filteredPayments.forEach((payment) => {
      const row = [
        toText(payment.id),
        toText(payment.client),
        toText(payment.provider),
        formatCurrency(payment.total || payment.amount),
        toText(payment.paymentMethod),
        toText(payment.status),
        formatDateTime(payment.createdAt),
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

    doc.save('payments.pdf');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Payments Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Review completed payments and export them as CSV or PDF.
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
            placeholder="Search by transaction, client, provider, or payment method"
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : null}

              {!loading && filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No payments found.
                  </td>
                </tr>
              ) : null}

              {!loading && filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">{payment.id}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{payment.client}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{payment.provider}</td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">{formatCurrency(payment.total || payment.amount)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{payment.paymentMethod}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PaymentsPage;
