import React from 'react';
import { User as UserIcon, Lock, Loader2, Hospital } from 'lucide-react';
import { useLoginForm } from '../hooks/useLoginForm';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { state, actions } = useLoginForm(onLoginSuccess);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-500 mb-4 border border-sky-500/10">
            <Hospital size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Kiosk Access</h1>
          <p className="text-slate-500 text-sm font-bold">Authorized Personnel Only</p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
            {state.error}
          </div>
        )}

        <form onSubmit={actions.handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                required
                value={state.email}
                onChange={(e) => actions.setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-semibold"
                placeholder="admin@hospital.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Access Token</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="password"
                required
                value={state.password}
                onChange={(e) => actions.setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-semibold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={state.loading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            {state.loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
            Hospital Token Management System v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
