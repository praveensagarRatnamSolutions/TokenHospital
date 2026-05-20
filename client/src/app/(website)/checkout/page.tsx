'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Crown,
  Activity,
  Building2,
  ChevronLeft,
  ArrowRight,
  Check,
  Lock,
  Zap,
  Star
} from 'lucide-react';

import { subscriptionApi, Plan } from '@/services/subscriptionApi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Resolve planId parameter from query parameters
  const planIdParam = (searchParams.get('planId') || 'GOLD').toUpperCase();

  const cycleParam = (
    searchParams.get('cycle') || 'MONTHLY'
  ).toUpperCase() as
    | 'MONTHLY'
    | 'QUARTERLY'
    | 'HALF_YEARLY'
    | 'YEARLY';

  /**
   * ==========================================
   * STATES
   * ==========================================
   */
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * ==========================================
   * FETCH PLANS
   * ==========================================
   */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await subscriptionApi.getPublicPlans();
        setPlans(data || []);
      } catch (err) {
        console.error('Failed to load plan details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  /**
   * ==========================================
   * RESOLVE PLAN + PRICE
   * ==========================================
   */
  const targetPlan = plans.find(
    (p) => p.planId?.toUpperCase() === planIdParam
  );

  const priceObj = targetPlan?.prices?.find(
    (p) => p.billingCycle?.toUpperCase() === cycleParam
  );

  const resolvedPrice = priceObj?.amount || 0;

  /**
   * ==========================================
   * PAYMENT HANDLER
   * ==========================================
   */
  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const checkoutRes = await subscriptionApi.createCheckout(
        planIdParam,
        cycleParam
      );

      if (!checkoutRes.success || !checkoutRes.data) {
        throw new Error('Could not initialize checkout');
      }

      const { subscriptionId, keyId, isMock } = checkoutRes.data as any;

      if (isMock) {
        // In sandbox mode, bypass Razorpay popup (which would block due to invalid/unsynced ID on real Razorpay servers)
        // and trigger immediate successful verification with simulated test details!
        setIsProcessing(true);
        setTimeout(async () => {
          try {
            await subscriptionApi.verifyCheckout({
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
              razorpay_subscription_id: subscriptionId,
              razorpay_signature: 'mock_signature_bypass',
              planId: planIdParam,
              billingCycle: cycleParam
            });

            setPaymentSuccess(true);
            setTimeout(() => {
              router.push('/admin');
            }, 2500);
          } catch (verifyErr: any) {
            setErrorMsg(
              verifyErr?.response?.data?.message ||
              'Sandbox verification failed'
            );
          } finally {
            setIsProcessing(false);
          }
        }, 1200); // 1.2s delay for a premium loading effect!
        return;
      }

      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: 'TokenHospital',
        description: `${targetPlan?.name} Subscription`,
        image: '/favicon.ico',
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            await subscriptionApi.verifyCheckout({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              planId: planIdParam,
              billingCycle: cycleParam
            });

            setPaymentSuccess(true);
            setTimeout(() => {
              router.push('/admin');
            }, 2500);
          } catch (verifyErr: any) {
            setErrorMsg(
              verifyErr?.response?.data?.message ||
              'Payment verification failed'
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Payment failed'
      );
      setIsProcessing(false);
    }
  };

  /**
   * ==========================================
   * LOADING
   * ==========================================
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading Secure Checkout...
        </p>
      </div>
    );
  }

  /**
   * ==========================================
   * INVALID PLAN
   * ==========================================
   */
  if (!targetPlan) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
        </div>
        <h2 className="mt-6 text-3xl font-black text-slate-900">
          Plan Structure Mismatch
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md font-medium leading-relaxed">
          The requested plan ID <code className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-rose-600">{planIdParam}</code> could not be matched with seeded subscription models.
        </p>
        <Link href="/onboarding" className="mt-6">
          <Button className="rounded-2xl h-12 px-6 font-extrabold uppercase text-xs tracking-wider shadow-md">
            Return to Onboarding Plan Selector
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-tr from-slate-50 via-blue-50/40 to-indigo-50/20 py-12 relative flex items-center justify-center px-4 md:px-8">
      
      {/* Background neon orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      {/* SUCCESS POPUP */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center px-4 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shadow-xl shadow-emerald-500/10 animate-bounce-subtle">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-4xl font-black text-slate-900 leading-none">
            Secure Node Confirmed!
          </h2>
          <p className="mt-3 text-slate-500 max-w-sm text-sm font-medium leading-relaxed">
            Your premium subscription has been successfully provisioned. Redirecting to workspace...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mt-6" />
        </div>
      )}

      <div className="w-full max-w-5xl bg-white border border-slate-200/80 rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-slate-100/60 relative overflow-hidden">
        
        {/* TOP BAR LAYOUT */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-[10px] font-black uppercase tracking-widest text-primary">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Secure Encrypted checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT PANEL: Subscription Details */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Active Node Upgrading
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                Confirm Subscription
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Verify your plan allocation details and quotas below before finalizing.
              </p>
            </div>

            {/* DETAILED CARD */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                    {targetPlan?.planId?.toUpperCase() === 'PRO' ? (
                      <Zap className="w-6 h-6 text-primary" />
                    ) : (
                      <Building2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {targetPlan.name} Plan
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {targetPlan.description}
                    </p>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              {/* METER LIMITS */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  {
                    label: 'Doctors',
                    value: targetPlan?.limits?.maxDoctors,
                    colorClass: 'bg-primary'
                  },
                  {
                    label: 'Departments',
                    value: targetPlan?.limits?.maxDepartments,
                    colorClass: 'bg-emerald-500'
                  },
                  {
                    label: 'Kiosks',
                    value: targetPlan?.limits?.maxKiosks,
                    colorClass: 'bg-indigo-500'
                  }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
                  >
                    <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-900 leading-none">
                      {item.value === -1 ? 'Unlimited' : item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* FEATURES */}
              {targetPlan?.features && targetPlan.features.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {targetPlan.features.slice(0, 6).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span className="line-clamp-1">{feat.text}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* RIGHT PANEL: Secure Payment */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="rounded-[2.2rem] bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 p-8 shadow-2xl shadow-slate-950/20 relative overflow-hidden flex-1 flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-primary">
                    Billing Invoice
                  </span>
                  <div className="flex items-end gap-1.5 mt-2">
                    <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
                      ₹{resolvedPrice.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs pb-0.5 capitalize font-medium">
                      / {cycleParam.replaceAll('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* BREAKDOWN LIST */}
                <div className="space-y-3 pt-6 border-t border-dashed border-white/10">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Subscription Allocation</span>
                    <span className="text-white font-extrabold">₹{resolvedPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Billing Term cycle</span>
                    <span className="text-emerald-400 font-extrabold capitalize">
                      {cycleParam.replaceAll('_', ' ').toLowerCase()}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-white/10 pt-4 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-200">Total Charged</span>
                    <span className="text-2xl font-black text-white">
                      ₹{resolvedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ERROR PANEL */}
                {errorMsg && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-medium text-rose-400 leading-normal">
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* ACTION PAY BUTTON */}
              <div className="mt-8 space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/95 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary/25 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                      Initializing Payment...
                    </>
                  ) : (
                    <>
                      Continue Secure Payment
                      <ArrowRight className="w-4 h-4 text-primary-foreground" />
                    </>
                  )}
                </Button>

                <Link href="/admin" className="block text-center pt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                    Skip payment for now
                  </span>
                </Link>
              </div>

              {/* SECURITY SEALS */}
              <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-center gap-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Razorpay</span>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Visa</span>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Mastercard</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </main>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading Secure Checkout...
        </p>
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}