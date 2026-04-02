import { useState, useEffect } from "react";
import { kioskApi } from "../../../core/api";
import { socketService } from "../../../core/api/socket";
import { dbStore, initDB } from "../../../core/db";
import { useOnlineStatus } from "../../../core/hooks/useOnlineStatus";
import { useSync } from "../../../core/hooks/useSync";
import type { Kiosk, Department, Doctor, DepartmentQueue } from "../../../core/types";

export type KioskStep = "LANDING" | "DEPARTMENT" | "DOCTOR" | "PAYMENT" | "SUCCESS";

export const useKioskDisplay = (code: string) => {
  const [showMenu, setShowMenu] = useState(false);
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [departmentQueue, setDepartmentQueue] = useState<DepartmentQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  // Flow State
  const [step, setStep] = useState<KioskStep>("LANDING");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [generatedToken, setGeneratedToken] = useState<any>(null);

  const isOnline = useOnlineStatus();
  useSync(isOnline);

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

      // Grouped department queue for the kiosk display
      socketService.on("kiosk-queue-updated", (data: DepartmentQueue[]) => {
        setDepartmentQueue(data);
        dbStore.set("tokens", "current_dept_queue", data);
      });

      // Initial fetch of grouped queue
      kioskApi
        .getTokenQueue(kiosk.hospitalId)
        .then((res) => {
          setDepartmentQueue(res.data || []);
        })
        .catch(() => {});

      return () => {
        socketService.off("kiosk-queue-updated");
      };
    } else if (!isOnline) {
      dbStore.get("tokens", "current_dept_queue").then((cached) => {
        if (cached) setDepartmentQueue(cached);
      });
    }
  }, [kiosk?.hospitalId, isOnline]);

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

  const handleStartProcess = () => setStep("DEPARTMENT");
  const handleDeptSelect = (dept: Department) => {
    setSelectedDept(dept);
    setStep("DOCTOR");
  };
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep("PAYMENT");
  };

  const handlePaymentProceed = async (data: { name: string; phone: string; method: string; }) => {
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

  return {
    state: {
      showMenu, kiosk, departmentQueue, loading, error, isFullscreen,
      showPinModal, pin, pinError, step, selectedDept, selectedDoctor, generatedToken, isOnline
    },
    actions: {
      setShowMenu, setPin, setShowPinModal,
      toggleFullscreen, handleExitKiosk, handleStartProcess,
      handleDeptSelect, handleDoctorSelect, handlePaymentProceed, resetFlow, setStep
    }
  };
};
