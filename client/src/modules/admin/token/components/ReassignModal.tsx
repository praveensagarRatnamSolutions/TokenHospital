'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { 
  X, 
  UserPlus, 
  Stethoscope, 
  Building2,
  ChevronRight,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useReassignDoctor } from '../hooks';

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string;
  currentTokenData: any;
}

export default function ReassignModal({ isOpen, onClose, tokenId, currentTokenData }: ReassignModalProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Fetch Doctors & Departments
  const { data: doctors } = useQuery({
    queryKey: ['doctors-list-all'],
    queryFn: async () => {
      const res = await api.get('/api/doctor');
      return res.data.doctors || res.data.data || [];
    }
  });

  const reassignMutation = useReassignDoctor();

  if (!isOpen) return null;

  const handleReassign = async () => {
    if (!selectedDoctorId) {
      alert('Please select a doctor');
      return;
    }

    const doctor = doctors.find((d: any) => d._id === selectedDoctorId);
    
    try {
      await reassignMutation.mutateAsync({
        id: tokenId,
        payload: {
          doctorId: selectedDoctorId,
          departmentId: doctor?.departmentId || selectedDeptId
        }
      });
      onClose();
    } catch (error: any) {
      alert(error.message || 'Re-assignment failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
               <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              Re-assign <span className="text-primary italic font-serif">Doctor</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Token: {currentTokenData?.tokenNumber}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Assignment</p>
                <div className="flex items-center gap-2">
                   <User className="w-4 h-4 text-slate-300" />
                   <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {currentTokenData?.doctor?.name || 'Unassigned'}
                   </span>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Doctor</label>
                <div className="relative">
                   <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                   <select
                     value={selectedDoctorId}
                     onChange={(e) => setSelectedDoctorId(e.target.value)}
                     className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-slate-700 dark:text-slate-200"
                   >
                     <option value="">Select a Doctor</option>
                     {Array.isArray(doctors) && doctors.map((d: any) => (
                       <option key={d._id} value={d._id}>{d.name} ({d.departmentId?.name || 'Gen'})</option>
                     ))}
                   </select>
                </div>
             </div>
          </div>

          <div className="flex gap-3">
             <Button 
               variant="outline" 
               onClick={onClose}
               className="flex-1 h-14 rounded-2xl font-bold text-slate-400"
             >
               Cancel
             </Button>
             <Button 
               onClick={handleReassign}
               disabled={reassignMutation.isPending}
               className="flex-1 h-14 rounded-2xl font-black bg-primary text-white shadow-lg shadow-primary/20"
             >
               {reassignMutation.isPending ? 'Processing...' : 'Confirm'}
             </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
