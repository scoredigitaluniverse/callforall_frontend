import { useEffect, useMemo, useState } from 'react';
import {
  deactivateUser,
  getUsers,
  reactivateUser,
  suspendUser,
} from '../api/adminApi';
import StatusBadge from '../components/StatusBadge';
import {
  formatCurrency,
  formatDateTime,
  normalizeUser,
} from '../utils/formatters';

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUsers();
      setUsers((Array.isArray(response) ? response : []).map(normalizeUser));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.phone,
        user.city,
        user.role,
        user.accountStatus,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search, users]);

  const handleSuspend = async (userId: string) => {
    const reason =
      window.prompt(
        'Reason for suspension',
        'Suspended by admin after policy review.'
      ) || '';
    const penaltyInput = window.prompt('Penalty amount in INR', '250') || '250';
    const penaltyAmount = Number(penaltyInput);

    if (!Number.isFinite(penaltyAmount) || penaltyAmount < 0) {
      setError('Penalty amount must be a valid number.');
      return;
    }

    setActionId(userId);
    setError('');

    try {
      await suspendUser({
        userId,
        reason,
        penaltyAmount,
      });
      await loadUsers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to suspend user');
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    const reason =
      window.prompt('Reason for deactivation', 'Deactivated by admin.') || '';

    setActionId(userId);
    setError('');

    try {
      await deactivateUser({
        userId,
        reason,
      });
      await loadUsers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to deactivate user');
    } finally {
      setActionId(null);
    }
  };

  const handleReactivate = async (userId: string) => {
    const reason =
      window.prompt(
        'Approval note',
        'Reactivated by admin after reviewing the client explanation.'
      ) || '';

    setActionId(userId);
    setError('');

    try {
      await reactivateUser({
        userId,
        reason,
      });
      await loadUsers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to reactivate user');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Users Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Super admin can review client records, suspend repeated unpaid cancellers,
              deactivate accounts, or approve them again after review.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone, city, role, or status"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-600 lg:max-w-md"
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Penalty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : null}

              {!loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : null}

              {!loading &&
                filteredUsers.map((user) => {
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.city}</div>
                        {user.suspensionReason ? (
                          <div className="mt-1 text-xs text-orange-700">{user.suspensionReason}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div>{user.email}</div>
                        <div>{user.phone}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{user.role}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <StatusBadge status={user.accountStatus} />
                          <div className="text-xs text-slate-500">
                            Strikes: {user.cancellationStrikes}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div>{formatCurrency(user.penaltyAmount)}</div>
                        <div className="mt-1">
                          <StatusBadge status={user.penaltyStatus} />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{user.totalBookings}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isAdmin ? (
                          <span className="text-xs text-slate-500">Protected admin account</span>
                        ) : user.accountStatus === 'active' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleSuspend(user.id)}
                              disabled={actionId === user.id}
                              className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                            >
                              {actionId === user.id ? 'Processing...' : 'Suspend'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeactivate(user.id)}
                              disabled={actionId === user.id}
                              className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                              {actionId === user.id ? 'Processing...' : 'Deactivate'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleReactivate(user.id)}
                              disabled={actionId === user.id}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {actionId === user.id ? 'Processing...' : 'Approve / Reactivate'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
