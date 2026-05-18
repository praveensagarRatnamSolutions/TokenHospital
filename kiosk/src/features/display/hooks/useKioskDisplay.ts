import { useState, useEffect, useRef } from "react";
import { kioskApi, authApi, printApi } from "../../../core/api";
import { socketService } from "../../../core/api/socket";
import { dbStore, initDB } from "../../../core/db";
import { useOnlineStatus } from "../../../core/hooks/useOnlineStatus";
import { useSync } from "../../../core/hooks/useSync";
import type {
  Kiosk,
  Department,
  Doctor,
  DepartmentQueue,
  User,
} from "../../../core/types";

export type KioskStep =
  | "LANDING"
  | "DEPARTMENT"
  | "DOCTOR"
  | "PAYMENT"
  | "UPI_PAYMENT"
  | "SUCCESS";

export const useKioskDisplay = (code: string) => {
  // Idle timeout configuration (3 minutes = 180000 milliseconds)
  const IDLE_TIMEOUT = 180000;
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [waitingCount, setWaitingCount] = useState<number>(0);

  const isOnline = useOnlineStatus();
  useSync(isOnline);

  // Idle timeout handler - resets to LANDING after inactivity
  const resetIdleTimeout = () => {
    // Clear existing timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // Set new timeout (only if not on LANDING or SUCCESS steps)
    if (step !== "LANDING" && step !== "UPI_PAYMENT") {
      idleTimeoutRef.current = setTimeout(() => {
        console.log("Kiosk idle timeout - returning to landing");
        setStep("LANDING");
        setSelectedDept(null);
        setSelectedDoctor(null);
        setGeneratedToken(null);
        setPaymentOrder(null);
        setWaitingCount(0);
      }, IDLE_TIMEOUT);
    }
  };

  // Setup interaction listeners
  useEffect(() => {
    const handleUserInteraction = () => {
      resetIdleTimeout();
    };

    // List of events to track user interaction
    const events = [
      "mousedown",
      "mouseup",
      "keydown",
      "keyup",
      "touchstart",
      "touchend",
      "click",
      "scroll",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction);
    });

    // Reset timeout on component mount
    resetIdleTimeout();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [step]);

  // Initialize DB and fetch kiosk & current user profile
  useEffect(() => {
    const init = async () => {
      await initDB();

      // Fetch Kiosk
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

      // Fetch Current User Profile
      const fetchProfile = async () => {
        try {
          const response = await authApi.getMe();
          if (response.success) {
            setCurrentUser(response.data);
          }
        } catch (err) {
          console.error("Failed to fetch user profile", err);
        }
      };

      await Promise.all([fetchKiosk(), fetchProfile()]);
    };
    init();
  }, [code]);

  // Socket updates
  useEffect(() => {
    if (kiosk?.hospitalId && isOnline) {
      socketService.connect(kiosk.hospitalId);

      // Join kiosk-specific room for targeted updates
      socketService.emit("join-kiosk", kiosk._id);

      // Grouped department queue for the kiosk display
      socketService.on("kiosk-queue-updated", (data: DepartmentQueue[]) => {
        console.log("Received queue update via socket", data);
        setDepartmentQueue(data);
        dbStore.set("tokens", "current_dept_queue", data);
      });

      // Initial fetch of grouped queue
      kioskApi
        .getTokenQueue(kiosk.hospitalId, kiosk._id)
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

  const handleStartProcess = () => {
    if (currentUser?.role?.toLowerCase() === "doctor") {
      // Find department from populated doctorId
      const docProfile = currentUser.doctorId;
      if (
        docProfile &&
        typeof docProfile === "object" &&
        docProfile.departmentId
      ) {
        const dept = docProfile.departmentId as Department;
        setSelectedDept(dept);
        setStep("DOCTOR");
        return;
      }
    }
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
    age: number;
    gender: "Male" | "Female" | "Other";
    phone: {
      full: string;
      countryCode: string;
      country: string;
      nationalNumber: string;
    };
    paymentMethod: "CASH" | "UPI" | "CARD";
  }) => {
    try {
      if (data.paymentMethod === "UPI" || data.paymentMethod === "CARD") {
        // 💳 Online Flow: Create order and show QR
        const response = await kioskApi.createPaymentOrder({
          doctorId: selectedDoctor!._id,
          departmentId: selectedDept!._id,
          method: data.paymentMethod,
          patientDetails: {
            name: data.name,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
          },
        });

        if (response.success) {
          setPaymentOrder(response.data);
          setStep("UPI_PAYMENT");
        }
        return;
      }

      // 💵 Cash Flow: Create token directly
      const today = new Date().toISOString().split("T")[0];

      const response = await kioskApi.createToken({
        departmentId: selectedDept!._id,
        doctorId: selectedDoctor!._id,
        appointmentDate: today,
        paymentMethod: data.paymentMethod,
        patientDetails: {
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
        },
      });

      // Store token in state
      setGeneratedToken(response.data);
      setWaitingCount(response.waitingCount || 0);

      // Move to success screen
      setStep("SUCCESS");

      // Use fresh API response directly
      const tokenData = response.data.token;

      console.log("Generated token data:", tokenData);

      try {
        const printRes = await printApi.getPrintData(tokenData._id);
        if (printRes.success && printRes.data) {
          await printApi.sendToPrinter(printRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch or send print data", err);
      }
    } catch (err) {
      console.error("❌ Process failed", err);
    }
  };

  const handleUPIComplete = async (data: any) => {
    // data might be the token object directly or { token, waitingCount }
    const token = data.token || data;
    const count = data.waitingCount || 0;

    setGeneratedToken({ token });
    setWaitingCount(count);
    setStep("SUCCESS");
    setPaymentOrder(null);

    // Print the token
    try {
      const printRes = await printApi.getPrintData(token._id);
      if (printRes.success && printRes.data) {
        await printApi.sendToPrinter(printRes.data);
      }
    } catch (err) {
      console.error("Printing failed after UPI", err);
    }
  };

  const resetFlow = () => {
    setStep("LANDING");
    setSelectedDept(null);
    setSelectedDoctor(null);
    setGeneratedToken(null);
    setPaymentOrder(null);
    setWaitingCount(0);
  };

  return {
    state: {
      showMenu,
      kiosk,
      departmentQueue,
      loading,
      error,
      isFullscreen,
      showPinModal,
      pin,
      pinError,
      step,
      selectedDept,
      selectedDoctor,
      generatedToken,
      isOnline,
      paymentOrder,
      waitingCount,
    },
    actions: {
      setShowMenu,
      setPin,
      setShowPinModal,
      toggleFullscreen,
      handleExitKiosk,
      handleStartProcess,
      handleDeptSelect,
      handleDoctorSelect,
      handlePaymentProceed,
      handleUPIComplete,
      resetFlow,
      setStep,
    },
  };
};
