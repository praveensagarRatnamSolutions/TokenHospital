'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait a tick for Redux to initialize from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isChecking) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role authorization
    if (requiredRoles && user) {
      const userRole = user.role.toUpperCase();
      const upperRequiredRoles = requiredRoles.map(r => r.toUpperCase());
      
      if (!upperRequiredRoles.includes(userRole)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isChecking, isAuthenticated, user, requiredRoles, router]);

  // Show loading state while checking auth
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 animate-pulse">
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
