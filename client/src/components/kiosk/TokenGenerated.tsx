'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';

interface TokenGeneratedProps {
  onFinish: () => void;
}

export default function TokenGenerated({ onFinish }: TokenGeneratedProps) {
  const [countdown, setCountdown] = useState(15);
  const tokenData = useAppSelector((state) => state.token);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* TopAppBar Area */}
      <header className="flex flex-col items-center pt-16 pb-12 px-8">
        <div className="bg-blue-500/10 p-6 rounded-full mb-6">
          <span className="material-symbols-outlined text-blue-500 !text-7xl">local_hospital</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 text-center">
          Your Token is Ready
        </h1>
        <p className="text-2xl text-slate-500 mt-4">Please take your printed slip</p>
      </header>

      {/* Center Token Card */}
      <main className="flex-1 px-12 flex flex-col items-center justify-start">
        <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="h-4 bg-blue-500 w-full"></div>
          <div className="p-12 flex flex-col items-center text-center">
            <p className="text-2xl font-semibold uppercase tracking-widest text-slate-400 mb-4">Token Number</p>
            
            <div className="bg-blue-50 rounded-2xl py-12 px-20 mb-10 border-2 border-blue-100">
              <span className="text-[160px] font-black leading-none text-blue-500">
                {tokenData.selectedDepartment?.prefix || 'A'}-104
              </span>
            </div>

            <div className="w-full grid grid-cols-1 gap-8 text-left">
              <div className="flex items-start gap-6 border-b border-slate-100 pb-6">
                <span className="material-symbols-outlined text-blue-500 !text-4xl mt-1">medical_services</span>
                <div>
                  <p className="text-xl text-slate-500 font-medium">Department</p>
                  <p className="text-4xl font-bold text-slate-900">{tokenData.selectedDepartment?.name || 'General Medicine'}</p>
                </div>
              </div>
              <div className="flex items-start gap-6 border-b border-slate-100 pb-6">
                <span className="material-symbols-outlined text-blue-500 !text-4xl mt-1">person</span>
                <div>
                  <p className="text-xl text-slate-500 font-medium">Doctor</p>
                  <p className="text-4xl font-bold text-slate-900">{tokenData.selectedDoctor?.name || 'Any Available'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 w-full">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-slate-400 !text-3xl">groups</span>
                  <div>
                    <p className="text-lg text-slate-500">Patients Waiting</p>
                    <p className="text-2xl font-bold">3 Patients</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-slate-400 !text-3xl">schedule</span>
                  <div>
                    <p className="text-lg text-slate-500">Estimated Time</p>
                    <p className="text-2xl font-bold">15 - 20 Mins</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 w-full pt-8 border-t border-dashed border-slate-300 flex justify-between items-center text-slate-500">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined !text-2xl">event</span>
                <span className="text-xl">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined !text-2xl">access_time</span>
                <span className="text-xl">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-12 pb-24 space-y-8 text-center bg-white z-50">
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={onFinish}
            className="w-full max-w-2xl bg-blue-500 hover:bg-blue-600 text-white text-4xl font-bold py-10 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-4 transition-all kiosk-button"
          >
            <span className="material-symbols-outlined !text-5xl">print</span>
            Print Token
          </button>
          <p className="text-2xl font-medium text-slate-600">
            Please collect your printed token below.
          </p>
        </div>
        <div className="pt-12">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-slate-100 rounded-full text-slate-400">
            <span className="material-symbols-outlined animate-spin !text-2xl">refresh</span>
            <span className="text-xl font-medium">Returning to home in {countdown}s...</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
