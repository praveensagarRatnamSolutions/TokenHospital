import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Clock, ArrowLeft, Loader2, Star, CheckCircle2 } from 'lucide-react';
import { kioskApi } from '../../api';
import type { Department, Doctor } from '../../types';

interface StepDoctorGridProps {
  department: Department;
  onSelect: (doctor: Doctor) => void;
  onBack: () => void;
}

const StepDoctorGrid: React.FC<StepDoctorGridProps> = ({ department, onSelect, onBack }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await kioskApi.getDoctors({ departmentId: department._id });
        setDoctors(response.doctors || []);
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [department]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="animate-spin text-sky-500 mb-6" size={48} />
        <p className="text-xl font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Finding Doctors in {department.name}...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-500">
      {/* Header */}
      <header className="pt-20 pb-12 px-12 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-3xl">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-4 text-slate-400 dark:text-white/30 hover:text-sky-500 transition-colors mb-12 group"
          >
            <div className="size-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">Change Department</span>
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="size-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-8">
              <ShieldCheck className="text-sky-500 dark:text-sky-400" size={40} />
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Select Doctor</h1>
            <p className="text-xl text-slate-500 dark:text-white/40 font-medium mb-4 uppercase tracking-widest">{department.name} Specialists</p>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-black uppercase tracking-widest">
              <div className="size-2 rounded-full bg-teal-500 animate-pulse" />
              Available for Consultation
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
          {doctors.map((doctor, index) => (
            <motion.button
              key={doctor._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(doctor)}
              className="relative flex flex-col items-start p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-sky-500/50 hover:bg-white dark:hover:bg-sky-500/5 transition-all text-left group overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-sky-500/10"
            >
              <div className="flex items-start gap-8 w-full">
                <div className="relative">
                  <div className="size-24 rounded-3xl bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-white/10 group-hover:border-sky-500/30 transition-all shadow-inner">
                    {doctor.profilePic ? (
                      <img src={doctor.profilePic} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-500/10 text-sky-500 dark:text-sky-400">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  {doctor.isAvailable && (
                    <div className="absolute -bottom-1 -right-1 size-8 rounded-2xl bg-teal-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="text-amber-500 fill-amber-500" size={14} />
                    <span className="text-xs font-black text-amber-600 dark:text-amber-500/60 uppercase tracking-widest">Verified Expert</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                    {doctor.name}
                  </h2>
                  <p className="text-slate-400 dark:text-white/30 uppercase text-xs font-black tracking-widest mb-4">
                    {doctor.specialization || 'Consultant'}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-300 dark:text-white/20">
                      <Clock size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Est. Wait: 15m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative background logo */}
              <ShieldCheck className="absolute -right-8 -bottom-8 size-40 text-slate-100 dark:text-white/5 group-hover:text-sky-500/5 transition-colors" />
            </motion.button>
          ))}

          {doctors.length === 0 && (
            <div className="col-span-2 py-32 text-center bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]">
              <User className="mx-auto text-slate-200 dark:text-white/5 mb-6" size={80} />
              <p className="text-2xl font-black text-slate-300 dark:text-white/20 uppercase tracking-widest mb-2">No doctors available</p>
              <p className="text-slate-400 dark:text-white/10 font-bold uppercase tracking-widest text-xs">Please check back later or try another unit</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StepDoctorGrid;
