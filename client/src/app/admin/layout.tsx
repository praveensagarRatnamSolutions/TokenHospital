'use client';

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { authApi } from '@/services/authApi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['authUser'],
      queryFn: authApi.getCurrentUser,
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
