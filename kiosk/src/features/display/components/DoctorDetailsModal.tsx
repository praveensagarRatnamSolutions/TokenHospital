import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Award, 
  IndianRupee, 
  Coffee,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import type { Doctor } from "../../../core/types";

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  onClose: () => void;
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({ doctor, onClose }) => {
  const cloudFrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";

  if (!doctor) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col"
        >
          {/* Header */}
          <div className="relative h-48 bg-sky-500/10 dark:bg-sky-500/5 flex items-center px-12 overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-8">
              <button
                onClick={onClose}
                className="size-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-white/60 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center gap-8">
              <div className="size-32 rounded-[2rem] bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden relative group">
                {doctor.profilePic ? (
                  <img
                    src={`${cloudFrontUrl}/${doctor.profilePic}`}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sky-500/10 text-sky-500">
                    <User size={48} />
                  </div>
                )}
                {doctor.isAvailable && (
                  <div className="absolute bottom-2 right-2 size-6 rounded-full bg-teal-500 border-2 border-white dark:border-slate-800 shadow-lg" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest">
                    Verified Doctor
                  </span>
                  {doctor.isAvailable ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest border border-teal-500/20">
                      <div className="size-2 rounded-full bg-teal-500 animate-pulse" />
                      Available
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                      <AlertCircle size={10} />
                      Away
                    </span>
                  )}
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {doctor.name}
                </h2>
                <p className="text-slate-500 dark:text-white/40 font-bold uppercase tracking-[0.2em] text-xs">
                  {doctor.specialization || (typeof doctor.departmentId === 'object' ? doctor.departmentId.name : "Senior Consultant")}
                </p>

              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-2 text-sky-500">
                  <Award size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Experience</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {doctor.experience || 0} <span className="text-sm font-bold text-slate-400 uppercase">Years</span>
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-2 text-emerald-500">
                  <IndianRupee size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Consultation</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{doctor.consultationFee || "---"}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-2 text-indigo-500">
                  <CheckCircle2 size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Success Rate</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  98% <span className="text-sm font-bold text-slate-400 uppercase">Track</span>
                </p>
              </div>
            </div>

            {/* Availability Section */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <Calendar className="text-sky-500" size={24} />
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Weekly Schedule
                </h3>
              </div>

              <div className="space-y-6">
                {doctor.availability && doctor.availability.length > 0 ? (
                  doctor.availability.map((day) => (
                    <div key={day._id} className="group">
                      <div className="flex items-center gap-6">
                        <div className="w-32 shrink-0">
                          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:text-sky-500 transition-colors">
                            {day.day}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-wrap gap-4">
                          {day.sessions.map((session) => (
                            <div 
                              key={session._id}
                              className="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col gap-1 min-w-[180px]"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                                  {session.label}
                                </span>
                                <Clock size={12} className="text-slate-300" />
                              </div>
                              <div className="text-sm font-bold text-slate-700 dark:text-white/80 uppercase tracking-tight">
                                {session.from} - {session.to}
                              </div>
                              {session.breaks && session.breaks.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5">
                                  {session.breaks.map((brk) => (
                                    <div key={brk._id} className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                                      <Coffee size={10} className="text-amber-500" />
                                      {brk.label}: {brk.from} - {brk.to}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="h-px bg-slate-100 dark:bg-white/5 mt-6 ml-32" />
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                    <Clock className="mx-auto text-slate-200 dark:text-white/5 mb-4" size={48} />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Schedule not published yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 px-12 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex justify-end gap-4 shrink-0">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 font-black uppercase tracking-widest text-sm hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DoctorDetailsModal;
