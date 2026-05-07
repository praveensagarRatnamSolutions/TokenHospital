'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Search,
  Calendar,
  Stethoscope,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Phone,
  User,
  Building2,
  Download,
  Loader2,
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';

export default function DoctorPatientsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();

  // Pick date range & doctor name from URL query params (passed from parent page)
  const initialStart = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
  const initialEnd = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
  const doctorName = searchParams.get('doctorName') || 'Doctor';

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchInput); setPage(1); }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-patients', id, startDate, endDate, debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
        page: String(page),
        limit: '20',
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await api.get(`/api/reports/doctor-performance/${id}/patients?${params.toString()}`);
      return res.data;
    },
    enabled: !!id,
  });

  const tokens = data?.tokens || [];
  const pagination = data?.pagination;

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await api.get(
        `/api/reports/doctor-performance/${id}/patients/export?${params.toString()}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Patients_${doctorName}_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-6">
          <button
            onClick={() => router.back()}
            className="mt-1.5 size-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all shadow-sm flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Consultation Drill-down
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {doctorName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1.5 text-sm">
              Patients seen from{' '}
              <span className="font-black text-slate-700 dark:text-slate-300">{startDate}</span>
              {' '}to{' '}
              <span className="font-black text-slate-700 dark:text-slate-300">{endDate}</span>
            </p>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exporting || isLoading || tokens.length === 0}
          className="h-11 px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-[1.02]"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Excel
        </button>
      </div>

      {/* Search & Filters */}
      <Card className="p-3 rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, phone or token number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="h-12 pl-10 pr-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-slate-300 font-black text-sm">→</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="h-12 pl-10 pr-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </Card>

      {/* Patients Table */}
      <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Token</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-5">
                      <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <User className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                      <p className="text-slate-400 font-medium italic text-sm">
                        No patients found for the selected criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tokens.map((token: any) => {
                  const name = token.patient?.name || token.patientDetails?.name || 'Unknown Patient';
                  const phone = token.patient?.phone?.full || token.patientDetails?.phone?.full || '—';
                  const dept = token.department?.name || 'General';
                  const createdAt = token.createdAt ? new Date(token.createdAt) : null;

                  return (
                    <tr
                      key={token._id}
                      className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${token.isEmergency ? 'bg-red-50/20 dark:bg-red-900/10' : ''}`}
                    >
                      {/* Token Number */}
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-sm ${
                          token.isEmergency
                            ? 'bg-red-600 text-white border-red-700'
                            : 'bg-white dark:bg-slate-900 text-primary border-slate-200 dark:border-slate-700'
                        }`}>
                          {token.isEmergency && <Zap className="w-3.5 h-3.5 fill-white" />}
                          <Ticket className="w-3.5 h-3.5 opacity-60" />
                          {token.tokenNumber}
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm capitalize">{name}</p>
                          <p className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mt-0.5">
                            <Phone className="w-3 h-3" /> {phone}
                          </p>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{dept}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5 text-center">
                        <TokenStatusBadge status={token.status} />
                      </td>

                      {/* Time */}
                      <td className="px-8 py-5 text-right">
                        {createdAt ? (
                          <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <Clock className="w-3 h-3" />
                              {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-8 py-6 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {tokens.length} of {pagination.total} patients
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function TokenStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; Icon: any }> = {
    WAITING: { label: 'Waiting', className: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800', Icon: Clock },
    PROVISIONAL: { label: 'Unpaid', className: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800', Icon: Clock },
    CALLED: { label: 'Called', className: 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse dark:bg-indigo-900/20 dark:border-indigo-800', Icon: Stethoscope },
    COMPLETED: { label: 'Done', className: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800', Icon: CheckCircle2 },
    CANCELED: { label: 'Cancelled', className: 'bg-red-50 text-red-400 border-red-100 dark:bg-red-900/20 dark:border-red-800', Icon: XCircle },
  };

  const c = config[status] || { label: status, className: 'bg-slate-50 text-slate-400 border-slate-100', Icon: Clock };
  const { label, className, Icon } = c;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
