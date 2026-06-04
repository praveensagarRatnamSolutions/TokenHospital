import { ChevronRight, ArrowDown, Users } from "lucide-react";
import type { DepartmentQueue, DoctorQueueDisplay } from "../../../core/types";
import { motion } from "framer-motion";

interface DoctorTokenPanelProps {
  doctorId: string;
  departments: DepartmentQueue[];
  theme?: "light" | "dark";
}

const DoctorTokenPanel = ({ doctorId, departments, theme = "dark" }: DoctorTokenPanelProps) => {
  const doctor = departments
    ?.flatMap((dept: DepartmentQueue) => dept.doctors || [])
    ?.find((doc: DoctorQueueDisplay) => doc.id === doctorId);

  if (!doctor) return null;

  console.log("Doctor Data:", doctor); // Debugging log
  const { display, queue = [], queueInfo = [], meta } = doctor;

  const isDark = theme === "dark";

  // ✅ Check if current token is emergency
  const isEmergencyCurrent =
    display?.emergency && display?.current === display?.emergency;

  const steps = [
    // 1. Completed token if available
    ...(display.completedInfo
      ? [
          {
            label: display.completedInfo.tokenNumber,
            type: "completed",
            isEmergency: display.completedInfo.isEmergency,
            isPostponed: display.completedInfo.isPostponed,
          },
        ]
      : []),
    // 2. Current token
    {
      label: display.currentInfo?.tokenNumber || display.current || "--",
      type: "current",
      isEmergency: display.currentInfo?.isEmergency || isEmergencyCurrent,
      isPostponed: display.currentInfo?.isPostponed || false,
    },
    // 3. Next token
    {
      label: display.nextInfo?.tokenNumber || display.next || "--",
      type: "next",
      isEmergency: display.nextInfo?.isEmergency || false,
      isPostponed: display.nextInfo?.isPostponed || false,
    },
    // 4. Upcoming queue (up to 3 items)
    ...(queueInfo && queueInfo.length > 0
      ? queueInfo.slice(0, 3).map((q) => ({
          label: q.tokenNumber,
          type: "upcoming",
          isEmergency: q.isEmergency,
          isPostponed: q.isPostponed,
        }))
      : queue.slice(0, 3).map((q: string) => ({
          label: q,
          type: "upcoming",
          isEmergency: false,
          isPostponed: false,
        }))),
  ];

  // ✅ Check if queue is empty (excluding completed token)
  const hasNoTokens =
    (display.current === "Ready" || !display.current) &&
    (display.next === "---" || !display.next) &&
    queue.length === 0;

  const getCircleStyles = (step: typeof steps[0]) => {
    let sizeClass = "";
    let borderShadowRing = "";

    if (step.type === "current") {
      sizeClass = "w-28 h-28 text-2xl mx-auto font-black";
    } else if (step.type === "next") {
      sizeClass = "w-20 h-20 text-xl font-bold";
    } else {
      sizeClass = "w-18 h-18 text-l font-bold";
    }

    if (step.isEmergency) {
      if (step.type === "current") {
        borderShadowRing = "bg-red-600 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)] ring-8 ring-red-500/30 animate-pulse";
      } else if (step.type === "next") {
        borderShadowRing = "bg-red-500 text-white ring-4 ring-red-500/20 animate-pulse";
      } else {
        borderShadowRing = isDark 
          ? "bg-red-950/80 text-red-400 border border-red-700/50 animate-pulse"
          : "bg-red-50 text-red-600 border border-red-200 animate-pulse";
      }
    } else if (step.isPostponed) {
      if (step.type === "current") {
        borderShadowRing = "bg-indigo-600 text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] ring-8 ring-indigo-500/30";
      } else if (step.type === "next") {
        borderShadowRing = "bg-indigo-500 text-white ring-4 ring-indigo-500/20";
      } else {
        borderShadowRing = isDark 
          ? "bg-indigo-950 text-indigo-300 border border-indigo-700/50"
          : "bg-indigo-50 text-indigo-600 border border-indigo-200";
      }
    } else if (step.type === "completed") {
      borderShadowRing = isDark 
        ? "bg-slate-900/60 text-slate-500 border border-slate-800/80 line-through decoration-slate-600"
        : "bg-slate-200/60 text-slate-400 border border-slate-300/80 line-through decoration-slate-400";
    } else {
      if (step.type === "current") {
        borderShadowRing = isDark 
          ? "bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.4)] ring-8 ring-emerald-500/20"
          : "bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.2)] ring-8 ring-emerald-500/10";
      } else if (step.type === "next") {
        borderShadowRing = "bg-amber-500 text-black ring-4 ring-amber-500/20";
      } else {
        borderShadowRing = isDark 
          ? "bg-slate-800 text-blue-400 border border-blue-700"
          : "bg-slate-100 text-blue-600 border border-blue-200";
      }
    }

    return `flex items-center justify-center rounded-full transition-all duration-500 text-center ${sizeClass} ${borderShadowRing}`;
  };

  const getLabelText = (step: typeof steps[0]) => {
    if (step.isEmergency) return "Emergency";
    if (step.isPostponed) return "Postponed";
    if (step.type === "completed") return "Done";
    if (step.type === "current") return "Serving";
    if (step.type === "next") return "Next";
    return "";
  };

  const getLabelColor = (step: typeof steps[0]) => {
    if (step.isEmergency) return "text-red-400";
    if (step.isPostponed) return "text-indigo-400";
    if (step.type === "completed") return "text-slate-500";
    if (step.type === "current") return "text-emerald-400";
    if (step.type === "next") return "text-amber-400";
    return isDark ? "text-slate-500" : "text-slate-400";
  };

  return (
    <div className={`flex items-center justify-between h-full w-full p-8 rounded-3xl border shadow-2xl transition-all duration-500 ${
      isDark ? "border-white/5" : "border-slate-100"
    }`}>
      {/* 🟢 CIRCLE SEQUENCE OR EMPTY STATE */}
      <div className="flex items-center gap-4 w-full">
        {hasNoTokens ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="size-20 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
            <div>
              <h3 className={`text-2xl font-black uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>
                Hi, Doctor!
              </h3>
              <p className={`font-bold uppercase tracking-widest text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Your queue is currently empty. Have a great day!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center relative">
                  {/* CURRENT Indicator */}
                  {step.type === "current" && (
                    <div className="absolute -top-10 animate-bounce">
                      <ArrowDown
                        size={32}
                        className={`${
                          step.isEmergency
                            ? "text-red-500 fill-red-500/20"
                            : step.isPostponed
                              ? "text-indigo-500 fill-indigo-500/20"
                              : "text-emerald-500 fill-emerald-500/20"
                        }`}
                      />
                    </div>
                  )}

                  {/* 🎯 CIRCLE */}
                  <div className={getCircleStyles(step)}>
                    {step.label}
                  </div>

                  {/* LABEL */}
                  <span
                    className={`mt-2 text-1xl font-bold tracking-[0.2em] uppercase ${getLabelColor(step)}`}
                  >
                    {getLabelText(step)}
                  </span>
                </div>

                {/* ➡️ Separator */}
                {i < steps.length - 1 && (
                  <ChevronRight size={34} className={`mx-5 ${isDark ? "text-slate-800" : "text-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📊 META STATS */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-2xl mb-1 mx-auto">
            <Users className="text-indigo-400" size={20} />
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black">
            Waiting
          </p>
          <p className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            {meta?.totalWaiting ?? 0}
          </p>
        </div>

        {/* <div className="h-12 w-[1px] bg-white/10" />

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-sky-500/10 rounded-2xl mb-1 mx-auto">
            <Clock className="text-sky-400" size={20} />
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black">
            Time
          </p>
          <p className="text-2xl font-black text-white">
            {meta?.estimatedWaitTime || "--"}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default DoctorTokenPanel;
