import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Navigation from '../components/Navigation';
import {
  approveBookingQuotation,
  cancelApprovedBooking,
  confirmBookingCompletion,
  confirmClientBookingPayment,
  createClientBookingPaymentOrder,
  createClientBookingRating,
  getMe,
  getBookingQuotation,
  getMyAppointments,
  rejectBookingQuotation,
} from '../api/clientApi';
import { loadRazorpayCheckout, openRazorpayCheckout } from '../utils/razorpayCheckout';
import { getStoredClientUser, setStoredClientUser } from '../utils/clientStorage';

const ACTIVE_BOOKING_STATUSES = new Set([
  'requested',
  'accepted',
  'on_the_way',
  'in_progress',
  'completed',
]);

const QUOTATION_RELEVANT_STATUSES = new Set([
  'accepted',
  'on_the_way',
  'in_progress',
  'completed',
  'paid',
]);

const STATUS_CLASS_MAP = {
  requested: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  on_the_way: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-violet-100 text-violet-700',
  completed: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-700',
};

const toDisplayDate = (value) => {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleString();
};

const toCurrency = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 'Rs 0';
  return `Rs ${numericValue.toFixed(2)}`;
};

const getQuotationAmounts = (quotation) => {
  const workAmount = Number(quotation?.workAmount ?? quotation?.amount ?? 0);
  const basicPay = Number(quotation?.basicPay ?? 0);
  const totalAmount = Number(quotation?.totalAmount ?? workAmount + basicPay);

  return {
    workAmount: Number.isFinite(workAmount) ? workAmount : 0,
    basicPay: Number.isFinite(basicPay) ? basicPay : 0,
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
  };
};

const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

const extractErrorMessage = (error) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.code ||
      error.message
    );
  }

  return error instanceof Error ? error.message : 'Something went wrong';
};

const readCachedUser = () => getStoredClientUser();

const toCheckoutOrder = (payment) => {
  if (payment?.order?.id && payment?.order?.amount && payment?.order?.currency) {
    return payment.order;
  }

  if (!payment?.orderId) {
    return null;
  }

  const amountInPaise = Math.round(Number(payment.amount || 0) * 100);
  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    return null;
  }

  return {
    id: payment.orderId,
    amount: amountInPaise,
    currency: payment.currency || 'INR',
  };
};

