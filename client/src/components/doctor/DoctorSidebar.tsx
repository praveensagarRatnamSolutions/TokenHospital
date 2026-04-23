'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  Activity,
  History,
  User,
  Monitor,
  HeartPulse
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const doctorNavItems = [
  { name: 'Live Console', href: '/doctor', icon: Activity },
  { name: 'My Kiosks', href: '/doctor/kiosks', icon: Monitor },
  { name: 'Patient History', href: '/doctor/history', icon: History },
  { name: 'Profile', href: '/doctor/profile', icon: User },
  { name: 'Settings', href: '/doctor/settings', icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      <div className="h-16 flex items-center px-6 border-b shrink-0 gap-3">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <HeartPulse className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
          Doctor <span className="text-primary italic">Panel</span>
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
           <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user?.name || 'Medical'}</p>
        </div>

        {doctorNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

    
    </div>
  );
}

export function DoctorSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white dark:bg-slate-950 flex-col h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Trigger */}
      <div className="lg:hidden flex items-center h-16 px-4 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
            <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>

          <div className="ml-4 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary" />
            <span className="font-black text-slate-900 dark:text-white tracking-tighter">Doctor <span className="text-primary italic">Console</span></span>
          </div>

          <SheetContent side="left" className="w-72 p-0 border-none">
            <SidebarContent onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for Mobile */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
