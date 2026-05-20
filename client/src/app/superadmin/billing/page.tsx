'use client';

import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Dummy data for visual layout
const MOCK_INVOICES = [
  { id: 'INV-2026-891', hospital: 'Apollo Hospitals', plan: 'Enterprise Global', amount: 150000, status: 'PAID', date: '2026-05-18', service: 'Subscription' },
  { id: 'INV-2026-892', hospital: 'City Care Center', plan: 'Professional', amount: 45000, status: 'PAID', date: '2026-05-17', service: 'Subscription' },
  { id: 'INV-2026-893', hospital: 'Max Super Speciality', plan: 'N/A', amount: 4999, status: 'PENDING', date: '2026-05-16', service: 'Wallet Top-up (SMS)' },
  { id: 'INV-2026-894', hospital: 'Fortis Healthcare', plan: 'Enterprise Global', amount: 150000, status: 'FAILED', date: '2026-05-15', service: 'Subscription' },
  { id: 'INV-2026-895', hospital: 'AIIMS Delhi', plan: 'Starter Pack', amount: 12000, status: 'PAID', date: '2026-05-15', service: 'Subscription' },
  { id: 'INV-2026-896', hospital: 'Narayana Health', plan: 'Professional', amount: 45000, status: 'PAID', date: '2026-05-14', service: 'Subscription' },
  { id: 'INV-2026-897', hospital: 'Medanta', plan: 'N/A', amount: 12999, status: 'PAID', date: '2026-05-13', service: 'Wallet Top-up (Email)' },
];

export default function SuperAdminBilling() {
  const [searchTerm, setSearchTerm] = useState('');

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
          <Button variant="outline" className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 transition-transform group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Collections This Month</p>
           <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10">₹14.2M</h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 transition-transform group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Pending Invoices</p>
           <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10">₹420k</h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-slate-900 shadow-xl hover:-translate-y-1 transition-transform group relative overflow-hidden border border-slate-800">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Next Payout Projection</p>
           <h3 className="text-4xl font-black tracking-tighter text-white relative z-10">₹2.1M</h3>
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
              {MOCK_INVOICES.map((inv, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-5 px-6 md:px-8">
                    <span className="text-xs font-bold font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300">
                      {inv.id}
                    </span>
                  </td>
                  <td className="py-5 px-6 md:px-8">
                    <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{inv.hospital}</p>
                  </td>
                  <td className="py-5 px-6 md:px-8">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{inv.service}</p>
                    {inv.plan !== 'N/A' && (
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-0.5">{inv.plan}</p>
                    )}
                  </td>
                  <td className="py-5 px-6 md:px-8">
                    <p className="text-xs font-bold text-slate-500 whitespace-nowrap">{inv.date}</p>
                  </td>
                  <td className="py-5 px-6 md:px-8">
                    <p className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">₹{inv.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-5 px-6 md:px-8">
                    <Badge 
                      className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 w-fit ${
                        inv.status === 'PAID' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' 
                          : inv.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                      }`}
                    >
                      {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                      {inv.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {inv.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-5 px-6 md:px-8 text-right">
                    <Button variant="ghost" size="icon" className="rounded-xl w-8 h-8 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
