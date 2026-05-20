'use client';

import {
  Activity,
  Building2,
  Calendar,
  CreditCard,
  Download,
  Filter,
  Loader2,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { hospitalApi } from '@/services/hospitalApi';
import { reportsApi } from '@/services/reportsApi';

export default function SuperAdminReports() {
  const [timeRange, setTimeRange] = useState('7M');
  const [showFilters, setShowFilters] = useState(false);
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalStatus, setHospitalStatus] = useState('ALL');
  const [subscriptionStatus, setSubscriptionStatus] = useState('ALL');
  const [transactionType, setTransactionType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);

  const reportParams = React.useMemo(
    () => ({
      timeRange,
      hospitalId,
      hospitalStatus,
      subscriptionStatus,
      transactionType,
      startDate,
      endDate,
    }),
    [
      timeRange,
      hospitalId,
      hospitalStatus,
      subscriptionStatus,
      transactionType,
      startDate,
      endDate,
    ],
  );

  const activeFilterCount = [
    hospitalId,
    hospitalStatus !== 'ALL',
    subscriptionStatus !== 'ALL',
    transactionType !== 'ALL',
    startDate,
    endDate,
  ].filter(Boolean).length;

  React.useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await hospitalApi.getAllHospitals();
        setHospitals(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        console.error('Failed to fetch hospital filters:', err);
      }
    };

    fetchHospitals();
  }, []);

  React.useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await reportsApi.getSuperAdminReports(reportParams);
        setReportData(data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportParams]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setStartDate('');
    setEndDate('');
  };

  const resetFilters = () => {
    setTimeRange('7M');
    setHospitalId('');
    setHospitalStatus('ALL');
    setSubscriptionStatus('ALL');
    setTransactionType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const handleExport = async () => {
    try {
      const blob = await reportsApi.exportSuperAdminReports(reportParams);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute(
        'download',
        `Global_Reports_${new Date().toISOString().split('T')[0]}.xlsx`,
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              System Analytics Engine
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Global <span className="text-primary italic font-serif">Reports</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Monitor system-wide platform usage, track recurring revenue, and audit wallet
            consumption across all active hospital nodes.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full sm:w-auto rounded-2xl h-12 px-6 font-bold ${showFilters ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Button>
          <Button
            onClick={handleExport}
            className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl animate-in slide-in-from-top-4 fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Report Filters
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Hospital
              </label>
              <select
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Hospitals</option>
                {hospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Hospital Status
              </label>
              <select
                value={hospitalStatus}
                onChange={(e) => setHospitalStatus(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Subscription
              </label>
              <select
                value={subscriptionStatus}
                onChange={(e) => setSubscriptionStatus(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">Active Subscriptions</option>
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Active</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">All Transactions</option>
                <option value="SUBSCRIPTION">Subscriptions</option>
                <option value="WALLET_TOPUP">Wallet Top-ups</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-10 px-4 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* METRICS ROW */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <MetricCard
              title="Total Hospitals"
              value={reportData?.metrics?.totalHospitals?.toString() || '0'}
              trend={activeFilterCount ? 'Filtered' : 'All Time'}
              icon={Building2}
              color="blue"
            />
            <MetricCard
              title={
                reportData?.metrics?.subscriptionMetricLabel || 'Active Subscriptions'
              }
              value={reportData?.metrics?.activeSubscriptions?.toString() || '0'}
              trend={subscriptionStatus === 'ALL' ? 'Current' : 'Filtered'}
              icon={CreditCard}
              color="indigo"
            />
            <MetricCard
              title="Platform Users"
              value={reportData?.metrics?.totalUsers?.toString() || '0'}
              trend={activeFilterCount ? 'Filtered' : 'Global'}
              icon={Users}
              color="amber"
            />
            <MetricCard
              title="Subscription Revenue"
              value={`₹${(reportData?.metrics?.subscriptionRevenue || 0).toLocaleString()}`}
              trend={reportData?.metrics?.revenueMetricPeriodLabel || 'Current Month'}
              icon={TrendingUp}
              color="emerald"
            />
            <MetricCard
              title="Wallet Revenue"
              value={`₹${(reportData?.metrics?.walletRevenue || 0).toLocaleString()}`}
              trend={reportData?.metrics?.revenueMetricPeriodLabel || 'Current Month'}
              icon={Wallet}
              color="purple"
            />
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Area Chart */}
            <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    Revenue Growth
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    {transactionType === 'WALLET_TOPUP'
                      ? 'Wallet Top-up Income'
                      : 'Subscription Income'}
                  </p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  {['1M', '3M', '7M', '1Y'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTimeRangeChange(t)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[350px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={reportData?.revenueData || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                      tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                      }}
                      itemStyle={{ color: '#0f172a', fontWeight: 900 }}
                      formatter={(value: any) => [
                        `₹${value.toLocaleString()}`,
                        reportData?.metrics?.revenueMetricLabel || 'Revenue',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
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
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Est. Top-up Values
                </p>
              </div>

              <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData?.walletData || []}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                      tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(10px)',
                      }}
                      formatter={(value: any, name: any) => [
                        `₹${value.toLocaleString()}`,
                        name === 'sms' ? 'SMS Value' : 'Email Value',
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '10px',
                        fontWeight: 700,
                        paddingTop: '20px',
                      }}
                    />
                    <Bar
                      dataKey="sms"
                      name="SMS Value"
                      fill="#818cf8"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="email"
                      name="Email Value"
                      fill="#c084fc"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
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
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-3.5 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <h4 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
        {value}
      </h4>
    </div>
  );
}
