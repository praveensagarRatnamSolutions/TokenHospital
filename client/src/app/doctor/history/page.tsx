'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  History,
  Phone,
  Search,
  User,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';


import { cn } from '@/lib/utils';
import api from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';

// Helper for phone formatting
function formatPhone(phone: any) {
  if (!phone) return '';
  if (typeof phone === 'string') {
    if (phone.startsWith('91') && phone.length === 12) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  }
  if (typeof phone === 'object') {
    const code = phone.countryCode || '';
    const num = phone.nationalNumber || '';
    if (code && num) {
      return `${code} ${num.slice(0, 5)} ${num.slice(5)}`;
    }
    return phone.full || '';
  }
  return '';
}

export default function DoctorHistoryPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const doctorId = user?.doctorId;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const router = useRouter();

  // Fetch History Tokens
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['doctorHistory', doctorId, statusFilter, startDate, endDate, searchTerm],
    enabled: !!doctorId,
    queryFn: async () => {
      // If ALL is selected, we fetch both completed and canceled
      const statusParam = statusFilter === 'ALL' ? 'COMPLETED,CANCELED' : statusFilter;
      const params: any = {
        doctorId,
        status: statusParam,
        limit: 50, // Fetch up to 50 recent records
      };
      
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/api/token', { params });
      return response.data.tokens;
    },
  });

  const tokens = historyData || [];

  // Compute stats based on the fetched tokens
  const totalCompleted = tokens.filter((t: any) => t.status === 'COMPLETED').length;
  const totalCanceled = tokens.filter((t: any) => t.status === 'CANCELED').length;

  const openPatientHistory = (patient: any) => {
    if (patient?._id) {
      router.push(`/doctor/patient/${patient._id}`);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Patient Records
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Consultation <span className="text-primary italic font-serif">History</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            Review your past appointments and patient records.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-4 w-full xl:w-auto">
          <div className="relative group w-full sm:w-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="size-4" />
            </div>
            <input
              type="text"
              placeholder="Search Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary w-full sm:w-64 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 w-full sm:w-auto">
            {['ALL', 'COMPLETED', 'CANCELED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-1',
                  statusFilter === status
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
               <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary text-sm font-medium transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer w-full"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
            <span className="text-slate-400 font-bold text-sm">to</span>
            <div className="relative flex-1 sm:flex-none">
               <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary text-sm font-medium transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer w-full"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6">
          <div className="size-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="size-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Completed</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalCompleted}</h3>
          </div>
        </div>
        <div className="glass p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6">
          <div className="size-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500">
            <XCircle className="size-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Canceled</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalCanceled}</h3>
          </div>
        </div>
        <div className="glass p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6">
           <div className="size-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="size-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Patients</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{tokens.length}</h3>
          </div>
        </div>
      </div>

      {/* DATA LIST */}
      <div className="flex-1 glass rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-black tracking-tight">Records</h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
            Showing {tokens.length} results
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
            ))
          ) : tokens.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-slate-400">
               <History className="size-12 mb-4 opacity-20" />
               <p className="font-bold text-lg">No history found</p>
               <p className="text-sm font-medium">Try adjusting your filters</p>
             </div>
          ) : (
            tokens.map((token: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={token._id}
                className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className={cn(
                     "size-16 shrink-0 rounded-2xl flex flex-col items-center justify-center shadow-inner",
                     token.status === 'COMPLETED' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                   )}>
                     <span className="text-[9px] font-black uppercase opacity-60">Token</span>
                     <span className="text-xl font-black">{token.tokenNumber}</span>
                   </div>
                   
                   <div className="min-w-0">
                     <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white truncate">
                          {token.patient?.name || token.patientId?.name || 'Unknown'}
                        </h4>
                        {token.isEmergency && (
                          <span className="bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Zap className="size-3 fill-current" /> Emergency
                          </span>
                        )}
                     </div>
                     <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><User className="size-3.5" /> {token.patient?.age || token.patientId?.age || '--'} Y, {token.patient?.gender?.[0] || token.patientId?.gender?.[0] || 'U'}</span>
                        <span className="flex items-center gap-1"><Phone className="size-3.5" /> {formatPhone(token.patient?.phone || token.patientId?.phone)}</span>
                     </div>
                   </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      {token.status === 'COMPLETED' ? 'Completed At' : 'Canceled At'}
                    </p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                       <Clock className="size-4 opacity-50" />
                       {token.completedAt || token.canceledAt 
                          ? format(new Date(token.completedAt || token.canceledAt), 'MMM dd, hh:mm a')
                          : format(new Date(token.updatedAt), 'MMM dd, hh:mm a')
                       }
                    </p>
                  </div>

                  <button
                    onClick={() => openPatientHistory(token.patient || token.patientId)}
                    className="size-12 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all group-hover:scale-105 active:scale-95"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>


    </div>
  );
}
