import axios from 'axios';
import { API_BASE_URL } from '../utils/runtime';
import type {
  ProviderApplication,
  ProviderAvailability,
  ProviderBooking,
  ProviderProfile,
  ProviderQuotation,
} from '../types';
import {
  clearProviderSession,
  clearProviderTempTargets,
  getProviderToken,
  setProviderToken,
  setStoredProviderProfile,
} from '../utils/providerStorage';
import { isApprovedProviderProfile } from '../utils/providerAccess';

const providerApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

providerApi.interceptors.request.use((config) => {
  const token = getProviderToken();
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

const extractErrorMessage = (error: unknown) => {
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

export const updateProviderProfile = async (profileData: Partial<ProviderProfile>) => {
  try {
    const response = await providerApi.put('/me/profile', profileData);
    const updatedProfile = unwrapData<ProviderProfile>(response);
    setStoredProviderProfile(updatedProfile);
    return updatedProfile;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

const unwrapData = <T>(response: { data: { data?: T } }) =>
  (response.data?.data ?? response.data) as T;

export const requestProviderOTP = async ({
  email,
  phone,
}: {
  email?: string;
  phone?: string;
}) => {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!normalizedEmail && !normalizedPhone) {
    throw new Error('Email or phone is required.');
  }

  const payload: { email?: string; phone?: string } = {};
  if (normalizedEmail) payload.email = normalizedEmail;
  if (normalizedPhone) payload.phone = normalizedPhone;

  try {
    const response = await providerApi.post('/request-otp', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const verifyProviderOTP = async ({
  email,
  phone,
  otp,
}: {
  email?: string;
  phone?: string;
  otp: string;
}) => {
  try {
    const target = email || phone;
    if (!target || !otp) {
      throw new Error('Target and OTP are required.');
    }

    const response = await providerApi.post('/verify-otp', {
      target,
      otp,
    });

    const token = response.data?.token || response.data?.data?.token;

    if (!token) {
      throw new Error('Provider token not returned by OTP verification.');
    }

    setProviderToken(token);
    clearProviderTempTargets();
    return response.data;
  } catch (error) {
    clearProviderSession();
    throw new Error(extractErrorMessage(error));
  }
};

export const getProviderMe = async () => {
  try {
    const response = await providerApi.get('/me');
    const profile = unwrapData<ProviderProfile>(response);
    setStoredProviderProfile(profile);
    return profile;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getApprovedProviderProfile = async () => {
  const profile = await getProviderMe();

  if (!isApprovedProviderProfile(profile)) {
    throw new Error('Provider approval is still pending.');
  }

  return profile;
};

export const updateProviderMeProfile = async ({
  name,
  city,
  address,
  pincode,
}: {
  name: string;
  city: string;
  address?: string;
  pincode?: string;
}) => {
  try {
    const response = await providerApi.put('/me/profile', {
      name,
      city,
      address,
      pincode,
    });
    const profile = unwrapData<ProviderProfile>(response);
    setStoredProviderProfile(profile);
    return profile;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getProviderApplication = async () => {
  try {
    const response = await providerApi.get('/provider/application');
    return unwrapData<ProviderApplication>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const submitProviderApplication = async ({
  serviceType,
  experience,
  aadhaarNumber,
}: {
  serviceType: string;
  experience: number;
  aadhaarNumber: string;
}) => {
  try {
    const response = await providerApi.post('/provider/apply', {
      serviceType,
      experience,
      aadhaarNumber,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const toggleProviderAvailability = async (payload: {
  isOnline: boolean;
  lat?: number;
  lng?: number;
}) => {
  try {
    const response = await providerApi.post('/provider/availability/toggle', payload);
    return unwrapData<ProviderAvailability>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getProviderBookingRequests = async () => {
  try {
    const response = await providerApi.get('/provider/bookings/requests');
    return unwrapData<ProviderBooking[]>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getActiveProviderBooking = async () => {
  try {
    const response = await providerApi.get('/provider/bookings/active');
    return unwrapData<ProviderBooking | null>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const acceptProviderBooking = async (bookingId: string) => {
  try {
    const response = await providerApi.post(`/provider/bookings/${bookingId}/accept`);
    return unwrapData<ProviderBooking>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const rejectProviderBooking = async (bookingId: string) => {
  try {
    const response = await providerApi.post(`/provider/bookings/${bookingId}/reject`);
    return unwrapData<ProviderBooking>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const updateProviderBookingStatus = async ({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) => {
  try {
    const response = await providerApi.post(`/provider/bookings/${bookingId}/status`, {
      status,
    });
    return unwrapData<ProviderBooking>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const createProviderQuotation = async ({
  bookingId,
  amount,
}: {
  bookingId: string;
  amount: number;
}) => {
  try {
    const response = await providerApi.post(`/provider/bookings/${bookingId}/quotation`, {
      amount,
    });
    return unwrapData<ProviderQuotation>(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
