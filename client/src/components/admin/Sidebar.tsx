'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Monitor,
  ChevronDown,
  ChevronRight,
  Circle
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
  { name: 'Kiosks', href: '/admin/kiosks', icon: Monitor },
  { 
    name: 'Reports', 
    href: '/admin/reports', 
    icon: BarChart3,
    children: [
      { name: 'Financial Reports', href: '/admin/reports' },
      { name: 'Doctor Reports', href: '/admin/reports/doctors' },
    ]
  },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === 'superadmin';

  // State to track expanded menus
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Auto-expand if current route is a child
  useEffect(() => {
    adminNavItems.forEach(item => {
      if (item.children?.some(child => pathname === child.href)) {
        setExpandedItems(prev => ({ ...prev, [item.name]: true }));
      }
    });
  }, [pathname]);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <span className="text-xl font-black text-primary tracking-tighter">
          {isSuperAdmin ? 'HOSPITAL DASH' : 'HOSPITAL ADMIN'}
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {isSuperAdmin && (
          <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Link
              href="/superadmin"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all',
                pathname.startsWith('/superadmin') && !pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900',
              )}
            >
              <Crown className="w-5 h-5" />
              Super Admin Panel
            </Link>
          </div>
        )}

        {adminNavItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems[item.name];
          const isParentActive = pathname.startsWith(item.href);
          const isExactActive = pathname === item.href;

          if (hasChildren) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group',
                    isParentActive
                      ? 'bg-slate-50 dark:bg-slate-900/50 text-primary'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", isParentActive ? "text-primary" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all relative',
                            isChildActive
                              ? 'text-primary'
                              : 'text-slate-500 dark:text-slate-400 hover:text-primary',
                          )}
                        >
                          {/* Vertical Line indicator */}
                          <div className={cn(
                            "absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full transition-all",
                            isChildActive ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                          )} />
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all',
                isExactActive
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900',
              )}
            >
              <item.icon className={cn("w-5 h-5", isExactActive ? "text-primary" : "text-slate-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        &copy; 2026 RATNAM SOLUTIONS
      </div>
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex-col h-screen sticky top-0 shadow-sm z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Trigger */}
      <div className="md:hidden flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
        <div className="font-black text-primary tracking-tighter">HOSPITAL SYSTEM</div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="p-2 -mr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
            <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0 border-none">
            <SidebarContent onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for Mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}