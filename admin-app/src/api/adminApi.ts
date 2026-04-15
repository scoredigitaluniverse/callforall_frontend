import axios from 'axios';
import { clearAdminAuth, getAdminToken, setAdminToken, setAdminUser } from '../utils/adminAuth';
import { API_BASE_URL } from '../utils/runtime';

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  withCredentials: true,
});

const unwrapData = (response: any) => response?.data?.data ?? response?.data;

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearAdminAuth();
    }

    return Promise.reject(error);
  }
);

export const loginAdmin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await adminApi.post('/login', {
    email,
    password,
  });

  const data = unwrapData(response);
  const token = data?.token ?? response?.data?.meta?.token;
  const admin = data?.admin ?? response?.data?.meta?.admin ?? null;

  if (!token) {
    throw new Error('Admin token not returned');
  }

  setAdminToken(token);
  if (admin) {
    setAdminUser(admin);
  }

  return data;
};

export const getDashboardStats = async (range = 'all') => {
  const response = await adminApi.get('/dashboard/stats', {
    params: {
      range,
    },
  });

  return unwrapData(response);
};

export const getReviews = async () => {
  const response = await adminApi.get('/reviews');
  return unwrapData(response);
};

export const getProviders = async () => {
  const response = await adminApi.get('/providers');
  return unwrapData(response);
};

export const getUsers = async () => {
  const response = await adminApi.get('/users');
  return unwrapData(response);
};

export const getPendingProviders = async () => {
  const response = await adminApi.get('/providers/pending');
  return unwrapData(response);
};

export const approveProvider = async (providerId: string) => {
  const response = await adminApi.post(`/providers/${providerId}/approve`);
  return unwrapData(response);
};

export const rejectProvider = async (providerId: string) => {
  const response = await adminApi.post(`/providers/${providerId}/reject`);
  return unwrapData(response);
};

export const getOrders = async () => {
  const response = await adminApi.get('/orders');
  return unwrapData(response);
};

export const suspendUser = async ({
  userId,
  reason,
  penaltyAmount,
}: {
  userId: string;
  reason?: string;
  penaltyAmount?: number;
}) => {
  const response = await adminApi.post(`/users/${userId}/suspend`, {
    reason,
    penaltyAmount,
  });
  return unwrapData(response);
};

export const deactivateUser = async ({
  userId,
  reason,
}: {
  userId: string;
  reason?: string;
}) => {
  const response = await adminApi.post(`/users/${userId}/deactivate`, {
    reason,
  });
  return unwrapData(response);
};

export const reactivateUser = async ({
  userId,
  reason,
}: {
  userId: string;
  reason?: string;
}) => {
  const response = await adminApi.post(`/users/${userId}/reactivate`, {
    reason,
  });
  return unwrapData(response);
};

export default adminApi;
