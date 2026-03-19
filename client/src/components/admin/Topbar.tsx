'use client';

import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
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

export function Topbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="h-16 border-b bg-white dark:bg-slate-950 flex items-center justify-between px-4 md:px-8 shadow-sm gap-4">
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search something..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Mobile search button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="flex items-center gap-2 h-auto p-0 hover:bg-transparent">
              <div className="h-8 w-8 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || 'admin@hospital.com'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(logout())}
              className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { Settings } from 'lucide-react';
