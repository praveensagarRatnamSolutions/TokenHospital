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
  ArrowUpRight
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

  const { data: queueData, isLoading } = useQuery({
    queryKey: ['globalQueue', hospitalId],
    enabled: !!hospitalId,
    queryFn: async () => {
      const response = await api.get('/api/token', {
        params: { status: 'WAITING,CALLED' }
      });
      return response.data.tokens;
    }
  });

  const groupedQueue = useMemo(() => {
    if (!queueData) return {};
    return queueData.reduce((acc: any, token: any) => {
      const doctorName = token.doctorId?.name || 'Unassigned';
      const deptName = token.departmentId?.name || 'General';
      const key = `${doctorName} (${deptName})`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(token);
      return acc;
    }, {});
  }, [queueData]);

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Hospital Status</span>
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
          value={queueData?.filter((t: any) => t.status === 'WAITING').length || 0}
          icon={Ticket}
          color="blue"
        />
        <StatusMetric
          title="Active Consultations"
          value={queueData?.filter((t: any) => t.status === 'CALLED').length || 0}
          icon={Activity}
          color="emerald"
        />
        <StatusMetric
          title="Doctors Online"
          value={Object.keys(groupedQueue).length}
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
        ) : Object.keys(groupedQueue).length > 0 ? (
          Object.entries(groupedQueue).map(([groupKey, tokens]: [string, any]) => (
            <DoctorQueueCard key={groupKey} groupKey={groupKey} tokens={tokens} />
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
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h4>
    </div>
  );
}

function DoctorQueueCard({ groupKey, tokens }: any) {
  const activeToken = tokens.find((t: any) => t.status === 'CALLED');
  const waitingTokens = tokens.filter((t: any) => t.status === 'WAITING');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <h3 className="font-black text-lg tracking-tight truncate max-w-[200px]" title={groupKey}>
          {groupKey}
        </h3>
        <span className="size-2 rounded-full bg-emerald-500" />
      </div>

      <div className="p-6 flex-1 space-y-6">
        {/* Active Consultation Section */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Current Patient</label>
          {activeToken ? (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-3xl p-5 relative overflow-hidden group/active">
              <div className="absolute top-0 right-0 p-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex items-center gap-4">
                <div className="size-auto p-1 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/30">
                  {activeToken.tokenNumber}
                </div>
                <div className="truncate">
                  <p className="font-bold text-slate-900 dark:text-white text-lg truncate">
                    {activeToken.patientId?.name || activeToken.patientDetails?.name}
                  </p>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">In Session</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-center">
              <p className="text-sm font-bold text-slate-300 italic">No Active Consultation</p>
            </div>
          )}
        </div>

        {/* Queue List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Next in Queue</label>
            <span className="text-[10px] font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{waitingTokens.length} </span>
          </div>
          <div className="space-y-2">
            {waitingTokens.slice(0, 3).map((t: any) => (
              <div key={t._id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3 truncate">
                  <div className="size-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center text-[10px] shadow-sm">
                    {t.tokenNumber}
                  </div>
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate uppercase tracking-tighter">
                    {t.patientId?.name || t.patientDetails?.name}
                  </p>
                </div>
                <Clock className="w-3 h-3 text-slate-300 flex-shrink-0" />
              </div>
            ))}
            {waitingTokens.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">+ {waitingTokens.length - 3} more waiting</p>
              </div>
            )}
            {waitingTokens.length === 0 && !activeToken && (
              <div className="py-2 text-center">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No patients</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center gap-2">
        <Monitor className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kiosk View Active</span>
      </div>
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
      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Hospital Queue Clear</h3>
      <p className="text-slate-500 max-w-md mx-auto font-medium">No patients are currently in the queue. New registrations from the kiosk will appear here instantly.</p>
    </div>
  );
}
