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

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['doctor']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center px-4 md:px-8 shadow-sm justify-between gap-4">
          <h1 className="text-lg md:text-xl font-bold text-primary">Doctor Panel</h1>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger>
                <button className="flex items-center gap-2 h-auto p-0 hover:bg-transparent">
                  <div className="h-8 w-8 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    Dr. Michael
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950">
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
