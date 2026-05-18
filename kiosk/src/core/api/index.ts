import axios from "axios";
import type { AuthResponse, KioskListResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kiosk_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
  getMe: async (): Promise<AuthResponse> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

export const kioskApi = {
  getAll: async (): Promise<KioskListResponse> => {
    const response = await api.get("/api/kiosk");
    return response.data;
  },
  getByCode: async (code: string) => {
    const response = await api.get(`/api/kiosk/code/${code}`);
    return response.data;
  },
  callNext: async (doctorId: string) => {
    const response = await api.post("/api/token/next", { doctorId });
    return response.data;
  },
  getDepartments: async () => {
    const response = await api.get("/api/department");
    return response.data;
  },
  getDoctors: async (params?: {
    departmentId?: string;
    isAvailable?: boolean;
  }) => {
    const response = await api.get("/api/doctor", { params });
    return response.data;
  },
  createToken: async (data: {
    departmentId: string;
    doctorId?: string;
    patientDetails: any;
    appointmentDate?: string;
    paymentMethod?: string;
  }) => {
    const response = await api.post("/api/token", data);
    return response.data;
  },
  createPaymentOrder: async (data: {
    doctorId: string;
    departmentId: string;
    patientDetails: any;
    method: string;
  }) => {
    const response = await api.post("/api/payment/create-order", data);
    return response.data;
  },
  checkPaymentStatus: async (orderId: string) => {
    const response = await api.get(`/api/payment/status/${orderId}`);
    return response.data;
  },
  getTokenQueue: async (hospitalId: string, kioskId?: string) => {
    const response = await api.get("/api/kiosk/token", {
      params: { hospitalId, kioskId },
    });
    return response.data;
  },
};

export const printApi = {
  getPrintData: async (tokenId: string) => {
    const response = await api.get(`/api/token/${tokenId}/print`);
    return response.data;
  },
  sendToPrinter: async (data: any) => {
    const printServiceUrl = import.meta.env.VITE_PRINT_SERVICE_URL || "http://localhost:3001";
    const response = await axios.post(printServiceUrl + "/print", data);
    console.log("Print API response:", response);
    return response.data;
  },
};

export default api;
