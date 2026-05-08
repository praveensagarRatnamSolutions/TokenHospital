import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Smartphone,
  Info,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { kioskApi } from "../../../core/api";

interface StepUPIPaymentProps {
  paymentData: {
    orderId: string;
    amount: number;
    currency: string;
    qrCode: {
      id: string;
      imageUrl: string;
      payload: string;
    } | null;
    paymentLink: {
      id: string;
      url: string;
    } | null;
  };
  onComplete: (token: any) => void;
  onBack: () => void;
}

const StepUPIPayment: React.FC<StepUPIPaymentProps> = ({
  paymentData,
  onComplete,
  onBack,
}) => {
  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILED">("PENDING");
  const [polling, setPolling] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (!polling || status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const response = await kioskApi.checkPaymentStatus(paymentData.orderId);
        if (response.success && response.status === "captured") {
          setStatus("SUCCESS");
          setPolling(false);
          // Wait a bit to show success animation before moving on
          setTimeout(() => {
            onComplete(response);
          }, 2000);
        } else if (response.status === "failed") {
          setStatus("FAILED");
          setPolling(false);
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [paymentData.orderId, polling, status, onComplete]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setPolling(false);
      setStatus("FAILED");
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-500">
      {/* Header */}
      <header className="pt-20 pb-12 px-12 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-3xl">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <button
            onClick={onBack}
            disabled={status === "SUCCESS"}
            className="flex items-center gap-4 text-slate-400 dark:text-white/30 hover:text-sky-500 transition-colors mb-12 group disabled:opacity-0"
          >
            <div className="size-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">
              Cancel Payment
            </span>
          </button>

          <div className="size-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-8">
            {paymentData.paymentLink ? (
                <CreditCard className="text-teal-600 dark:text-teal-400" size={40} />
            ) : (
                <QrCode className="text-teal-600 dark:text-teal-400" size={40} />
            )}
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
            Scan & Pay
          </h1>
          <p className="text-xl text-slate-500 dark:text-white/40 font-medium uppercase tracking-widest leading-relaxed">
            {paymentData.paymentLink ? "Scan to pay via Card, Net Banking or Wallets" : "Scan the QR code below using any UPI App"}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side: QR Code Display */}
          <div className="flex flex-col items-center">
            <div className="relative p-8 bg-white dark:bg-white/5 rounded-[3rem] border-2 border-slate-100 dark:border-white/10 shadow-2xl">
              <AnimatePresence mode="wait">
                {status === "PENDING" ? (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="relative flex items-center justify-center p-4 bg-white rounded-3xl"
                  >
                    {paymentData.qrCode || paymentData.paymentLink ? (
                      <div className="p-4 bg-white rounded-2xl">
                        <QRCodeSVG
                          value={paymentData.qrCode?.payload || paymentData.paymentLink?.url || ""}
                          size={320}
                          level="H"
                          includeMargin={false}
                          imageSettings={{
                            src: paymentData.paymentLink 
                                ? "https://cdn.razorpay.com/static/assets/logo/payment_method_card.png"
                                : "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
                            x: undefined,
                            y: undefined,
                            height: 40,
                            width: 40,
                            excavate: true,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="size-80 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                        <Loader2 className="animate-spin text-sky-500" size={48} />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating QR...</span>
                      </div>
                    )}
                  </motion.div>
                ) : status === "SUCCESS" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="size-80 flex flex-col items-center justify-center gap-6"
                  >
                    <div className="size-32 rounded-full bg-teal-500 flex items-center justify-center shadow-xl shadow-teal-500/30">
                      <CheckCircle2 className="text-white" size={64} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-black text-teal-600 dark:text-teal-400 uppercase tracking-tighter">Payment Received</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Generating your token...</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="failed"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="size-80 flex flex-col items-center justify-center gap-6"
                  >
                    <div className="size-32 rounded-full bg-red-500 flex items-center justify-center shadow-xl shadow-red-500/30">
                      <XCircle className="text-white" size={64} />
                    </div>
                    <div className="text-center px-4">
                      <h3 className="text-3xl font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">Payment Failed</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">The session expired or was declined</p>
                      <button 
                        onClick={onBack}
                        className="mt-6 px-6 py-2 bg-slate-100 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest"
                      >
                        Try Again
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {status === "PENDING" && (
              <div className="mt-8 flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Expires in</span>
                <span className="text-xl font-black text-sky-500 tabular-nums">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Right Side: Payment Info */}
          <div className="flex flex-col gap-8">
            <div className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-8">
              <div>
                <p className="text-xs font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.3em] mb-4 leading-none">Consultation Amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-400">₹</span>
                  <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {paymentData.amount / 100}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-white/5" />

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-white leading-none uppercase tracking-tight">Secure Payment</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Encrypted via Razorpay</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-white leading-none uppercase tracking-tight">Any UPI App</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GPay, PhonePe, Paytm, etc.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 px-8 py-6 rounded-3xl bg-sky-500/5 border border-sky-500/10 text-sky-600 dark:text-sky-400">
              <Info className="flex-shrink-0 mt-1" size={18} />
              <p className="text-xs font-bold leading-relaxed">
                Please do not refresh or go back until the payment is confirmed. Your token will be generated automatically once the transaction is complete.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Status Footer */}
      <footer className="p-12 border-t border-slate-100 dark:border-white/5 flex justify-center bg-slate-50/30 dark:bg-slate-900/30 overflow-hidden">
        <div className="flex items-center gap-12">
            <div className="flex items-center gap-4 grayscale opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4" />
            </div>
        </div>
      </footer>
    </div>
  );
};

export default StepUPIPayment;
