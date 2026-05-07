'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Ticket,
  Zap,
  Smartphone,
  Banknote,
  Users,
  Stethoscope,
  Activity,
  MoreVertical,
  XCircle,
  UserPlus,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import {
  useTokens,
  useVerifyCashToken,
  useCancelToken,
  useToggleEmergency,
  useReassignDoctor
} from '../hooks';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Pagination } from '@/components/common/Pagination';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReassignModal from './ReassignModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TokenManagement() {
  const { user } = useAppSelector((state: RootState) => state.auth);

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const router = useRouter();

  // Re-assign State
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [activeToken, setActiveToken] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 1. Fetch Tokens & Stats
  const { data: tokensRes, isLoading } = useTokens({
    appointmentDate: dateFilter,
    page,
    limit,
    search: debouncedSearch,
    doctorId,
    isQueue: false,
  });

  const tokens = tokensRes?.tokens || [];
  const stats = tokensRes?.stats || { totalCreated: 0, emergencyCount: 0, waitingCount: 0, activeCount: 0 };
  const pagination = tokensRes?.pagination;

  // 2. Fetch Doctors for filter
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-list-simple'],
    queryFn: async () => {
      const res = await api.get('/api/doctor');
      return res.data.doctors || res.data.data || [];
    }
  });

  // Mutations
  const verifyCashMutation = useVerifyCashToken();
  const cancelTokenMutation = useCancelToken();
  const toggleEmergencyMutation = useToggleEmergency();

  const handleToggleEmergency = async (id: string) => {
    try {
      await toggleEmergencyMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Admin Control Center
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Token <span className="text-primary italic font-serif">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-lg">
            Manage live patient flows, re-assign doctors, and handle emergency priorities with precision.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/admin/token/create')}
            className="h-14 px-8 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />{' '}
            Create Token
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tokens" value={stats.totalCreated} icon={Ticket} color="blue" sub="Today's total traffic" />
        <StatCard title="Emergency" value={stats.emergencyCount} icon={Zap} color="red" sub="Critical cases" pulse={stats.emergencyCount > 0} />
        <StatCard title="In Queue" value={stats.waitingCount} icon={Clock} color="amber" sub="Awaiting consultation" />
        <StatCard title="Active Now" value={stats.activeCount} icon={Activity} color="emerald" sub="With doctors" />
      </div>

      {/* Search & Filters */}
      <Card className="p-4 rounded-[2rem] border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Find patient by Name, Phone or Token Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>

        <div className="flex gap-4">
          <div className="relative min-w-[200px]">
            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <select
              value={doctorId}
              onChange={(e) => { setDoctorId(e.target.value); setPage(1); }}
              className="w-full h-14 pl-12 pr-10 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">All Doctors</option>
              {Array.isArray(doctorsData) && doctorsData.map((d: any) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      </Card>

      {/* Management Table */}
      <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient & Token</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assignment</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Payment</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl w-full" />
                    </td>
                  </tr>
                ))
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <p className="text-slate-400 font-medium italic">No tokens found for the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                tokens.map((token: any) => (
                  <tr
                    key={token._id}
                    className={`transition-all duration-300 ${token.isEmergency ? 'bg-red-50/20 dark:bg-red-900/10' : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/30'}`}
                  >
                    {/* Patient & Token Info */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`size-14 rounded-2xl flex flex-col items-center justify-center font-black border transition-all ${token.isEmergency
                          ? 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-200 dark:shadow-none'
                          : 'bg-white dark:bg-slate-900 text-primary border-slate-200 dark:border-slate-800'
                          }`}>

                          <span className="text-sm">{token.tokenNumber}</span>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white capitalize leading-tight">
                            {token.patient?.name || token.patientDetails?.name || 'Unknown'}
                          </h4>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">
                            {token.patient?.phone?.full || token.patientDetails?.phone?.full || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Assignment Info */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <Stethoscope className="w-3.5 h-3.5 text-primary/40" />
                          {token.doctor?.name || 'Unassigned'}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">
                          {token.department?.name || 'General'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-8 py-6 text-center">
                      <StatusBadge status={token.status} />
                    </td>

                    {/* Payment Info */}
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <PaymentStatus token={token} onVerify={(id: string) => verifyCashMutation.mutate(id)} />
                      </div>
                    </td>

                    {/* Actions Column (Dropdown Menu) */}
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
                              Token Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Toggle Emergency */}
                            <DropdownMenuItem
                              className="rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3 font-bold text-sm"
                              onClick={() => handleToggleEmergency(token._id)}
                            >
                              {token.isEmergency ? (
                                <><ZapOff className="w-4 h-4 text-slate-400" /> Mark Normal</>
                              ) : (
                                <><Zap className="w-4 h-4 text-red-500 fill-red-500" /> Mark Emergency</>
                              )}
                            </DropdownMenuItem>

                            {/* Re-assign Doctor */}
                            {(token.status === 'WAITING' || token.status === 'PROVISIONAL') && (
                              <DropdownMenuItem
                                className="rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3 font-bold text-sm"
                                onClick={() => { setActiveToken(token); setIsReassignOpen(true); }}
                              >
                                <UserPlus className="w-4 h-4 text-blue-500" /> Re-assign Doctor
                              </DropdownMenuItem>
                            )}

                            {/* Verify Payment */}
                            {(token.status === 'PROVISIONAL') && (
                              <DropdownMenuItem
                                className="rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3 font-bold text-sm text-emerald-600"
                                onClick={() => verifyCashMutation.mutate(token._id)}
                              >
                                <ShieldCheck className="w-4 h-4" /> Verify Payment
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Cancel Token */}
                            {(token.status === 'WAITING' || token.status === 'PROVISIONAL') && (
                              <DropdownMenuItem
                                className="rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3 font-bold text-sm text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20"
                                onClick={() => { if (confirm('Cancel this token?')) cancelTokenMutation.mutate(token._id) }}
                              >
                                <XCircle className="w-4 h-4" /> Cancel Token
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-8 py-6 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {tokens.length} of {pagination.total} tokens
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      <ReassignModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        tokenId={activeToken?._id}
        currentTokenData={activeToken}
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, sub, pulse }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    red: 'bg-red-500/10 text-red-600 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };

  return (
    <Card className={`p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-500 ${pulse ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 italic leading-none">{sub}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    WAITING: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    PROVISIONAL: 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800',
    CALLED: 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    CANCELED: 'bg-red-50 text-red-400 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  };

  return (
    <span className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] inline-flex items-center justify-center min-w-[100px] ${styles[status]}`}>
      {status}
    </span>
  );
}

function PaymentStatus({ token, onVerify }: any) {
  if (token.payment?.method === 'UPI') {
    return (
      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
        <Smartphone className="w-3 h-3" /> Online
      </span>
    );
  }

  if (token.payment?.status === 'pending' || token.status === 'PROVISIONAL') {
    return (
      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3" /> Unpaid Cash
      </span>
    );
  }

  return (
    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
      <Banknote className="w-3 h-3" /> Cash Paid
    </span>
  );
}
