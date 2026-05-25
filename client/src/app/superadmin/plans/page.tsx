'use client';

import {
  Activity,
  ArrowUpRight,
  Check,
  Crown,
  Edit2,
  Infinity as InfinityIcon,
  Layers3,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import api from '@/services/api';

type BillingMode = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';

export default function PlanManagementPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingMode, setBillingMode] = useState<BillingMode>('MONTHLY');
  const [migrationPlan, setMigrationPlan] = useState<any | null>(null);
  const [migrationAmount, setMigrationAmount] = useState('');
  const [migrationDate, setMigrationDate] = useState('');
  const [schedulingMigration, setSchedulingMigration] = useState(false);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/subscription/plans');

      const sortedPlans = response.data.data.sort(
        (a: any, b: any) => a.displayOrder - b.displayOrder
      );

      setPlans(sortedPlans);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this plan? This action cannot be undone.'
      )
    )
      return;

    try {
      await api.delete(`/api/subscription/plans/${id}`);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const openMigrationDialog = (plan: any, currentPrice: number) => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    setMigrationPlan({ ...plan, currentPrice });
    setMigrationAmount(String(currentPrice));
    setMigrationDate(defaultDate.toISOString().split('T')[0]);
  };

  const handleScheduleMigration = async () => {
    if (!migrationPlan) return;

    const parsedAmount = Number(migrationAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      toast.error('Enter a valid new price');
      return;
    }
    if (!migrationDate) {
      toast.error('Choose an effective date');
      return;
    }

    try {
      setSchedulingMigration(true);
      const res = await api.post('/api/subscription/price-migrations', {
        planId: migrationPlan.planId,
        billingCycle: billingMode,
        newAmount: parsedAmount,
        effectiveDate: migrationDate,
        sendEmails: true,
      });
      toast.success(res.data?.message || 'Price-change notice scheduled');
      setMigrationPlan(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule price change');
    } finally {
      setSchedulingMigration(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: plans.length,
      active: plans.filter((p) => p.isActive).length,
      recommended: plans.find((p) => p.recommended)?.name || 'None',
    };
  }, [plans]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-6 space-y-8 animate-fade-in">
        {/* Skeleton Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-3">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>

        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-3xl bg-slate-200/50 dark:bg-slate-800/30 border border-slate-200/20 dark:border-slate-800/20 animate-pulse"
            />
          ))}
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[580px] rounded-[2.5rem] bg-white/70 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950/10 p-6 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative overflow-hidden p-6 rounded-[2rem] glass">
        {/* Soft floating glow behind header */}
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-xl animate-bounce-subtle">
              <Sparkles className="w-4 h-4" />
            </div>
            <Badge className="rounded-full px-3 py-0.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 font-semibold text-xs tracking-wide">
              Subscription Control Center
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Plan Management
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
            Configure pricing commercials, subscription tiers, resource limits, and premium SaaS platform features for onboarded hospitals.
          </p>
        </div>

        <Link href="/superadmin/plans/create" className="shrink-0 relative z-10">
          <Button className="h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold px-6 group">
            <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
            Create Plan
          </Button>
        </Link>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Plans */}
        <div className="rounded-[2rem] p-6 flex items-center justify-between glass hover:scale-[1.02] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <div className="space-y-1 relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Total Plans
            </p>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {stats.total}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Configured in platform database</p>
          </div>
          <div className="bg-primary/10 text-primary p-4 rounded-2xl relative z-10 group-hover:rotate-6 transition-transform">
            <Layers3 className="w-6 h-6" />
          </div>
        </div>

        {/* Active Tiers */}
        <div className="rounded-[2rem] p-6 flex items-center justify-between glass hover:scale-[1.02] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="space-y-1 relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Active Tiers
            </p>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {stats.active}
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Currently visible for hospital checkout</p>
          </div>
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl relative z-10 group-hover:rotate-6 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Recommended */}
        <div className="rounded-[2rem] p-6 flex items-center justify-between glass hover:scale-[1.02] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="space-y-1 relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Recommended Plan
            </p>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 truncate max-w-[180px]">
              {stats.recommended}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Highlighted as &apos;Most Popular&apos;</p>
          </div>
          <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-2xl relative z-10 group-hover:rotate-6 transition-transform">
            <Crown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BILLING TOGGLE CONTAINER */}
      <div className="flex items-center justify-center pt-2">
        <div className="glass rounded-[1.5rem] p-1.5 flex gap-1 shadow-sm relative z-10 flex-wrap justify-center max-w-full">
          {(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setBillingMode(mode)}
              className={cn(
                'px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 duration-300',
                billingMode === mode
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              )}
            >
              {mode === 'MONTHLY' ? 'Monthly' : mode === 'QUARTERLY' ? 'Quarterly' : mode === 'HALF_YEARLY' ? 'Half-Yearly' : 'Yearly'}
            </button>
          ))}
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pt-4">
        {plans.map((plan) => {
          // Resolve price for selected billing mode
          const priceObj = plan.prices?.find((p: any) => p.billingCycle === billingMode);
          let price = priceObj?.amount;
          if (!price) {
            if (billingMode === 'MONTHLY') price = plan.price;
            else if (billingMode === 'QUARTERLY') price = plan.quarterlyPrice || Math.round(plan.price * 3);
            else if (billingMode === 'HALF_YEARLY') price = plan.halfYearlyPrice || Math.round(plan.price * 6);
            else price = plan.yearlyPrice || Math.round(plan.price * 12);
          }

          const intervalMonths = billingMode === 'MONTHLY' ? 1 : billingMode === 'QUARTERLY' ? 3 : billingMode === 'HALF_YEARLY' ? 6 : 12;
          const monthlyEquiv = Math.round(price / intervalMonths);

          return (
            <Card
              key={plan._id}
              className={cn(
                'relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between group h-full',
                plan.recommended
                  ? 'glass-primary border-primary/40 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2'
                  : 'glass border-slate-200/60 dark:border-slate-800/60 hover:shadow-xl hover:shadow-slate-200/10 hover:-translate-y-2'
              )}
            >
              {/* RECOMMENDED BADGE */}
              {plan.recommended && (
                <div className="absolute top-5 right-5 z-15">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary font-bold rounded-full px-3.5 py-1 text-[10px] tracking-widest uppercase shadow-md shadow-primary/20 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary-foreground animate-spin-slow" />
                    Popular
                  </Badge>
                </div>
              )}

              {/* CARD GRADIENT HEADER ACCENT */}
              <div
                className={cn(
                  'absolute inset-x-0 top-0 h-32 opacity-25 pointer-events-none transition-opacity group-hover:opacity-35',
                  plan.recommended
                    ? 'bg-gradient-to-br from-primary/30 via-secondary/15 to-transparent'
                    : 'bg-gradient-to-br from-slate-400/20 to-transparent'
                )}
              />

              {/* CARD CONTENT HEADER */}
              <CardHeader className="relative pb-0 pt-7 px-7 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    className={cn(
                      'rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase border',
                      plan.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    )}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Link href={`/superadmin/plans/create?id=${plan._id}`}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-xl hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-colors"
                      onClick={() => handleDelete(plan._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-widest bg-primary/5 dark:bg-primary/10 px-2.5 py-0.5 rounded-md">
                      {plan.planId}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 h-10">
                    {plan.description || 'No description provided.'}
                  </CardDescription>
                </div>

                {/* PRICING */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1 relative w-fit">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      ₹{monthlyEquiv.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      /month
                    </span>
                  </div>

                  <div className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {billingMode === 'MONTHLY' ? 'Billed monthly' : billingMode === 'QUARTERLY' ? `Billed quarterly (₹${price.toLocaleString()})` : billingMode === 'HALF_YEARLY' ? `Billed semi-annually (₹${price.toLocaleString()})` : `Billed annually (₹${price.toLocaleString()})`}
                  </div>

                  {billingMode !== 'MONTHLY' && plan.price > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-500/10 animate-pulse">
                      <Zap className="w-3 h-3 fill-emerald-500" />
                      Save up to {billingMode === 'QUARTERLY' ? '10%' : billingMode === 'HALF_YEARLY' ? '15%' : '20%'}
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* CARD BODY CONTENT */}
              <CardContent className="pt-6 px-7 pb-7 flex flex-col flex-1 justify-between space-y-6">
                <Separator className="bg-slate-200/50 dark:bg-slate-800/50" />

                {/* RESOURCES GRID */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Hospital Limits
                  </p>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Departments */}
                    <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 text-center flex flex-col justify-center h-16 transition-all hover:bg-primary/5 hover:border-primary/20">
                      <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-0.5">
                        {plan.limits?.maxDepartments >= 99999 ? (
                          <InfinityIcon className="w-4 h-4 text-primary" />
                        ) : (
                          plan.limits?.maxDepartments ?? 1
                        )}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold mt-0.5">
                        Depts
                      </span>
                    </div>

                    {/* Doctors */}
                    <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 text-center flex flex-col justify-center h-16 transition-all hover:bg-primary/5 hover:border-primary/20">
                      <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-0.5">
                        {plan.limits?.maxDoctors >= 99999 ? (
                          <InfinityIcon className="w-4 h-4 text-primary" />
                        ) : (
                          plan.limits?.maxDoctors ?? 2
                        )}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold mt-0.5">
                        Doctors
                      </span>
                    </div>

                    {/* Kiosks */}
                    <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 text-center flex flex-col justify-center h-16 transition-all hover:bg-primary/5 hover:border-primary/20">
                      <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-0.5">
                        {plan.limits?.maxKiosks === -1 ? (
                          <InfinityIcon className="w-4 h-4 text-primary" />
                        ) : (
                          plan.limits?.maxKiosks ?? 0
                        )}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold mt-0.5">
                        Kiosks
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200/50 dark:bg-slate-800/50" />

                {/* INCLUDED FEATURES LIST */}
                <div className="flex-1 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Platform Features
                  </p>

                  <ul className="space-y-3">
                    {plan.features?.map((feature: any, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs font-semibold"
                      >
                        <div className="shrink-0 mt-0.5">
                          {feature.available ? (
                            <div className="bg-emerald-500/10 text-emerald-500 p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="bg-slate-200/60 dark:bg-slate-800 text-slate-400 p-0.5 rounded-full">
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <span
                          className={cn(
                            'leading-relaxed text-slate-600 dark:text-slate-300 font-medium',
                            !feature.available && 'text-slate-400 line-through opacity-60'
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FOOTER ACTION BUTTON */}
                <div className="space-y-2 pt-2">
                  <Link href={`/superadmin/plans/create?id=${plan._id}`}>
                    <Button
                      className={cn(
                        'w-full h-12 rounded-2xl text-xs font-bold shadow-sm transition-all group-hover:shadow-md flex items-center justify-center gap-1.5',
                        plan.recommended
                          ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300'
                      )}
                      variant={plan.recommended ? 'default' : 'outline'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Configure Tier
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Button
                    onClick={() => openMigrationDialog(plan, price)}
                    variant="outline"
                    className="w-full h-10 rounded-2xl text-xs font-bold border-amber-300/40 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/40"
                  >
                    Schedule Price Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {!plans.length && (
        <div className="rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center bg-white/50 dark:bg-slate-900/30 glass relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30 pointer-events-none" />

          <div className="max-w-md mx-auto space-y-5 relative z-10">
            <div className="mx-auto w-fit bg-primary/10 text-primary p-5 rounded-3xl animate-bounce-subtle">
              <Layers3 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              No Subscription Plans Found
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              Create premium subscription plans to begin onboarding hospitals, setting custom rate limits, and defining credit commercials.
            </p>

            <Link href="/superadmin/plans/create" className="inline-block">
              <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/25">
                <Plus className="w-5 h-5 mr-2" />
                Publish First Plan
              </Button>
            </Link>
          </div>
        </div>
      )}

      {migrationPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                Price migration notice
              </p>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                {migrationPlan.name} - {billingMode.replace('_', ' ')}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Existing subscribers will receive a notice and see the upcoming change in Billing.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Current price
                </label>
                <div className="mt-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  ₹{Number(migrationPlan.currentPrice || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  New price
                </label>
                <input
                  type="number"
                  min={0}
                  value={migrationAmount}
                  onChange={(event) => setMigrationAmount(event.target.value)}
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Effective date
                </label>
                <input
                  type="date"
                  value={migrationDate}
                  onChange={(event) => setMigrationDate(event.target.value)}
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setMigrationPlan(null)}
                className="h-11 flex-1 rounded-2xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleMigration}
                disabled={schedulingMigration}
                className="h-11 flex-1 rounded-2xl font-black"
              >
                {schedulingMigration ? 'Scheduling...' : 'Send Notice'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
