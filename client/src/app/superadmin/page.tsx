'use client';

import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { type Hospital, hospitalApi } from '@/services/hospitalApi';
import { reportsApi } from '@/services/reportsApi';
import { subscriptionApi } from '@/services/subscriptionApi';

type ReportMetrics = {
  activeSubscriptions?: number;
  revenueMetricPeriodLabel?: string;
  subscriptionRevenue?: number;
  totalHospitals?: number;
  totalRevenue?: number;
  totalUsers?: number;
  walletRevenue?: number;
};

type SuperAdminReport = {
  metrics?: ReportMetrics;
};

type BillingItem = {
  _id?: string;
  amount?: number;
  createdAt?: string;
  hospitalId?: {
    name?: string;
  };
  planId?: string;
  razorpayPaymentId?: string;
  status?: string;
  type?: string;
};

const formatCurrency = (value?: number) =>
  `₹${Math.round(value || 0).toLocaleString('en-IN')}`;

const formatDate = (value?: string) => {
  if (!value) return 'N/A';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function SuperAdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [reportData, setReportData] = useState<SuperAdminReport | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [hospitalResponse, reportResponse, billingResponse] = await Promise.all([
          hospitalApi.getAllHospitals(),
          reportsApi.getSuperAdminReports({ timeRange: '1M' }),
          subscriptionApi.getHistory(),
        ]);

        setHospitals(hospitalResponse.data || []);
        setReportData(reportResponse || null);
        setBillingHistory(Array.isArray(billingResponse) ? billingResponse : []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metrics = reportData?.metrics || {};
  const activeHospitals = hospitals.filter((hospital) => hospital.isActive).length;
  const inactiveHospitals = hospitals.length - activeHospitals;
  const totalHospitals = metrics.totalHospitals ?? hospitals.length;
  const activeSubscriptions = metrics.activeSubscriptions ?? 0;
  const totalUsers = metrics.totalUsers ?? 0;
  const subscriptionRevenue = metrics.subscriptionRevenue ?? 0;
  const walletRevenue = metrics.walletRevenue ?? 0;
  const totalRevenue = metrics.totalRevenue ?? subscriptionRevenue + walletRevenue;
  const periodLabel = metrics.revenueMetricPeriodLabel || 'Current Month';
  const pendingInvoices = billingHistory.filter(
    (item) => item.status === 'PENDING',
  ).length;
  const completedInvoices = billingHistory.filter(
    (item) => item.status === 'COMPLETED',
  ).length;

  const revenueMix = totalRevenue
    ? Math.round((subscriptionRevenue / totalRevenue) * 100)
    : 0;
  const walletMix = totalRevenue ? 100 - revenueMix : 0;
  const activeHospitalRate = totalHospitals
    ? Math.round((activeHospitals / totalHospitals) * 100)
    : 0;
  const billingSuccessRate = billingHistory.length
    ? Math.round((completedInvoices / billingHistory.length) * 100)
    : 100;

  const filteredHospitals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return hospitals;

    return hospitals.filter((hospital) => {
      const city = hospital.address?.city?.toLowerCase() || '';
      return (
        hospital.name.toLowerCase().includes(term) ||
        hospital.email.toLowerCase().includes(term) ||
        city.includes(term)
      );
    });
  }, [hospitals, searchTerm]);

  const recentBilling = useMemo(
    () =>
      [...billingHistory]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 5),
    [billingHistory],
  );

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 relative p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Platform Command Center
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            SuperAdmin <span className="text-primary italic font-serif">Overview</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Track hospital nodes, subscriptions, billing velocity, wallet top-ups, and
            operational health from one global control surface.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Link
            href="/superadmin/reports"
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </Link>
          <Link
            href="/superadmin/hospitals"
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="size-5" />
            Provision Hospital
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-[2rem] flex items-center gap-4 text-red-600">
          <AlertCircle className="size-6 shrink-0" />
          <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-44 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <StatusMetric
              title="Hospital Nodes"
              value={totalHospitals}
              icon={Building2}
              color="blue"
              description={`${activeHospitals} active, ${inactiveHospitals} inactive`}
            />
            <StatusMetric
              title="Subscriptions"
              value={activeSubscriptions}
              icon={CreditCard}
              color="indigo"
              description="Active paid/trial nodes"
            />
            <StatusMetric
              title="Platform Users"
              value={totalUsers}
              icon={Users}
              color="amber"
              description="Admins and doctors"
            />
            <StatusMetric
              title="Subscription Revenue"
              value={formatCurrency(subscriptionRevenue)}
              icon={TrendingUp}
              color="emerald"
              description={periodLabel}
            />
            <StatusMetric
              title="Wallet Revenue"
              value={formatCurrency(walletRevenue)}
              icon={Wallet}
              color="purple"
              description={periodLabel}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Hospital Network
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Latest provisioned nodes
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search hospitals..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30">
                      <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Hospital
                      </th>
                      <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Region
                      </th>
                      <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Contact
                      </th>
                      <th className="py-4 px-6 md:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="py-4 px-6 md:px-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/70">
                    {filteredHospitals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-14 text-center">
                          <p className="text-sm font-bold text-slate-400">
                            No hospital nodes match this search.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredHospitals.slice(0, 8).map((hospital) => (
                        <tr
                          key={hospital._id}
                          className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-5 px-6 md:px-8">
                            <div className="flex items-center gap-4">
                              <div className="size-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-lg">
                                {hospital.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                                  {hospital.name}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                  {hospital.registrationNumber || 'Unregistered'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6 md:px-8">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {hospital.address?.city || 'N/A'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {hospital.address?.state || 'Region pending'}
                            </p>
                          </td>
                          <td className="py-5 px-6 md:px-8">
                            <p className="text-xs font-bold text-slate-400 font-mono">
                              {hospital.email}
                            </p>
                          </td>
                          <td className="py-5 px-6 md:px-8">
                            <StatusBadge active={hospital.isActive} />
                          </td>
                          <td className="py-5 px-6 md:px-8 text-right">
                            <Link
                              href={`/superadmin/hospitals/${hospital._id}`}
                              className="inline-flex size-9 items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <ArrowUpRight className="size-4" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-8">
              <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 size-40 bg-primary/20 blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Revenue Mix
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                      {periodLabel}
                    </p>
                  </div>
                  <div className="size-11 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                    <Zap className="size-5" />
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <MetricBar
                    label="Subscription Share"
                    value={revenueMix}
                    detail={formatCurrency(subscriptionRevenue)}
                    color="indigo"
                  />
                  <MetricBar
                    label="Wallet Share"
                    value={walletMix}
                    detail={formatCurrency(walletRevenue)}
                    color="purple"
                  />
                  <MetricBar
                    label="Active Hospitals"
                    value={activeHospitalRate}
                    detail={`${activeHospitals}/${totalHospitals}`}
                    color="emerald"
                  />
                  <MetricBar
                    label="Billing Success"
                    value={billingSuccessRate}
                    detail={`${pendingInvoices} pending`}
                    color="amber"
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                  <div className="flex items-end justify-between">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-black text-white tracking-tighter">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      Recent Billing
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Subscription and wallet activity
                    </p>
                  </div>
                  <Link
                    href="/superadmin/billing"
                    className="size-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary flex items-center justify-center transition-colors"
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentBilling.length === 0 ? (
                    <p className="text-sm font-bold text-slate-400 py-8 text-center">
                      No billing activity yet.
                    </p>
                  ) : (
                    recentBilling.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div
                            className={`size-10 rounded-2xl flex items-center justify-center ${
                              item.type === 'WALLET_TOPUP'
                                ? 'bg-purple-500/10 text-purple-600'
                                : 'bg-emerald-500/10 text-emerald-600'
                            }`}
                          >
                            {item.type === 'WALLET_TOPUP' ? (
                              <Wallet className="size-4" />
                            ) : (
                              <FileText className="size-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                              {item.hospitalId?.name || 'Unknown hospital'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {formatCurrency(item.amount)}
                          </p>
                          <BillingStatus status={item.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-8 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionLink
                    href="/superadmin/reports"
                    icon={TrendingUp}
                    label="Reports"
                  />
                  <QuickActionLink
                    href="/superadmin/billing"
                    icon={CreditCard}
                    label="Billing"
                  />
                  <QuickActionLink
                    href="/superadmin/settings"
                    icon={Settings}
                    label="Settings"
                  />
                  <QuickActionLink
                    href="/superadmin/wallet-packages"
                    icon={Wallet}
                    label="Wallets"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatusMetric({ title, value, icon: Icon, color, description }: any) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  };

  return (
    <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-3.5 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
        {value}
      </h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {description}
      </p>
    </div>
  );
}

function MetricBar({ label, value, detail, color }: any) {
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
  };
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end gap-4">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[10px] font-black text-white">{detail || `${value}%`}</p>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-1000`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        active
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}
      />
      {active ? 'Online' : 'Offline'}
    </span>
  );
}

function BillingStatus({ status }: { status?: string }) {
  const className =
    status === 'COMPLETED'
      ? 'text-emerald-600'
      : status === 'PENDING'
        ? 'text-amber-600'
        : 'text-rose-600';

  return (
    <p className={`text-[9px] font-black uppercase tracking-widest ${className}`}>
      {status || 'UNKNOWN'}
    </p>
  );
}

function QuickActionLink({ href, icon: Icon, label }: any) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-primary/5 group transition-all text-slate-400 hover:text-primary border border-transparent hover:border-primary/10"
    >
      <Icon className="size-6 mb-2 group-hover:scale-110 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}
