'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { subscriptionApi } from '@/services/subscriptionApi';

export default function SuperAdminBilling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await subscriptionApi.getHistory();
        setInvoices(data || []);
      } catch (err) {
        console.error("Failed to fetch billing history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    const hospitalName = inv.hospitalId?.name?.toLowerCase() || '';
    const invoiceId = inv.razorpayPaymentId?.toLowerCase() || inv._id?.toLowerCase() || '';
    const matchesSearch = hospitalName.includes(term) || invoiceId.includes(term);

    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    
    const isWallet = inv.type === 'WALLET_TOPUP';
    const itemType = isWallet ? 'WALLET' : 'SUBSCRIPTION';
    const matchesType = filterType === 'ALL' || itemType === filterType;

    let matchesDate = true;
    if (startDate || endDate) {
      const invDate = new Date(inv.createdAt);
      if (startDate) {
        matchesDate = matchesDate && invDate >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && invDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const handleExport = async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterType !== 'ALL') params.service = filterType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const blob = await subscriptionApi.exportHistory(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `Billing_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to export billing history:", err);
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const collectionsThisMonth = invoices
    .filter(inv => {
      const d = new Date(inv.createdAt);
      return inv.status === 'COMPLETED' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'PENDING')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const nextPayout = collectionsThisMonth * 0.9;

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 relative p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-4">
             <ShieldCheck className="size-4 text-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger & Invoicing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Billing <span className="text-emerald-500 italic font-serif">Tracker</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            A secure master ledger tracking all hospital subscriptions, automated Razorpay collections, and wallet top-up transactions.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search invoices, hospitals..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
             />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full sm:w-auto rounded-2xl h-12 px-6 font-bold ${showFilters ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleExport} className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-wrap gap-4 items-center animate-in slide-in-from-top-4 fade-in">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">Status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Paid / Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">Service:</span>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Services</option>
              <option value="SUBSCRIPTION">Subscriptions</option>
              <option value="WALLET">Wallet Top-ups</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">From:</span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">To:</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <Button variant="ghost" onClick={() => { setFilterStatus('ALL'); setFilterType('ALL'); setSearchTerm(''); setStartDate(''); setEndDate(''); }} className="h-10 px-4 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl">
            Clear Filters
          </Button>
        </div>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 transition-transform group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Collections This Month</p>
           <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10">₹{collectionsThisMonth.toLocaleString()}</h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 transition-transform group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Pending Invoices</p>
           <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10">₹{pendingAmount.toLocaleString()}</h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-slate-900 shadow-xl hover:-translate-y-1 transition-transform group relative overflow-hidden border border-slate-800">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Next Payout Projection</p>
           <h3 className="text-4xl font-black tracking-tighter text-white relative z-10">₹{nextPayout.toLocaleString()}</h3>
        </div>
      </div>

      {/* MASTER LEDGER TABLE */}
      <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm glass overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
           <div>
             <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Master Ledger</h3>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Chronological transaction history</p>
           </div>
           <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-primary bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
             <Receipt className="w-4 h-4" />
           </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30">
                <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Invoice ID</th>
                <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital</th>
                <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Item</th>
                <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 md:px-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <Loader className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => {
                  const dateStr = new Date(inv.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const isWallet = inv.type === 'WALLET_TOPUP';
                  const displayId = inv.razorpayPaymentId || inv._id;
                  return (
                    <tr key={inv._id || idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-5 px-6 md:px-8">
                        <span className="text-xs font-bold font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300">
                          {displayId.length > 12 ? displayId.substring(0, 12) + '...' : displayId}
                        </span>
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{inv.hospitalId?.name || 'Unknown Hospital'}</p>
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{isWallet ? 'Wallet Top-up' : 'Subscription'}</p>
                        {inv.planId && inv.planId !== 'N/A' && (
                          <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-0.5">{inv.planId}</p>
                        )}
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        <p className="text-xs font-bold text-slate-500 whitespace-nowrap">{dateStr}</p>
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        <p className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">₹{(inv.amount || 0).toLocaleString()}</p>
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        <Badge 
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 w-fit ${
                            inv.status === 'COMPLETED' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' 
                              : inv.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                          }`}
                        >
                          {inv.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                          {inv.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {inv.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                          {inv.status === 'COMPLETED' ? 'PAID' : inv.status}
                        </Badge>
                      </td>
                      <td className="py-5 px-6 md:px-8 text-right">
                        <Button variant="ghost" size="icon" className="rounded-xl w-8 h-8 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
