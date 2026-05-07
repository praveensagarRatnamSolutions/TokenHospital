'use client';

import React, { useMemo, useEffect } from 'react';
import {
  Users,
  Ticket,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Monitor,
  Activity,
  ArrowUpRight,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { StatsCard } from '@/components/admin/StatsCard';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { socket, joinHospital } = useSocket();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const hospitalId = user?.hospitalId;

  useEffect(() => {
    if (hospitalId && joinHospital) {
      joinHospital(hospitalId);
    }
  }, [hospitalId, joinHospital]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['globalQueue'] });
    };
    socket.on('queue-updated', handleUpdate);
    return () => {
      socket.off('queue-updated', handleUpdate);
    };
  }, [socket, queryClient]);

  const { data: queueResponse, isLoading } = useQuery({
    queryKey: ['globalQueue', hospitalId],
    enabled: !!hospitalId,
    queryFn: async () => {
      const response = await api.get('/api/token/global-queue');
      return response.data;
    },
  });

  const stats = queueResponse?.stats;
  const queue = queueResponse?.queue || [];

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Live Hospital Status
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Global Queue <span className="text-primary italic font-serif">Board</span>
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient..."
              className="pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none w-full md:w-72 transition-all"
            />
          </div>
          <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusMetric
          title="In Queue"
          value={stats?.waitingCount || 0}
          icon={Ticket}
          color="blue"
        />
        <StatusMetric
          title="Active Consultations"
          value={stats?.activeCount || 0}
          icon={Activity}
          color="emerald"
        />
        <StatusMetric
          title="Doctors Online"
          value={stats?.doctorsOnline || 0}
          icon={Users}
          color="indigo"
        />
        <StatusMetric
          title="Patient Throughput"
          value="96%"
          icon={TrendingUp}
          color="amber"
          trend="+2.4%"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <LoadingPlaceholder />
        ) : queue.length > 0 ? (
          queue.map((docQueue: any) => (
            <DoctorQueueCard
              key={docQueue._id}
              groupKey={`${docQueue.doctorName} (${docQueue.departmentName})`}
              activeToken={docQueue.activeToken}
              waitingTokens={docQueue.waitingTokens}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function StatusMetric({ title, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
        {title}
      </p>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        {value}
      </h4>
    </div>
  );
}

function DoctorQueueCard({ groupKey, activeToken, waitingTokens }: any) {
  console.log('Rendering DoctorQueueCard for', groupKey, { activeToken, waitingTokens });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <h3
          className="font-black text-lg tracking-tight truncate max-w-[200px]"
          title={groupKey}
        >
          {groupKey}
        </h3>
        <span className="size-2 rounded-full bg-emerald-500" />
      </div>

      <div className="p-6 flex-1 space-y-6">
        {/* Active Consultation Section */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">
            Current Patient
          </label>
          {activeToken ? (
            <div
              className={`border-2 rounded-3xl p-5 relative overflow-hidden group/active transition-all ${
                activeToken.isEmergency
                  ? 'bg-red-600 text-white border-red-700 shadow-xl shadow-red-200 shadow-red-900/10'
                  : 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'
              }`}
            >
              <div className="absolute top-0 right-0 p-2">
                {activeToken.isEmergency ? (
                  <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`size-auto p-1 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ${
                    activeToken.isEmergency
                      ? 'bg-white text-red-600'
                      : 'bg-primary text-white shadow-primary/30'
                  }`}
                >
                  {activeToken.tokenNumber}
                </div>
                <div className="truncate">
                  <p
                    className={`font-bold text-lg truncate ${activeToken.isEmergency ? 'text-white' : 'text-slate-900 dark:text-white'}`}
                  >
                    {activeToken.patient?.name || activeToken.patientDetails?.name}
                  </p>
                  {(activeToken.patient?.phone || activeToken.patientDetails?.phone) && (
                    <p className={`text-xs text-dark-200 dark:text-dark-400 truncate`}>
                      {formatPhone(activeToken.patient?.phone || activeToken.patientDetails?.phone)}
                    </p>
                  )}
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${activeToken.isEmergency ? 'text-white/80' : 'text-primary'}`}
                  >
                    {activeToken.isEmergency ? 'High Priority' : 'In Session'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-center">
              <p className="text-sm font-bold text-slate-300 italic">
                No Active Consultation
              </p>
            </div>
          )}
        </div>

        {/* Queue List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Next in Queue
            </label>
            <span className="text-[10px] font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {waitingTokens.length}{' '}
            </span>
          </div>
          <div className="space-y-2">
            {waitingTokens.slice(0, 3).map((t: any) => (
              <div
                key={t._id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  t.isEmergency
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                    : t.isPostponed
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800'
                      : 'bg-slate-50/50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`size-10 border font-bold rounded-xl flex items-center justify-center text-[10px] shadow-sm ${
                      t.isEmergency
                        ? 'bg-red-600 text-white border-red-700'
                        : t.isPostponed
                          ? 'bg-yellow-500 text-white border-yellow-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.tokenNumber}
                  </div>

                  <div className="truncate">
                    <p
                      className={`font-bold text-sm truncate uppercase tracking-tighter ${
                        t.isEmergency
                          ? 'text-red-700 dark:text-red-400'
                          : t.isPostponed
                            ? 'text-yellow-700 dark:text-yellow-400'
                            : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.patient?.name || t.patientDetails?.name}
                    </p>
                    {(t.patient?.phone || t.patientDetails?.phone) && (
                      <p className="text-[11px] text-slate-400 truncate">
                         {formatPhone(t.patient?.phone || t.patientDetails?.phone)}
                      </p>
                    )}

                    {t.isEmergency && (
                      <p className="text-[8px] font-black text-red-600 uppercase tracking-widest animate-pulse">
                        Emergency
                      </p>
                    )}

                    {t.isPostponed && !t.isEmergency && (
                      <p className="text-[8px] font-black text-yellow-600 uppercase tracking-widest">
                        Postponed
                      </p>
                    )}
                  </div>
                </div>

                {t.isEmergency ? (
                  <Zap className="w-3 h-3 text-red-500 fill-red-500 animate-pulse flex-shrink-0" />
                ) : t.isPostponed ? (
                  <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-300 flex-shrink-0" />
                )}
              </div>
            ))}
            {waitingTokens.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">
                  + {waitingTokens.length - 3} more waiting
                </p>
              </div>
            )}
            {waitingTokens.length === 0 && !activeToken && (
              <div className="py-2 text-center">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  No patients
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center gap-2">
        <Monitor className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Kiosk View Active
        </span>
      </div> */}
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="col-span-full py-20 text-center animate-pulse">
      <div className="size-16 bg-slate-200 rounded-full mx-auto mb-4" />
      <div className="h-4 w-48 bg-slate-100 rounded mx-auto mb-2" />
      <div className="h-3 w-32 bg-slate-50 rounded mx-auto" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 border border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
      <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
        <Ticket className="w-12 h-12 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
        Hospital Queue Clear
      </h3>
      <p className="text-slate-500 max-w-md mx-auto font-medium">
        No patients are currently in the queue. New registrations from the kiosk will
        appear here instantly.
      </p>
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
