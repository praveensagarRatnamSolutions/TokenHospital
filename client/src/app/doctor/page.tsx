'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import {
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
  Plus,
  Trash2,
  History,
  Activity,
  Save
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';

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
      console.log('Doctor Dashboard: Received queue update', data);
      // Refresh current and upcoming tokens
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
    };

    socket.on('queue-updated', handleUpdate);
    return () => {
      socket.off('queue-updated', handleUpdate);
    };
  }, [socket, queryClient, doctorId]);

  console.log('Doctor ID:', doctorId);
  console.log('Hospital ID:', hospitalId);

  const { data: currentToken, isLoading: loadingCurrent } = useQuery({
    queryKey: ['currentToken', doctorId],
    queryFn: async () => {
      const response = await api.get('/api/token/current', { params: { doctorId } });
      return response.data.data;
    }
  });

  const { data: upcomingTokens, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcomingTokens', doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const response = await api.get('/api/token', {
        params: { doctorId, status: 'WAITING', limit: 5 }
      });
      return response.data.tokens;
    }
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['doctorStats', doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const response = await api.get(`/api/doctor/${doctorId}/stats`);
      return response.data.data;
    }
  });

  const { data: doctorProfile } = useQuery({
    queryKey: ['doctorProfile', doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const response = await api.get(`/api/doctor/${doctorId}`);
      return response.data.data;
    }
  });

  // --- Consultation Form State ---
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [prescription, setPrescription] = useState<{ medicineName: string, dosage: string, duration: string, instructions: string }[]>([]);
  const [newMedicine, setNewMedicine] = useState({ medicineName: '', dosage: '', duration: '', instructions: '' });
  const [vitals, setVitals] = useState({ bp: '', hr: '', spo2: '', temp: '' });
  const [isConsultationSaved, setIsConsultationSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // --- Mutations ---
  const callNextMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/token/next', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
      refetchStats();
      // Reset form
      setDiagnosis('');
      setSymptoms('');
      setPrescription([]);
    }
  });

  const completeMutation = useMutation({
    mutationFn: (data: { id: string, consultation: any }) => 
      api.patch(`/api/token/${data.id}/complete`, data.consultation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      refetchStats();
    }
  });

  const skipMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/token/${id}/skip`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens', doctorId] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => api.patch(`/api/doctor/${doctorId}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfile', doctorId] });
    }
  });

  // --- Handlers ---
  const handleCallNext = () => {
    callNextMutation.mutate({ doctorId });
  };

  const handleSaveConsultation = async () => {
    if (!currentToken || !diagnosis) return;
    
    try {
      await api.post(`/api/patient/${currentToken.patientId._id}/consultation`, {
        tokenId: currentToken._id,
        diagnosis,
        symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
        prescription,
        vitals
      });
      setIsConsultationSaved(true);
      alert('Consultation saved successfully!');
    } catch (error) {
       console.error("Save consultation error", error);
       alert('Failed to save consultation');
    }
  };

  const handleComplete = () => {
    if (currentToken?._id) {
      completeMutation.mutate({ 
        id: currentToken._id, 
        consultation: {} // Already saved or send empty
      });
      setIsConsultationSaved(false);
      setDiagnosis('');
      setSymptoms('');
      setPrescription([]);
      setVitals({ bp: '', hr: '', spo2: '', temp: '' });
    }
  };

  const handleSkip = () => {
    if (currentToken?._id) {
      skipMutation.mutate(currentToken._id);
    }
  };

  const addMedicine = () => {
    if (newMedicine.medicineName) {
      setPrescription([...prescription, newMedicine]);
      setNewMedicine({ medicineName: '', dosage: '', duration: '', instructions: '' });
    }
  };

  const removeMedicine = (index: number) => {
    setPrescription(prescription.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Top Stats & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <Activity className="w-8 h-8" />
            </div>
            <div>
               <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Doctor Console</h1>
               <p className="text-slate-500 font-medium">Welcome back, Dr. {user?.name.split(' ')[0]}</p>
            </div>
         </div>

         <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border shadow-sm">
            <button 
               onClick={() => toggleStatusMutation.mutate()}
               disabled={toggleStatusMutation.isPending}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  doctorProfile?.isAvailable 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
               }`}
            >
               {doctorProfile?.isAvailable ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
               {doctorProfile?.isAvailable ? 'Online' : 'Offline'}
            </button>
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
               doctorProfile?.isAvailable ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-50'
            }`}>
               <span className={`size-2 rounded-full animate-pulse ${
                  doctorProfile?.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
               }`}></span>
               {doctorProfile?.isAvailable ? 'Receiving Tokens' : 'Queue Paused'}
            </div>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm group hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <UserCheck className="w-6 h-6" />
               </div>
               <TrendingUp className="w-5 h-5 text-emerald-500 opacity-50" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Patients Today</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalSeenToday || 0}</h3>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm group hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <Clock className="w-6 h-6" />
               </div>
               <Activity className="w-5 h-5 text-blue-500 opacity-50" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg. Time / Patient</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.avgConsultationTime || 0} <span className="text-lg font-bold text-slate-400">min</span></h3>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm group hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                  <Users className="w-6 h-6" />
               </div>
               <ArrowRight className="w-5 h-5 text-orange-500 opacity-50" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Currently Waiting</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.currentWaiting || 0}</h3>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left & Middle: Current Patient Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
          <div className={`p-6 text-white flex justify-between items-center transition-colors ${currentToken?.isEmergency ? 'bg-red-600' : 'bg-primary'}`}>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${currentToken?.isEmergency ? 'text-white' : 'text-white'}`}>
              <User className="w-5 h-5" /> Current Patient
            </h2>
            <div className="flex items-center gap-2">
               {currentToken?.isEmergency && (
                  <span className="bg-white text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                     <AlertTriangle className="w-3 h-3 fill-red-600 text-white" /> High Priority
                  </span>
               )}
               <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                 In Consultation
               </span>
            </div>
          </div>

          <div className="p-8">
            {loadingCurrent ? (
              <div className="text-center py-20 text-slate-400 italic">Finding current patient...</div>
            ) : currentToken ? (
              <div className="space-y-8">
                <div className="flex items-center gap-8">
                  <div className={`size-auto p-5 rounded-2xl flex items-center justify-center text-5xl font-black border-2 transition-all ${
                    currentToken.isEmergency 
                    ? 'bg-red-600 text-white border-red-700 shadow-xl shadow-red-200' 
                    : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {currentToken.tokenNumber || 'A-101'}
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white">
                      {currentToken.patientId?.name || 'John Doe'}
                    </h3>
                    <p className="text-xl text-slate-500 mt-1">
                      {currentToken.patientId?.age || 25} years old • Male
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Problem Description</p>
                    <p className="text-lg font-medium">
                      {currentToken.patientId?.problem || 'General checkup and routine follow-up.'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Previous History</p>
                    <p className="text-lg font-medium text-slate-400 italic">No previous records found.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={handleComplete}
                    disabled={completeMutation.isPending}
                    className="flex-1 min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-6 h-6" /> Finish & Complete
                  </button>
                  <button 
                    onClick={handleSkip}
                    disabled={skipMutation.isPending}
                    className="px-6 py-4 bg-orange-100 text-orange-600 rounded-xl font-bold hover:bg-orange-200 transition-all flex items-center gap-2"
                  >
                    <UserMinus className="w-5 h-5" /> Postpone
                  </button>
                  <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
                    <History className="w-5 h-5" /> History
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-400">No active patient</h3>
                <p className="text-slate-500 mt-2">Call the next patient from the queue to start.</p>
                <button
                  onClick={handleCallNext}
                  disabled={callNextMutation.isPending}
                  className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <PhoneCall className="w-5 h-5" /> Call Next Patient
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Patient Form Placeholder */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" /> Consultation Details
            </h2>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">
               <Activity className="w-4 h-4" /> Live Entry
            </div>
          </div>

          {/* Quick Vitals Section */}
          <div className="mb-8 border-b border-slate-100 pb-8">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Patient Vitals</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl group focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                   <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Blood Pressure</p>
                   <input 
                      className="w-full bg-transparent text-xl font-bold text-rose-700 outline-none placeholder:text-rose-200"
                      placeholder="e.g. 120/80"
                      value={vitals.bp}
                      onChange={e => setVitals({...vitals, bp: e.target.value})}
                   />
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                   <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Heart Rate (bpm)</p>
                   <input 
                      className="w-full bg-transparent text-xl font-bold text-blue-700 outline-none placeholder:text-blue-200"
                      placeholder="e.g. 72"
                      value={vitals.hr}
                      onChange={e => setVitals({...vitals, hr: e.target.value})}
                   />
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                   <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">SpO2 (%)</p>
                   <input 
                      className="w-full bg-transparent text-xl font-bold text-emerald-700 outline-none placeholder:text-emerald-200"
                      placeholder="e.g. 98"
                      value={vitals.spo2}
                      onChange={e => setVitals({...vitals, spo2: e.target.value})}
                   />
                </div>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                   <p className="text-[10px] font-black text-orange-400 uppercase mb-1">Temp (°F)</p>
                   <input 
                      className="w-full bg-transparent text-xl font-bold text-orange-700 outline-none placeholder:text-orange-200"
                      placeholder="e.g. 98.6"
                      value={vitals.temp}
                      onChange={setVitals ? (e => setVitals({...vitals, temp: e.target.value})) : undefined}
                   />
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Symptoms (comma separated)</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none min-h-[100px] transition-all font-medium"
                placeholder="Fever, Cough, Headache..."
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Final Diagnosis *</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none min-h-[100px] transition-all font-medium"
                placeholder="Enter clinical diagnosis..."
              ></textarea>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-100 pt-8 mt-8">
             <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" /> Digital Prescription
             </h3>
             
             {/* Prescription Table/List */}
             <div className="space-y-4 mb-8">
                {prescription.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 group animate-in slide-in-from-left-2">
                      <div className="size-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">{idx + 1}</div>
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase">Medicine</p>
                            <p className="font-bold">{item.medicineName}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase">Dosage</p>
                            <p className="font-bold">{item.dosage}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase">Duration</p>
                            <p className="font-bold">{item.duration}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase">Instructions</p>
                            <p className="font-bold text-sm">{item.instructions}</p>
                         </div>
                      </div>
                      <button onClick={() => removeMedicine(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                ))}
             </div>

             {/* Add Medicine Form */}
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <input 
                      type="text" 
                      placeholder="Medicine Name" 
                      value={newMedicine.medicineName}
                      onChange={e => setNewMedicine({...newMedicine, medicineName: e.target.value})}
                      className="p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                   />
                   <input 
                      type="text" 
                      placeholder="Dosage (e.g. 1-0-1)" 
                      value={newMedicine.dosage}
                      onChange={e => setNewMedicine({...newMedicine, dosage: e.target.value})}
                      className="p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                   />
                   <input 
                      type="text" 
                      placeholder="Duration" 
                      value={newMedicine.duration}
                      onChange={e => setNewMedicine({...newMedicine, duration: e.target.value})}
                      className="p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                   />
                   <input 
                      type="text" 
                      placeholder="Instructions" 
                      value={newMedicine.instructions}
                      onChange={e => setNewMedicine({...newMedicine, instructions: e.target.value})}
                      className="p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                   />
                </div>
                <button 
                   onClick={addMedicine}
                   className="w-full py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                   <Plus className="w-5 h-5" /> Add to Prescription
                </button>
             </div>
              <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-slate-100">
                 <button 
                    onClick={handleSaveConsultation}
                    disabled={!diagnosis || isConsultationSaved}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                       isConsultationSaved 
                       ? 'bg-emerald-100 text-emerald-600' 
                       : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                    } disabled:opacity-50`}
                 >
                    {isConsultationSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isConsultationSaved ? 'Consultation Saved' : 'Save Consultation'}
                 </button>
              </div>
          </div>
        </div>
      </div>

      {/* Right: Upcoming Queue */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" /> Up Next
            </h2>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {upcomingTokens?.length || 0} Waiting
            </span>
          </div>

          <div className="space-y-4">
            {loadingUpcoming ? (
              <div className="text-center py-10 text-slate-400 italic">Updating queue...</div>
            ) : upcomingTokens?.length > 0 ? (
              upcomingTokens.map((token: any) => (
                <div key={token._id} className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${
                   token.isEmergency 
                   ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800' 
                   : token.isPostponed
                   ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800 border-l-4 border-l-orange-400'
                   : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`size-auto p-2 border font-bold rounded-lg flex flex-col items-center justify-center transition-all ${
                       token.isEmergency 
                       ? 'bg-red-600 text-white border-red-700' 
                       : token.isPostponed
                       ? 'bg-orange-500 text-white border-orange-600'
                       : 'bg-white text-slate-900 group-hover:bg-primary group-hover:text-white group-hover:border-primary'
                    }`}>
                      <span className="leading-none">{token.tokenNumber}</span>
                      {token.isEmergency && <Zap className="w-2.5 h-2.5 mt-0.5 fill-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-bold leading-tight ${
                          token.isEmergency ? 'text-red-700 dark:text-red-400' 
                          : token.isPostponed ? 'text-orange-700 dark:text-orange-400'
                          : 'text-slate-900 dark:text-white'
                        }`}>
                          {token.patientId?.name}
                        </p>
                        {token.isEmergency && (
                           <span className="text-[8px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Emergency</span>
                        )}
                        {token.isPostponed && !token.isEmergency && (
                           <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Postponed</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{token.patientId?.age} yrs</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-colors ${
                    token.isEmergency ? 'text-red-400' 
                    : token.isPostponed ? 'text-orange-400'
                    : 'text-slate-300 group-hover:text-primary'
                  }`} />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 italic">No patients in queue</div>
            )}
          </div>

          <button
            onClick={handleCallNext}
            disabled={callNextMutation.isPending || !upcomingTokens?.length || currentToken}
            className={`w-full mt-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
               upcomingTokens?.[0]?.isEmergency 
               ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 animate-bounce-subtle' 
               : 'bg-slate-900 hover:bg-slate-800 text-white'
            } disabled:opacity-30`}
          >
            {upcomingTokens?.[0]?.isEmergency ? <AlertTriangle className="w-5 h-5 fill-white" /> : <PhoneCall className="w-5 h-5" />}
            {upcomingTokens?.[0]?.isEmergency ? 'Call Emergency Patient' : 'Call Next'}
          </button>
        </div>

        <div className="bg-primary/5 rounded-2xl border-2 border-primary/10 p-6">
          <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Live Update
          </h3>
          <p className="text-sm text-slate-600">
            Queue is updating in real-time. Any new patient registrations in your department will appear here instantly.
          </p>
        </div>
      </div>
    </div>
  </div>
);
}
