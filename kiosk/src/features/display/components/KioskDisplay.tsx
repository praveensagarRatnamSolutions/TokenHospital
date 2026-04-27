import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKioskDisplay } from "../hooks/useKioskDisplay";
import AdCarousel from "./AdCarousel";
import {
  Wifi,
  WifiOff,
  Loader2,
  Maximize2,
  Minimize2,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
  MoreVertical,
  X,
} from "lucide-react";

// Flow Components
import StepDepartmentGrid from "../flow/StepDepartmentGrid";
import StepDoctorGrid from "../flow/StepDoctorGrid";
import StepPaymentSelection from "../flow/StepPaymentSelection";
import StepTokenSuccess from "../flow/StepTokenSuccess";

interface KioskDisplayProps {
  code: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const KioskDisplay: React.FC<KioskDisplayProps> = ({
  code,
  theme,
  onToggleTheme,
}) => {
  const { state, actions } = useKioskDisplay(code);
  const userData = localStorage.getItem("kiosk_user");
  const user = userData ? JSON.parse(userData) : null;
  const isDoctor = user?.role === "DOCTOR";
  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-500">
        <Loader2 className="animate-spin text-sky-500 mb-8" size={64} />
        <p className="text-2xl font-black uppercase tracking-[0.3em] animate-pulse">
          Initializing Kiosk System
        </p>
      </div>
    );
  }

  if (state.error || !state.kiosk) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 dark:bg-red-950 text-red-900 dark:text-white p-12 text-center overflow-hidden transition-colors duration-500">
        <h1 className="text-6xl font-black mb-6 tracking-tighter uppercase">
          Kiosk Error
        </h1>
        <p className="text-2xl opacity-60 font-medium leading-relaxed uppercase tracking-widest">
          {state.error || "Configuration lost"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-12 px-8 py-3 bg-red-600 text-white font-black uppercase rounded-2xl tracking-widest hover:bg-red-700 transition-colors shadow-xl shadow-red-600/20"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderStep = () => {
    switch (state.step) {
      case "DEPARTMENT":
        return <StepDepartmentGrid onSelect={actions.handleDeptSelect} />;
      case "DOCTOR":
        return (
          <StepDoctorGrid
            department={state.selectedDept!}
            onSelect={actions.handleDoctorSelect}
            onBack={() => actions.setStep("DEPARTMENT")}
          />
        );
      case "PAYMENT":
        return (
          <StepPaymentSelection
            department={state.selectedDept!}
            doctor={state.selectedDoctor!}
            onProceed={actions.handlePaymentProceed}
            onBack={() => actions.setStep("DOCTOR")}
          />
        );
      case "SUCCESS":
        return (
          <StepTokenSuccess
            tokenNumber={state.generatedToken?.tokenNumber}
            department={state.selectedDept!}
            doctor={state.selectedDoctor!}
            onDone={actions.resetFlow}
          />
        );
      default:
        return (
          <div
            className="w-screen h-screen relative overflow-hidden"
            onClick={actions.handleStartProcess}
          >
            {/* Full-screen carousel — ads + department queue slides interleaved */}
            <AdCarousel
              ads={state.kiosk?.ads || []}
              isOnline={state.isOnline}
              departments={state.departmentQueue}
              theme={theme}
            />

            {/* "Get Token" CTA — floats over the carousel */}
            {/* <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <motion.button
                onClick={actions.handleStartProcess}
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`h-20 px-14 rounded-full border flex flex-col items-center justify-center group transition-all shadow-2xl active:scale-95 ${
                  theme === "dark" 
                    ? "bg-white/10 backdrop-blur-3xl border-white/25 shadow-black/40 hover:bg-teal-500 hover:border-teal-400" 
                    : "bg-white shadow-blue-500/10 border-slate-200 hover:bg-blue-600 hover:border-blue-500"
                }`}
              >
                <ChevronUp
                  className={`transition-colors duration-500 group-hover:text-white group-hover:animate-bounce mb-0.5 ${
                    theme === "dark" ? "text-white" : "text-blue-600"
                  }`}
                  size={28}
                />
                <span className={`text-base font-black uppercase tracking-[0.3em] group-hover:scale-105 transition-all group-hover:text-white ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  Tap to Get Token
                </span>
              </motion.button>
            </div> */}
          </div>
        );
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500">
      {/* ── Top-Right Menu Trigger ── */}
      <div className="absolute top-8 right-8 z-[60]">
        <button
          onClick={() => actions.setShowMenu(!state.showMenu)}
          className="size-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 shadow-xl active:scale-95 transition-all pointer-events-auto"
        >
          {state.showMenu ? <X size={28} /> : <MoreVertical size={28} />}
        </button>

        {/* ── The Dropdown Menu ── */}
        <AnimatePresence>
          {state.showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-16 right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-3 flex flex-col gap-2"
            >
              {/* Status Item (Non-clickable) */}
              <div
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl ${state.isOnline ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
              >
                {state.isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                <span className="text-xs font-black uppercase tracking-widest">
                  {state.isOnline ? "System Online" : "System Offline"}
                </span>
              </div>

              <div className="h-px bg-slate-100 dark:bg-white/5 mx-4 my-1" />

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  onToggleTheme();
                  actions.setShowMenu(false);
                }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-white/70 transition-colors"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-xs font-black uppercase tracking-widest">
                  Toggle Theme
                </span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => {
                  actions.toggleFullscreen();
                  actions.setShowMenu(false);
                }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-white/70 transition-colors"
              >
                {state.isFullscreen ? (
                  <Minimize2 size={20} />
                ) : (
                  <Maximize2 size={20} />
                )}
                <span className="text-xs font-black uppercase tracking-widest">
                  {state.isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                </span>
              </button>

              {/* Exit/LogOut */}
              <button
                onClick={() => {
                  actions.setShowPinModal(true);
                  actions.setShowMenu(false);
                }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-red-500/10 text-red-500 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-xs font-black uppercase tracking-widest">
                  Admin Controls
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Kiosk Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* PIN Modal (Unchanged Admin Logic) */}
      <AnimatePresence>
        {state.showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-12 w-full max-w-md text-center shadow-2xl"
            >
              <div className="size-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-8">
                <ShieldCheck className="text-sky-400" size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 uppercase">
                Kiosk Control
              </h2>
              <div className="relative mb-8">
                <input
                  type="password"
                  value={state.pin}
                  onChange={(e) => actions.setPin(e.target.value)}
                  placeholder="----"
                  maxLength={4}
                  className={`w-full bg-white/5 border-2 rounded-2xl py-6 text-center text-4xl font-black text-white outline-none transition-all ${state.pinError ? "border-red-500" : "border-white/10 focus:border-sky-500"}`}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    actions.setShowPinModal(false);
                    actions.setPin("");
                  }}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={actions.handleExitKiosk}
                  className="flex-1 py-4 rounded-2xl bg-sky-500 text-white font-black uppercase tracking-widest"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KioskDisplay;
