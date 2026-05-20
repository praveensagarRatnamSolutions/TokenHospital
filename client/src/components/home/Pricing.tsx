'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Shield, Zap, Crown, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { subscriptionApi, Plan } from '@/services/subscriptionApi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PLAN_ICONS: Record<string, any> = {
  BASIC: Shield,
  PRO: Zap,
  ENTERPRISE: Crown,
};

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'half_yearly' | 'yearly'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionApi.getPublicPlans();
        // Sort plans by displayOrder
        const sorted = data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setPlans(sorted);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Calculate savings dynamically based on the database PRO plan prices
  const savingsData = useMemo(() => {
    const proPlan = plans.find((p) => p.planId === 'PRO');
    if (!proPlan) return { savings: 20, trialDays: 30 };
    
    const monthlyAmt = proPlan.price || 1499;
    const yearlyAmt = proPlan.yearlyPrice || 14399;
    const savings = Math.round(((monthlyAmt * 12 - yearlyAmt) / (monthlyAmt * 12)) * 100);
    const trialDays = proPlan.trialDays || 30;

    return { savings: savings > 0 ? savings : 20, trialDays };
  }, [plans]);

  if (loading || plans.length === 0) return null;

  return (
    <section id="pricing" className="py-32 bg-slate-50/50 dark:bg-[#090d16] overflow-hidden relative">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[140px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px] -ml-64 -mb-64 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-bounce-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Flexible Plans that scale with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 dark:from-primary dark:to-indigo-400">
              your clinic.
            </span>
          </h3>
          
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Start a {savingsData.trialDays}-day free trial instantly. No credit card required. Experience premium patient queuing controls today.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[1.5rem] p-1.5 shadow-md border border-slate-200/50 dark:border-slate-800/80 flex-wrap justify-center max-w-full gap-1">
            {(['monthly', 'quarterly', 'half_yearly', 'yearly'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2',
                  billingCycle === cycle
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                )}
              >
                {cycle === 'monthly' ? 'Monthly' : cycle === 'quarterly' ? 'Quarterly' : cycle === 'half_yearly' ? 'Half-Yearly' : 'Yearly'}
                {cycle === 'yearly' && (
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                    -{savingsData.savings}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.filter(p => p.planId !== 'ENTERPRISE').map((plan) => {
            const PlanIcon = PLAN_ICONS[plan.planId] || Shield;
            const priceObj = plan.prices?.find((p: any) => p.billingCycle === billingCycle.toUpperCase());
            let price: number = priceObj?.amount ?? 0;
            if (price === 0) {
              if (billingCycle === 'monthly') price = plan.price || 0;
              else if (billingCycle === 'quarterly') price = plan.quarterlyPrice || Math.round((plan.price || 0) * 3 * 0.9);
              else if (billingCycle === 'half_yearly') price = plan.halfYearlyPrice || Math.round((plan.price || 0) * 6 * 0.85);
              else price = plan.yearlyPrice || Math.round((plan.price || 0) * 12 * 0.8);
            }

            const intervalMonths = billingCycle === 'monthly' ? 1 : billingCycle === 'quarterly' ? 3 : billingCycle === 'half_yearly' ? 6 : 12;
            const monthlyEquiv = Math.round(price / intervalMonths);

            return (
              <div
                key={plan._id}
                className={cn(
                  'relative flex flex-col items-stretch',
                  plan.recommended ? 'md:scale-[1.03] z-20' : 'z-10'
                )}
              >
                {/* Popular Badge Overlay */}
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-indigo-500 dark:from-primary dark:to-indigo-400 text-white px-6 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-lg shadow-primary/20 border border-white/5 z-30">
                    Most Popular
                  </div>
                )}

                <div
                  className={cn(
                    'relative rounded-[2.5rem] transition-all duration-500 flex flex-col justify-between overflow-hidden group flex-1',
                    plan.recommended
                      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 dark:from-[#0c1220] dark:via-[#090d16] dark:to-[#0f172a] text-white shadow-2xl shadow-primary/10 border border-primary/30'
                      : 'bg-white/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl'
                  )}
                >

                {/* Top Ambient Glow */}
                <div
                  className={cn(
                    'absolute inset-x-0 top-0 h-32 opacity-15 pointer-events-none transition-opacity group-hover:opacity-25',
                    plan.recommended
                      ? 'bg-gradient-to-br from-primary/30 to-transparent'
                      : 'bg-gradient-to-br from-slate-400/20 to-transparent'
                  )}
                />

                <div className="p-8 pt-10 flex flex-col flex-1 justify-between space-y-8 relative z-10">
                  
                  {/* Icon & Name */}
                  <div className="space-y-5">
                    <div className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner',
                      plan.recommended 
                        ? 'bg-primary text-white border border-white/10' 
                        : 'bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10'
                    )}>
                      <PlanIcon className="w-6.5 h-6.5" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className={cn(
                        'text-2xl font-black tracking-tight',
                        plan.recommended ? 'text-white' : 'text-slate-900 dark:text-white'
                      )}>
                        {plan.name}
                      </h4>
                      <p className={cn(
                        'text-xs leading-relaxed font-semibold h-10 line-clamp-2',
                        plan.recommended ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                      )}>
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1 relative w-fit">
                      <span className={cn(
                        'text-4xl font-extrabold tracking-tight',
                        plan.recommended ? 'text-white' : 'text-slate-900 dark:text-white'
                      )}>
                        ₹{monthlyEquiv.toLocaleString()}
                      </span>
                      <span className={cn(
                        'text-xs font-semibold uppercase tracking-wider',
                        plan.recommended ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                      )}>
                        /month
                      </span>
                    </div>

                    <p className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      plan.recommended ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                    )}>
                      {billingCycle === 'monthly' ? 'Billed monthly' : billingCycle === 'quarterly' ? `Billed quarterly (₹${price.toLocaleString()})` : billingCycle === 'half_yearly' ? `Billed semi-annually (₹${price.toLocaleString()})` : `Billed annually (₹${price.toLocaleString()})`}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className={cn(
                    'border-t',
                    plan.recommended ? 'border-white/10' : 'border-slate-200/50 dark:border-slate-800/50'
                  )} />

                  {/* Features List */}
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs font-semibold">
                        
                        <div className="shrink-0 mt-0.5">
                          {feature.available ? (
                            <div className={cn(
                              'p-0.5 rounded-full',
                              plan.recommended 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10'
                            )}>
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className={cn(
                              'p-0.5 rounded-full',
                              plan.recommended 
                                ? 'bg-white/5 text-white/30 border border-white/5' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            )}>
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <span className={cn(
                          'leading-relaxed font-medium',
                          feature.available
                            ? (plan.recommended ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300')
                            : (plan.recommended ? 'text-white/30 line-through' : 'text-slate-400 dark:text-slate-600 line-through opacity-60')
                        )}>
                          {feature.text}
                        </span>

                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <Link href={`/register?planId=${plan.planId}&cycle=${billingCycle}`} className="block">
                      <Button
                        className={cn(
                          'w-full h-13 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]',
                          plan.recommended
                            ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/25 border border-white/5'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-850 dark:text-slate-300 border border-transparent'
                        )}
                      >
                        Start {plan.trialDays || savingsData.trialDays} Days Free Trial
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

          {/* 👑 STATIC CUSTOM ENTERPRISE CARD (Method 1: Contact Sales) */}
          <div className="relative rounded-[2.5rem] bg-white/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between overflow-hidden group">
            {/* Top Ambient Glow */}
            <div className="absolute inset-x-0 top-0 h-32 opacity-15 pointer-events-none transition-opacity group-hover:opacity-25 bg-gradient-to-br from-amber-500/20 to-transparent" />

            <div className="p-8 pt-10 flex flex-col flex-1 justify-between space-y-8 relative z-10">
              {/* Icon & Name */}
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-amber-500/10 text-amber-550 border border-amber-500/20">
                  <Crown className="w-6.5 h-6.5 text-amber-500" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Enterprise
                  </h4>
                  <p className="text-xs leading-relaxed font-semibold h-10 line-clamp-2 text-slate-500 dark:text-slate-400">
                    Bespoke limits, advanced queues, custom integrations and offline SLAs.
                  </p>
                </div>
              </div>

              {/* Price Block */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-1 relative w-fit">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Custom Quote
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  For multi-branch or enterprise chains
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200/50 dark:border-slate-800/50" />

              {/* Features List */}
              <ul className="space-y-4 flex-1">
                {[
                  'Unlimited Departments',
                  'Unlimited Doctors & Staff',
                  'Custom Queue Layouts',
                  'Priority 24/7 Call Support',
                  'Custom Branding & White-label',
                  'Dedicated Account Manager'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-semibold">
                    <div className="shrink-0 mt-0.5">
                      <div className="p-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                    <span className="leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="pt-2">
                <a 
                  href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi TokenHospital Team! I want to discuss a Custom Enterprise Subscription Plan for our hospital.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className="w-full h-13 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border border-white/5"
                  >
                    Contact Sales
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Sub-Note */}
        <p className="text-center text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest pt-4">
          All subscriptions include a{' '}
          <span className="text-primary dark:text-primary font-extrabold">{savingsData.trialDays}-day free trial</span>
          {' '}with full limits. No credit card required. Cancel anytime.
        </p>

      </div>
    </section>
  );
}
