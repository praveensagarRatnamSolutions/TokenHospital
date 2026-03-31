"use client";

import React from 'react';
import { LogOut, User } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function DoctorLayoutClient({ children }: { children: React.ReactNode }) {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    return (
        <ProtectedRoute requiredRoles={['DOCTOR']}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center px-4 md:px-8 shadow-sm justify-between gap-4">
                    <h1 className="text-lg md:text-xl font-bold text-primary">Doctor Panel</h1>

                    <div className="flex items-center gap-2 md:gap-4 ml-auto">
                        <ThemeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 h-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none cursor-pointer">
                                <div className="h-8 w-8 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="hidden sm:inline text-sm font-medium">
                                    {user?.name || 'Doctor'}
                                </span>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => router.push('/doctor/kiosks')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>My Kiosks</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* ✅ FIX: attach onClick */}
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}