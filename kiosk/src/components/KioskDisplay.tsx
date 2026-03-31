import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { kioskApi } from "../api";
import { socketService } from "../api/socket";
import type { Kiosk, Token, Department, Doctor } from "../types";
import AdCarousel from "./AdCarousel";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useSync } from "../hooks/useSync";
import { dbStore, initDB } from "../db";
import {
  Wifi,
  WifiOff,
  Loader2,
  Maximize2,
  Minimize2,
  LogOut,
  ShieldCheck,
  ChevronUp,
  Activity,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

// Flow Components
import StepDepartmentGrid from "./flow/StepDepartmentGrid";
import StepDoctorGrid from "./flow/StepDoctorGrid";
import StepPaymentSelection from "./flow/StepPaymentSelection";
import StepTokenSuccess from "./flow/StepTokenSuccess";

interface KioskDisplayProps {
  code: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

type KioskStep = "LANDING" | "DEPARTMENT" | "DOCTOR" | "PAYMENT" | "SUCCESS";

const KioskDisplay: React.FC<KioskDisplayProps> = ({
  code,
  theme,
  onToggleTheme,
}) => {
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [layout, setLayout] = useState<"carousel" | "fullscreen">("carousel");
  // Flow State
  const [step, setStep] = useState<KioskStep>("LANDING");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [generatedToken, setGeneratedToken] = useState<any>(null);

  const isOnline = useOnlineStatus();
  const { pendingCount } = useSync(isOnline);

  // Initialize DB and fetch kiosk
  useEffect(() => {
    const init = async () => {
      await initDB();
      const fetchKiosk = async () => {
        try {
          setLoading(true);
          const response = await kioskApi.getByCode(code);
          const kioskData = response.data;
          setKiosk(kioskData);
          await dbStore.set("config", "active_kiosk", kioskData);
          await dbStore.set("ads", "active_ads", kioskData.ads);
          setError(null);
        } catch (err: any) {
          const cachedKiosk = await dbStore.get("config", "active_kiosk");
          if (cachedKiosk) {
            setKiosk(cachedKiosk);
            setError(null);
          } else {
            setError(
              err.response?.data?.message || "Failed to load kiosk config.",
            );
          }
        } finally {
          setLoading(false);
        }
      };
      fetchKiosk();
    };
    init();
  }, [code]);

  // Socket updates
  useEffect(() => {
    if (kiosk?.hospitalId && isOnline) {
      socketService.connect(kiosk.hospitalId);
      socketService.on("tokenUpdate", (updatedTokens: Token[]) => {
        setTokens(updatedTokens);
        dbStore.set("tokens", "current_queue", updatedTokens);
      });
      return () => {
        socketService.off("tokenUpdate");
      };
    } else if (!isOnline) {
      dbStore.get("tokens", "current_queue").then((cachedTokens) => {
        if (cachedTokens) setTokens(cachedTokens);
      });
    }
  }, [kiosk?.hospitalId, isOnline]);
  console.log("tokens", tokens);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleExitKiosk = () => {
    if (pin === "1234") {
      localStorage.removeItem("active_kiosk_id");
      window.location.reload();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
      setPin("");
    }
  };

  const handleStartProcess = () => {
    setStep("DEPARTMENT");
  };

  const handleDeptSelect = (dept: Department) => {
    setSelectedDept(dept);
    setStep("DOCTOR");
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep("PAYMENT");
  };

  const handlePaymentProceed = async (data: {
    name: string;
    phone: string;
    method: string;
  }) => {
    try {
      const response = await kioskApi.createToken({
        departmentId: selectedDept!._id,
        doctorId: selectedDoctor!._id,
        patientDetails: {
          name: data.name,
          phone: data.phone,
          paymentMode: data.method,
        },
      });
      setGeneratedToken(response.data);
      setStep("SUCCESS");
    } catch (err) {
      console.error("Token generation failed", err);
    }
  };

  const resetFlow = () => {
    setStep("LANDING");
    setSelectedDept(null);
    setSelectedDoctor(null);
    setGeneratedToken(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-500">
        <Loader2 className="animate-spin text-sky-500 mb-8" size={64} />
        <p className="text-2xl font-black uppercase tracking-[0.3em] animate-pulse">
          Initializing Kiosk System
        </p>
      </div>
    );
  }

  if (error || !kiosk) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 dark:bg-red-950 text-red-900 dark:text-white p-12 text-center overflow-hidden transition-colors duration-500">
        <h1 className="text-6xl font-black mb-6 tracking-tighter uppercase">
          Kiosk Error
        </h1>
        <p className="text-2xl opacity-60 font-medium leading-relaxed uppercase tracking-widest">
          {error || "Configuration lost"}
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
    switch (step) {
      case "DEPARTMENT":
        return <StepDepartmentGrid onSelect={handleDeptSelect} />;
      case "DOCTOR":
        return (
          <StepDoctorGrid
            department={selectedDept!}
            onSelect={handleDoctorSelect}
            onBack={() => setStep("DEPARTMENT")}
          />
        );
      case "PAYMENT":
        return (
          <StepPaymentSelection
            department={selectedDept!}
            doctor={selectedDoctor!}
            onProceed={handlePaymentProceed}
            onBack={() => setStep("DOCTOR")}
          />
        );
      case "SUCCESS":
        return (
          <StepTokenSuccess
            tokenNumber={generatedToken.tokenNumber}
            department={selectedDept!}
            doctor={selectedDoctor!}
            onDone={resetFlow}
          />
        );
      default:
        return (
          <div className="w-screen h-screen flex flex-col overflow-hidden">
            <div className="flex-[8] relative bg-slate-100 dark:bg-red-900 transition-all duration-700">
              <AdCarousel
                ads={kiosk.ads}
                isOnline={isOnline}
                onLayoutChange={setLayout}
              />

              <div className="absolute inset-x-0 bottom-0 top-[60%] bg-gradient-to-t from-white dark:from-slate-950 via-white/40 dark:via-slate-900/40 to-transparent pointer-events-none" />

              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
                <motion.button
                  onClick={handleStartProcess}
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-auto h-24 px-12 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/20 flex flex-col items-center justify-center group hover:bg-sky-500 hover:border-sky-400 transition-all shadow-2xl"
                >
                  <ChevronUp
                    className="text-slate-900 dark:text-white group-hover:text-white group-hover:animate-bounce mb-1"
                    size={32}
                  />
                  <span className="text-slate-900 dark:text-white group-hover:text-white text-lg font-black uppercase tracking-[0.3em] group-hover:scale-105 transition-transform">
                    Swipe Up to Begin
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Queue Footer Section */}
            <div className="flex-[2] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 p-8 flex items-center transition-all duration-500  opacity-100">
              <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                      Live Progress
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="size-20 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-teal-500/30">
                        {tokens[0]?.tokenNumber || "---"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tighter">
                          CURRENT TOKEN
                        </span>
                        <span className="text-xs font-bold text-slate-500/60 uppercase tracking-widest">
                          In Consultation
                        </span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className="text-slate-200 dark:text-white/10"
                    size={32}
                  />

                  <div className="flex items-center gap-4 opacity-70">
                    <div className="size-16 rounded-full border-2 border-sky-500/20 bg-sky-500/5 flex items-center justify-center text-sky-600 dark:text-sky-400 text-2xl font-black">
                      {tokens[1]?.tokenNumber || "---"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                        Up Next
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Est. 5-8 Mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-12 w-px bg-slate-100 dark:bg-white/5 mx-12" />

                <div className="flex items-center gap-12">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Emergency
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                      E-09{" "}
                      <span className="text-red-500 text-sm ml-1 font-bold">
                        ●
                      </span>
                    </span>
                  </div>
                  <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400">
                    <Activity size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500">
      {/* Top Controls Overlay */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4 pointer-events-none">
        <div
          className={`
          flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-3xl border pointer-events-auto shadow-sm
          ${isOnline ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"}
        `}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isOnline ? "Active" : "Offline"}
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          className="pointer-events-auto size-10 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/40 hover:text-sky-500 dark:hover:text-white transition-all shadow-sm"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="pointer-events-auto h-10 px-4 flex items-center gap-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span className="text-[8px] font-black uppercase tracking-widest">
            Display
          </span>
        </button>

        <button
          onClick={() => setShowPinModal(true)}
          className="pointer-events-auto size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Main Kiosk Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
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
        {showPinModal && (
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
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="----"
                  maxLength={4}
                  className={`w-full bg-white/5 border-2 rounded-2xl py-6 text-center text-4xl font-black text-white outline-none transition-all ${pinError ? "border-red-500" : "border-white/10 focus:border-sky-500"}`}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPin("");
                  }}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExitKiosk}
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
