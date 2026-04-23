'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import {
  Activity,
  History,
  User,
  Users,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  ClipboardList,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  UserCheck,
  UserMinus,
  ShieldAlert,
  ArrowRight,
  Save,
  Thermometer,
  Heart,
  Droplets,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { format } from 'date-fns';
import DoctorEmergencyModal from './components/DoctorEmergencyModal';

// Helper for phone formatting
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

export default function DoctorDashboard() {
  const queryClient = useQueryClient();
  const { socket, joinHospital } = useSocket();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const doctorId = user?.doctorId;
  const hospitalId = user?.hospitalId;

  useEffect(() => {
    if (hospitalId) {
      joinHospital(hospitalId);
    }
  }, [hospitalId, joinHospital]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
    };
    socket.on('queue-updated', handleUpdate);
    return () => {
      socket.off('queue-updated', handleUpdate);
    };
  }, [socket, queryClient, doctorId]);

  const [isConsultationSaved, setIsConsultationSaved] = useState(false);
  const [sessionTime, setSessionTime] = useState('00:00');
  const [patientDetails, setPatientDetails] = useState({ age: '', gender: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [prescription, setPrescription] = useState<any[]>([]);
  const [newMedicine, setNewMedicine] = useState({
    medicineName: '',
    dosage: '',
    duration: '',
    instructions: '',
  });
  const [vitals, setVitals] = useState({ bp: '', hr: '', spo2: '', temp: '' });

  // Queries
  const { data: currentToken, isLoading: loadingCurrent } = useQuery({
    queryKey: ['currentToken', doctorId],
    queryFn: async () => {
      const response = await api.get('/api/token/current', { params: { doctorId } });
      return response.data.data;
    },
  });

  const { data: upcomingTokens, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcomingTokens', doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const response = await api.get('/api/token', {
        params: { doctorId, status: 'WAITING', limit: 10 },
      });
      return response.data.tokens;
    },
  });

  const orderedUpcomingTokens = upcomingTokens
    ? [...upcomingTokens].sort((a: any, b: any) => {
      // 1. Emergency first
      if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;

      // 2. Use sortKey (crucial for postpone logic)
      const timeA = new Date(a.sortKey || a.createdAt || 0).getTime();
      const timeB = new Date(b.sortKey || b.createdAt || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;

      // 3. Fallback to token number numeric value
      const numA = parseInt(a.tokenNumber?.toString().replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.tokenNumber?.toString().replace(/\D/g, '') || '0', 10);
      return numA - numB;
    })
    : [];

  const nextToken = orderedUpcomingTokens[0];
  const remainingTokens = orderedUpcomingTokens.slice(1);

  const { data: patientHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['patientHistory', currentToken?.patientId?._id],
    enabled: !!currentToken?.patientId?._id && isHistoryOpen,
    queryFn: async () => {
      const response = await api.get(
        `/api/patient/${currentToken.patientId._id}/consultations`,
      );
      return response.data.data;
    },
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['doctorStats', doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const response = await api.get(`/api/doctor/${doctorId}/stats`);
      return response.data.data;
    },
  });

  const { data: doctorProfile } = useQuery({
    queryKey: ['doctorProfile', doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const response = await api.get(`/api/doctor/${doctorId}`);
      return response.data.data;
    },
  });

  // Sync patient details when token changes
  useEffect(() => {
    if (currentToken?.patientId) {
      setPatientDetails({
        age: currentToken.patientId.age?.toString() || '',
        gender: currentToken.patientId.gender || 'Male',
      });
    }
  }, [currentToken]);

  // Timer Logic
  useEffect(() => {
    if (!currentToken || currentToken.status !== 'CALLED' || !currentToken.calledAt) {
      setSessionTime('00:00');
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(currentToken.calledAt).getTime();
      const diff = Math.floor((Date.now() - startTime) / 1000);
      if (diff < 0) {
        setSessionTime('00:00');
        return;
      }
      const mins = Math.floor(diff / 60)
        .toString()
        .padStart(2, '0');
      const secs = (diff % 60).toString().padStart(2, '0');
      setSessionTime(`${mins}:${secs}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentToken]);

  // Mutations
  const callNextMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/token/next', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
      refetchStats();
      resetForm();
    },
  });

  const completeMutation = useMutation({
    mutationFn: (data: { id: string; consultation: any }) =>
      api.patch(`/api/token/${data.id}/complete`, data.consultation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
      refetchStats();
    },
  });

  const skipMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/token/${id}/skip`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => api.patch(`/api/doctor/${doctorId}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfile', doctorId] });
    },
  });

  const resetForm = () => {
    setDiagnosis('');
    setSymptoms('');
    setPrescription([]);
    setVitals({ bp: '', hr: '', spo2: '', temp: '' });
    setIsConsultationSaved(false);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    if (!symptoms.trim()) newErrors.symptoms = 'At least one symptom is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveConsultation = async () => {
    if (!currentToken) return;
    if (!validate()) return;

    try {
      await api.post(`/api/patient/${currentToken.patientId._id}/consultation`, {
        tokenId: currentToken._id,
        diagnosis,
        symptoms: symptoms
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
        prescription,
        vitals,
      });
      setIsConsultationSaved(true);
    } catch (error) {
      console.error('Save error', error);
    }
  };

  const handleComplete = async () => {
    if (!currentToken?._id) return;

    // Auto-save consultation data if present
    const consultation = {
      diagnosis,
      symptoms: symptoms
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      vitals,
      prescription,
      patientUpdates: patientDetails, // Backend can use this to update patient record
    };

    completeMutation.mutate({
      id: currentToken._id,
      consultation:
        diagnosis || symptoms || Object.values(vitals).some((v) => v) ? consultation : {},
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      {/* ROW 1: DOCTOR STATUS & QUICK STATS */}
      <div className="xl:col-span-12 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div
            className={cn(
              'p-6 rounded-[2.5rem] border shadow-xl transition-all duration-500',
              doctorProfile?.isAvailable
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800',
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <p
                className={cn(
                  'text-[10px] font-black uppercase tracking-[0.2em]',
                  doctorProfile?.isAvailable ? 'text-white/80' : 'text-slate-400',
                )}
              >
                Terminal Status
              </p>
              <div
                className={cn(
                  'size-2 rounded-full animate-pulse',
                  doctorProfile?.isAvailable ? 'bg-white' : 'bg-slate-300',
                )}
              />
            </div>
            <h3 className="text-2xl font-black mb-6 tracking-tight">
              {doctorProfile?.isAvailable ? 'Ready for Patients' : 'Terminal Paused'}
            </h3>
            <button
              onClick={() => toggleStatusMutation.mutate()}
              className={cn(
                'w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg',
                doctorProfile?.isAvailable
                  ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30',
              )}
            >
              {doctorProfile?.isAvailable ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          <QuickStatCard
            label="Patients Seen"
            value={stats?.totalSeenToday || 0}
            icon={UserCheck}
            color="emerald"
            trend="+12%"
          />
          <QuickStatCard
            label="Avg Consult"
            value={`${stats?.avgConsultationTime || 0}m`}
            icon={Clock}
            color="blue"
          />
          <QuickStatCard
            label="Waiting Now"
            value={stats?.currentWaiting || 0}
            icon={Users}
            color="amber"
          />
        </div>
      </div>

      {/* ROW 2: PATIENT SPOTLIGHT & LIVE QUEUE (2 COL) */}
      <div className="xl:col-span-8 space-y-8">
        {loadingCurrent ? (
          <div className="h-96 glass rounded-[3rem] animate-pulse flex flex-col items-center justify-center space-y-4">
            <div className="size-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ) : currentToken ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Patient Spotlight Card */}
            <div
              className={cn(
                'p-8 rounded-[3rem] border relative overflow-hidden shadow-2xl transition-all duration-500',
                currentToken.isEmergency
                  ? 'bg-slate-950 border-red-500/50 animate-emergency-glow ring-1 ring-red-500/20'
                  : 'glass border-slate-200 dark:border-slate-800',
              )}
            >
              {/* Background Accent */}
              {!currentToken.isEmergency && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[5rem] -z-10" />
              )}

              <div className="flex items-start justify-between mb-10">
                <div className="flex gap-6 items-center">
                  <div
                    className={cn(
                      'size-20 rounded-3xl flex items-center justify-center text-1xl font-black shadow-lg',
                      currentToken.isEmergency
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 ring-1 ring-red-400/30'
                        : 'bg-primary text-white shadow-primary/30',
                    )}
                  >
                    {currentToken.tokenNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2
                        className={cn(
                          'text-4xl font-black tracking-tight',
                          currentToken.isEmergency
                            ? 'text-white'
                            : 'text-slate-900 dark:text-white',
                        )}
                      >
                        {currentToken.patientId?.name}
                      </h2>
                      {currentToken.isEmergency && (
                        <span className="bg-red-500/20 text-red-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-red-500/30">
                          <Zap className="size-3 fill-white" /> Emergency
                        </span>
                      )}
                      <button
                        onClick={() => setIsHistoryOpen(true)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border',
                          currentToken.isEmergency
                            ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                            : 'bg-slate-100 text-slate-500 border-slate-200',
                        )}
                      >
                        <History className="size-3" /> Visit History
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all',
                          currentToken.isEmergency
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
                        )}
                      >
                        <span className="text-[9px] font-black uppercase opacity-60">
                          Age
                        </span>
                        <input
                          type="number"
                          value={patientDetails.age}
                          onChange={(e) =>
                            setPatientDetails({ ...patientDetails, age: e.target.value })
                          }
                          className="bg-transparent border-none outline-none w-10 text-xs font-black p-0 focus:ring-0"
                        />
                      </div>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all',
                          currentToken.isEmergency
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
                        )}
                      >
                        <span className="text-[9px] font-black uppercase opacity-60">
                          Sex
                        </span>
                        <select
                          value={patientDetails.gender}
                          onChange={(e) =>
                            setPatientDetails({
                              ...patientDetails,
                              gender: e.target.value,
                            })
                          }
                          className="bg-transparent border-none outline-none text-xs font-black p-0 focus:ring-0 appearance-none cursor-pointer"
                        >
                          <option value="Male">M</option>
                          <option value="Female">F</option>
                          <option value="Other">O</option>
                        </select>
                      </div>
                      <p
                        className={cn(
                          'text-xs font-bold',
                          currentToken.isEmergency ? 'text-white/80' : 'text-slate-500',
                        )}
                      >
                        • {formatPhone(currentToken.patientId?.phone)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p
                    className={cn(
                      'text-[10px] font-black uppercase tracking-[0.2em] mb-1',
                      currentToken.isEmergency ? 'text-white/60' : 'text-slate-400',
                    )}
                  >
                    In Session For
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-mono font-bold',
                      currentToken.isEmergency ? 'text-white' : 'text-primary',
                    )}
                  >
                    {sessionTime}
                  </p>
                </div>
              </div>

              {/* Patient Vitals Quick-View */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <VitalBox
                  label="BP"
                  value={vitals.bp}
                  icon={Heart}
                  color="rose"
                  editable
                  onChange={(val: string) => setVitals({ ...vitals, bp: val })}
                  placeholder="120/80"
                />
                <VitalBox
                  label="HR"
                  value={vitals.hr}
                  icon={Activity}
                  color="blue"
                  editable
                  onChange={(val: string) => setVitals({ ...vitals, hr: val })}
                  placeholder="72"
                />
                <VitalBox
                  label="SpO2"
                  value={vitals.spo2}
                  icon={Droplets}
                  color="emerald"
                  editable
                  onChange={(val: string) => setVitals({ ...vitals, spo2: val })}
                  placeholder="98"
                />
                <VitalBox
                  label="Temp"
                  value={vitals.temp}
                  icon={Thermometer}
                  color="orange"
                  editable
                  onChange={(val: string) => setVitals({ ...vitals, temp: val })}
                  placeholder="98.6"
                />
              </div>
            </div>

            {/* Clinical Entry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={cn(
                  'glass p-6 rounded-[2.5rem] border transition-all',
                  errors.symptoms
                    ? 'border-red-500 shadow-red-500/10 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800',
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList className="size-4 text-primary" /> Symptoms &
                    Observation
                  </h4>
                  {errors.symptoms && (
                    <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1">
                      <AlertTriangle className="size-3" /> Required
                    </span>
                  )}
                </div>
                <textarea
                  value={symptoms}
                  onChange={(e) => {
                    setSymptoms(e.target.value);
                    if (e.target.value.trim()) setErrors({ ...errors, symptoms: '' });
                  }}
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border-none outline-none min-h-[120px] text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Record patient symptoms..."
                />
              </div>
              <div
                className={cn(
                  'glass p-6 rounded-[2.5rem] border transition-all',
                  errors.diagnosis
                    ? 'border-red-500 shadow-red-500/10 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800',
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Stethoscope className="size-4 text-primary" /> Clinical Diagnosis
                  </h4>
                  {errors.diagnosis && (
                    <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1">
                      <AlertTriangle className="size-3" /> Required
                    </span>
                  )}
                </div>
                <textarea
                  value={diagnosis}
                  onChange={(e) => {
                    setDiagnosis(e.target.value);
                    if (e.target.value.trim()) setErrors({ ...errors, diagnosis: '' });
                  }}
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border-none outline-none min-h-[120px] text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  placeholder="Final diagnosis..."
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveConsultation}
                disabled={!diagnosis || isConsultationSaved}
                className={cn(
                  'flex-1 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl',
                  isConsultationSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary text-white shadow-primary/30 hover:bg-primary/90',
                )}
              >
                {isConsultationSaved ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <Save className="size-6" />
                )}
                {isConsultationSaved ? 'Consultation Saved' : 'Save Record'}
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-5 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl hover:opacity-90"
              >
                <ArrowRight className="size-6" /> Complete & Next
              </button>
              <button
                onClick={() => skipMutation.mutate(currentToken._id)}
                className="p-5 rounded-[2rem] glass border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-500 transition-all"
              >
                <UserMinus className="size-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
            <div className="size-32 bg-primary/10 rounded-full flex items-center justify-center animate-bounce-subtle">
              <User className="size-16 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Queue Clear
              </h3>
              <p className="text-slate-500 font-medium text-lg">
                Waiting for new patients to be assigned...
              </p>
            </div>
            <button
              onClick={() => callNextMutation.mutate({ doctorId })}
              disabled={!upcomingTokens?.length}
              className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
            >
              Call Next Patient
            </button>
          </div>
        )}
      </div>

      {/* ROW 2: LIVE QUEUE FEED (4 COL) */}
      <div className="xl:col-span-4 space-y-6">
        <div className="glass p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Users className="size-5 text-primary" /> Live Queue
            </h3>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-4 py-1.5 bg-red-500 text-white rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20 text-[9px] font-black uppercase tracking-widest"
            >
              <Zap className="size-3 fill-white" /> Emergency
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {loadingUpcoming ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-20 glass rounded-2xl animate-pulse" />
                ))
            ) : nextToken ? (
              <>
                <div
                  className={cn(
                    'p-4 rounded-3xl border shadow-sm transition-all duration-300',
                    nextToken.isEmergency
                      ? 'bg-slate-950 border-red-500/30 dark:bg-slate-950 shadow-[0_0_20px_-10px_rgba(239,68,68,0.3)]'
                      : nextToken.isPostponed
                        ? 'bg-amber-50/80 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900'
                        : 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700',
                  )}
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                        Next Patient
                      </p>

                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={cn(
                          'px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm',
                          nextToken.isEmergency
                            ? 'bg-red-500 text-white animate-pulse'
                            : nextToken.isPostponed
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-900 text-white',
                        )}
                      >
                        {nextToken.isEmergency
                          ? 'Emergency'
                          : nextToken.isPostponed
                            ? 'Postponed'
                            : 'Waiting'}
                      </div>
                      {nextToken.isEmergency && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-red-500 animate-pulse uppercase tracking-widest">
                          <ShieldAlert className="size-3" /> Urgent
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "min-w-14 h-14 px-3 rounded-3xl flex items-center justify-center font-black text-lg shadow-lg",
                      nextToken.isEmergency ? "bg-red-500 text-white shadow-red-500/20" : "bg-slate-950 text-white"
                    )}>
                      {nextToken.tokenNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-xl font-black truncate",
                        nextToken.isEmergency ? "text-red-500 dark:text-red-400" : "text-slate-900 dark:text-white"
                      )}>
                        {nextToken.patientId?.name || 'Unknown Patient'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          {nextToken.patientId?.age} yrs ·{' '}
                          {nextToken.patientId?.gender || 'N/A'}
                        </p>
                        <span className={cn(
                          "size-1 rounded-full",
                          nextToken.isEmergency ? "bg-red-500" : "bg-slate-300"
                        )} />
                        <p className="text-xs font-medium text-slate-400 truncate">
                          {formatPhone(nextToken.patientId?.phone)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      Remaining Queue
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      {remainingTokens.length} next
                    </span>
                  </div>
                  {remainingTokens.length ? (
                    remainingTokens.map((token: any, index: number) => (
                      <div
                        key={token._id}
                        className={cn(
                          'p-4 rounded-3xl border transition-all duration-300 group hover:scale-[1.02]',
                          token.isEmergency
                            ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900'
                            : token.isPostponed
                              ? 'bg-amber-50/80 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900'
                              : 'bg-white dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700',
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'min-w-10 h-10 px-2 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm',
                                token.isEmergency
                                  ? 'bg-red-600 text-white'
                                  : token.isPostponed
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300',
                              )}
                            >
                              {token.tokenNumber}
                            </div>
                            <div className="truncate">
                              <p
                                className={cn(
                                  'font-black text-sm truncate',
                                  token.isEmergency
                                    ? 'text-red-700 dark:text-red-400'
                                    : token.isPostponed
                                      ? 'text-amber-700 dark:text-amber-400'
                                      : 'text-slate-900 dark:text-white',
                                )}
                              >
                                {token.patientId?.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-tight">
                                {token.patientId?.age}yrs •{' '}
                                {token.isPostponed ? 'Postponed' : 'Waiting'}
                              </p>
                            </div>
                          </div>
                          {token.isPostponed && (
                            <div className="bg-amber-500/10 p-1.5 rounded-lg">
                              <Clock className="size-3 text-amber-600 animate-pulse" />
                            </div>
                          )}
                          {!token.isPostponed && (
                            <ChevronRight className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 space-y-3">
                      <p className="text-sm font-bold text-slate-400 italic">
                        No patients waiting
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 space-y-3">
                <p className="text-sm font-bold text-slate-400 italic">
                  No patients waiting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PATIENT HISTORY DRAWER */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent
          side="right"
          className="w-[400px] sm:w-[540px] p-0 border-none shadow-2xl glass !bg-white/80 dark:!bg-slate-950/80 backdrop-blur-xl"
        >
          <SheetHeader className="p-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <History className="size-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black tracking-tight mb-1">
                  Medical Record
                </SheetTitle>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  History for {currentToken?.patientId?.name}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="p-8 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
            {loadingHistory ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 glass rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : patientHistory?.length > 0 ? (
              <div className="space-y-8 relative before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                {patientHistory.map((visit: any, index: number) => (
                  <div key={visit._id} className="relative pl-12 group">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1 size-11 bg-white dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10 group-hover:border-primary group-hover:scale-110 transition-all">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-primary">
                        {index + 1}
                      </span>
                    </div>

                    <div className="glass p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 group-hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-primary uppercase tracking-widest">
                          {format(new Date(visit.createdAt), 'MMMM dd, yyyy')}
                        </p>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg font-bold text-slate-500">
                          Dr. {visit.doctorId?.name || 'Medical Staff'}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Stethoscope className="size-3" /> Diagnosis
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                            {visit.diagnosis || 'No record.'}
                          </p>
                        </div>

                        {visit.symptoms?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                              <ClipboardList className="size-3" /> Symptoms
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {visit.symptoms.map((s: string, ci: number) => (
                                <span
                                  key={ci}
                                  className="text-[10px] font-bold bg-primary/5 text-primary px-2 py-1 rounded-lg border border-primary/10"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {visit.prescription?.length > 0 && (
                          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                              Prescription
                            </p>
                            <div className="space-y-2">
                              {visit.prescription.map((m: any, mi: number) => (
                                <div
                                  key={mi}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <p className="text-xs font-black text-slate-900 dark:text-white">
                                    {m.medicineName}
                                  </p>
                                  <p className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                    {m.dosage}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-10">
                <div className="size-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="size-8 text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  No History Found
                </h4>
                <p className="text-sm text-slate-500 font-medium">
                  This patient doesn't have any previous consultation records on file.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* EMERGENCY MODAL */}
      <DoctorEmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        doctorId={doctorId || ''}
        departmentId={
          doctorProfile?.departmentId?._id || doctorProfile?.departmentId || ''
        }
      />
    </div>
  );
}

// Sub-components for cleaner code
function QuickStatCard({ label, value, icon: Icon, color, trend }: any) {
  const colorStyles: any = {
    emerald: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      accent: 'bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    blue: {
      bg: 'bg-blue-500/5 dark:bg-blue-500/10',
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      accent: 'bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    amber: {
      bg: 'bg-amber-500/5 dark:bg-amber-500/10',
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      accent: 'bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden p-6 rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.02] group',
        'bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none',
        'border-slate-100 dark:border-slate-800',
      )}
    >
      {/* Background Watermark Icon */}
      <Icon className={cn("absolute -right-4 -bottom-4 size-32 opacity-[0.03] dark:opacity-[0.05] -rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110", style.text)} />

      {/* Subtle Background Accent */}
      <div
        className={cn(
          'absolute -right-4 -top-4 size-24 blur-3xl opacity-20 rounded-full',
          style.accent,
        )}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'size-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-6',
              style.iconBg,
            )}
          >
            <Icon className="size-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              {label}
            </p>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {value}
            </h4>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {trend ? (
            <>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                {trend}
              </span>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                vs last week
              </p>
            </>
          ) : (
            /* Decorative Micro-Chart if no trend */
            <div className="w-16 h-8 opacity-40">
              <svg viewBox="0 0 40 20" className={cn("w-full h-full fill-none stroke-current stroke-2", style.text)}>
                <path d="M0,15 Q5,5 10,12 T20,8 T30,15 T40,5" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VitalBox({
  label,
  value,
  icon: Icon,
  color,
  editable,
  onChange,
  placeholder,
}: any) {
  const colors: any = {
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20 focus-within:ring-rose-500/30',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 focus-within:ring-blue-500/30',
    emerald:
      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 focus-within:ring-emerald-500/30',
    orange:
      'bg-orange-500/10 text-orange-500 border-orange-500/20 focus-within:ring-orange-500/30',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-3xl border flex flex-col items-center justify-center space-y-2 transition-all',
        colors[color],
        editable && 'focus-within:ring-2 focus-within:scale-[1.02]',
      )}
    >
      <Icon className="size-4 opacity-70" />
      <div className="text-center w-full">
        <p className="text-[8px] font-black uppercase tracking-widest opacity-80 mb-1">
          {label}
        </p>
        {editable ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent border-none text-center text-sm font-black w-full focus:outline-none placeholder:text-inherit/30"
          />
        ) : (
          <p className="text-sm font-black truncate max-w-full">{value || '--'}</p>
        )}
      </div>
    </div>
  );
}
