import axios from 'axios';
import { API_BASE_URL } from '../config/runtime';
import { getClientToken } from '../utils/clientStorage';

const clientApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

clientApi.interceptors.request.use((config) => {
  const token = getClientToken();

  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export const requestOTP = async ({ email, phone }) => {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!normalizedEmail && !normalizedPhone) {
    throw new Error('Email or phone required');
  }

  const payload = {};
  if (normalizedEmail) payload.email = normalizedEmail;
  if (normalizedPhone) payload.phone = normalizedPhone;

  const response = await clientApi.post('/request-otp', payload);
  return response.data;
};

export const verifyOTP = async ({ email, phone, otp }) => {
  const target = email || phone;

  if (!target || !otp) {
    throw new Error('Target and OTP required');
  }

  const response = await clientApi.post('/verify-otp', { target, otp });
  return response.data;
};

export const getMe = async () => {
  const response = await clientApi.get('/me');
  return response.data;
};

export const updateMyProfile = async ({ name, city, address, pincode }) => {
  const response = await clientApi.put('/me/profile', { name, city, address, pincode });
  return response.data;
};

export const getClientNearbyProviders = async ({
  lat,
  lng,
  serviceType,
  radiusKm = 50,
  limit = 20,
  minRating = 2,
}) => {
  if (lat === undefined || lng === undefined) {
    throw new Error('lat and lng are required');
  }

  if (!serviceType) {
    throw new Error('serviceType is required');
  }

  const response = await clientApi.get('/client/providers/nearby', {
    params: {
      lat,
      lng,
      serviceType,
      radiusKm,
      limit,
      minRating,
    },
  });

  return response.data;
};

export const bookAppointment = async ({ providerId, notes }) => {
  if (!providerId) {
    throw new Error('providerId is required');
  }

  const response = await clientApi.post('/appointments', { providerId, notes });
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await clientApi.get('/appointments/my');
  return response.data;
};

export const getBookingQuotation = async (bookingId) => {
  if (!bookingId) {
    throw new Error('bookingId is required');
  }

  const response = await clientApi.get(`/client/bookings/${bookingId}/quotation`);
  return response.data;
};

export const approveBookingQuotation = async (bookingId) => {
  if (!bookingId) {
    throw new Error('bookingId is required');
  }

  const response = await clientApi.post(`/client/bookings/${bookingId}/quotation/approve`);
  return response.data;
};

export const rejectBookingQuotation = async (bookingId) => {
  if (!bookingId) {
    throw new Error('bookingId is required');
  }

  const response = await clientApi.post(`/client/bookings/${bookingId}/quotation/reject`);
  return response.data;
};

export const cancelApprovedBooking = async ({ bookingId, reason }) => {
  if (!bookingId) {
    throw new Error('bookingId is required');
  }

  const response = await clientApi.post(`/client/bookings/${bookingId}/cancel`, {
    reason,
  });
  return response.data;
};

export const confirmBookingCompletion = async (bookingId) => {
  if (!bookingId) {
    throw new Error('bookingId is required');
  }

  const response = await clientApi.post(`/client/bookings/${bookingId}/confirm-completion`);
  return response.data;
};

export const createClientBookingPaymentOrder = async (bookingId) => {
  if (!bookingId) {
    throw new Error('bookingId is required');
  }

  const response = await clientApi.post(`/client/bookings/${bookingId}/pay`);
  return response.data;
};

export const confirmClientBookingPayment = async ({
  bookingId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error('bookingId and Razorpay payment fields are required');
  }

  const response = await clientApi.post(`/client/bookings/${bookingId}/pay/confirm`, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return response.data;
};

export const createClientBookingRating = async ({ bookingId, rating, review }) => {
  if (!bookingId) {
    throw new Error('bookingId is required');
  }

  const response = await clientApi.post(`/client/bookings/${bookingId}/rate`, {
    rating,
    review,
  });
  return response.data;
};

export const createPenaltyPaymentOrder = async () => {
  const response = await clientApi.post('/me/penalty/pay');
  return response.data;
};

export const confirmPenaltyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error('Razorpay payment fields are required');
  }

  const response = await clientApi.post('/me/penalty/pay/confirm', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return response.data;
};

export default clientApi;
