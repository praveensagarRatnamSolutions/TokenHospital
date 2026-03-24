'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Ticket,
  MonitorPlay,
  BarChart3,
  Settings,
  Crown,
  Menu,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Doctors', href: '/admin/doctors', icon: Users },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Tokens', href: '/admin/token', icon: Ticket },
  { name: 'Ads', href: '/admin/ads', icon: MonitorPlay },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <span className="text-xl font-bold text-primary">
          {isSuperAdmin ? 'Dashboard' : 'Admin'}
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isSuperAdmin && (
          <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Link
              href="/superadmin"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith('/superadmin') && !pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900',
              )}
            >
              <Crown className="w-5 h-5" />
              Super Admin Panel
            </Link>
          </div>
        )}
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900',
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 shrink-0">
        &copy; 2026 Hospital Token System
      </div>
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-950 border-r flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Trigger - Positioned absolutely/fixed */}
      <div className="md:hidden flex items-center h-16 px-4 border-b bg-white dark:bg-slate-950 fixed top-0 left-0 right-0 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          {/* FIX: Using simple 'button' properties on SheetTrigger to avoid nesting errors.
              This aligns the burger vertically with the logo/text area.
          */}
          <SheetTrigger className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
            <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>

          <div className="ml-4 font-bold text-primary">Hospital System</div>

          <SheetContent side="left" className="w-64 p-0 border-none">
            <SidebarContent onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for Mobile so content doesn't go under the fixed header */}
      <div className="h-16 md:hidden" />
    </>
  );
}