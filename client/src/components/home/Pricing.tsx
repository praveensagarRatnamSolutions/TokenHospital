'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Zap, Crown } from 'lucide-react';
import { subscriptionApi, Plan } from '@/services/subscriptionApi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PLAN_ICONS: Record<string, any> = {
  BASIC: Shield,
  PRO: Zap,
  ENTERPRISE: Crown,
};

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionApi.getPublicPlans();
        setPlans(data);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading || plans.length === 0) return null;

  const proMonthly = plans.find(p => p.planId === 'PRO')?.price || 1499;
  const proYearly = plans.find(p => p.planId === 'PRO')?.yearlyPrice || 14399;
  const yearlySavings = Math.round(((proMonthly * 12 - proYearly) / (proMonthly * 12)) * 100);

  return (
    <section id="pricing" className="py-28 bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden relative">
      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] -ml-64 -mb-64" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4">Transparent Pricing</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Plans that scale with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              your hospital.
            </span>
          </h3>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Start free for 25 days. No credit card required. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center mb-14">
          <div className="inline-flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-md border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-7 py-3 rounded-xl text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-7 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Yearly
              <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                -{yearlySavings}%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => {
            const PlanIcon = PLAN_ICONS[plan.planId] || Shield;
            const displayPrice = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.price;

            return (
              <div
                key={plan._id}
                className={`relative group rounded-[2rem] transition-all duration-500 ${
                  plan.recommended
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-2xl shadow-blue-600/15 scale-[1.03] z-20'
                    : 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-xl shadow-sm'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-blue-600/30">
                    Most Popular
                  </div>
                )}

                <div className="p-8 pt-10">
                  {/* Icon & Name */}
                  <div className="mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                      plan.recommended ? 'bg-blue-600' : 'bg-blue-50 dark:bg-blue-500/10'
                    }`}>
                      <PlanIcon className={`w-7 h-7 ${plan.recommended ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <h4 className="text-2xl font-extrabold mb-1">{plan.name}</h4>
                    <p className={`text-sm ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold tracking-tight">₹{displayPrice.toLocaleString()}</span>
                      <span className={`text-sm ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className={`text-xs mt-1 ${plan.recommended ? 'text-slate-500' : 'text-slate-400'}`}>
                        Billed as ₹{plan.yearlyPrice.toLocaleString()}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm">
                        {feature.available ? (
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.recommended ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'
                          }`}>
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400">
                            <X className="w-3 h-3" />
                          </div>
                        )}
                        <span className={
                          feature.available
                            ? (plan.recommended ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400')
                            : 'text-slate-400 dark:text-slate-600 line-through'
                        }>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href="/register" className="block">
                    <Button
                      className={`w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-[0.98] ${
                        plan.recommended
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-900 dark:text-white'
                      }`}
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-14 text-slate-400 dark:text-slate-500 text-sm">
          All plans include a{' '}
          <span className="text-blue-600 font-bold">25-day free trial</span>
          {' '}with full Pro features. No credit card required.
        </p>
      </div>
    </section>
  );
}
