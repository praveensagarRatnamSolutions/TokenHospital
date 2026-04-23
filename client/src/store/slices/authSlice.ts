import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getInitialUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
  user: getInitialUser(),
  accessToken: (getCookie('accessToken') as string) || null,
  refreshToken: (getCookie('refreshToken') as string) || null,
  isAuthenticated: !!getCookie('accessToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      
      // Set Cookies for Server Side access
      setCookie('accessToken', action.payload.accessToken, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      setCookie('refreshToken', action.payload.refreshToken, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
      setCookie('userRole', action.payload.user.role, { maxAge: 60 * 60 * 24 * 7 });

      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(action.payload.user));
      }
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      setCookie('accessToken', action.payload, { maxAge: 60 * 60 * 24 * 7 });
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      deleteCookie('userRole');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, updateAccessToken, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
