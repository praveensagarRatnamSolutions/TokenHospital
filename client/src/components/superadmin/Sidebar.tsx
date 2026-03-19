'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2,
  BarChart3, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils'; 

const navItems = [
  { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Hospitals', href: '/superadmin/hospitals', icon: Building2 },
  { name: 'Reports', href: '/superadmin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/superadmin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold text-primary">Super Admin</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
