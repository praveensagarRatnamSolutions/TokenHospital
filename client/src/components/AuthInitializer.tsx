'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';

/**
 * This component initializes the auth state from localStorage on app load
 * It should be placed in the root layout
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    // Initialize auth from localStorage on first load
    if (!isAuthenticated && typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('userData');

      if (accessToken && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch(setCredentials({
            user,
            accessToken,
            refreshToken: refreshToken || accessToken,
          }));
        } catch (error) {
          console.error('Failed to parse user data from localStorage');
          // Clear invalid data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
        }
      }
    }
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
}
