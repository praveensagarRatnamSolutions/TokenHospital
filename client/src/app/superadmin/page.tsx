'use client';

import { useEffect, useState } from 'react';
import { 
  Building2,
  Users, 
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { hospitalApi, Hospital } from '@/services/hospitalApi';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await hospitalApi.getAllHospitals();
        setHospitals(response.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch hospitals');
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const activeHospitals = hospitals.filter(h => h.isActive).length;
  const inactiveHospitals = hospitals.filter(h => !h.isActive).length;

  return (
    <div className="space-y-10 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <ShieldCheck className="size-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Overlord Terminal</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            System <span className="text-primary italic font-serif">Overview</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring and managing global hospital infrastructure</p>
        </div>
        <Link 
            href="/superadmin/hospitals/new" 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
        >
            <Plus className="size-5" />
            Provision Hospital
        </Link>
      </div>

      {error && (
        <div className="p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-[2rem] flex items-center gap-4 text-red-600">
          <AlertCircle className="size-6 shrink-0" />
          <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatusMetric 
          title="Total Units" 
          value={hospitals.length} 
          icon={Building2} 
          color="indigo"
          description="Provisioned nodes"
        />
        <StatusMetric 
          title="Active Nodes" 
          value={activeHospitals} 
          icon={Activity} 
          color="emerald"
          trend={`${hospitals.length > 0 ? Math.round((activeHospitals / hospitals.length) * 100) : 0}%`}
        />
        <StatusMetric 
          title="Maintenance" 
          value={inactiveHospitals} 
          icon={AlertCircle} 
          color="amber"
          description="Awaiting setup"
        />
        <StatusMetric 
          title="System Core" 
          value="STABLE" 
          icon={TrendingUp} 
          color="blue"
          description="Uptime: 99.9%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-xl tracking-tight">Recent Infrastructure</h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search hospitals..." 
                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none ring-primary/20 focus:ring-2 transition-all"
                />
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
                <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                <div className="h-4 w-48 bg-slate-50 dark:bg-slate-800 rounded" />
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-400 font-bold italic">No hospital nodes detected in the matrix</p>
              </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800">
                                <th className="pb-4 pt-1 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital Node</th>
                                <th className="pb-4 pt-1 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Endpoint</th>
                                <th className="pb-4 pt-1 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="pb-4 pt-1 px-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {hospitals.slice(0, 8).map((hospital) => (
                                <tr key={hospital._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-11 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-2xl flex items-center justify-center font-black text-lg">
                                                {hospital.name.charAt(0)}
                                            </div>
                                            <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{hospital.name}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-xs font-bold text-slate-400 font-mono tracking-tighter">{hospital.email}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            hospital.isActive 
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' 
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                        }`}>
                                            <span className={`size-1.5 rounded-full ${hospital.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {hospital.isActive ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="size-5 text-slate-300" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-32 bg-primary/20 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 relative z-10">Network Integrity</h4>
                
                <div className="space-y-6 relative z-10">
                    <MetricBar label="System Health" value={98} color="indigo" />
                    <MetricBar label="Network Latency" value={14} color="emerald" reverse />
                    <MetricBar label="Load Balancer" value={42} color="amber" />
                </div>
                
                <div className="mt-10 p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                        "Your system core is performing within optimal parameters. All 14 regional nodes are synchronized."
                    </p>
                </div>
            </div>

            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Quick Actions</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <QuickActionButton icon={TrendingUp} label="Reports" color="blue" />
                    <QuickActionButton icon={Users} label="Accounts" color="indigo" />
                    <QuickActionButton icon={AlertCircle} label="Audit Log" color="amber" />
                    <QuickActionButton icon={Plus} label="Deploy New" color="emerald" />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatusMetric({ title, value, icon: Icon, color, description, trend }: any) {
    const colors: any = {
        blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    
    return (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="size-6" />
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full tracking-widest">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{value}</h4>
            {description && <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{description}</p>}
        </div>
    );
}

function MetricBar({ label, value, color, reverse }: any) {
    const colorClasses: any = {
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
    };
    const displayValue = reverse ? 100 - value : value;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
                <p className="text-[10px] font-black text-white">{value}%</p>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${colorClasses[color]} transition-all duration-1000`} style={{ width: `${displayValue}%` }} />
            </div>
        </div>
    );
}

function QuickActionButton({ icon: Icon, label, color }: any) {
    return (
        <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-primary/5 group transition-all text-slate-400 hover:text-primary border border-transparent hover:border-primary/10">
            <Icon className="size-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
