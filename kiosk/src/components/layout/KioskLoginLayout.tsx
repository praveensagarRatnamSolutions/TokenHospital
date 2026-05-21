import { MonitorCheck } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface KioskLoginLayoutProps {
  children: React.ReactNode;
}

const KioskLoginLayout: React.FC<KioskLoginLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-400">
              <MonitorCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-white">
                Hospital Token
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Kiosk Console
              </p>
            </div>
          </div>

          <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">
            Secure Access
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-slate-950/95">
        <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 lg:flex-row">
          <span>Hospital Token Management System v1.0</span>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/privacy-policy" className="transition hover:text-sky-300">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="transition hover:text-sky-300">
              Terms of Service
            </Link>
            <Link to="/refund-policy" className="transition hover:text-sky-300">
              Refund Policy
            </Link>
          </nav>

          <span>© 2026 Ratnam Solutions Private Limited</span>
        </div>
      </footer>
    </div>
  );
};

export default KioskLoginLayout;
