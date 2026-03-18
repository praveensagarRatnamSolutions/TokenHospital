'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedDoctor } from '@/store/slices/tokenSlice';

interface SelectDoctorProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SelectDoctor({ onNext, onBack }: SelectDoctorProps) {
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const selectedDept = useAppSelector((state) => state.token.selectedDepartment);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', selectedDept?._id],
    queryFn: async () => {
      try {
        const response = await api.get('/api/doctor', {
          params: { departmentId: selectedDept?._id }
        });
        return response.data.data;
      } catch {
        // Fallback mock data
        return [
          { _id: '1', name: 'Dr. Sarah Smith', specialty: 'Cardiology Specialist', available: true, waiting: 2, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=2070&auto=format&fit=crop' },
          { _id: '2', name: 'Dr. James Wilson', specialty: 'Pediatrics', available: false, waiting: 5, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop' },
          { _id: '3', name: 'Dr. Elena Rodriguez', specialty: 'Neurology Specialist', available: true, waiting: 1, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop' },
          { _id: '4', name: 'Dr. Michael Chen', specialty: 'General Medicine', available: true, waiting: 0, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop' },
        ];
      }
    }
  });

  const filtered = doctors?.filter((d: any) => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (doctor: any) => {
    dispatch(setSelectedDoctor(doctor));
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Top Bar / Header Section */}
      <header className="flex flex-col items-center pt-12 pb-8 px-10 border-b border-slate-100 bg-white">
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-slate-900">Choose Your Doctor</h1>
        <p className="text-2xl text-slate-500 text-center max-w-2xl leading-relaxed">
          Select a doctor or let the system assign one automatically.
        </p>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-10 pt-10 pb-32 bg-slate-50/30">
        {/* Search Bar Section */}
        <div className="mb-10">
          <div className="relative flex items-center group">
            <span className="material-symbols-outlined absolute left-6 text-slate-400 text-4xl group-focus-within:text-blue-500 transition-colors">search</span>
            <input 
              className="w-full pl-20 pr-10 py-8 bg-white border-2 border-slate-200 rounded-2xl text-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm outline-none placeholder:text-slate-400" 
              placeholder="Search doctor by name..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-12">
          <button 
            onClick={() => handleSelect({ _id: 'auto', name: 'Auto Assign' })}
            className="w-full flex items-center justify-center gap-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-8 px-10 transition-colors shadow-lg shadow-blue-500/20 active:scale-95 kiosk-button"
          >
            <span className="material-symbols-outlined text-5xl">magic_button</span>
            <span className="text-3xl font-bold">Auto Assign Best Available Doctor</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-500 text-4xl">medical_services</span>
            Available Specialists
          </h2>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-slate-500 text-xl">
              <span className="w-4 h-4 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-2 text-slate-500 text-xl">
              <span className="w-4 h-4 rounded-full bg-amber-500"></span> Busy
            </span>
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-2 gap-8">
          {isLoading ? (
            <div className="col-span-2 text-center py-20 text-slate-400 text-2xl italic">Loading doctors...</div>
          ) : filtered?.map((doctor: any) => (
            <div 
              key={doctor._id}
              onClick={() => handleSelect(doctor)}
              className="flex flex-col bg-white rounded-xl p-6 border-2 border-slate-100 hover:border-blue-500 cursor-pointer transition-all shadow-sm kiosk-button"
            >
              <div 
                className="w-full aspect-square bg-slate-200 rounded-lg mb-6 bg-cover bg-center overflow-hidden" 
                style={{ backgroundImage: `url(${doctor.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop'})` }}
              ></div>
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-2 text-left">
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{doctor.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${doctor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {doctor.available ? 'Available' : 'Busy'}
                  </span>
                </div>
                <p className="text-xl text-blue-500 font-semibold mb-4 text-left">{doctor.specialty}</p>
                <div className="flex items-center gap-2 text-slate-600 text-lg">
                  <span className="material-symbols-outlined">group</span>
                  <span>Waiting: <strong className="text-slate-900">{doctor.waiting || 0} Patients</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-10 flex gap-6 z-40">
        <button 
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-600 rounded-xl py-8 px-6 transition-colors hover:bg-slate-200 active:scale-95 kiosk-button"
        >
          <span className="material-symbols-outlined text-4xl">arrow_back</span>
          <span className="text-3xl font-bold">Back</span>
        </button>
        <div className="flex-[2] flex items-center justify-center gap-3 bg-blue-500 text-white rounded-xl py-8 px-6 transition-transform active:scale-95 shadow-xl shadow-blue-500/25 kiosk-button">
          <span className="text-3xl font-bold">Confirm Selection</span>
          <span className="material-symbols-outlined text-4xl">arrow_forward</span>
        </div>
      </footer>
    </div>
  );
}
