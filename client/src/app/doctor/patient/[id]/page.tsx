'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  Clock,
  Droplets,
  FileText,
  Heart,
  Pill,
  Stethoscope,
  Thermometer,
  User,
  Phone,
  Wind,
  Zap,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import api from '@/services/api';

// ─────────── helpers ───────────
function formatPhone(phone: any) {
  if (!phone) return '—';
  if (typeof phone === 'string') {
    if (phone.startsWith('91') && phone.length === 12)
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    return phone;
  }
  if (typeof phone === 'object') {
    const code = phone.countryCode || '';
    const num = phone.nationalNumber || '';
    if (code && num) return `${code} ${num.slice(0, 5)} ${num.slice(5)}`;
    return phone.full || '—';
  }
  return '—';
}

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  color: string;
}) {
  if (!value) return null;
  return (
    <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl', color)}>
      <Icon className="size-4 shrink-0" />
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-sm font-black leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─────────── main component ───────────
export default function PatientHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patientConsultations', id],
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/api/patient/${id}/consultations`, {
        params: { limit: 100 },
      });
      return response.data;
    },
  });

  const consultations: any[] = data?.data || [];
  const patient = consultations[0]?.patientId || null;

  return (
    <div className="min-h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to History
          </button>

          {patient && (
            <span className="text-xs font-bold text-slate-400">
              {consultations.length} consultation{consultations.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">

        {/* ── PATIENT HERO CARD ── */}
        {isLoading ? (
          <div className="h-40 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
        ) : patient ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-indigo-600 p-8 text-white shadow-2xl shadow-primary/30"
          >
            {/* decorative circles */}
            <div className="absolute -right-12 -top-12 size-56 rounded-full bg-white/5" />
            <div className="absolute -right-4 -bottom-16 size-72 rounded-full bg-white/5" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="size-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 shadow-inner">
                <User className="size-10 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight truncate">
                  {patient.name || 'Unknown Patient'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {patient.age && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                      {patient.age} yrs
                    </span>
                  )}
                  {patient.gender && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                      {patient.gender}
                    </span>
                  )}
                  {patient.phone && (
                    <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-black">
                      <Phone className="size-3" />
                      {formatPhone(patient.phone)}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Visits</p>
                <p className="text-5xl font-black">{consultations.length}</p>
              </div>
            </div>
          </motion.div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <AlertCircle className="size-12 mb-3" />
            <p className="font-bold text-lg">Failed to load patient data</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardList className="size-12 mb-3 opacity-30" />
            <p className="font-bold text-lg">No consultations found</p>
            <p className="text-sm mt-1">This patient has no recorded visits in this hospital.</p>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {!isLoading && consultations.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="size-4" />
              Consultation Timeline
            </h2>

            <div className="relative space-y-6">
              {/* vertical rail */}
              <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-slate-200 to-transparent dark:via-slate-700" />

              {consultations.map((c: any, idx: number) => {
                const doctor = c.doctorId;
                const token = c.tokenId;
                const department = token?.departmentId;
                const hasPrescription = c.prescription && c.prescription.length > 0;
                const hasVitals = c.vitals && Object.values(c.vitals).some(Boolean);
                const hasSymptoms = c.symptoms && c.symptoms.length > 0;

                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07, duration: 0.4 }}
                    className="relative pl-16"
                  >
                    {/* timeline dot */}
                    <div className="absolute left-0 top-6 size-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-md flex flex-col items-center justify-center z-10 shrink-0">
                      <span className="text-[9px] font-black uppercase text-slate-400 leading-none">
                        {format(new Date(c.createdAt), 'MMM')}
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                        {format(new Date(c.createdAt), 'dd')}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 leading-none">
                        {format(new Date(c.createdAt), 'yyyy')}
                      </span>
                    </div>

                    {/* card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">

                      {/* card header */}
                      <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-base">
                              Dr. {doctor?.name || 'Unknown'}
                            </p>
                            {(doctor?.specialization || department?.name) && (
                              <p className="text-xs font-bold text-slate-400">
                                {doctor?.specialization || department?.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {token?.tokenNumber && (
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                              Token {token.tokenNumber}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Clock className="size-3.5" />
                            {format(new Date(c.createdAt), 'hh:mm a')}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">

                        {/* diagnosis */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                            <FileText className="size-3.5" /> Diagnosis
                          </p>
                          <p className={cn(
                            'text-lg font-black',
                            c.diagnosis
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 italic font-medium'
                          )}>
                            {c.diagnosis || 'No diagnosis recorded'}
                          </p>
                        </div>

                        {/* symptoms */}
                        {hasSymptoms && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                              <AlertCircle className="size-3.5" /> Symptoms
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {c.symptoms.map((s: string, i: number) => (
                                <span
                                  key={i}
                                  className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-bold"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* vitals */}
                        {hasVitals && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                              <Activity className="size-3.5" /> Vitals
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <StatChip icon={Heart} label="Blood Pressure" value={c.vitals.bp} color="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" />
                              <StatChip icon={Activity} label="Heart Rate" value={c.vitals.hr} color="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" />
                              <StatChip icon={Droplets} label="SpO2" value={c.vitals.spo2} color="bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400" />
                              <StatChip icon={Thermometer} label="Temperature" value={c.vitals.temp} color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" />
                            </div>
                          </div>
                        )}

                        {/* prescription */}
                        {hasPrescription && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                              <Pill className="size-3.5" /> Prescription
                            </p>
                            <div className="space-y-2">
                              {c.prescription.map((rx: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex flex-col sm:flex-row sm:items-center gap-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl px-5 py-3.5"
                                >
                                  <div className="size-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Pill className="size-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-black text-emerald-900 dark:text-emerald-200 text-sm">
                                      {rx.medicineName || 'Unknown Medicine'}
                                    </p>
                                    {(rx.dosage || rx.duration) && (
                                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                        {[rx.dosage, rx.duration].filter(Boolean).join(' · ')}
                                      </p>
                                    )}
                                  </div>
                                  {rx.instructions && (
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full shrink-0">
                                      {rx.instructions}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* notes */}
                        {c.notes && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                              <FileText className="size-3.5" /> Doctor Notes
                            </p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                              {c.notes}
                            </p>
                          </div>
                        )}

                        {/* follow up */}
                        {c.nextFollowUp && (
                          <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-4 py-2.5 rounded-xl border border-primary/20">
                            <Calendar className="size-4" />
                            Follow-up: {format(new Date(c.nextFollowUp), 'dd MMM yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* loading skeletons */}
        {isLoading && (
          <div className="pl-16 space-y-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
