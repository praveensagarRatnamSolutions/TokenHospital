'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface HomeWelcomeProps {
  onStart: () => void;
}

export default function HomeWelcome({ onStart }: HomeWelcomeProps) {
  // Mocking queue progress as seen in HTML
  const queueProgress = [
    { token: 'A-142', status: 'Completed', current: false },
    { token: 'A-143', status: 'CURRENT', current: true, counter: 'Counter 04' },
    { token: 'E-09', status: 'EMERGENCY', emergency: true },
    { token: 'A-144', status: 'NEXT', next: true, est: '5 min' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background dark:bg-slate-950">
      {/* Header / Carousel Section */}
      <header className="relative w-full overflow-hidden h-[80vh] flex flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-teal-600/60 dark:from-blue-600/70 dark:to-teal-700/50 mix-blend-multiply z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')" }}
        ></div>
        
        <div className="relative z-20 h-full flex flex-col p-12 pb-16 text-white pt-24">
          <div className="flex items-center gap-4 mb-6">
            <span className="material-symbols-outlined text-5xl">medical_services</span>
            <div className="h-1 w-24 bg-white/40 rounded-full"></div>
          </div>
          <h1 className="text-6xl font-extrabold leading-tight tracking-tight mb-4">
            We Are The Best <br/>Health Care Services
          </h1>
          <p className="text-2xl font-medium text-white/90 max-w-2xl">
            Leading the way in medical excellence. Your health and comfort are our top priorities.
          </p>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 right-12 z-20 flex gap-3">
          <div className="w-12 h-2 bg-white rounded-full"></div>
          <div className="w-3 h-2 bg-white/40 rounded-full"></div>
          <div className="w-3 h-2 bg-white/40 rounded-full"></div>
        </div>

        {/* Swipe up / Click to get token interaction area */}
        <div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 cursor-pointer"
          onClick={onStart}
        >
          <div className="kiosk-glass px-8 py-4 rounded-full flex flex-col items-center shadow-lg border border-white/20">
            <span className="material-symbols-outlined text-white text-4xl animate-bounce-up">keyboard_double_arrow_up</span>
            <span className="text-white text-xl font-bold tracking-wider uppercase">Tap to get token</span>
          </div>
          <div className="w-1 h-12 bg-gradient-to-t from-white/60 to-transparent rounded-full mt-2"></div>
        </div>
      </header>

      {/* Bottom Section: Token Queue Progress */}
      <footer className="bg-card dark:bg-slate-900 border-t border-border p-4 h-[20vh] flex flex-col justify-center">
        <div className="relative flex justify-between items-start max-w-6xl mx-auto w-full px-12">
          {/* Progress Line */}
          <div className="absolute top-8 left-20 right-20 h-1 bg-slate-200 dark:bg-slate-700 z-0">
            <div className="h-full bg-teal-600 dark:bg-teal-500 w-1/3"></div>
          </div>

          {queueProgress.map((item, index) => (
            <div key={index} className={`relative z-10 flex flex-col items-center w-40 ${item.status === 'Completed' ? 'opacity-50' : ''}`}>
              {item.current ? (
                <div className="w-24 h-24 rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center mb-4 shadow-xl shadow-teal-600/40 dark:shadow-teal-500/30 ring-8 ring-teal-600/20 dark:ring-teal-500/20 transition-transform">
                  <span className="text-white text-3xl font-black">{item.token}</span>
                </div>
              ) : item.emergency ? (
                <div className="w-20 h-20 rounded-full bg-rose-500 dark:bg-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30 dark:shadow-rose-600/20 ring-8 ring-rose-500/10 dark:ring-rose-600/10 text-white font-black">
                  {item.token}
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 ${item.status === 'Completed' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700'}`}>
                  {item.status === 'Completed' ? (
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-3xl">check</span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">{item.token}</span>
                  )}
                </div>
              )}
              <span className={`text-lg font-bold ${item.current ? 'text-teal-600 dark:text-teal-400 uppercase' : item.emergency ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.status}
              </span>
              {(item.counter || item.est) && (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {item.counter || `Est. ${item.est}`}
                </span>
              )}
              {item.status === 'Completed' && <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{item.token}</span>}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
