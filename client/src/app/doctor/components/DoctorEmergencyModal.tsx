'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Zap, User, Phone, Save } from 'lucide-react';
import api from '@/services/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { cn } from '@/lib/utils';

interface DoctorEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  departmentId: string;
}

export default function DoctorEmergencyModal({ isOpen, onClose, doctorId, departmentId }: DoctorEmergencyModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Form State
  const [patientPhone, setPatientPhone] = useState<any>({ full: '' });
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const createTokenMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/token', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctorStats', doctorId] });
      onClose();
      // Reset form
      setPatientName('');
      setPatientPhone({ full: '' });
      setPatientAge('');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTokenMutation.mutateAsync({
        departmentId,
        doctorId,
        isEmergency: true,
        paymentType: 'CASH',
        patientDetails: {
          name: patientName,
          phone: patientPhone,
          age: patientAge ? parseInt(patientAge) : undefined,
          gender: patientGender,
        },
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create emergency token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-[3rem] shadow-2xl border border-red-500/20 overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-red-600 to-rose-700 text-white relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[5rem] -z-10" />
           <div className="flex justify-between items-start mb-6">
              <div className="size-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                 <Zap className="size-7 fill-white" />
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="size-6" />
              </button>
           </div>
           <h2 className="text-3xl font-black tracking-tight mb-2">Emergency Entry</h2>
           <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Jump to front of queue • Direct Admission</p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
           <form id="emergencyForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Patient Phone</label>
                    <PhoneInput
                      country={'in'}
                      value={patientPhone.full}
                      onChange={(value, data: any) => {
                          setPatientPhone({
                              full: value,
                              countryCode: `+${data.dialCode}`,
                              country: data.countryCode?.toUpperCase(),
                              nationalNumber: value.replace(data.dialCode, '')
                          });
                      }}
                      inputClass="!w-full !py-4 !pl-16 !pr-4 !bg-slate-50 dark:!bg-slate-900 !border-none !rounded-2xl !focus:!ring-2 !focus:!ring-red-500 !outline-none !font-bold !text-slate-900 dark:!text-white"
                      containerClass="!w-full"
                      buttonClass="!bg-slate-50 dark:!bg-slate-900 !border-none !rounded-l-2xl !px-3"
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                       <input 
                         required 
                         type="text" 
                         value={patientName} 
                         onChange={e => setPatientName(e.target.value)} 
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold placeholder:text-slate-400" 
                         placeholder="Enter patient name..." 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Age</label>
                       <input 
                         type="number" 
                         value={patientAge} 
                         onChange={e => setPatientAge(e.target.value)} 
                         className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold" 
                         placeholder="Yrs" 
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Gender</label>
                       <select 
                         value={patientGender} 
                         onChange={e => setPatientGender(e.target.value as any)} 
                         className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold cursor-pointer"
                       >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                       </select>
                    </div>
                 </div>
              </div>
           </form>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex flex-col gap-3">
           <button 
             form="emergencyForm" 
             type="submit" 
             disabled={loading} 
             className="w-full py-5 rounded-[2rem] font-black text-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
           >
              {loading ? (
                <span className="animate-spin size-6 border-4 border-white/30 border-t-white rounded-full"></span>
              ) : (
                <>
                  <Zap className="size-5 fill-white" />
                  Confirm Emergency Admission
                </>
              )}
           </button>
           <button 
             type="button" 
             onClick={onClose} 
             className="w-full py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
           >
              Cancel
           </button>
        </div>
      </div>
    </div>
  );
}
