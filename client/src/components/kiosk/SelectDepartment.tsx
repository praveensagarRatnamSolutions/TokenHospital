'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedDepartment } from '@/store/slices/tokenSlice';

interface SelectDepartmentProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SelectDepartment({ onNext, onBack }: SelectDepartmentProps) {
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/department');
        return response.data.data;
      } catch {
        // Fallback mock data
        return [
          { _id: '1', name: 'General Medicine', description: 'Internal & Routine Care', icon: 'stethoscope' },
          { _id: '2', name: 'Cardiology', description: 'Heart Health Center', icon: 'favorite' },
          { _id: '3', name: 'Orthopedics', description: 'Bone & Joint Specialist', icon: 'skeleton' },
          { _id: '4', name: 'Pediatrics', description: 'Child & Infant Health', icon: 'child_care' },
          { _id: '5', name: 'ENT', description: 'Ear, Nose, & Throat', icon: 'hearing' },
          { _id: '6', name: 'Dermatology', description: 'Skin & Aesthetic Care', icon: 'vaccines' },
        ];
      }
    }
  });

  const filtered = departments?.filter((d: any) => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (dept: any) => {
    dispatch(setSelectedDepartment(dept));
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Top Bar / Header Section */}
      <header className="flex flex-col items-center pt-16 pb-12 px-8 border-b border-slate-200 bg-white shadow-sm">
        <div className="mb-8">
          <div className="size-24 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-white text-5xl">local_hospital</span>
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-4">Select Department</h1>
        <p className="text-2xl text-slate-500 font-medium">Please choose the department you want to visit.</p>
        
        <div className="w-full max-w-2xl mt-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-3xl text-slate-400 group-focus-within:text-blue-500 transition-colors">search</span>
          </div>
          <input 
            className="block w-full h-20 pl-16 pr-6 text-2xl font-medium text-slate-900 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 outline-none" 
            placeholder="Search department..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content: Grid of Department Cards */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="grid grid-cols-2 gap-8">
          {isLoading ? (
            <div className="col-span-2 text-center py-20 text-slate-400 text-2xl italic">Loading departments...</div>
          ) : filtered?.map((dept: any) => (
            <button 
              key={dept._id}
              onClick={() => handleSelect(dept)}
              className="flex flex-col items-start justify-between p-10 rounded-xl bg-white border-2 border-slate-100 shadow-xl hover:border-blue-500 active:scale-95 transition-all group kiosk-button text-left"
            >
              <div className="size-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">{dept.icon || 'stethoscope'}</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{dept.name}</h2>
                <p className="text-xl text-slate-500">{dept.description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer Navigation Section */}
      <footer className="p-12 bg-white border-t border-slate-200 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center justify-center gap-4 h-24 px-12 rounded-xl bg-slate-100 text-slate-900 text-3xl font-bold shadow-md active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-4xl">arrow_back</span>
          <span>Back</span>
        </button>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-slate-400 text-lg uppercase tracking-widest font-bold">Emergency</p>
            <p className="text-blue-500 text-3xl font-bold">Dial 911</p>
          </div>
          <div className="size-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined text-4xl">emergency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
