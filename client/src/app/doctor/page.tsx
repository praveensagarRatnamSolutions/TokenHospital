'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { 
  User, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  PhoneCall, 
  ClipboardList 
} from 'lucide-react';

export default function DoctorDashboard() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [doctorId] = useState('doc_123'); // Assume logged in doctor ID

  const { data: currentToken, isLoading: loadingCurrent } = useQuery({
    queryKey: ['currentToken', doctorId],
    queryFn: async () => {
      const response = await api.get('/api/token/current', { params: { doctorId } });
      return response.data.data;
    }
  });

  const { data: upcomingTokens, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcomingTokens', doctorId],
    queryFn: async () => {
      const response = await api.get('/api/token', { 
        params: { doctorId, status: 'waiting', limit: 5 } 
      });
      return response.data.data;
    }
  });

  const callNextMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/token/next', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingTokens'] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/token/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentToken'] });
    }
  });

  const handleCallNext = () => {
    callNextMutation.mutate({ doctorId });
  };

  const handleComplete = () => {
    if (currentToken?._id) {
      completeMutation.mutate(currentToken._id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left & Middle: Current Patient Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-primary p-6 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5" /> Current Patient
            </h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              In Consultation
            </span>
          </div>
          
          <div className="p-8">
            {loadingCurrent ? (
              <div className="text-center py-20 text-slate-400 italic">Finding current patient...</div>
            ) : currentToken ? (
              <div className="space-y-8">
                <div className="flex items-center gap-8">
                  <div className="size-32 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-5xl font-black border-2 border-primary/20">
                    {currentToken.tokenNumber || 'A-101'}
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white">
                      {currentToken.patientDetails?.name || 'John Doe'}
                    </h3>
                    <p className="text-xl text-slate-500 mt-1">
                      {currentToken.patientDetails?.age || 25} years old • Male
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Problem Description</p>
                    <p className="text-lg font-medium">
                      {currentToken.patientDetails?.problem || 'General checkup and routine follow-up.'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Previous History</p>
                    <p className="text-lg font-medium text-slate-400 italic">No previous records found.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleComplete}
                    disabled={completeMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-6 h-6" /> Complete Consultation
                  </button>
                  <button className="bg-slate-100 text-slate-600 px-6 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    Add Note
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Consultation Form
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Diagnosis</label>
              <textarea 
                className="w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
                placeholder="Enter diagnosis here..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Prescription</label>
              <textarea 
                className="w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                placeholder="List medications..."
              ></textarea>
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
                <div key={token._id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-white border font-bold text-slate-900 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                      {token.tokenNumber}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">
                        {token.patientDetails?.name}
                      </p>
                      <p className="text-xs text-slate-500">{token.patientDetails?.age} yrs • Male</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 italic">No patients in queue</div>
            )}
          </div>

          <button 
            onClick={handleCallNext}
            disabled={callNextMutation.isPending || !upcomingTokens?.length || currentToken}
            className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-5 h-5" /> Call Next
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
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
