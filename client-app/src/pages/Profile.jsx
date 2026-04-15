import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Pencil, Save, User } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { getTranslation } from '../i18n/translations';
import {
  confirmPenaltyPayment,
  createPenaltyPaymentOrder,
  getMe,
  updateMyProfile,
} from '../api/clientApi';
import { clearClientSession, setStoredClientUser } from '../utils/clientStorage';
import { loadRazorpayCheckout, openRazorpayCheckout } from '../utils/razorpayCheckout';

const Profile = ({ lang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = (key) => getTranslation(lang, key);
  const isTamil = lang === 'ta';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payingPenalty, setPayingPenalty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    pincode: '',
  });

  const forceComplete =
    new URLSearchParams(location.search).get('complete') === '1' ||
    Boolean(user && !user.profile_completed);
  const statusOnlyView = new URLSearchParams(location.search).get('status') === '1';
  const accountStatus = String(user?.accountStatus || user?.account_status || 'active')
    .trim()
    .toLowerCase();
  const penaltyAmount = Number(user?.penalty?.amountInr || 0);

  const resetForm = (profile) => {
    setForm({
      name: profile?.name || '',
      city: profile?.city || '',
      address: profile?.address || '',
      pincode: profile?.pincode || '',
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const me = await getMe();
        if (!isMounted) return;

        setUser(me);
        resetForm(me);
        setStoredClientUser(me);

        if (!me?.profile_completed) {
          setIsEditing(true);
        }
      } catch (nextError) {
        if (!isMounted) return;

        setError(nextError?.response?.data?.message || 'Failed to load profile');

        if (nextError?.response?.status === 401) {
          clearClientSession();
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (forceComplete) {
      setIsEditing(true);
    }
  }, [forceComplete]);

  const canSave = useMemo(() => {
    if (!form.name.trim() || !form.city.trim()) return false;
    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) return false;
    return true;
  }, [form]);

  const handleInputChange = (field, value) => {
    setError('');
    setSuccess('');
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLogout = () => {
    clearClientSession();
    navigate('/login', { replace: true });
  };

  const handleSave = async () => {
    if (!canSave) {
      setError('Please fill Name and City. Pincode must be 6 digits if entered.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await updateMyProfile({
        name: form.name.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
      });

      const updatedUser = response?.user || response?.data?.user || response;
      if (updatedUser) {
        setUser(updatedUser);
        resetForm(updatedUser);
        setStoredClientUser(updatedUser);
      }

      setIsEditing(false);
      setSuccess('Profile updated successfully.');

      if (forceComplete) {
        navigate('/', { replace: true });
      }
    } catch (nextError) {
      setError(nextError?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePenaltyPayment = async () => {
    try {
      setPayingPenalty(true);
      setError('');
      setSuccess('');

      const sdkReady = await loadRazorpayCheckout();
      if (!sdkReady) {
        throw new Error('Unable to load payment gateway. Please try again.');
      }

      const response = await createPenaltyPaymentOrder();
      const payment = response?.data || {};
      const order = payment?.order || null;
      const keyId = payment?.key_id || null;

      if (!keyId || !order?.id || !order?.amount || !order?.currency) {
        throw new Error('Penalty payment order is incomplete.');
      }

      const paymentResult = await openRazorpayCheckout({
        keyId,
        order,
        description: 'Client account reactivation penalty',
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          purpose: 'client_penalty_payment',
        },
      });

      await confirmPenaltyPayment({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      const refreshedUser = await getMe();
      setUser(refreshedUser);
      resetForm(refreshedUser);
      setStoredClientUser(refreshedUser);
      setSuccess('Penalty paid successfully. Your account is active again.');
      navigate('/', { replace: true });
    } catch (nextError) {
      setError(nextError?.response?.data?.message || nextError?.message || 'Penalty payment failed');
    } finally {
      setPayingPenalty(false);
    }
  };

  const handleCancelEdit = () => {
    if (forceComplete) return;

    resetForm(user || {});
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className={`min-h-screen bg-background ${forceComplete ? 'pb-6' : 'pb-20'}`}>
      <div className="border-b border-border bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <h1 className={`text-xl font-bold ${isTamil ? 'font-tamil' : ''}`}>
            {t('myProfile') || 'My Profile'}
          </h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        {forceComplete ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Complete your profile to continue using the client app.
          </div>
        ) : null}

        {accountStatus === 'suspended' ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-900">
            <p className="font-semibold">Your client account is suspended.</p>
            <p className="mt-2">
              {user?.suspensionReason ||
                'Three approved quotation cancellations without payment triggered an automatic suspension.'}
            </p>
            <p className="mt-2">
              Current penalty: <span className="font-semibold">Rs {penaltyAmount.toFixed(2)}</span>
            </p>
            <p className="mt-2">
              You can either pay the penalty now for automatic approval, or contact the admin
              team with a valid reason and wait for manual approval.
            </p>
            <button
              type="button"
              onClick={handlePenaltyPayment}
              disabled={payingPenalty}
              className="mt-4 inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {payingPenalty ? 'Processing...' : 'Pay Penalty and Reactivate'}
            </button>
          </div>
        ) : null}

        {accountStatus === 'deactivated' ? (
          <div className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-4 text-sm text-slate-800">
            <p className="font-semibold">Your client account has been deactivated.</p>
            <p className="mt-2">
              {user?.suspensionReason ||
                'Please contact the app support email and wait for admin approval before using the client app again.'}
            </p>
          </div>
        ) : null}

        <section className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-100">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user?.name || 'Client'} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-primary-600" />
              )}
            </div>

            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${isTamil ? 'font-tamil' : ''}`}>
                {user?.name || 'Client'}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email || 'No email linked'}</p>
              <p className="text-sm text-muted-foreground">{user?.phone || 'No phone linked'}</p>
            </div>

            {!forceComplete ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
              <input
                type="text"
                className="input-field"
                value={form.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                disabled={!isEditing || saving}
                placeholder="Enter your name"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">City</span>
              <input
                type="text"
                className="input-field"
                value={form.city}
                onChange={(event) => handleInputChange('city', event.target.value)}
                disabled={!isEditing || saving}
                placeholder="Enter your city"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
              <input
                type="text"
                className="input-field"
                value={form.address}
                onChange={(event) => handleInputChange('address', event.target.value)}
                disabled={!isEditing || saving}
                placeholder="House no, street, area"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Pincode</span>
              <input
                type="text"
                className="input-field"
                value={form.pincode}
                onChange={(event) =>
                  handleInputChange('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                disabled={!isEditing || saving}
                placeholder="6-digit pincode"
              />
            </label>
          </div>

          {error || success ? (
            <p className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-emerald-700'}`}>
              {error || success}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                {!forceComplete ? (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>

      {!forceComplete && !statusOnlyView ? <BottomNav lang={lang} /> : null}
    </div>
  );
};

export default Profile;
