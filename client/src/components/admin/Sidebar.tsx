'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Ticket, 
  MonitorPlay, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils'; 

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Doctors', href: '/admin/doctors', icon: Users },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Tokens', href: '/admin/tokens', icon: Ticket },
  { name: 'Ads', href: '/admin/ads', icon: MonitorPlay },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold text-primary">Admin Panel</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t text-xs text-slate-400">
        &copy; 2026 Hospital Token System
      </div>
    </aside>
  );
}
