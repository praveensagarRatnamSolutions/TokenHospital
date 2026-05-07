'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Stethoscope,
  Zap,
  Activity,
  ArrowUpRight,
  Search,
  Building2,
  ChevronRight,
  Download,
  Loader2
} from 'lucide-react';
import { useDoctorReports } from '@/hooks/useDoctorReports';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/card';

export default function DoctorReportsPage() {
  const router = useRouter();
  const {
    data,
    isLoading,
    dateRange,
    search,
    departmentId,
    setStartDate,
    setEndDate,
    setSearch,
    setDepartmentId
  } = useDoctorReports();

  const [searchInput, setSearchInput] = useState('');
  const [exporting, setExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput, setSearch]);

  const report = data?.report || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        ...dateRange,
        ...(search ? { search } : {}),
        ...(departmentId ? { departmentId } : {}),
      });
      const res = await api.get(`/api/reports/doctor-performance/export?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Doctor_Performance_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
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

  // Fetch departments for filter
  const { data: deptData } = useQuery({
    queryKey: ['departments-list'],
    queryFn: async () => {
      const res = await api.get('/api/department');
      return res.data.departments || res.data.data || [];
    }
  });

  // Calculate Totals
  const totals = report.reduce((acc: any, curr: any) => ({
    patients: acc.patients + (curr.totalPatients || 0),
    revenue: acc.revenue + (curr.revenue || 0),
    completed: acc.completed + (curr.completedPatients || 0),
    emergencies: acc.emergencies + (curr.emergencyPatients || 0),
  }), { patients: 0, revenue: 0, completed: 0, emergencies: 0 });

  const topDoctor = report[0] || null;

  const handleDrillDown = (doc: any) => {
    const params = new URLSearchParams({
      doctorName: doc.doctorName,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    router.push(`/admin/reports/doctors/${doc._id}/patients?${params.toString()}`);
  };

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Medical Analytics
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Doctor <span className="text-primary italic font-serif">Performance</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-lg">
            Monitor consultation volumes, clinical efficiency, and revenue generation.
          </p>
        </div>

        {/* Date Filters + Export */}
        <div className="flex items-center gap-3 flex-wrap">
          <Card className="p-2 rounded-2xl border-slate-200 dark:border-slate-800 flex gap-2 shadow-sm bg-white dark:bg-slate-900">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center text-slate-300 font-black text-sm px-1">→</div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Card>

          <button
            onClick={handleExport}
            disabled={exporting || isLoading || report.length === 0}
            className="h-10 px-5 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-[1.02]"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Excel
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Consultations" value={totals.patients} icon={Users} color="blue" sub="Across all doctors" />
        <MetricCard title="Total Revenue" value={`₹${totals.revenue.toLocaleString()}`} icon={TrendingUp} color="emerald" sub="Generated in period" />
        <MetricCard
          title="Avg. Completion"
          value={totals.patients > 0 ? `${Math.round((totals.completed / totals.patients) * 100)}%` : '0%'}
          icon={Activity}
          color="amber"
          sub="Success rate"
        />
        <MetricCard title="Critical Cases" value={totals.emergencies} icon={Zap} color="red" sub="Emergency tokens" />
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-3 rounded-[2rem] border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 shadow-sm bg-white dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full h-12 pl-11 pr-8 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-700 dark:text-slate-200"
          >
            <option value="">All Departments</option>
            {Array.isArray(deptData) && deptData.map((d: any) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Top Performer Spotlight */}
        {topDoctor && (
          <Card className="lg:col-span-1 p-8 rounded-[2.5rem] border-none bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
              </svg>
            </div>
            <div>
              <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                🏆 Top Performer
              </span>
              <h2 className="text-3xl text-white mt-5 tracking-tighter leading-tight">
                {topDoctor.doctorName}
              </h2>
              <p className="text-white/60 font-bold mt-1 text-xs uppercase tracking-widest">
                {topDoctor.specialization}
              </p>
              <p className="text-white/50 font-bold mt-0.5 text-xs">
                {topDoctor.departmentName}
              </p>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <span className="text-xs font-bold text-white/60">Revenue Impact</span>
                <span className="text-2xl font-black">₹{topDoctor.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <span className="text-xs font-bold text-white/60">Total Patients</span>
                <span className="text-2xl font-black">{topDoctor.totalPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/60">Success Rate</span>
                <span className="text-2xl font-black">
                  {topDoctor.totalPatients > 0
                    ? Math.round((topDoctor.completedPatients / topDoctor.totalPatients) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Performance Table */}
        <Card className={`${topDoctor ? 'lg:col-span-2' : 'lg:col-span-3'} rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm`}>
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Doctor Rankings</h3>
            <BarChart3 className="w-5 h-5 text-slate-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Specialist</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Consults</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6">
                        <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : report.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic font-medium">
                      No doctor data found for this period.
                    </td>
                  </tr>
                ) : (
                  report.map((doc: any, i: number) => (
                    <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      {/* Specialist */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-sm">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">{doc.doctorName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.specialization}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {doc.departmentName}
                        </span>
                      </td>

                      {/* Consults - clickable drill-down */}
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => handleDrillDown(doc)}
                          className="group/btn inline-flex flex-col items-center gap-1 hover:scale-105 transition-all"
                        >
                          <span className="font-black text-2xl text-primary group-hover/btn:text-primary/80 transition-colors">
                            {doc.totalPatients}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-primary transition-colors">
                            View Patients <ChevronRight className="w-3 h-3" />
                          </span>
                        </button>
                      </td>

                      {/* Revenue */}
                      <td className="px-8 py-5 text-right">
                        <span className="font-black text-emerald-600 text-sm">₹{doc.revenue.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, sub }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    red: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <Card className="p-6 rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 italic">{sub}</p>
    </Card>
  );
}
