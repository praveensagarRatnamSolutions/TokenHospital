'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Loader2, 
  Activity, 
  Zap, 
  Crown, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Globe,
  Plus,
  Lock,
  Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { Input } from '@/components/ui/input';
import PhoneNumberInput, { PhoneData } from '@/components/common/phone-input';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { subscriptionApi } from '@/services/subscriptionApi';

// Interfaces matching backend Plan structure
interface PlanPrice {
  billingCycle: string;
  amount: number;
  intervalMonths?: number;
}

interface PlanFeature {
  text: string;
  available: boolean;
}

interface Plan {
  planId: string;
  name: string;
  description: string;
  prices: PlanPrice[];
  features?: PlanFeature[];
  limits?: {
    maxDoctors?: number;
    maxDepartments?: number;
    maxKiosks?: number;
  };
}

const getPlanIcon = (planId: string) => {
  switch (planId?.toUpperCase()) {
    case 'FREE':
      return Activity;
    case 'GOLD':
    case 'PRO':
      return Zap;
    default:
      return Crown;
  }
};

export default function OnboardingPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <OnboardingContent />
    </ProtectedRoute>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // States
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('FREE');
  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'>('MONTHLY');
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Premium UI Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [tempCheckoutDetails, setTempCheckoutDetails] = useState<any>(null);

  // Accordion/Section Toggles
  const [showAddress, setShowAddress] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);

  // Core fields
  const [hospitalName, setHospitalName] = useState('');
  const [phone, setPhone] = useState<PhoneData>({
    full: '',
    countryCode: '',
    country: '',
    nationalNumber: '',
  });

  // Optional fields
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Fetch Public Plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await api.get('/api/subscription/public-plans');
        const fetchedPlans = response?.data?.data || [];
        setPlans(fetchedPlans);

        if (!searchParams.get('planId') && fetchedPlans.length > 0) {
          const hasFree = fetchedPlans.some((p: Plan) => p.planId?.toUpperCase() === 'FREE');
          setSelectedPlanId(hasFree ? 'FREE' : fetchedPlans[0].planId);
          setSelectedCycle('MONTHLY');
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [searchParams]);

  // Pre-fill from URL parameters
  useEffect(() => {
    const planParam = searchParams.get('planId');
    const cycleParam = searchParams.get('cycle');

    if (planParam) {
      setSelectedPlanId(planParam.toUpperCase());
    }
    if (cycleParam) {
      setSelectedCycle(cycleParam.toUpperCase() as any);
    }
  }, [searchParams]);

  const normalizedPlanId = selectedPlanId?.toUpperCase();
  const isPaidPlan = normalizedPlanId !== 'FREE';

  const targetPlan =
    plans.find((p) => p.planId?.toUpperCase() === normalizedPlanId) ||
    plans.find((p) => p.planId?.toUpperCase() === 'FREE') ||
    plans[0];

  const priceObj = targetPlan?.prices?.find(
    (p) => p.billingCycle?.toUpperCase() === selectedCycle?.toUpperCase()
  );

  const cyclePrice = Number(priceObj?.amount || 0);

  const monthlyEquivalent =
    selectedCycle === 'YEARLY'
      ? cyclePrice / 12
      : selectedCycle === 'HALF_YEARLY'
        ? cyclePrice / 6
        : selectedCycle === 'QUARTERLY'
          ? cyclePrice / 3
          : cyclePrice;

  const triggerRazorpayCheckout = (keyId: string, subscriptionId: string, userResult: any, contactPhone: string) => {
    if (!(window as any).Razorpay) {
      setErrorMsg('Razorpay payment gateway script not loaded. Please try again.');
      return;
    }

    const options = {
      key: keyId,
      subscription_id: subscriptionId,
      name: 'TokenHospital',
      description: `${targetPlan?.name} Subscription Upgrade`,
      image: '/favicon.ico',
      handler: async function (response: any) {
        setIsProcessing(true);
        setProcessingStage('Verifying paid subscription payment...');
        try {
          await subscriptionApi.verifyCheckout({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
            planId: normalizedPlanId,
            billingCycle: selectedCycle
          });
          
          setProcessingStage('Payment success! Routing to dashboard...');
          setTimeout(() => {
            setIsProcessing(false);
            sessionStorage.removeItem('onboarding_in_progress');
            window.location.href = '/admin';
          }, 1500);
        } catch (verifyErr) {
          console.error('Payment verification failed. Showing action panel.');
          setIsProcessing(false);
          setShowDecisionModal(true);
        }
      },
      prefill: {
        name: userResult?.name || user?.name || '',
        email: userResult?.email || user?.email || '',
        contact: contactPhone || ''
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: function () {
          console.log('Payment dismissed by user. Displaying action modal.');
          setShowDecisionModal(true);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleRetryPayment = () => {
    if (!tempCheckoutDetails) return;
    setShowDecisionModal(false);
    
    if (tempCheckoutDetails.isMock) {
      handleMockPaymentFlow(tempCheckoutDetails.subscriptionId);
    } else {
      triggerRazorpayCheckout(
        tempCheckoutDetails.keyId,
        tempCheckoutDetails.subscriptionId,
        tempCheckoutDetails.userResult,
        phone.full
      );
    }
  };

  const handleMockPaymentFlow = (subscriptionId: string) => {
    setIsProcessing(true);
    setProcessingStage('Authorizing mock credentials (Sandbox)...');
    
    setTimeout(() => {
      setProcessingStage('Simulating bank gateway response (Sandbox)...');
      
      setTimeout(() => {
        setProcessingStage('Verifying cryptographic sandbox signature (Sandbox)...');
        
        setTimeout(async () => {
          try {
            await subscriptionApi.verifyCheckout({
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
              razorpay_subscription_id: subscriptionId,
              razorpay_signature: 'mock_signature_bypass',
              planId: normalizedPlanId,
              billingCycle: selectedCycle
            });

            setProcessingStage('Payment success! Provisioning premium workspace limits...');
            setTimeout(() => {
              setIsProcessing(false);
              sessionStorage.removeItem('onboarding_in_progress');
              window.location.href = '/admin';
            }, 1500);
          } catch (verifyErr) {
            console.error('Sandbox verification failed. Activating Free tier instead.');
            setIsProcessing(false);
            setShowDecisionModal(true);
          }
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    sessionStorage.setItem('onboarding_in_progress', 'true');

    // Validation
    if (!hospitalName.trim()) {
      setErrorMsg('Hospital name is required');
      return;
    }
    if (!phone.full || phone.nationalNumber.length < 5) {
      setErrorMsg('A valid phone number is required');
      return;
    }

    try {
      setIsPending(true);
      setIsProcessing(true);
      setProcessingStage('Registering hospital node...');

      const payload = {
        hospitalName,
        phone,
        address: showAddress ? address : undefined,
        registrationNumber: showCompliance && registrationNumber.trim() ? registrationNumber.trim() : undefined,
        licenseNumber: showCompliance && licenseNumber.trim() ? licenseNumber.trim() : undefined,
        gstNumber: showCompliance && gstNumber.trim() ? gstNumber.trim() : undefined,
      };

      // 1. Submit Onboarding data (creates Hospital & FREE subscription initially)
      const res = await api.post('/api/auth/onboard', payload);
      const userResult = res.data.data;
      const token = userResult.token;

      // Update Redux state and cookies with refreshed token containing hospitalId
      dispatch(
        setCredentials({
          user: userResult,
          accessToken: token,
          refreshToken: token,
        })
      );

      // 2. If it is FREE plan, go straight to dashboard
      if (!isPaidPlan) {
        setProcessingStage('Provisioning Free workspace...');
        setTimeout(() => {
          setIsProcessing(false);
          sessionStorage.removeItem('onboarding_in_progress');
          window.location.href = '/admin';
        }, 1000);
        return;
      }

      // 3. Paid plan chosen: initialize subscription checkout immediately!
      setProcessingStage('Launching payment portal...');
      
      const checkoutRes = await subscriptionApi.createCheckout(
        normalizedPlanId,
        selectedCycle
      );

      if (!checkoutRes.success || !checkoutRes.data) {
        // If checkout initialization fails, fallback to FREE plan and redirect to admin
        console.error('Paid checkout initialization failed. Falling back to FREE plan.');
        setProcessingStage('Payment portal load failed. Falling back to Free...');
        setTimeout(() => {
          setIsProcessing(false);
          window.location.href = '/admin';
        }, 1500);
        return;
      }

      const { subscriptionId, keyId, isMock } = checkoutRes.data as any;
      setTempCheckoutDetails({ subscriptionId, keyId, isMock, userResult });

      if (isMock) {
        setIsProcessing(false);
        handleMockPaymentFlow(subscriptionId);
        return;
      }

      setIsProcessing(false);
      triggerRazorpayCheckout(keyId, subscriptionId, userResult, phone.full);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Onboarding failed');
      setIsPending(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-800">
      
      {/* LEFT COLUMN: Premium Spacious Form */}
      <div className="flex-1 flex flex-col justify-between p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto space-y-10">
          
          {/* Header Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">TokenHospital</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              v2.0 Workspace Setup
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-[11px] font-black text-primary uppercase tracking-widest">
              🏥 Client Registration
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Setup Your Workspace
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Register your hospital credentials and select a subscription model to initiate your queue systems, kiosk setups, and doctor profiles.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Core details card */}
            <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                Primary Clinic Details
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Hospital Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. City General Hospital"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider font-semibold">Phone Contact *</label>
                  <PhoneNumberInput
                    value={phone.full}
                    onChange={(val) => setPhone(val)}
                    showLabel={false}
                  />
                </div>
              </div>
            </div>

            {/* Address Details (Optional Accordion Card) */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
              <button
                type="button"
                onClick={() => setShowAddress(!showAddress)}
                className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">Hospital Location (Optional)</h3>
                    <p className="text-[11px] text-slate-400">Add physical location address details</p>
                  </div>
                </div>
                {showAddress ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showAddress && (
                <div className="px-6 md:px-8 pb-6 pt-2 space-y-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 102 Blue Ring Road"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Zip Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 400001"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Country</label>
                    <input
                      type="text"
                      placeholder="Country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Records (Optional Accordion Card) */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
              <button
                type="button"
                onClick={() => setShowCompliance(!showCompliance)}
                className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">Compliance & Registrations (Optional)</h3>
                    <p className="text-[11px] text-slate-400">Add medical license and government registration records</p>
                  </div>
                </div>
                {showCompliance ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showCompliance && (
                <div className="px-6 md:px-8 pb-6 pt-2 space-y-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Registration Number</label>
                      <input
                        type="text"
                        placeholder="Gov Registration No."
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Medical License Number</label>
                      <input
                        type="text"
                        placeholder="Medical License No."
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">GST Number</label>
                    <input
                      type="text"
                      placeholder="GSTIN"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Plan Selector Card */}
            {!searchParams.get('planId') && plans.length > 0 && (
              <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                  Choose Subscription Plan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    const PlanIcon = getPlanIcon(p.planId);
                    const active = normalizedPlanId === p.planId?.toUpperCase();
                    return (
                      <button
                        type="button"
                        key={p.planId}
                        onClick={() => setSelectedPlanId(p.planId)}
                        className={cn(
                          'p-5 border rounded-2xl text-left transition-all relative overflow-hidden bg-slate-50/30 flex flex-col justify-between min-h-[140px]',
                          active 
                            ? 'border-primary bg-primary/[0.02] shadow-lg shadow-primary/5 ring-1 ring-primary' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        {active && (
                          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 flex items-center justify-center rounded-bl-xl">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}
                        <PlanIcon className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800 mt-4">{p.name}</h4>
                          <p className="text-[10px] text-slate-400 leading-normal mt-1 line-clamp-2">{p.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="h-14 w-full rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/95 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                    {errorMsg && (
                      errorMsg.includes('payment') ||
                      errorMsg.includes('portal') ||
                      errorMsg.includes('simulated') ||
                      errorMsg.includes('Verifying') ||
                      errorMsg.includes('success') ||
                      errorMsg.includes('cancelled')
                    ) ? errorMsg : 'Provisioning Node...'}
                  </>
                ) : (
                  <>
                    {isPaidPlan ? 'Submit & Proceed to Checkout' : 'Activate Free Account'}
                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer branding copyright */}
        <div className="max-w-2xl w-full mx-auto text-center mt-12 text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} TokenHospital Systems. All rights reserved. E2EE encrypted data channel.
        </div>
      </div>

      {/* RIGHT COLUMN: Majestic Dark Interactive Dashboard Preview */}
      <div className="lg:w-[42%] bg-slate-900 text-slate-200 p-8 md:p-12 lg:p-16 flex flex-col justify-between border-l border-slate-800 relative min-h-[450px] lg:min-h-screen overflow-hidden shadow-2xl">
        
        {/* Glow Radial Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Dynamic Upper Header */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-primary tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Real-time Node Compiler
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Node Monitor</h2>
          <p className="text-xs text-slate-400 leading-normal max-w-sm">
            Watch your hospital database constraints compile in real-time as you select subscriptions and fill in clinic fields.
          </p>
        </div>

        {/* Visual Live Hospital Node Card */}
        <div className="relative z-10 my-8">
          {plansLoading ? (
            <div className="h-72 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">Synthesizing Preview...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* IMMERSIVE LIVE CARD */}
              <div className="rounded-[2.2rem] bg-slate-950 border border-slate-800 p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[30px] pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div>
                    {/* Pulsing indicator */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Preview Node
                    </div>
                    
                    {/* Live clinic title */}
                    <h3 className="text-2xl font-black text-white leading-none tracking-tight">
                      {hospitalName.trim() ? hospitalName.trim() : 'Your Clinic Node'}
                    </h3>
                    
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      {phone.full ? `Contact: ${phone.full}` : 'No phone linked yet'}
                    </p>
                  </div>
                  
                  {isPaidPlan ? (
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Crown className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Activity className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Sub pricing tag */}
                <div className="mt-8">
                  <div className="flex items-end gap-1.5">
                    <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
                      ₹{Math.round(monthlyEquivalent).toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs pb-1 font-medium">/month ({selectedCycle.toLowerCase()})</span>
                  </div>
                  {isPaidPlan && cyclePrice > 0 && (
                    <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                      Billed as ₹{Math.round(cyclePrice).toLocaleString()} for {
                        selectedCycle === 'YEARLY' ? '12 months' :
                        selectedCycle === 'HALF_YEARLY' ? '6 months' :
                        selectedCycle === 'QUARTERLY' ? '3 months' : '1 month'
                      }
                    </p>
                  )}
                  {selectedCycle !== 'MONTHLY' && isPaidPlan && (
                    <p className="text-[10px] text-emerald-400 font-bold mt-1.5 uppercase tracking-wider">
                      Save with {selectedCycle.replace('_', ' ')} billing
                    </p>
                  )}
                </div>

                {/* Features limits progress bars */}
                <div className="mt-8 border-t border-slate-900 pt-6 space-y-4">
                  
                  {/* Doctor limit bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Doctor Terminals</span>
                      <span className="text-white font-extrabold">{targetPlan?.limits?.maxDoctors ?? 0} active</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((targetPlan?.limits?.maxDoctors ?? 1) / 20) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Department limit bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Departments</span>
                      <span className="text-white font-extrabold">{targetPlan?.limits?.maxDepartments ?? 0} active</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((targetPlan?.limits?.maxDepartments ?? 1) / 10) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Kiosk limit bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Digital Kiosks</span>
                      <span className="text-white font-extrabold">{targetPlan?.limits?.maxKiosks ?? 0} active</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((targetPlan?.limits?.maxKiosks ?? 1) / 8) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* SMS Credits limit bar */}
                  {(targetPlan?.limits?.freeSmsUnits ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">Free SMS Credits</span>
                        <span className="text-white font-extrabold">{targetPlan?.limits?.freeSmsUnits ?? 0} / month</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500 w-full" />
                      </div>
                    </div>
                  )}

                  {/* Email Credits limit bar */}
                  {(targetPlan?.limits?.freeEmailUnits ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">Free Email Credits</span>
                        <span className="text-white font-extrabold">{targetPlan?.limits?.freeEmailUnits ?? 0} / month</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full transition-all duration-500 w-full" />
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Dynamic list of features */}
              {targetPlan?.features && targetPlan.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2 pt-2">
                  {targetPlan.features.slice(0, 4).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-400">
                      <div className="size-4.5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="font-semibold line-clamp-1">{feat.text}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Dynamic Billing cycle segments - only if paid plan */}
        <div className="relative z-10 space-y-5 mt-auto">
          {isPaidPlan && targetPlan?.prices && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Adjust Billing Term</label>
              <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                {['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'].map((cycle) => {
                  const cycleExists = targetPlan.prices.some(
                    (p) => p.billingCycle?.toUpperCase() === cycle
                  );
                  if (!cycleExists) return null;

                  return (
                    <button
                      type="button"
                      key={cycle}
                      onClick={() => setSelectedCycle(cycle as any)}
                      className={cn(
                        'rounded-xl p-2.5 text-[9px] font-black uppercase transition-all whitespace-nowrap',
                        selectedCycle === cycle
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {cycle.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Secure compliance banner */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
            <div className="size-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <Globe className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-200">End-to-End Cryptographic Tunnel</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-medium">
                Workspace configurations and compliance details are tunneled with strict token validation, ensuring medical data safety.
              </p>
            </div>
          </div>
        </div>

      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xl transition-all duration-300 animate-in fade-in">
          <div className="max-w-md w-full mx-4 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            {/* Glowing background highlights */}
            <div className="absolute -top-24 -left-24 size-48 bg-primary/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 size-48 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative flex items-center justify-center size-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
              <div className="size-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <Building2 className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                SaaS Node Provisioning
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight mt-2">
                Compiling Workspace
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Please stand by while we secure the database connection.
              </p>
            </div>

            {/* Dynamic Stage Indicator */}
            <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3 justify-center relative z-10">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-200 font-bold tracking-tight">
                {processingStage}
              </span>
            </div>
            
            <div className="text-[9px] text-slate-500 font-medium">
              E2EE Secure Tunnel • TokenHospital Setup Engine
            </div>
          </div>
        </div>
      )}

      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-lg animate-in fade-in transition-all duration-300">
          <div className="max-w-md w-full mx-4 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300 animate-in zoom-in-95">
            {/* Soft ambient light spots */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[30px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[30px] pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                  Payment Gateway Closed
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-xs mt-2">
                  Your premium workspace setup for the <strong className="text-slate-800">{targetPlan?.name} plan</strong> is pending checkout completion.
                </p>
              </div>
            </div>

            {/* Selected pricing box */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Selected Plan</span>
                <h4 className="font-extrabold text-sm text-slate-800 leading-tight">{targetPlan?.name}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Billing Cycle</span>
                <h4 className="font-extrabold text-sm text-primary leading-tight">{selectedCycle.replace('_', ' ')}</h4>
              </div>
            </div>

            {/* Actions Stepper */}
            <div className="space-y-2.5">
              {/* Option 1: Retry Payment */}
              <button
                type="button"
                onClick={handleRetryPayment}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/95 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/10"
              >
                <Lock className="w-4 h-4 text-primary-foreground" />
                Retry Secure Payment
              </button>

              {/* Option 2: Change Plan Selection */}
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="w-full h-12 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 text-slate-500" />
                Modify Plan Selection
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Or fallback</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Option 3: Skip & Activate Free */}
              <button
                type="button"
                onClick={() => {
                  setShowDecisionModal(false);
                  setIsProcessing(true);
                  setProcessingStage('Activating Free fallback tier...');
                  setTimeout(() => {
                    setIsProcessing(false);
                    window.location.href = '/admin';
                  }, 1200);
                }}
                className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-extrabold text-xs tracking-tight flex items-center justify-center gap-1.5 transition-colors"
              >
                Skip for Now & Start Free
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
