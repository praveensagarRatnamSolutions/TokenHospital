import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

// types/auth.ts
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  hospitalName: string;
  phone: string; // E.164 format (+919876543210)
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  hospitalId?: string;
  token: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginRequest) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      console.log('API login response:', response);
      // axios already wraps data in response.data, so return data directly
      return response.data.data;
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },

  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/admin-signup', data);

      console.log('Register response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);

      // Clean error handling
      throw error.response?.data || { message: 'Something went wrong' };
    }
  },

  // Get current user (if needed)
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('API getCurrentUser error:', error);
      throw error;
    }
  },
};
