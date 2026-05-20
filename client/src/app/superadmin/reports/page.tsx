'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  CreditCard,
  Activity,
  Zap,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const revenueData = [
  { month: 'Jan', revenue: 45000, subscriptions: 120 },
  { month: 'Feb', revenue: 52000, subscriptions: 135 },
  { month: 'Mar', revenue: 48000, subscriptions: 125 },
  { month: 'Apr', revenue: 61000, subscriptions: 150 },
  { month: 'May', revenue: 75000, subscriptions: 180 },
  { month: 'Jun', revenue: 85000, subscriptions: 210 },
  { month: 'Jul', revenue: 105000, subscriptions: 255 },
];

const walletData = [
  { month: 'Jan', sms: 1200, email: 3000 },
  { month: 'Feb', sms: 1900, email: 4500 },
  { month: 'Mar', sms: 2400, email: 5100 },
  { month: 'Apr', sms: 3100, email: 6200 },
  { month: 'May', sms: 4500, email: 8000 },
  { month: 'Jun', sms: 5800, email: 9500 },
  { month: 'Jul', sms: 7200, email: 12000 },
];

export default function SuperAdminReports() {
  const [timeRange, setTimeRange] = useState('7M');

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 relative p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-4">
             <Activity className="size-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Analytics Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Global <span className="text-primary italic font-serif">Reports</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Monitor system-wide platform usage, track recurring revenue, and audit wallet consumption across all active hospital nodes.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="rounded-2xl h-12 px-6 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Monthly Recurring Rev" 
          value="₹1,05,000" 
          trend="+23.5%" 
          icon={TrendingUp} 
          color="emerald" 
        />
        <MetricCard 
          title="Active Subscriptions" 
          value="255" 
          trend="+12%" 
          icon={CreditCard} 
          color="indigo" 
        />
        <MetricCard 
          title="Total Hospitals" 
          value="312" 
          trend="+8%" 
          icon={Building2} 
          color="blue" 
        />
        <MetricCard 
          title="Daily Active Users" 
          value="14.2k" 
          trend="+18.2%" 
          icon={Users} 
          color="amber" 
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Revenue Growth</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Subscription Income</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {['1M', '3M', '7M', '1Y'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wallet Consumption Bar Chart */}
        <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-700 pointer-events-none" />
          
          <div className="mb-8 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="size-4 text-purple-400" />
              <h3 className="text-xl font-black">Wallet Consumption</h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add-on Credits Used</p>
          </div>

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={walletData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '20px' }} />
                <Bar dataKey="sms" name="SMS Credits" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="email" name="Email Credits" fill="#c084fc" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
            <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-2xl h-12 font-bold backdrop-blur-md transition-all">
              View Detailed Ledger
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{value}</h4>
    </div>
  );
}