const Bookings = ({ lang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const highlightedBookingId = location.state?.bookingId
    ? String(location.state.bookingId)
    : null;

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [quotationByBookingId, setQuotationByBookingId] = useState({});
  const [actionState, setActionState] = useState(null);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [ratedBookingIds, setRatedBookingIds] = useState({});

  async function loadBookings() {
    try {
      setLoading(true);
      setError('');

      const response = await getMyAppointments();
      const items = Array.isArray(response?.data) ? response.data : [];
      setAppointments(items);
    } catch (nextError) {
      setError(extractErrorMessage(nextError));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadQuotation(bookingId) {
    if (!bookingId) return;

    setQuotationByBookingId((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        loading: true,
        error: '',
      },
    }));

    try {
      const response = await getBookingQuotation(bookingId);
      setQuotationByBookingId((current) => ({
        ...current,
        [bookingId]: {
          loading: false,
          notFound: false,
          error: '',
          data: response?.data || null,
        },
      }));
    } catch (nextError) {
      const notFound = axios.isAxiosError(nextError) && nextError.response?.status === 404;

      setQuotationByBookingId((current) => ({
        ...current,
        [bookingId]: {
          loading: false,
          notFound,
          error: notFound ? '' : extractErrorMessage(nextError),
          data: null,
        },
      }));
    }
  }

  async function refreshBookingState(bookingId) {
    await loadBookings();

    if (bookingId) {
      await loadQuotation(bookingId);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  useEffect(() => {
    const missingBookingIds = appointments
      .filter((appointment) => QUOTATION_RELEVANT_STATUSES.has(normalizeText(appointment.status)))
      .map((appointment) => String(appointment.id))
      .filter((bookingId) => quotationByBookingId[bookingId] === undefined);

    missingBookingIds.forEach((bookingId) => {
      void loadQuotation(bookingId);
    });
  }, [appointments, quotationByBookingId]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const active = appointments.filter((item) => ACTIVE_BOOKING_STATUSES.has(normalizeText(item.status))).length;
    const paid = appointments.filter((item) => normalizeText(item.status) === 'paid').length;

    return {
      total,
      active,
      paid,
    };
  }, [appointments]);

  const isActionRunning = (bookingId, type) =>
    actionState?.bookingId === bookingId && actionState?.type === type;

  const updateRatingDraft = (bookingId, field, value) => {
    setRatingDrafts((current) => ({
      ...current,
      [bookingId]: {
        rating: current[bookingId]?.rating || '5',
        review: current[bookingId]?.review || '',
        [field]: value,
      },
    }));
  };

  const handleApproveQuotation = async (bookingId) => {
    setActionState({
      bookingId,
      type: 'approveQuotation',
    });

    try {
      await approveBookingQuotation(bookingId);
      window.alert('Quotation approved successfully.');
      await refreshBookingState(bookingId);
    } catch (nextError) {
      window.alert(extractErrorMessage(nextError));
    } finally {
      setActionState(null);
    }
  };

  const handleRejectQuotation = async (bookingId) => {
    setActionState({
      bookingId,
      type: 'rejectQuotation',
    });

    try {
      await rejectBookingQuotation(bookingId);
      window.alert('Quotation rejected successfully.');
      await refreshBookingState(bookingId);
    } catch (nextError) {
      window.alert(extractErrorMessage(nextError));
    } finally {
      setActionState(null);
    }
  };

  const handleCancelApprovedBooking = async (bookingId) => {
    const confirmed = window.confirm(
      'This will cancel the booking after you already approved the quotation. Repeated unpaid cancellations can suspend your account. Continue?'
    );

    if (!confirmed) {
      return;
    }

    setActionState({
      bookingId,
      type: 'cancelBooking',
    });

    try {
      const response = await cancelApprovedBooking({
        bookingId,
      });

      if (response?.accountStatus === 'suspended') {
        const me = await getMe();
        setStoredClientUser(me);
        window.alert(
          response?.message ||
            'Your account has been suspended after repeated unpaid cancellations.'
        );
        navigate('/profile?status=1', { replace: true });
        return;
      }

      window.alert(response?.message || 'Booking cancelled successfully.');
      await refreshBookingState(bookingId);
    } catch (nextError) {
      window.alert(extractErrorMessage(nextError));
    } finally {
      setActionState(null);
    }
  };

  const handleConfirmCompletion = async (bookingId) => {
    setActionState({
      bookingId,
      type: 'confirmCompletion',
    });

    try {
      await confirmBookingCompletion(bookingId);
      window.alert('Work completion confirmed.');
      await refreshBookingState(bookingId);
    } catch (nextError) {
      window.alert(extractErrorMessage(nextError));
    } finally {
      setActionState(null);
    }
  };

  const handlePayNow = async (appointment) => {
    setActionState({
      bookingId: appointment.id,
      type: 'pay',
    });

    try {
      const sdkReady = await loadRazorpayCheckout();
      if (!sdkReady) {
        throw new Error('Unable to load payment gateway. Please try again.');
      }

      const response = await createClientBookingPaymentOrder(appointment.id);
      const payment = response?.data?.payment || null;

      if (!payment) {
        throw new Error(response?.message || 'Unable to start payment for this booking.');
      }

      if (response?.meta?.alreadyPaid || normalizeText(payment.status) === 'paid') {
        window.alert('Payment has already been completed for this booking.');
        await refreshBookingState(appointment.id);
        return;
      }

      const order = toCheckoutOrder(payment);
      if (!payment.key_id || !order) {
        throw new Error('Payment order information is incomplete.');
      }

      const currentUser = readCachedUser();
      const paymentResult = await openRazorpayCheckout({
        keyId: payment.key_id,
        order,
        description: `Payment for ${appointment?.provider?.name || 'provider booking'}`,
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || '',
        },
        notes: {
          bookingId: String(appointment.id),
        },
      });

      await confirmClientBookingPayment({
        bookingId: appointment.id,
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      window.alert('Payment completed successfully.');
      await refreshBookingState(appointment.id);
    } catch (nextError) {
      window.alert(extractErrorMessage(nextError));
    } finally {
      setActionState(null);
    }
  };

  const handleSubmitRating = async (bookingId) => {
    const draft = ratingDrafts[bookingId] || {
      rating: '5',
      review: '',
    };

    const numericRating = Number(draft.rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      window.alert('Please choose a rating between 1 and 5.');
      return;
    }

    setActionState({
      bookingId,
      type: 'rate',
    });

    try {
      await createClientBookingRating({
        bookingId,
        rating: numericRating,
        review: draft.review || '',
      });

      setRatedBookingIds((current) => ({
        ...current,
        [bookingId]: true,
      }));
      window.alert('Thanks for rating your provider.');
    } catch (nextError) {
      const reviewExists =
        axios.isAxiosError(nextError) &&
        nextError.response?.data?.code === 'BOOKING_REVIEW_EXISTS';

      if (reviewExists) {
        setRatedBookingIds((current) => ({
          ...current,
          [bookingId]: true,
        }));
        window.alert('A rating has already been submitted for this booking.');
      } else {
        window.alert(extractErrorMessage(nextError));
      }
    } finally {
      setActionState(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navigation lang={lang} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-[#dbeafe] bg-[#edf6ff] p-6">
          <h1 className="text-2xl font-semibold text-[#0b3d91]">Bookings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track provider response, quotation approval, completion confirmation, payment,
            and rating from one page.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white bg-white p-4">
              <div className="text-xs text-slate-500">Total Bookings</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{stats.total}</div>
            </div>
            <div className="rounded-xl border border-white bg-white p-4">
              <div className="text-xs text-slate-500">Active</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{stats.active}</div>
            </div>
            <div className="rounded-xl border border-white bg-white p-4">
              <div className="text-xs text-slate-500">Paid</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{stats.paid}</div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            Loading booking history...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && appointments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            No bookings found yet. Choose a service and request a provider to get started.
          </div>
        ) : null}

        {!loading && !error && appointments.map((appointment) => {
          const statusKey = normalizeText(appointment.status);
          const statusClass = STATUS_CLASS_MAP[statusKey] || 'bg-slate-100 text-slate-700';
          const quotationState = quotationByBookingId[appointment.id];
          const quotation = quotationState?.data?.quotation || null;
          const quotationAmounts = getQuotationAmounts(quotation);
          const completionVerified =
            quotationState?.data?.completionVerified ?? Boolean(appointment.completionVerified);
          const hasSubmittedRating = Boolean(ratedBookingIds[appointment.id]);
          const ratingDraft = ratingDrafts[appointment.id] || {
            rating: '5',
            review: '',
          };

          const canApproveQuotation =
            statusKey === 'accepted' && quotation?.status === 'pending';
          const canConfirmCompletion =
            statusKey === 'completed' && !completionVerified;
          const canPay =
            statusKey === 'completed' &&
            completionVerified &&
            (quotation?.status === 'approved' || quotation?.status === 'basic_only');
          const canCancelApprovedBooking =
            (quotation?.status === 'approved' || quotation?.status === 'basic_only') &&
            statusKey !== 'paid' &&
            statusKey !== 'cancelled';
          const canRate =
            statusKey === 'paid' && !hasSubmittedRating;

          return (
            <article
              key={appointment.id}
              className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${
                highlightedBookingId === String(appointment.id)
                  ? 'ring-2 ring-[#0b3d91]/20'
                  : ''
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {appointment?.provider?.name || 'Service Provider'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {appointment?.provider?.serviceLabel || appointment?.serviceType || 'Service'}
                    {' • '}
                    {appointment?.provider?.city || 'Location not available'}
                  </p>
                </div>

                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                  {statusKey.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <div className="text-xs text-slate-500">Booked At</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {toDisplayDate(appointment.bookedAt)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <div className="text-xs text-slate-500">Provider Info</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {appointment?.provider?.name || appointment.providerId || 'Not available'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <div className="text-xs text-slate-500">Payment Status</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {appointment?.payment?.status || 'Not started'}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">Quotation</h3>
                  {quotation ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {quotation.status}
                    </span>
                  ) : null}
                </div>

                {quotationState?.loading ? (
                  <p className="mt-3 text-sm text-slate-600">Loading quotation...</p>
                ) : null}

                {!quotationState?.loading && quotation ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                    <div className="rounded-xl bg-white px-3 py-3">
                      <div className="text-xs text-slate-500">Work Cost</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {toCurrency(quotationAmounts.workAmount)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <div className="text-xs text-slate-500">Basic Pay</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {toCurrency(quotationAmounts.basicPay)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <div className="text-xs text-slate-500">Total Cost</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {toCurrency(quotationAmounts.totalAmount)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3 sm:col-span-3">
                      <div className="text-xs text-slate-500">Updated At</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {toDisplayDate(quotation.updatedAt || quotation.createdAt)}
                      </div>
                    </div>
                  </div>
                ) : null}

                {!quotationState?.loading && quotation?.status === 'pending' ? (
                  <p className="mt-3 text-sm text-slate-700">
                    Work cost is {toCurrency(quotationAmounts.workAmount)}, basic pay is{' '}
                    {toCurrency(quotationAmounts.basicPay)}, total is{' '}
                    {toCurrency(quotationAmounts.totalAmount)}. Would you like to continue?
                  </p>
                ) : null}

                {!quotationState?.loading && quotation?.status === 'basic_only' ? (
                  <p className="mt-3 text-sm text-slate-700">
                    You chose not to continue the work. Only the basic pay{' '}
                    {toCurrency(quotationAmounts.basicPay)} is payable.
                  </p>
                ) : null}

                {!quotationState?.loading &&
                !quotation &&
                QUOTATION_RELEVANT_STATUSES.has(statusKey) ? (
                  <p className="mt-3 text-sm text-slate-600">
                    Waiting for the provider to share a quotation.
                  </p>
                ) : null}

                {quotationState?.error ? (
                  <p className="mt-3 text-sm text-red-600">{quotationState.error}</p>
                ) : null}

                {canApproveQuotation ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApproveQuotation(appointment.id)}
                      disabled={isActionRunning(appointment.id, 'approveQuotation')}
                      className="rounded-lg bg-[#0b3d91] px-4 py-2 text-sm font-medium text-white hover:bg-[#082f72] disabled:opacity-60"
                    >
                      {isActionRunning(appointment.id, 'approveQuotation')
                        ? 'Processing...'
                        : 'Yes, Continue Work'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectQuotation(appointment.id)}
                      disabled={isActionRunning(appointment.id, 'rejectQuotation')}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
                    >
                      {isActionRunning(appointment.id, 'rejectQuotation')
                        ? 'Processing...'
                        : 'No, Pay Basic Only'}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {statusKey === 'requested' ? (
                  <p className="text-sm text-slate-600">
                    Waiting for the provider to accept or reject your booking request.
                  </p>
                ) : null}

                {statusKey === 'accepted' && !quotation ? (
                  <p className="text-sm text-slate-600">
                    The provider accepted your request. Review the quotation once it arrives.
                  </p>
                ) : null}

                {canCancelApprovedBooking ? (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                    <h3 className="text-sm font-semibold text-orange-900">Cancel Payment</h3>
                    <p className="mt-2 text-sm text-orange-800">
                      Cancelling after quotation confirmation without completing payment counts as a
                      policy violation. Three such cancellations can suspend your account.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCancelApprovedBooking(appointment.id)}
                      disabled={isActionRunning(appointment.id, 'cancelBooking')}
                      className="mt-3 rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-100 disabled:opacity-60"
                    >
                      {isActionRunning(appointment.id, 'cancelBooking')
                        ? 'Processing...'
                        : 'Cancel Payment'}
                    </button>
                  </div>
                ) : null}

                {(statusKey === 'on_the_way' || statusKey === 'in_progress') ? (
                  <p className="text-sm text-slate-600">
                    The job is in progress. Payment will be enabled after completion is confirmed.
                  </p>
                ) : null}

                {statusKey === 'completed' ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <h3 className="text-sm font-semibold text-emerald-900">
                      Completion Confirmation
                    </h3>
                    <p className="mt-2 text-sm text-emerald-800">
                      {completionVerified
                        ? `Work confirmed on ${toDisplayDate(
                            quotationState?.data?.completionVerifiedAt ||
                              appointment.completionVerifiedAt
                          )}.`
                        : 'Confirm the work before payment is allowed.'}
                    </p>

                    {canConfirmCompletion ? (
                      <button
                        type="button"
                        onClick={() => handleConfirmCompletion(appointment.id)}
                        disabled={isActionRunning(appointment.id, 'confirmCompletion')}
                        className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {isActionRunning(appointment.id, 'confirmCompletion')
                          ? 'Processing...'
                          : 'Confirm Work Completed'}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {canPay ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <h3 className="text-sm font-semibold text-blue-900">Payment</h3>
                    <p className="mt-2 text-sm text-blue-800">
                      {quotation?.status === 'basic_only'
                        ? `You chose not to continue. Proceed to pay only the basic amount ${toCurrency(
                            quotationAmounts.basicPay
                          )}.`
                        : `You chose to continue. Proceed to pay the full amount ${toCurrency(
                            quotationAmounts.totalAmount
                          )}.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => handlePayNow(appointment)}
                      disabled={isActionRunning(appointment.id, 'pay')}
                      className="mt-3 rounded-lg bg-[#0b3d91] px-4 py-2 text-sm font-medium text-white hover:bg-[#082f72] disabled:opacity-60"
                    >
                      {isActionRunning(appointment.id, 'pay') ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                ) : null}

                {statusKey === 'completed' &&
                completionVerified &&
                quotation?.status !== 'approved' &&
                quotation?.status !== 'basic_only' ? (
                  <p className="text-sm text-slate-600">
                    Payment will be enabled after the quotation is approved.
                  </p>
                ) : null}

                {statusKey === 'paid' ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Payment Completed</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Paid amount:{' '}
                      <span className="font-semibold text-slate-900">
                        {toCurrency(
                          appointment?.payment?.amountInr || quotation?.amount || 0
                        )}
                      </span>
                    </p>

                    {hasSubmittedRating ? (
                      <p className="mt-3 text-sm text-emerald-700">
                        Your rating has already been submitted for this booking.
                      </p>
                    ) : (
                      <form
                        className="mt-4 space-y-3"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void handleSubmitRating(appointment.id);
                        }}
                      >
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Rating</span>
                          <select
                            value={ratingDraft.rating}
                            onChange={(event) =>
                              updateRatingDraft(appointment.id, 'rating', event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          >
                            <option value="5">5</option>
                            <option value="4">4</option>
                            <option value="3">3</option>
                            <option value="2">2</option>
                            <option value="1">1</option>
                          </select>
                        </label>

                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Review</span>
                          <textarea
                            value={ratingDraft.review}
                            onChange={(event) =>
                              updateRatingDraft(appointment.id, 'review', event.target.value)
                            }
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            placeholder="Share your experience"
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={isActionRunning(appointment.id, 'rate')}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {isActionRunning(appointment.id, 'rate')
                            ? 'Processing...'
                            : 'Submit Rating'}
                        </button>
                      </form>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-lg bg-[#0b3d91] px-4 py-2 text-sm font-medium text-white hover:bg-[#082f72]"
                >
                  Book Another
                </button>
              </div>
            </article>
          );
        })}
      </main>

      <BottomNav lang={lang} />
    </div>
  );
};

export default Bookings;
