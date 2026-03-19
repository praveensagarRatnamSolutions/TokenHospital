import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['doctor']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center px-8 shadow-sm justify-between">
          <h1 className="text-xl font-bold text-primary">Doctor Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Logged in: Dr. Michael</span>
            <button className="text-sm text-red-500 font-semibold">Logout</button>
          </div>
        </header>
        <main className="p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
