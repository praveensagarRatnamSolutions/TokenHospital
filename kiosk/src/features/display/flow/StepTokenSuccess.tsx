import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Ticket, Hospital, User, Clock, Printer, ChevronRight } from 'lucide-react';
import type { Department, Doctor } from '../../../core/types';

interface StepTokenSuccessProps {
  tokenNumber: string;
  department: Department;
  doctor: Doctor;
  onDone: () => void;
}

const StepTokenSuccess: React.FC<StepTokenSuccessProps> = ({ tokenNumber, department, doctor, onDone }) => {
  console.log('Rendering StepTokenSuccess with:', { tokenNumber, department, doctor });
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 items-center justify-center p-12 overflow-hidden relative transition-colors duration-500">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 dark:bg-sky-500/5 blur-[200px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-3xl w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[4rem] p-16 text-center shadow-2xl relative z-10"
      >
        <div className="size-32 rounded-[2.5rem] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-10 text-teal-600 dark:text-teal-400">
          <CheckCircle2 size={64} />
        </div>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Registration Successful</h1>
        <p className="text-xl text-slate-400 dark:text-white/40 font-medium mb-12 uppercase tracking-widest">Please collect your token below</p>

        <div className="relative mb-16">
          <div className="bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[3rem] p-12 relative overflow-hidden shadow-xl">
            {/* Ticket Cutouts */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 size-12 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 size-12 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10" />
            
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.5em] mb-4">Your Token Number</span>
              <span className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{tokenNumber}</span>
              <div className="h-0.5 w-full bg-slate-100 dark:bg-white/5 border-b border-dashed border-slate-300 dark:border-white/20 mb-8" />
              
              <div className="grid grid-cols-2 gap-12 w-full">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 text-slate-300 dark:text-white/20 uppercase text-[10px] font-black tracking-widest">
                    <Hospital size={12} />
                    <span>Unit</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white uppercase">{department.name}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-slate-300 dark:text-white/20 uppercase text-[10px] font-black tracking-widest">
                    <User size={12} />
                    <span>Doctor</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white uppercase">{doctor.name}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Print Status */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-teal-500 text-white flex items-center gap-4 shadow-xl shadow-teal-500/20">
            <Printer size={18} className="animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest">Printing Ticket...</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 text-slate-400 dark:text-white/30 mb-16 font-bold uppercase tracking-widest text-xs">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Est: 15-20 Min</span>
          </div>
          <div className="size-1 rounded-full bg-slate-300 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <Ticket size={16} />
            <span>Counter 04</span>
          </div>
        </div>

        <button 
          onClick={onDone}
          className="w-full h-24 rounded-[3rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center gap-4 transition-all shadow-lg active:scale-95"
        >
          <span className="text-2xl font-black uppercase tracking-[0.2em] ml-8">Finish Process</span>
          <div className="size-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <ChevronRight size={24} />
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default StepTokenSuccess;
