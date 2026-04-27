import React from 'react';
import { Clock, Calendar, AlertCircle, Info } from 'lucide-react';

interface Session {
  label: string; // e.g., "Morning"
  start: string; // e.g., "09:00"
  end: string;   // e.g., "13:00"
}

interface DayAvailability {
  day: string;
  isClosed: boolean;
  sessions: Session[];
}

export default function DoctorWeeklySchedule({ availability }: { availability: DayAvailability[] }) {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Weekly Duty Roster</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Doctor Availability Management</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        {weekDays.map((dayName) => {
          // Find data for this day, or default to closed
          const dayData = availability.find(d => d.day.toLowerCase() === dayName.toLowerCase());
          const isClosed = !dayData || dayData.isClosed;

          return (
            <div 
              key={dayName}
              className={`flex items-center gap-4 p-4 rounded-3xl transition-all border-2 ${
                isClosed 
                ? 'bg-slate-50/50 border-transparent opacity-60' 
                : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 shadow-sm'
              }`}
            >
              {/* Day Label */}
              <div className="w-24">
                <span className={`text-xs font-black uppercase tracking-tighter ${isClosed ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {dayName}
                </span>
              </div>

              {/* Timing Slots */}
              <div className="flex-1 flex flex-wrap gap-2">
                {isClosed ? (
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Off Duty
                  </span>
                ) : (
                  dayData.sessions.map((session, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl"
                    >
                      <Clock className="w-3 h-3 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-primary uppercase leading-none">{session.label}</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {session.start} - {session.end}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Status Indicator */}
              {!isClosed && (
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-start gap-3 border border-dashed border-slate-200 dark:border-slate-700">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
          Admin Note: Timings shown above are standard weekly slots. Emergency appointments or manual cancellations will override these visible hours in the live queue.
        </p>
      </div>
    </div>
  );
}