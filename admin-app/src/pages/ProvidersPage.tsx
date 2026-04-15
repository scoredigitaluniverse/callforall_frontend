import { useEffect, useMemo, useState } from 'react';
import { approveProvider, getPendingProviders, getProviders, rejectProvider } from '../api/adminApi';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, normalizePendingProvider, normalizeProvider } from '../utils/formatters';

const ProvidersPage = () => {
  const [tab, setTab] = useState<'pending' | 'active'>('pending');
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadProviders = async () => {
    setLoading(true);
    setError('');

    try {
      const [pendingResponse, providersResponse] = await Promise.all([
        getPendingProviders(),
        getProviders(),
      ]);

      setPendingProviders(
        (Array.isArray(pendingResponse) ? pendingResponse : []).map(normalizePendingProvider)
      );
      setProviders(
        (Array.isArray(providersResponse) ? providersResponse : []).map(normalizeProvider)
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProviders();
  }, []);

  const activeList = useMemo(
    () => (tab === 'pending' ? pendingProviders : providers),
    [pendingProviders, providers, tab]
  );

  const handleApprove = async (providerId: string) => {
    setActionId(providerId);
    try {
      await approveProvider(providerId);
      await loadProviders();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to approve provider');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (providerId: string) => {
    setActionId(providerId);
    try {
      await rejectProvider(providerId);
      await loadProviders();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to reject provider');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Providers Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Reused the existing provider approval flow and active provider listing endpoints.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('pending')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                tab === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Pending ({pendingProviders.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('active')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                tab === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Active ({providers.length})
            </button>
          </div>
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading providers...
                  </td>
                </tr>
              ) : null}

              {!loading && activeList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No providers found for this view.
                  </td>
                </tr>
              ) : null}

              {!loading && activeList.map((provider) => (
                <tr key={provider.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">{provider.name}</div>
                    {tab === 'active' ? (
                      <div className="text-xs text-slate-500">
                        Rating {provider.rating.toFixed(1)} ({provider.totalRatings})
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Experience {provider.experienceYears} years
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    <div>{provider.email}</div>
                    <div>{provider.phone}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{provider.serviceType}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{provider.city}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={tab === 'pending' ? provider.status : provider.isVerified ? 'approved' : 'pending'} />
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(provider.createdAt)}</td>
                  <td className="px-4 py-4 text-right">
                    {tab === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(provider.id)}
                          disabled={actionId === provider.id}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {actionId === provider.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(provider.id)}
                          disabled={actionId === provider.id}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {actionId === provider.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Reused active provider listing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ProvidersPage;
