import { ChevronRight, ArrowDown, Users, Clock } from "lucide-react";
import type { DepartmentQueue, DoctorQueueDisplay } from "../../../core/types";

interface DoctorTokenPanelProps {
  doctorId: string;
  departments: DepartmentQueue[];
}

const DoctorTokenPanel = ({ doctorId, departments }: DoctorTokenPanelProps) => {
  const doctor = departments
    ?.flatMap((dept: DepartmentQueue) => dept.doctors || [])
    ?.find((doc: DoctorQueueDisplay) => doc.id === doctorId);

  if (!doctor) return null;

  const { display, queue = [], meta } = doctor;

  // ✅ Check if current token is emergency
  const isEmergencyCurrent =
    display?.emergency && display?.current === display?.emergency;

  const steps = [
    { label: display.current || "--", type: "current" },
    { label: display.next || "--", type: "next" },
    ...queue.slice(0, 3).map((q: string) => ({ label: q, type: "upcoming" })),
  ];

  return (
    <div className="flex items-center justify-between h-full w-full p-8 rounded-3xl border border-white/5 shadow-2xl">
      {/* 🟢 CIRCLE SEQUENCE */}
      <div className="flex items-center gap-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center relative">
              {/* CURRENT Indicator */}
              {step.type === "current" && (
                <div className="absolute -top-10 animate-bounce">
                  <ArrowDown
                    size={32}
                    className={`${
                      isEmergencyCurrent
                        ? "text-red-500 fill-red-500/20"
                        : "text-emerald-500 fill-emerald-500/20"
                    }`}
                  />
                </div>
              )}

              {/* 🎯 CIRCLE */}
              <div
                className={`
                  flex items-center justify-center rounded-full transition-all duration-500 text-center
                  ${
                    step.type === "current"
                      ? isEmergencyCurrent
                        ? "w-28 h-28 bg-red-600 text-white mx-auto text-2xl font-black shadow-[0_0_40px_rgba(239,68,68,0.5)] ring-8 ring-red-500/30 animate-pulse"
                        : "w-28 h-28 bg-emerald-500 text-white mx-auto text-2xl font-black shadow-[0_0_40px_rgba(16,185,129,0.4)] ring-8 ring-emerald-500/20"
                      : step.type === "next"
                        ? "w-20 h-20 bg-amber-500 text-black text-xl font-bold ring-4 ring-amber-500/20"
                        : "w-18 h-18 bg-slate-800 text-blue-400 text-l font-bold border border-blue-700"
                  }
                `}
              >
                {step.label}
              </div>

              {/* LABEL */}
              <span
                className={`mt-2 text-1xl font-bold tracking-[0.2em] uppercase ${
                  step.type === "current"
                    ? isEmergencyCurrent
                      ? "text-red-400"
                      : "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {step.type === "current"
                  ? isEmergencyCurrent
                    ? "Emergency"
                    : "Serving"
                  : step.type === "next"
                    ? "Next"
                    : ""}
              </span>
            </div>

            {/* ➡️ Separator */}
            {i < steps.length - 1 && (
              <ChevronRight size={34} className="mx-5 text-slate-800" />
            )}
          </div>
        ))}
      </div>

      {/* 📊 META STATS */}
      {/* <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-2xl mb-1 mx-auto">
            <Users className="text-indigo-400" size={20} />
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black">
            Waiting
          </p>
          <p className="text-2xl font-black text-white">
            {meta?.totalWaiting ?? 0}
          </p>
        </div>

        <div className="h-12 w-[1px] bg-white/10" />

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
        </div>
      </div> */}
    </div>
  );
};

export default DoctorTokenPanel;