'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionApi, Plan } from '@/services/subscriptionApi';
import { Check, X, Shield, Zap, Crown, Clock, Loader } from 'lucide-react';
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

export default function BillingPage() {
  const { status, loading, refresh } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionApi.getPublicPlans();
        setPlans(data);
      } catch (error) {
        console.error('Failed to load plans');
      }
    };
    fetchPlans();
  }, []);

  const handleChangePlan = async (planId: string) => {
    try {
      setChangingPlan(planId);
      await subscriptionApi.changePlan(planId);
      toast.success('Plan updated successfully!');
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change plan');
    } finally {
      setChangingPlan(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Subscription & Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your hospital&apos;s plan and resource usage.
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant={status.isValid ? 'default' : 'destructive'} className="px-4 py-1.5 text-sm">
            {isTrial ? `TRIAL · ${status.trialDaysLeft} Days Left` : status.status}
          </Badge>
        </div>
      </div>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {status.limits.currentDoctors}
              <span className="text-lg text-muted-foreground font-normal">
                {' '}/ {status.limits.maxDoctors >= 99999 ? '∞' : status.limits.maxDoctors}
              </span>
            </div>
            <Progress
              value={status.limits.maxDoctors >= 99999 ? 5 : (status.limits.currentDoctors / status.limits.maxDoctors) * 100}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {status.limits.currentDepartments}
              <span className="text-lg text-muted-foreground font-normal">
                {' '}/ {status.limits.maxDepartments >= 99999 ? '∞' : status.limits.maxDepartments}
              </span>
            </div>
            <Progress
              value={status.limits.maxDepartments >= 99999 ? 5 : (status.limits.currentDepartments / status.limits.maxDepartments) * 100}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kiosks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {status.limits.currentKiosks}
              <span className="text-lg text-muted-foreground font-normal">
                {' '}/ {status.limits.maxKiosks === -1 ? '∞' : status.limits.maxKiosks === 0 ? 'Locked' : status.limits.maxKiosks}
              </span>
            </div>
            {status.limits.maxKiosks !== 0 && (
              <Progress
                value={status.limits.maxKiosks === -1 ? 5 : (status.limits.currentKiosks / status.limits.maxKiosks) * 100}
                className="mt-3 h-2"
              />
            )}
            {status.limits.maxKiosks === 0 && (
              <p className="text-xs text-muted-foreground mt-3">Upgrade your plan to access kiosks</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Yearly
            <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              SAVE {yearlySavings}%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = status.planId === plan.planId;
          const PlanIcon = PLAN_ICONS[plan.planId] || Shield;
          const displayPrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
          const monthlyEquiv = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.price;

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
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed as ₹{displayPrice.toLocaleString()}/year
                  </p>
                )}
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

      {/* Trial Extension CTA */}
      {isTrial && (
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-3xl flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Need more time to explore?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              If you need an extension on your trial, contact our support team. We&apos;re here to help you get the most out of our platform.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
