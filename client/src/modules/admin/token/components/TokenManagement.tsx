'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useTokens, useVerifyCashToken, useCancelToken } from '../hooks';
import CreateTokenModal from './CreateTokenModal';
import { Pagination } from '@/components/common/Pagination';
import { useRouter } from 'next/navigation';
export default function TokenManagement() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const hospitalId = user?.hospitalId;

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const router = useRouter();

  // Fetch Tokens
  const { data: tokensRes, isLoading } = useTokens({
    appointmentDate: dateFilter,
    page,
    limit,
  });
  const tokens = tokensRes?.tokens || [];
  const pagination = tokensRes?.pagination;

  const verifyCashMutation = useVerifyCashToken();
  const cancelTokenMutation = useCancelToken();

  const handleVerifyCash = async (tokenId: string) => {
    if (confirm('Verify cash payment received for this token?')) {
      await verifyCashMutation.mutateAsync(tokenId);
    }
  };

  const handleCancelToken = async (tokenId: string) => {
    if (confirm('Are you sure you want to cancel this token?')) {
      await cancelTokenMutation.mutateAsync(tokenId);
    }
  };

  const filteredTokens = tokens.filter((t: any) => {
    const pName = typeof t.patientId === 'object' ? t.patientId?.name : '';
    const pPhone =
      typeof t.patientId === 'object'
        ? typeof t.patientId.phone === 'object'
          ? t.patientId.phone.full
          : t.patientId.phone
        : '';
    const searchLower = search.toLowerCase();
    return (
      pName?.toLowerCase().includes(searchLower) ||
      pPhone?.includes(searchLower) ||
      t.tokenNumber.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Administration
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Token <span className="text-primary italic font-serif">Management</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-lg">
            Create walk-in tokens, manage clinic queues, and resolve pending cash
            payments.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => router.push('/admin/token/create')}
            className="w-full md:w-auto px-6 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />{' '}
            Generate Token
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by token number, patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none w-full transition-all shadow-sm font-medium"
          />
        </div>
        <div className="relative w-full md:w-auto">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1); // Reset page on filter change
            }}
            className="pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none w-full md:w-48 transition-all shadow-sm font-bold text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">
                  Token ID
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">
                  Patient File
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">
                  Doctor / Dept
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-center">
                  Status
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-center">
                  Payment
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-slate-400 font-medium animate-pulse"
                  >
                    Loading tokens...
                  </td>
                </tr>
              ) : filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-400 font-medium">
                    No tokens found for this date.
                  </td>
                </tr>
              ) : (
                filteredTokens.map((token: any) => (
                  <tr
                    key={token._id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${token.isEmergency ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
                  >
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center justify-center h-10 px-4 font-black rounded-xl border transition-all ${token.isEmergency
                              ? 'bg-red-600 text-white border-red-700 shadow-md shadow-red-200'
                              : 'bg-primary/10 text-primary border-primary/20'
                            }`}
                        >
                          {token.tokenNumber}
                        </span>
                        {token.isEmergency && (
                          <span className="flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-black uppercase tracking-tighter animate-pulse text-center">
                            <Zap className="w-3 h-3 fill-red-600" /> Emergency
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-900 dark:text-white capitalize truncate max-w-[150px]">
                        {typeof token.patient === 'object'
                          ? token.patient?.name
                          : 'Unknown'}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        {formatPhone(
                          typeof token.patient === 'object'
                            ? token.patient.phone
                            : '',
                        )}
                      </p>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                        {typeof token.doctor === 'object'
                          ? token.doctor?.name
                          : 'Unassigned'}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {typeof token.department === 'object'
                          ? token.department?.name
                          : 'General'}
                      </p>
                    </td>
                    <td className="p-6 text-center">
                      <StatusBadge status={token.status} />
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {token.payment?.method === 'UPI' ? (
                          <span className="px-3 py-1 bg-blue-100/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <Smartphone className="w-3 h-3" /> UPI PAID
                          </span>
                        ) : token.payment?.status === 'pending' || token.status === 'PROVISIONAL' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> PENDING CASH
                            </span>
                            <button
                              onClick={() => handleVerifyCash(token._id)}
                              className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wide"
                            >
                              Verify Received
                            </button>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <Banknote className="w-3 h-3" /> CASH PAID
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {token.status !== 'COMPLETED' && token.status !== 'CANCELED' && (
                        <button
                          onClick={() => handleCancelToken(token._id)}
                          className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Modal
         {hospitalId && (
            <CreateTokenModal
               isOpen={isModalOpen}
               onClose={() => setIsModalOpen(false)}
               hospitalId={hospitalId}
            />
         )} */}
    </div>
  );
}

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

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    WAITING: 'bg-blue-100 text-blue-700 border-blue-200',
    PROVISIONAL: 'bg-slate-100 text-slate-600 border-slate-200',
    CALLED: 'bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200 opacity-75',
    CANCELED: 'bg-red-100 text-red-700 border-red-200 opacity-75',
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center w-24 ${styles[status]}`}
    >
      {status}
    </span>
  );
}
