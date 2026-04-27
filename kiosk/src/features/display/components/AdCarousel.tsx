import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { KioskAd, DepartmentQueue } from "../../../core/types/index";
import { Zap, Clock, ChevronRight, Stethoscope } from "lucide-react";
import { useAdCarousel } from "../hooks/useAdCarousel";
import type { DeptSlide } from "../hooks/useAdCarousel";
import DoctorTokenPanel from "./DoctorTokenPanel";

interface AdCarouselProps {
  ads: KioskAd[];
  isOnline: boolean;
  onLayoutChange?: (layout: "carousel" | "fullscreen") => void;
  departments?: DepartmentQueue[];
  theme?: "light" | "dark";
}

const AdCarousel: React.FC<AdCarouselProps> = ({
  ads,
  isOnline,
  onLayoutChange,
  departments = [],
  theme = "dark",
}) => {
  const userData = localStorage.getItem("kiosk_user");
  const user = userData ? JSON.parse(userData) : null;
  const isDoctor = user?.role === "DOCTOR";

  const { state, actions } = useAdCarousel(
    ads,
    isOnline,
    departments,
    onLayoutChange,
  );

  if (state.slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white/20 gap-4">
        <div className="size-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
          <span className="text-4xl">?</span>
        </div>
        <p className="font-black uppercase tracking-widest text-sm text-center px-12">
          No content available for display.
          <br />
          Connect to internet to sync ads.
        </p>
      </div>
    );
  }

  const slideKey =
    state.activeSlide?.kind === "ad"
      ? `ad-${state.activeSlide.ad.adId?._id}-${state.currentIndex}`
      : `dept-${(state.activeSlide as DeptSlide)?.dept?.id}-${state.currentIndex}`;

  if (isDoctor) {
    return (
      <div className="flex flex-col w-full h-full">
        {/* 🔵 80% Ads (Top) */}
        <div className="h-[80%] w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideKey}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {state.activeSlide?.kind === "ad" && (
                <AdSlideView
                  ad={state.activeSlide.ad}
                  cloudFrontUrl={state.cloudFrontUrl}
                  isOnline={isOnline}
                  onVideoEnd={actions.handleVideoEnd}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 🟣 20% Tokens (Bottom) */}
        <div className="h-[20%] w-full bg-slate-900 border-t border-slate-800 px-6 py-3">
          <DoctorTokenPanel
            doctorId={user?.doctorId}
            departments={departments}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden transition-colors duration-500 ${theme === "dark" ? "bg-slate-950" : "bg-slate-50"}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slideKey}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {state.activeSlide?.kind === "ad" ? (
            <AdSlideView
              ad={state.activeSlide.ad}
              cloudFrontUrl={state.cloudFrontUrl}
              isOnline={isOnline}
              onVideoEnd={actions.handleVideoEnd}
            />
          ) : (
            <DeptSlideView
              dept={(state.activeSlide as DeptSlide).dept}
              slideIndex={state.currentIndex}
              totalDepts={departments.length}
              theme={theme}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// Ad Slide
// ─────────────────────────────────────────────
const AdSlideView: React.FC<{
  ad: KioskAd;
  cloudFrontUrl: string;
  isOnline: boolean;
  onVideoEnd: () => void;
}> = ({ ad, cloudFrontUrl, isOnline, onVideoEnd }) => {
  const adData = ad.adId;
  if (!adData) return null;

  return (
    <>
      {adData.type === "video" && isOnline ? (
        <video
          src={`${cloudFrontUrl}/${adData.fileKey}`}
          loop
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onEnded={onVideoEnd}
        />
      ) : (
        <img
          src={`${cloudFrontUrl}/${adData.fileKey}`}
          alt={adData.title}
          className="w-full h-full object-cover"
        />
      )}
    </>
  );
};

const DeptSlideView: React.FC<{
  dept: DepartmentQueue;
  slideIndex: number;
  totalDepts: number;
  theme: "light" | "dark";
}> = ({ dept, slideIndex, totalDepts, theme }) => {
  const isDark = theme === "dark";
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalWaiting = dept.doctors.reduce(
    (s: number, d: any) => s + d.meta.totalWaiting,
    0,
  );
  const hasEmergency = dept.doctors.some((d: any) => d.display.emergency);

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden transition-colors duration-500 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* ── Header bar ── */}
      <div
        className={`flex-shrink-0 flex items-center justify-between px-10 py-5 border-b transition-colors duration-500 ${
          isDark
            ? "bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 border-teal-500/20"
            : "bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 border-blue-500/20 shadow-md text-white"
        }`}
      >
        <div className="flex items-center gap-5">
          {/* Department icon */}
          <div
            className={`size-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-colors duration-500 ${
              isDark
                ? "bg-teal-500/15 border-teal-500/30"
                : "bg-white/20 border-white/30"
            }`}
          >
            <Stethoscope
              size={26}
              className={isDark ? "text-teal-400" : "text-white"}
            />
          </div>
          <div>
            <p
              className={`text-[11px] font-black uppercase tracking-[0.35em] leading-none mb-1 ${isDark ? "text-teal-400/70" : "text-blue-100/80"}`}
            >
              Department Queue
            </p>
            <h2 className="text-4xl font-black tracking-tighter leading-none">
              {dept.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Emergency badge */}
          {hasEmergency && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                isDark
                  ? "bg-red-500/15 border-red-500/40"
                  : "bg-white/20 border-white/40"
              }`}
            >
              <Zap
                size={16}
                className={
                  isDark ? "text-red-400 fill-red-400" : "text-white fill-white"
                }
              />
              <span
                className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-red-300" : "text-white"}`}
              >
                Emergency Active
              </span>
            </motion.div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-blue-100/60"}`}
              >
                Waiting
              </span>
              <span className="text-3xl font-black">{totalWaiting}</span>
            </div>
            <div
              className={`w-px h-10 ${isDark ? "bg-white/10" : "bg-white/20"}`}
            />
            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-blue-100/60"}`}
              >
                {dateStr}
              </span>
              <span
                className={`text-3xl font-black tabular-nums ${isDark ? "text-teal-400" : "text-white"}`}
              >
                {timeStr}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Column headers ── */}
      <div
        className={`flex-shrink-0 grid border-b transition-colors duration-500 ${
          isDark
            ? "border-white/5 bg-white/[0.02]"
            : "border-slate-200 bg-slate-100/50"
        }`}
        style={{ gridTemplateColumns: "2fr 1.4fr 1.4fr 1fr 1fr" }}
      >
        {["Doctor / Room", "Now Serving", "Up Next", "Queue", "Wait"].map(
          (h) => (
            <div
              key={h}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {h}
            </div>
          ),
        )}
      </div>

      {/* ── Doctor rows ── */}
      <div
        className={`flex-1 overflow-hidden flex flex-col divide-y transition-colors duration-500 ${
          isDark ? "divide-white/[0.04]" : "divide-slate-100"
        }`}
      >
        {dept.doctors.length === 0 ? (
          <div className="flex-1 flex items-center justify-center gap-3 text-slate-600">
            <span className="text-sm font-black uppercase tracking-widest">
              No doctors scheduled
            </span>
          </div>
        ) : (
          dept.doctors.map((doctor: any, idx: number) => (
            <DoctorRow
              key={doctor.id}
              doctor={doctor}
              idx={idx}
              theme={theme}
            />
          ))
        )}
      </div>

      {/* Dept progress dots */}
      {totalDepts > 1 && (
        <div
          className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 transition-colors duration-500 ${
            isDark ? "bg-slate-950" : "bg-slate-50"
          }`}
        >
          {Array.from({ length: totalDepts }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i === slideIndex % totalDepts
                  ? isDark
                    ? "w-6 h-1.5 bg-teal-400"
                    : "w-6 h-1.5 bg-blue-600"
                  : isDark
                    ? "w-1.5 h-1.5 bg-white/15"
                    : "w-1.5 h-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Single doctor row in the board
// ─────────────────────────────────────────────
const DoctorRow: React.FC<{
  doctor: any;
  idx: number;
  theme: "light" | "dark";
}> = ({ doctor, idx, theme }) => {
  const isDark = theme === "dark";
  const hasEmergency = !!doctor.display.emergency;
  const isCurrent = doctor.display.current !== "---";
  const isEvenRow = idx % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.08 }}
      // REMOVED: flex-1, min-h-0
      // ADDED: w-full, border-b (to define the row edge)
      className={`grid items-center w-full border-b ${
        isDark ? "border-white/5" : "border-slate-100"
      } ${
        isEvenRow
          ? isDark
            ? "bg-white/[0.02]"
            : "bg-slate-50/50"
          : "bg-transparent"
      }`}
      style={{
        gridTemplateColumns: "2fr 1.4fr 1.4fr 1fr 1fr",
        // Use a fixed height (e.g., 100px) or a calculation
        // to ensure they touch regardless of screen size
        height: "110px",
      }}
    >
      {/* Doctor / Room */}
      <div
        className={`px-8 py-0 flex items-center gap-4 border-r transition-colors duration-500 ${isDark ? "border-white/5" : "border-slate-100"}`}
      >
        <div
          className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-500 ${
            isDark
              ? "bg-teal-500/10 border-teal-500/20"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <Stethoscope
            size={16}
            className={isDark ? "text-teal-400" : "text-blue-600"}
          />
        </div>
        <div className="min-w-0">
          <p
            className={`text-lg font-black leading-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {doctor.name}
          </p>
          {doctor.room && (
            <p
              className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              Room {doctor.room}
            </p>
          )}
        </div>
        {hasEmergency && (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 ml-2"
          >
            <Zap size={10} className="text-red-400 fill-red-400" />
            <span className="text-[9px] font-black text-red-300 uppercase tracking-wider">
              {doctor.display.emergency}
            </span>
          </motion.div>
        )}
      </div>

      {/* NOW SERVING */}
      <div
        className={`px-8 border-r transition-colors duration-500 ${isDark ? "border-white/5" : "border-slate-100"}`}
      >
        <motion.div
          key={doctor.display.current}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`w-40 inline-flex items-center justify-center px-5 py-2 rounded-xl font-black text-2xl tracking-tighter border transition-colors duration-500 ${
            isCurrent
              ? isDark
                ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                : "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
              : isDark
                ? "bg-white/5 border-white/5 text-slate-600"
                : "bg-slate-100 border-slate-200 text-slate-300"
          }`}
        >
          {doctor.display.current}
        </motion.div>
      </div>

      {/* UP NEXT */}
      <div
        className={`px-8 border-r transition-colors duration-500 ${isDark ? "border-white/5" : "border-slate-100"}`}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={14}
            className={isDark ? "text-slate-600" : "text-blue-400"}
          />
          <span
            className={`text-xl font-black tracking-tighter ${isDark ? "text-slate-400" : "text-slate-700"}`}
          >
            {doctor.display.next}
          </span>
        </div>
      </div>

      {/* QUEUE PILLS */}
      <div
        className={`px-8 flex flex-wrap gap-1.5 border-r transition-colors duration-500 ${isDark ? "border-white/5" : "border-slate-100"}`}
      >
        {doctor.queue.slice(0, 3).map((tok: string, i: number) => (
          <span
            key={i}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-colors duration-500 ${
              isDark
                ? "bg-white/5 text-slate-500 border-white/5"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            {tok}
          </span>
        ))}
        {doctor.queue.length > 3 && (
          <span
            className={`text-[10px] font-bold self-center ${isDark ? "text-slate-600" : "text-slate-400"}`}
          >
            +{doctor.queue.length - 3}
          </span>
        )}
        {doctor.queue.length === 0 && doctor.display.current === "---" && (
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-700" : "text-slate-300"}`}
          >
            Clear
          </span>
        )}
      </div>

      {/* WAIT */}
      <div className="px-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-black ${isDark ? "text-slate-500" : "text-slate-900"}`}
            >
              {doctor.meta.totalWaiting}{" "}
              <span
                className={`text-[10px] uppercase font-bold ${isDark ? "text-slate-600" : "text-slate-400"}`}
              >
                waiting
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock
              size={11}
              className={isDark ? "text-slate-600" : "text-slate-400"}
            />
            <span
              className={`text-[11px] font-bold ${isDark ? "text-slate-600" : "text-slate-400"}`}
            >
              {doctor.meta.estimatedWaitTime}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdCarousel;
