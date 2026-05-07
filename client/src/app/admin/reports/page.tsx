'use client';

import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  CheckCircle2,
  Clock,
  XCircle,
  Hash
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useFinancialReports } from '@/hooks/useFinancialReports';

/**
 * Financial Reports Page
 * 
 * Logic is handled in the useFinancialReports hook.
 * This file focuses purely on UI/Presentation.
 */
export default function FinancialReports() {
  const {
    page, setPage,
    search, setSearch,
    doctorId, setDoctorId,
    departmentId, setDepartmentId,
    method, setMethod,
    dateRange, setDateRange,
    stats,
    methodSplit,
    transactions,
    pagination,
    doctors,
    departments,
    isLoading,
    isExporting,
    resetFilters,
    handleExport
  } = useFinancialReports();

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Financial <span className="text-primary italic font-serif">Reports</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            Detailed audit and revenue analysis for your hospital.
          </p>
        </div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map((r) => (
            <Button
              key={r}
              variant={dateRange === r ? 'default' : 'outline'}
              className="capitalize rounded-2xl px-6"
              onClick={() => { setDateRange(r); setPage(1); }}
            >
              {r}
            </Button>
          ))}
          <Button 
            variant="outline" 
            className="rounded-2xl gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" /> 
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="emerald"
          subValue={`${stats.transactionCount} successful payments`}
        />
        <ReportCard 
          title="Cash Collected" 
          value={`₹${(methodSplit.find((m: any) => m._id === 'CASH')?.total || 0).toLocaleString()}`} 
          icon={Wallet} 
          color="blue"
          subValue={`${methodSplit.find((m: any) => m._id === 'CASH')?.count || 0} transactions`}
        />
        <ReportCard 
          title="UPI Payments" 
          value={`₹${(methodSplit.find((m: any) => m._id === 'UPI')?.total || 0).toLocaleString()}`} 
          icon={CreditCard} 
          color="indigo"
          subValue={`${methodSplit.find((m: any) => m._id === 'UPI')?.count || 0} transactions`}
        />
        <ReportCard 
          title="Avg. Consultation" 
          value={`₹${Math.round(stats.avgTransactionValue).toLocaleString()}`} 
          icon={Clock} 
          color="amber"
          subValue="Per patient revenue"
        />
      </div>

      {/* Filters & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 rounded-[2rem] border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-xs">Filter Transactions</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Search Patient</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Name or phone..." 
                    className="pl-10 rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Doctor</label>
                <select 
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  <option value="">All Doctors</option>
                  {doctors?.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Department</label>
                <select 
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments?.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={method === 'CASH' ? 'default' : 'outline'} 
                    size="sm" 
                    className="rounded-xl text-xs"
                    onClick={() => setMethod(method === 'CASH' ? '' : 'CASH')}
                  >
                    Cash
                  </Button>
                  <Button 
                    variant={method === 'UPI' ? 'default' : 'outline'} 
                    size="sm" 
                    className="rounded-xl text-xs"
                    onClick={() => setMethod(method === 'UPI' ? '' : 'UPI')}
                  >
                    UPI
                  </Button>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-xs font-bold text-slate-500"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-9 space-y-4">
          <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Token</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Doctor</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Method</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                        No transactions found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx: any) => (
                      <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {format(new Date(tx.createdAt), 'dd MMM yyyy')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {format(new Date(tx.createdAt), 'hh:mm a')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                               {tx.token?.tokenNumber || 'N/A'}
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                              {tx.patient?.name || tx.patientDetails?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                              {tx.patient?.phone?.full || tx.patientDetails?.phone?.full}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                               <Stethoscope className="w-3 h-3 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              {tx.doctor?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-sm text-slate-900 dark:text-white">
                          ₹{tx.amount}
                        </td>
                        <td className="px-6 py-4">
                           <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                             tx.method === 'UPI' 
                              ? 'bg-indigo-500/10 text-indigo-600' 
                              : 'bg-emerald-500/10 text-emerald-600'
                           }`}>
                             {tx.method === 'UPI' ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                             {tx.method}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            tx.status === 'captured' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : tx.status === 'failed'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {tx.status === 'captured' ? <CheckCircle2 className="w-3 h-3" /> : tx.status === 'failed' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {tx.status}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing {transactions.length} of {pagination.total} transactions
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-xl p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                   {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-xl w-8 h-8 text-[10px] font-bold"
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                   ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-xl p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon: Icon, color, subValue }: any) {
  const colors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <Hash className="w-3 h-3 text-slate-300" />
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
        {title}
      </p>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
        {value}
      </h4>
      <p className="text-[10px] font-bold text-slate-400 italic">
        {subValue}
      </p>
    </Card>
  );
}
