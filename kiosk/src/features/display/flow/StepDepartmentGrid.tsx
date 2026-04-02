import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Stethoscope, Heart, Baby, Eye, Activity, ChevronRight, Loader2, Hospital } from 'lucide-react';
import { kioskApi } from '../../../core/api';
import type { Department } from '../../../core/types';

interface StepDepartmentGridProps {
  onSelect: (dept: Department) => void;
}

const StepDepartmentGrid: React.FC<StepDepartmentGridProps> = ({ onSelect }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await kioskApi.getDepartments();
        setDepartments(response.data);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('heart') || n.includes('cardio')) return <Heart size={32} />;
    if (n.includes('child') || n.includes('pedia')) return <Baby size={32} />;
    if (n.includes('eye') || n.includes('opthal')) return <Eye size={32} />;
    if (n.includes('general')) return <Stethoscope size={32} />;
    return <Activity size={32} />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="animate-spin text-sky-500 mb-6" size={48} />
        <p className="text-xl font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Loading Departments...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-500">
      {/* Header */}
      <header className="pt-20 pb-12 px-12 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-3xl">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="size-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-8">
            <Hospital className="text-sky-500 dark:text-sky-400" size={40} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Select Department</h1>
          <p className="text-xl text-slate-500 dark:text-white/40 font-medium mb-10 uppercase tracking-widest">Which department would you like to visit today?</p>

          <div className="relative w-full max-w-2xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 group-focus-within:text-sky-500 transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Search by department name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all placeholder:text-slate-300 dark:placeholder:text-white/10 shadow-sm focus:shadow-xl focus:shadow-sky-500/10"
            />
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
          {filteredDepts.map((dept, index) => (
            <motion.button
              key={dept._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(dept)}
              className="flex flex-col items-start p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 dark:hover:bg-sky-500/5 transition-all text-left group shadow-sm hover:shadow-2xl hover:shadow-sky-500/10"
            >
              <div className="size-20 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 dark:text-sky-400 mb-8 icon-container group-hover:bg-sky-500 group-hover:text-white transition-all transform group-hover:scale-110">
                {getIcon(dept.name)}
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                {dept.name}
              </h2>
              <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 uppercase text-xs font-black tracking-[0.2em]">
                <span>{dept.prefix} Unit</span>
                <ChevronRight size={14} />
              </div>
            </motion.button>
          ))}

          {filteredDepts.length === 0 && (
            <div className="col-span-2 py-32 text-center bg-slate-50/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
              <Search className="mx-auto text-slate-200 dark:text-white/5 mb-6" size={80} />
              <p className="text-2xl font-black text-slate-300 dark:text-white/20 uppercase tracking-widest">No departments found</p>
            </div>
          )}
        </div>
      </main>

      <footer className="p-12 border-t border-slate-100 dark:border-white/5 flex justify-center bg-slate-50/30 dark:bg-slate-900/30">
        <div className="flex items-center gap-6 opacity-40">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-widest leading-none">Emergency</p>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400">DIAL 911</p>
          </div>
          <div className="size-12 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-500">
            <Activity size={24} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StepDepartmentGrid;
