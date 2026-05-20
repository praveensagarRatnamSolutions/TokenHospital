'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Terminal,
  Download,
  Fingerprint,
  RefreshCw,
  Server,
  UserCog,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Dummy Audit Logs Data
const MOCK_LOGS = [
  { id: 'LOG-8821', time: '10:45 AM, May 19, 2026', user: 'System Auto', action: 'Subscription Renewed', target: 'Apollo Hospitals', ip: '10.0.0.4', type: 'SYSTEM', status: 'SUCCESS' },
  { id: 'LOG-8820', time: '10:30 AM, May 19, 2026', user: 'SuperAdmin (Praveen)', action: 'Modified Plan', target: 'Enterprise Global', ip: '192.168.1.12', type: 'ADMIN', status: 'SUCCESS' },
  { id: 'LOG-8819', time: '09:15 AM, May 19, 2026', user: 'SuperAdmin (Praveen)', action: 'Failed Login Attempt', target: 'Admin Portal', ip: '45.22.19.102', type: 'SECURITY', status: 'WARNING' },
  { id: 'LOG-8818', time: '08:00 AM, May 19, 2026', user: 'Hospital Admin (Max)', action: 'Purchased Wallet Top-up', target: 'SMS Bundle (5k)', ip: '117.210.33.45', type: 'BILLING', status: 'SUCCESS' },
  { id: 'LOG-8817', time: '11:45 PM, May 18, 2026', user: 'System Routine', action: 'Database Backup', target: 'MongoDB Cluster', ip: 'localhost', type: 'SYSTEM', status: 'SUCCESS' },
  { id: 'LOG-8816', time: '04:20 PM, May 18, 2026', user: 'SuperAdmin (Praveen)', action: 'Deactivated Node', target: 'City Care Center', ip: '192.168.1.12', type: 'ADMIN', status: 'CRITICAL' },
];

export default function SuperAdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20">
      
      {/* TERMINAL HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 relative p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden group">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-rose-500/20 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-4">
             <Terminal className="size-4 text-rose-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security & Compliance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Audit <span className="text-rose-500 italic font-serif">Logs</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl text-sm leading-relaxed">
            Immutable system logs tracking administrator actions, security events, billing operations, and automated routines across the global network.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search event ID, IP, user..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-slate-600"
             />
          </div>
          <Button variant="outline" className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold bg-slate-950/50 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold bg-white text-slate-900 hover:bg-slate-200 shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* QUICK STATUS BAR */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 bg-white/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass">
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Auditing Active
        </div>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-2" />
        <div className="flex items-center gap-2">
          <Fingerprint className="w-3.5 h-3.5" />
          Strict Identity Verification Enabled
        </div>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-2" />
        <Button variant="ghost" className="h-6 px-2 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg ml-auto">
          <RefreshCw className="w-3 h-3 mr-1.5" /> Refresh Stream
        </Button>
      </div>

      {/* LOGS TABLE (TERMINAL STYLE) */}
      <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm glass overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30">
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Timestamp & ID</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor & IP</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Details</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
              {MOCK_LOGS.map((log, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-300 whitespace-nowrap">{log.time}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{log.id}</p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="outline" className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 w-fit bg-transparent ${
                      log.type === 'SYSTEM' ? 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400' :
                      log.type === 'ADMIN' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
                      log.type === 'SECURITY' ? 'border-amber-500/30 text-amber-600 dark:text-amber-400' :
                      'border-blue-500/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {log.type === 'SYSTEM' && <Server className="w-3 h-3" />}
                      {log.type === 'ADMIN' && <UserCog className="w-3 h-3" />}
                      {log.type === 'SECURITY' && <ShieldAlert className="w-3 h-3" />}
                      {log.type === 'BILLING' && <Database className="w-3 h-3" />}
                      {log.type}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">{log.user}</p>
                    <p className="text-xs font-mono font-medium text-slate-500 mt-0.5">{log.ip}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5"><span className="opacity-60 mr-1">Target:</span> {log.target}</p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge 
                      className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full w-fit ${
                        log.status === 'SUCCESS' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' 
                          : log.status === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                      }`}
                    >
                      {log.status}
                    </Badge>
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
