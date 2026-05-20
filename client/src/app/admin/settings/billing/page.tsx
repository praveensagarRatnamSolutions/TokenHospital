'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionApi, Plan } from '@/services/subscriptionApi';
import { walletApi } from '@/services/walletApi';
import { Check, X, Shield, Zap, Crown, Clock, Loader, MessageSquare, Mail, Calendar, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PLAN_ICONS: Record<string, any> = {
  BASIC: Shield,
  PRO: Zap,
  ENTERPRISE: Crown,
};

// Dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BillingPage() {
  const { status, loading, refresh } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'half_yearly' | 'yearly'>('monthly');
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  // --- WALLET & HISTORY LEDGER STATES ---
  const [balances, setBalances] = useState<{ smsCredits: number; emailCredits: number } | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);

  // Active shops: 'plans' (SaaS Tiers), 'messaging' (SMS/Email Topups)
  const [activeShopTab, setActiveShopTab] = useState<'plans' | 'messaging'>('plans');

  // Active ledger logs: 'invoices' (Payment history), 'ledger' (Usage logs)
  const [activeLedgerTab, setActiveLedgerTab] = useState<'invoices' | 'ledger'>('invoices');

  const fetchWalletAndHistoryData = async () => {
    try {
      setLoadingWallet(true);
      const [balRes, pkgRes, ledgerRes, historyRes] = await Promise.all([
        walletApi.getBalances().catch(() => null),
        walletApi.getPackages().catch(() => []),
        walletApi.getLedger().catch(() => []),
        subscriptionApi.getHistory().catch(() => [])
      ]);
      setBalances(balRes || { smsCredits: 0, emailCredits: 0 });
      setPackages(Array.isArray(pkgRes) ? pkgRes : []);
      setLedger(Array.isArray(ledgerRes) ? ledgerRes : []);
      setBillingHistory(Array.isArray(historyRes) ? historyRes : []);
    } catch (error) {
      console.error('Failed to load wallet & invoice history data:', error);
      setPackages([]);
      setLedger([]);
      setBillingHistory([]);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionApi.getPublicPlans();
        setPlans(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load pricing plans');
        setPlans([]);
      }
    };
    fetchPlans();
    fetchWalletAndHistoryData();
  }, []);

  const handleChangePlan = async (planId: string) => {
    try {
      setChangingPlan(planId);
      const cycleUpper = billingCycle.toUpperCase() as 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
      
      const checkoutRes = await subscriptionApi.createCheckout(planId, cycleUpper);
      if (!checkoutRes.success) {
        throw new Error('Failed to create checkout session');
      }

      const checkoutData = checkoutRes.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay Payment Gateway SDK.');
        return;
      }

      const options = {
        key: checkoutData.keyId,
        subscription_id: checkoutData.subscriptionId,
        name: "Hospital Queue Token",
        description: `Subscription to ${planId} Plan (${billingCycle.toUpperCase()})`,
        image: "/logo.png",
        handler: async function (response: any) {
          try {
            toast.loading("Verifying transaction...");
            await subscriptionApi.verifyCheckout({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              billingCycle: cycleUpper,
            });
            toast.success("Subscription activated successfully!");
            refresh();
            fetchWalletAndHistoryData();
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Cryptographic verification failed.");
          } finally {
            toast.dismiss();
          }
        },
        prefill: {
          name: status?.planName || "",
        },
        theme: {
          color: "#2563EB",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to initiate plan upgrade');
    } finally {
      setChangingPlan(null);
    }
  };

  const handleBuyPackage = async (packageId: string) => {
    try {
      setPurchasingPackage(packageId);

      const orderRes = await walletApi.buyPackage(packageId);
      if (!orderRes.success) {
        throw new Error('Failed to create credit checkout session');
      }

      const orderData = orderRes.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay Payment Gateway SDK.');
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // paise
        currency: 'INR',
        name: "Hospital Queue Token",
        description: `Add-on Credits: ${orderData.name}`,
        order_id: orderData.orderId,
        image: "/logo.png",
        handler: async function (response: any) {
          try {
            toast.loading("Verifying credit purchase...");
            await walletApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId,
            });
            toast.success("Credits added successfully!");
            fetchWalletAndHistoryData();
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Cryptographic verification failed.");
          } finally {
            toast.dismiss();
          }
        },
        prefill: {
          name: status?.planName || "",
        },
        theme: {
          color: "#10B981",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to initiate credits purchase');
    } finally {
      setPurchasingPackage(null);
    }
  };

  if (loading || !status) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isTrial = status.status === 'TRIAL';
  const yearlySavings = Math.round(((1499 * 12 - 14399) / (1499 * 12)) * 100);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Subscription & Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your hospital plan, purchase messaging alert credits, and view payment statements.
        </p>
      </div>

      {/* 1. Active Subscription Details Banner card */}
      <Card className="border-0 shadow-lg relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial-glow from-blue-500/10 to-transparent blur-3xl opacity-60 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/20 text-xs px-3 py-1 font-bold rounded-full uppercase tracking-wider">
              {status.status}
            </Badge>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">{status.planName}</h2>
              <p className="text-slate-350 text-sm mt-1">{status.planDescription}</p>
            </div>
            {isTrial ? (
              <div className="flex items-center gap-2 text-xs text-indigo-200">
                <Clock className="w-4 h-4 text-indigo-300" />
                <span>Trial ends on <strong>{new Date(status.trialEndDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</strong> ({status.trialDaysLeft} days remaining)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <Calendar className="w-4 h-4 text-blue-300" />
                <span>Plan active. Billed cycle keeps digital queues and smart broadcast alerts fully functional.</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-end items-start md:items-end gap-3 text-right">
            {isTrial ? (
              <Button
                onClick={() => {
                  setActiveShopTab('plans');
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                className="bg-white text-indigo-950 hover:bg-indigo-50 font-black rounded-xl h-11 px-6 shadow-md transition-all shrink-0"
              >
                Upgrade to PRO Tiers ⚡
              </Button>
            ) : (
              <Badge className="bg-green-500/20 text-green-300 border border-green-400/30 px-4 py-1.5 text-sm font-bold shrink-0">
                ✓ Premium Active
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Unified Resource & Wallet Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950/20 md:col-span-1">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Doctors</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black">
              {status.limits.currentDoctors}
              <span className="text-xs text-muted-foreground font-normal"> / {status.limits.maxDoctors >= 99999 ? '∞' : status.limits.maxDoctors}</span>
            </div>
            <Progress
              value={status.limits.maxDoctors >= 99999 ? 5 : (status.limits.currentDoctors / status.limits.maxDoctors) * 100}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950/20 md:col-span-1">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black">
              {status.limits.currentDepartments}
              <span className="text-xs text-muted-foreground font-normal"> / {status.limits.maxDepartments >= 99999 ? '∞' : status.limits.maxDepartments}</span>
            </div>
            <Progress
              value={status.limits.maxDepartments >= 99999 ? 5 : (status.limits.currentDepartments / status.limits.maxDepartments) * 100}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950/20 md:col-span-1">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Kiosks</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black">
              {status.limits.currentKiosks}
              <span className="text-xs text-muted-foreground font-normal"> / {status.limits.maxKiosks === -1 ? '∞' : status.limits.maxKiosks === 0 ? 'Locked' : status.limits.maxKiosks}</span>
            </div>
            {status.limits.maxKiosks !== 0 ? (
              <Progress
                value={status.limits.maxKiosks === -1 ? 5 : (status.limits.currentKiosks / status.limits.maxKiosks) * 100}
                className="mt-2 h-1.5"
              />
            ) : (
              <p className="text-[10px] text-amber-500 font-bold mt-2">Locked in current tier</p>
            )}
          </CardContent>
        </Card>

        {/* SMS Credits Wallet Meter */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 md:col-span-1">
          <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-emerald-600 dark:text-emerald-400">SMS Credits</CardTitle>
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-350">
              {loadingWallet ? (
                <Loader className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                balances?.smsCredits.toLocaleString() ?? '0'
              )}
            </div>
            <button
              onClick={() => {
                setActiveShopTab('messaging');
                window.scrollTo({ top: 320, behavior: 'smooth' });
              }}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black hover:underline mt-2 flex items-center gap-1"
            >
              + Purchase Add-on
            </button>
          </CardContent>
        </Card>

        {/* Email Credits Wallet Meter */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-sky-500/5 to-indigo-500/5 border border-sky-500/20 md:col-span-1">
          <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-sky-600 dark:text-sky-400">Email Credits</CardTitle>
            <Mail className="w-3.5 h-3.5 text-sky-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black text-sky-700 dark:text-sky-350">
              {loadingWallet ? (
                <Loader className="w-4 h-4 animate-spin text-sky-600" />
              ) : (
                balances?.emailCredits.toLocaleString() ?? '0'
              )}
            </div>
            <button
              onClick={() => {
                setActiveShopTab('messaging');
                window.scrollTo({ top: 320, behavior: 'smooth' });
              }}
              className="text-[10px] text-sky-600 dark:text-sky-400 font-black hover:underline mt-2 flex items-center gap-1"
            >
              + Purchase Add-on
            </button>
          </CardContent>
        </Card>
      </div>

      {/* 3. Shop Selector Tab panel */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveShopTab('plans')}
              className={`text-xl font-bold pb-2 transition-all border-b-2 ${
                activeShopTab === 'plans'
                  ? 'border-blue-650 text-blue-650 dark:text-blue-400 border-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Plan Tiers & Subscriptions ⚡
            </button>
            <button
              onClick={() => setActiveShopTab('messaging')}
              className={`text-xl font-bold pb-2 transition-all border-b-2 ${
                activeShopTab === 'messaging'
                  ? 'border-emerald-650 text-emerald-650 dark:text-emerald-400 border-emerald-600'
                  : 'border-transparent text-muted-foreground hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              SMS & Email Add-on Credits ✉️
            </button>
          </div>
        </div>

        {/* Tab A: Subscriptions Shop */}
        {activeShopTab === 'plans' && (
          <div className="space-y-8 animate-fade-in">
            {/* Dynamic Billing Cycle Selector Tabs */}
            <div className="flex items-center justify-center gap-2">
              <div className="inline-flex flex-wrap justify-center items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 gap-1">
                {(['monthly', 'quarterly', 'half_yearly', 'yearly'] as const).map((cycle) => {
                  const title = cycle === 'monthly' ? 'Monthly' : (cycle === 'quarterly' ? '3 Months' : (cycle === 'half_yearly' ? '6 Months' : '1 Year'));
                  return (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                        billingCycle === cycle
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                      }`}
                    >
                      {title}
                      {cycle === 'yearly' && (
                        <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          SAVE {yearlySavings}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.isArray(plans) && plans.map((plan) => {
                const isCurrent = status.planId === plan.planId;
                const PlanIcon = PLAN_ICONS[plan.planId] || Shield;
                const cycleUpper = billingCycle.toUpperCase() as 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
                const priceOption = plan.prices?.find((p) => p.billingCycle === cycleUpper);

                const amount = priceOption ? priceOption.amount : (billingCycle === 'yearly' ? plan.yearlyPrice : plan.price);
                const intervalMonths = priceOption ? priceOption.intervalMonths : (billingCycle === 'yearly' ? 12 : 1);
                const monthlyEquiv = Math.round(amount / intervalMonths);

                return (
                  <Card
                    key={plan._id}
                    className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
                      plan.recommended
                        ? 'border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20 scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 hover:shadow-lg'
                    } ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}
                  >
                    {plan.recommended && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center text-[11px] font-bold tracking-widest uppercase py-1.5">
                        RECOMMENDED
                      </div>
                    )}
                    {isCurrent && !plan.recommended && (
                      <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-center text-[11px] font-bold tracking-widest uppercase py-1.5">
                        CURRENT PLAN
                      </div>
                    )}

                    <CardHeader className={`${plan.recommended || isCurrent ? 'pt-10' : 'pt-6'}`}>
                      <div className={`p-2.5 w-fit rounded-xl mb-3 ${
                        plan.recommended ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <PlanIcon className={`w-6 h-6 ${plan.recommended ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`} />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-5 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold">₹{monthlyEquiv.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Billed as ₹{amount.toLocaleString()} for {intervalMonths} {intervalMonths === 1 ? 'month' : 'months'}
                      </p>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm">
                            {feature.available ? (
                              <Check className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                            )}
                            <span className={feature.available ? '' : 'text-muted-foreground line-through'}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button
                        className={`w-full h-12 rounded-xl font-bold transition-all ${
                          isCurrent
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                            : plan.recommended
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md'
                              : ''
                        }`}
                        variant={isCurrent ? 'outline' : (plan.recommended ? 'default' : 'secondary')}
                        disabled={isCurrent || changingPlan !== null}
                        onClick={() => handleChangePlan(plan.planId)}
                      >
                        {changingPlan === plan.planId ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : isCurrent ? (
                          '✓ Current Plan'
                        ) : isTrial ? (
                          'Upgrade Now'
                        ) : (
                          'Switch Plan'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab B: Add-on Messaging shop */}
        {activeShopTab === 'messaging' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-350">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong>Unlimited Lifetime Balances</strong>: Add-on credits purchased are logged instantly to your hospital messaging wallet, never expire, and are only consumed when patient tokens are dispatched.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.isArray(packages) && packages.map((pkg) => {
                const isSms = pkg.service === 'SMS';
                return (
                  <Card key={pkg._id} className={`flex flex-col relative overflow-hidden transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:shadow-lg ${
                    isSms ? 'hover:border-emerald-500/50' : 'hover:border-sky-500/50'
                  }`}>
                    <CardHeader>
                      <div className={`p-2.5 w-fit rounded-xl mb-3 flex items-center justify-center ${
                        isSms ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600' : 'bg-sky-100 dark:bg-sky-950/30 text-sky-600'
                      }`}>
                        {isSms ? <MessageSquare className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                      </div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description || `Add-on top-up bundle`}</CardDescription>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold">₹{pkg.price}</span>
                        <span className="text-muted-foreground text-xs">one-time</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Credit Units:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{pkg.credits.toLocaleString()} {pkg.service}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rate breakdown:</span>
                          <span className="font-medium text-xs text-slate-700 dark:text-slate-350">₹{(pkg.price / pkg.credits).toFixed(2)} / unit</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expiration:</span>
                          <span className="text-green-600 font-semibold">Never</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button
                        onClick={() => handleBuyPackage(pkg._id)}
                        disabled={purchasingPackage !== null}
                        className={`w-full h-10 rounded-xl font-bold transition-all ${
                          isSms 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' 
                            : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                        }`}
                      >
                        {purchasingPackage === pkg._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          `Buy ${pkg.credits.toLocaleString()} Credits ⚡`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
              {(!Array.isArray(packages) || packages.length === 0) && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No messaging credits bundles are currently configured by the SuperAdmin.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Billing history statement & Messaging logs ledger */}
      <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Billing History & Logs</h2>
            <p className="text-muted-foreground text-sm mt-1">Audit previous plan payments, package invoices, and live credit usage ledger items.</p>
          </div>
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveLedgerTab('invoices')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLedgerTab === 'invoices'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              Payments & Invoices
            </button>
            <button
              onClick={() => setActiveLedgerTab('ledger')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLedgerTab === 'ledger'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              Messaging Wallet Log
            </button>
          </div>
        </div>

        {/* Tab 1: Payment history Invoices */}
        {activeLedgerTab === 'invoices' && (
          <Card className="border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-150 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.isArray(billingHistory) && billingHistory.map((invoice) => {
                    const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const isWallet = invoice.type === 'WALLET_TOPUP';
                    return (
                      <tr key={invoice._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400 max-w-[140px] truncate">{invoice.razorpayPaymentId || invoice._id}</td>
                        <td className="px-6 py-4 font-medium text-slate-955 dark:text-white">{dateStr}</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{invoice.description}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={isWallet ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/5' : 'border-blue-500/30 text-blue-600 bg-blue-500/5 hover:bg-blue-500/5'}>
                            {isWallet ? 'Credit Bundle' : 'Subscription'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-950 dark:text-white font-extrabold">₹{invoice.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge className={
                            invoice.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100'
                              : invoice.status === 'FAILED'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-350 hover:bg-yellow-100'
                          }>
                            {invoice.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {(!Array.isArray(billingHistory) || billingHistory.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No subscription or wallet payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 2: Messaging usage ledger logs */}
        {activeLedgerTab === 'ledger' && (
          <Card className="border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-150 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.isArray(ledger) && ledger.map((log) => {
                    const dateStr = new Date(log.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const isCredit = log.type === 'CREDIT';
                    return (
                      <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{dateStr}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={log.service === 'SMS' ? 'border-emerald-500/30 text-emerald-600 hover:bg-transparent' : 'border-sky-500/30 text-sky-600 hover:bg-transparent'}>
                            {log.service}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isCredit ? 'text-green-600' : 'text-slate-500'}`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-black text-sm ${isCredit ? 'text-green-600' : 'text-slate-700 dark:text-slate-350'}`}>
                            {isCredit ? '+' : '-'}{log.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{log.description}</td>
                        <td className="px-6 py-4 text-slate-955 dark:text-white font-extrabold">{log.balanceAfter.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {(!Array.isArray(ledger) || ledger.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No messaging wallet history logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Trial Extension Support Footer */}
      {isTrial && (
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-3xl flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Need more time to explore?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              If you require a specialized trial extension for your hospital tests, get in touch with our operations support. We are happy to help.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

