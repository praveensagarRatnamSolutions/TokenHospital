import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest = originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/register');
    const isTokenExpired = error.response?.data?.code === 'TOKEN_EXPIRED';

    if (error.response?.status === 401 && !originalRequest._retry && isTokenExpired && !isAuthRequest && typeof window !== 'undefined') {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${getApiUrl()}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        setCookie('accessToken', accessToken, { maxAge: 60 * 60 * 24 * 7 });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        deleteCookie('userRole');
        localStorage.removeItem('userData');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
