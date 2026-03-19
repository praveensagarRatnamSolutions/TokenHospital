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
  X,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Doctors', href: '/admin/doctors', icon: Users },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Tokens', href: '/admin/tokens', icon: Ticket },
  { name: 'Ads', href: '/admin/ads', icon: MonitorPlay },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function SidebarContent() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold text-primary">
          {isSuperAdmin ? 'Dashboard' : 'Admin'}
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {isSuperAdmin && (
          <div className="mb-4 pb-4 border-b">
            <Link
              href="/superadmin"
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
      <div className="p-4 border-t text-xs text-slate-400">
        &copy; 2026 Hospital Token System
      </div>
    </>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-950 border-r flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
