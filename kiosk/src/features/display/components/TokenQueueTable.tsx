import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DepartmentQueue } from "../types";
import {
  Activity,
  Zap,
  Clock,
  Users,
  ChevronRight,
  Stethoscope,
} from "lucide-react";

interface TokenQueueTableProps {
  departments: DepartmentQueue[];
  theme: "light" | "dark";
}

const TokenQueueTable: React.FC<TokenQueueTableProps> = ({
  departments,
  theme,
}) => {
  const [activeDeptIdx, setActiveDeptIdx] = useState(0);
  const isDark = theme === "dark";

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
        <Activity size={40} className="text-slate-400 animate-pulse" />
        <p
          className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          No active queues
        </p>
      </div>
    );
  }

  const activeDept = departments[activeDeptIdx] ?? departments[0];

  return (
    <div className="flex flex-col h-full gap-0 overflow-hidden">
      {/* Department Tabs */}
      <div
        className={`flex items-center gap-2 px-6 pt-4 pb-0 overflow-x-auto flex-shrink-0 scrollbar-hide ${isDark ? "border-b border-white/5" : "border-b border-slate-100"}`}
      >
        {departments.map((dept, idx) => (
          <button
            key={dept.id}
            onClick={() => setActiveDeptIdx(idx)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
              idx === activeDeptIdx
                ? isDark
                  ? "bg-white/10 text-white border-b-2 border-sky-400"
                  : "bg-sky-50 text-sky-700 border-b-2 border-sky-500"
                : isDark
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Stethoscope size={12} />
            {dept.name}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                idx === activeDeptIdx
                  ? "bg-sky-500 text-white"
                  : isDark
                    ? "bg-white/10 text-slate-400"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {dept.doctors.reduce((s, d) => s + d.meta.totalWaiting, 0)}
            </span>
          </button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDept.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-4 grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(activeDept.doctors.length, 3)}, 1fr)`,
          }}
        >
          {activeDept.doctors.map((doctor) => (
            <DoctorQueueCard
              key={doctor.id}
              doctor={doctor}
              isDark={isDark}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface DoctorQueueCardProps {
  doctor: DepartmentQueue["doctors"][0];
  isDark: boolean;
}

const DoctorQueueCard: React.FC<DoctorQueueCardProps> = ({
  doctor,
  isDark,
}) => {
  const hasEmergency = !!doctor.display.emergency;
  const isCurrent = doctor.display.current !== "---";

  return (
    <motion.div
      layout
      className={`relative rounded-2xl p-4 flex flex-col gap-3 overflow-hidden transition-all ${
        isDark
          ? "bg-white/5 border border-white/8 hover:border-white/15"
          : "bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
      }`}
    >
      {/* Emergency badge */}
      {hasEmergency && (
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 text-red-500 px-2 py-1 rounded-full"
        >
          <Zap size={10} className="fill-red-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {doctor.display.emergency}
          </span>
        </motion.div>
      )}

      {/* Doctor Header */}
      <div className="flex items-start gap-3 pr-8">
        <div
          className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDark ? "bg-sky-500/15 text-sky-400" : "bg-sky-50 text-sky-600"
          }`}
        >
          <Stethoscope size={16} />
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm font-black leading-tight truncate ${isDark ? "text-white" : "text-slate-800"}`}
          >
            Dr. {doctor.name}
          </p>
          {doctor.room && (
            <p
              className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              Room {doctor.room}
            </p>
          )}
        </div>
      </div>

      {/* Token Display Row */}
      <div className="flex items-stretch gap-2">
        {/* Current Token */}
        <div
          className={`flex-1 rounded-xl p-3 flex flex-col items-center justify-center gap-1 ${
            isCurrent
              ? isDark
                ? "bg-teal-500/15 border border-teal-500/25"
                : "bg-teal-50 border border-teal-200"
              : isDark
                ? "bg-white/5 border border-white/5"
                : "bg-slate-50 border border-slate-100"
          }`}
        >
          <span
            className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            Current
          </span>
          <motion.span
            key={doctor.display.current}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-2xl font-black tracking-tighter ${
              isCurrent
                ? isDark
                  ? "text-teal-400"
                  : "text-teal-600"
                : isDark
                  ? "text-slate-600"
                  : "text-slate-300"
            }`}
          >
            {doctor.display.current}
          </motion.span>
        </div>

        <ChevronRight
          size={14}
          className={`self-center flex-shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`}
        />

        {/* Next Token */}
        <div
          className={`flex-1 rounded-xl p-3 flex flex-col items-center justify-center gap-1 ${
            isDark
              ? "bg-white/5 border border-white/5"
              : "bg-slate-50 border border-slate-100"
          }`}
        >
          <span
            className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            Next
          </span>
          <motion.span
            key={doctor.display.next}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xl font-black tracking-tighter opacity-60 ${isDark ? "text-sky-400" : "text-sky-600"}`}
          >
            {doctor.display.next}
          </motion.span>
        </div>
      </div>

      {/* Upcoming Queue Pills */}
      {doctor.queue.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {doctor.queue.slice(0, 6).map((tok, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                isDark
                  ? "bg-white/5 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tok}
            </span>
          ))}
          {doctor.queue.length > 6 && (
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${isDark ? "text-slate-600" : "text-slate-400"}`}
            >
              +{doctor.queue.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Footer Meta */}
      <div
        className={`flex items-center justify-between pt-2 mt-auto border-t ${isDark ? "border-white/5" : "border-slate-100"}`}
      >
        <div className="flex items-center gap-1.5">
          <Users
            size={11}
            className={isDark ? "text-slate-500" : "text-slate-400"}
          />
          <span
            className={`text-[10px] font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            {doctor.meta.totalWaiting} waiting
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock
            size={11}
            className={isDark ? "text-slate-500" : "text-slate-400"}
          />
          <span
            className={`text-[10px] font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            ~{doctor.meta.estimatedWaitTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TokenQueueTable;
