import axios from 'axios';
import type { AuthResponse, KioskListResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kiosk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
};

export const kioskApi = {
  getAll: async (): Promise<KioskListResponse> => {
    const response = await api.get('/api/kiosk');
    return response.data;
  },
  getByCode: async (code: string) => {
    const response = await api.get(`/api/kiosk/code/${code}`);
    return response.data;
  },
  callNext: async (doctorId: string) => {
    const response = await api.post('/api/token/next', { doctorId });
    return response.data;
  },
  getDepartments: async () => {
    const response = await api.get('/api/department');
    return response.data;
  },
  getDoctors: async (params?: { departmentId?: string; isAvailable?: boolean }) => {
    const response = await api.get('/api/doctor', { params });
    return response.data;
  },
  createToken: async (data: { departmentId: string; doctorId?: string; patientDetails: any }) => {
    const response = await api.post('/api/token', data);
    return response.data;
  },
  getTokenQueue: async (hospitalId: string) => {
    const response = await api.get('/api/kiosk/token', { params: { hospitalId } });
    return response.data;
  },
};

export default api;
