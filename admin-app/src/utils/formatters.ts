export const toText = (value: unknown, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

export const toNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(toNumber(value));

export const formatDateTime = (value: unknown) => {
  const text = toText(value);
  if (!text) return 'N/A';

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  return date.toLocaleString();
};

export const normalizeStatus = (value: unknown) => {
  const status = toText(value, 'pending').toLowerCase();
  if (status === 'created') return 'pending';
  if (status === 'canceled') return 'cancelled';
  return status;
};

export const normalizeDashboardStats = (payload: any) => ({
  totalUsers: toNumber(payload?.totalUsers),
  totalProviders: toNumber(payload?.totalProviders),
  totalBookings: toNumber(payload?.totalOrders),
  totalRevenue: toNumber(payload?.totalRevenue),
});

export const normalizePendingProvider = (provider: any, index = 0) => ({
  id: toText(provider?._id ?? provider?.id, `pending-${index + 1}`),
  name: toText(provider?.name, `Applicant ${index + 1}`),
  email: toText(provider?.email, 'No email'),
  phone: toText(provider?.phone, 'No phone'),
  city: toText(provider?.city, 'Unknown'),
  serviceType: toText(provider?.serviceType ?? provider?.service_type_id, 'Service'),
  experienceYears: toNumber(provider?.experience_years ?? provider?.experience),
  createdAt: toText(provider?.created_at, ''),
  status: toText(provider?.status, 'pending'),
});

export const normalizeProvider = (provider: any, index = 0) => ({
  id: toText(provider?._id ?? provider?.id ?? provider?.user_id, `provider-${index + 1}`),
  name: toText(provider?.display_name ?? provider?.name, `Provider ${index + 1}`),
  email: toText(provider?.email, 'No email'),
  phone: toText(provider?.phone, 'No phone'),
  city: toText(provider?.city, 'Unknown'),
  serviceType: toText(provider?.serviceType ?? provider?.service_type_id, 'Service'),
  rating: toNumber(provider?.rating),
  totalRatings: toNumber(provider?.total_ratings ?? provider?.reviews),
  isVerified: Boolean(provider?.is_verified ?? provider?.isVerified),
  createdAt: toText(provider?.created_at, ''),
});

export const normalizeUser = (user: any, index = 0) => ({
  id: toText(user?._id ?? user?.id, `user-${index + 1}`),
  name: toText(user?.name, `User ${index + 1}`),
  email: toText(user?.email, 'No email'),
  phone: toText(user?.phone, 'No phone'),
  city: toText(user?.city, 'Unknown'),
  role: toText(user?.role, 'client'),
  isVerified: Boolean(user?.is_verified ?? user?.isVerified),
  totalBookings: toNumber(user?.totalBookings ?? user?.total_bookings),
  accountStatus: toText(user?.accountStatus ?? user?.account_status, 'active'),
  cancellationStrikes: toNumber(
    user?.cancellationStrikes ?? user?.moderation?.cancellation_strikes
  ),
  suspensionReason: toText(
    user?.suspensionReason ?? user?.moderation?.suspension_reason,
    ''
  ),
  penaltyAmount: toNumber(
    user?.penalty?.amountInr ??
      user?.penaltyAmount ??
      user?.moderation?.penalty?.amount_inr
  ),
  penaltyStatus: toText(
    user?.penalty?.status ?? user?.penaltyStatus ?? user?.moderation?.penalty?.status,
    'none'
  ),
  createdAt: toText(user?.created_at ?? user?.createdAt, ''),
  updatedAt: toText(user?.updated_at ?? user?.updatedAt, ''),
});

export const normalizeOrder = (order: any, index = 0) => {
  const amount = toNumber(
    order?.amount ??
      order?.price ??
      order?.payment?.total_amount_inr ??
      order?.payment?.amount
  );

  return {
    id: toText(order?._id ?? order?.id ?? order?.order_id, `order-${index + 1}`),
    client: toText(
      order?.customer ??
        order?.customer_name ??
        order?.user_name ??
        order?.user?.name ??
        order?.user_id,
      'N/A'
    ),
    clientPhone: toText(order?.customer_phone ?? order?.user?.phone, '-'),
    provider: toText(
      order?.provider ??
        order?.provider_name ??
        order?.service_provider_name ??
        order?.provider?.display_name ??
        order?.provider_id,
      'N/A'
    ),
    service: toText(
      order?.service ??
        order?.service_name ??
        order?.service_type ??
        order?.serviceType ??
        order?.service_type_id,
      'N/A'
    ),
    amount,
    total: toNumber(order?.total ?? order?.total_amount, amount),
    paymentMethod: toText(
      order?.paymentMethod ?? order?.payment_method ?? order?.payment?.provider,
      'Online'
    ),
    status: normalizeStatus(order?.status),
    createdAt: toText(order?.created_at ?? order?.createdAt ?? order?.date, ''),
  };
};
