import React from 'react';
import { Sidebar } from '@/components/superadmin/Sidebar';
import { Topbar } from '@/components/superadmin/Topbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['superadmin']}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
