'use client';

import React from 'react';
import { LayoutDashboard, Monitor, LogOut, ShieldCheck, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function AdminPortal() {

  const router = useRouter();
const dispatch = useAppDispatch();
  const apps = [
    {
      id: 'kiosk',
      title: 'Kiosk App',
      description: 'Customer-facing terminal interface for ad display and interactions.',
      icon: <Monitor className="w-10 h-10" />,
      path: '/kiosk',
      // Gradient using #131793 and #0091DD
      gradient: 'from-[#131793] to-[#0091DD]',
      shadow: 'shadow-blue-500/20',
    },
    {
      id: 'dashboard',
      title: 'Admin Dashboard',
      description: 'Manage advertisements, view analytics, and control system settings.',
      icon: <LayoutDashboard className="w-10 h-10" />,
      path: '/admin',
      // Reversed gradient for visual distinction
      gradient: 'from-[#0091DD] to-[#131793]',
      shadow: 'shadow-indigo-500/20',
    },
  ];

  return (
    <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-500 font-medium">
        
        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-8 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/logo.png" 
              className="h-12 w-auto object-contain"
              alt="Ratnam Solutions"
            />
          </Link>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-6xl mx-auto w-full">
          <div className="max-w-4xl w-full text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight bg-gradient-to-r from-[#131793] via-[#0091DD] to-[#131793] bg-clip-text text-transparent">
              Welcome back, Administrator
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              Select an application to begin your session.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 w-full max-w-5xl">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => router.push(app.path)}
                className={`group relative flex flex-col text-left p-10 rounded-3xl border border-[#0091DD]/50 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#0091DD]/50`}
              >
                {/* Gradient Icon Box */}
                <div
                  className={`bg-gradient-to-br ${app.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-lg ${app.shadow} text-white group-hover:scale-110 transition-transform duration-500 mx-auto`}
                >
                  {app.icon}
                </div>

                {/* Title with Gradient on Hover */}
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 transition-colors group-hover:text-[#0091DD]">
                  {app.title}
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>

                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-10 font-medium">
                  {app.description}
                </p>

                {/* Bottom Bar */}
                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold tracking-wide text-slate-400 group-hover:text-[#131793] dark:group-hover:text-[#0091DD] transition-colors">
                    Launch Application
                  </span>
                  <div className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0091DD] opacity-75`}></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0091DD]"></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>

        
      </div>
    </ProtectedRoute>
  );
}