import React from 'react';
import type { Kiosk } from '../../../core/types';
import { Monitor, MapPin, Loader2, Search, ArrowRight } from 'lucide-react';
import { useKioskSelector } from '../hooks/useKioskSelector';

interface KioskSelectorProps {
  onSelect: (kiosk: Kiosk) => void;
}

const KioskSelector: React.FC<KioskSelectorProps> = ({ onSelect }) => {
  const { state, actions } = useKioskSelector(onSelect);

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
        <p className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Scanning for active kiosks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex flex-col items-center transition-colors duration-500">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Select Local Kiosk</h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-2 px-1">Available displays for your hospital</p>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search by code or name..."
              value={state.search}
              onChange={(e) => actions.setSearch(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {state.filteredKiosks.length === 0 ? (
          <div className="bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-32 flex flex-col items-center justify-center text-center shadow-sm">
            <Monitor className="text-slate-200 dark:text-slate-800 mb-6" size={80} />
            <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-tight">No Kiosks Found</h3>
            <p className="text-slate-400 text-sm mt-4 max-w-xs font-medium">Contact administrator to register a display for this hospital wing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.filteredKiosks.map((kiosk) => (
              <button
                key={kiosk._id}
                onClick={() => actions.handleKioskSelect(kiosk)}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] text-left hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-sky-500/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-sky-500/10"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="size-14 rounded-2xl bg-sky-500/10 dark:bg-white/5 flex items-center justify-center text-sky-500 dark:text-slate-400 group-hover:text-sky-500 group-hover:bg-sky-500/10 transition-all transform group-hover:scale-110">
                    <Monitor size={28} />
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 dark:border-white/5">
                    {kiosk.code}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{kiosk.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-all">
                  <MapPin size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">{kiosk.locationType}</span>
                </div>

                <div className="absolute right-8 bottom-8 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="size-12 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xl shadow-sky-600/30">
                    <ArrowRight size={24} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <button 
            onClick={actions.handleLogoutAdmin}
            className="px-6 py-2 rounded-full border border-slate-200 dark:border-white/5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
          >
            Logout and Reset Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default KioskSelector;
