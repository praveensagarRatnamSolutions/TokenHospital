'use client';

import React from 'react';
import { LogOut, User, Bell, Search, Settings } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';

export default function DoctorLayoutClient({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((state: RootState) => state.auth);

  console.log('user', user);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <ProtectedRoute requiredRoles={['DOCTOR']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <DoctorSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-16 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-20">
            {/* Search Bar - Aesthetic Only for Now */}
            <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-2xl w-96 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search medical records..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>

              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 h-auto p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all outline-none cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                  <div className="h-9 w-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1">
                    {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-none">
                      Specialist
                    </p>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        My Account
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push('/doctor/profile')}
                    className="rounded-xl px-3 py-2 cursor-pointer gap-3"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Profile Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push('/doctor/settings')}
                    className="rounded-xl px-3 py-2 cursor-pointer gap-3"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">System Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 cursor-pointer gap-3 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950 font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminal Exit</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {/* Background subtle gradient for dashboard feel */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
