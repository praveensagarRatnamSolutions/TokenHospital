'use client';

import {
  Award,
  Check,
  ChevronLeft,
  Crown,
  Info,
  ListPlus,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import api from '@/services/api';

const DEFAULT_PLAN_LIMITS = {
  maxDepartments: 1,
  maxDoctors: 2,
  maxKiosks: 0,
  freeSmsUnits: 0,
  freeEmailUnits: 0,
};

export default function PlanFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = editId !== null && editId !== undefined && editId !== '';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [previewCycle, setPreviewCycle] = useState<'monthly' | 'quarterly' | 'half_yearly' | 'yearly'>('monthly');

  // Core form data state
  const [formData, setFormData] = useState({
    name: '',
    planId: '',
    description: '',
    price: 0,
    quarterlyPrice: 0,
    halfYearlyPrice: 0,
    yearlyPrice: 0,
    displayOrder: 0,
    recommended: false,
    limits: DEFAULT_PLAN_LIMITS,
    trialDays: 30,
    isActive: true,
  });

  // Dynamic custom features array state
  const [features, setFeatures] = useState<{ text: string; available: boolean }[]>([]);
  const [originalPrices, setOriginalPrices] = useState<any[]>([]);

  // Load plan details if editing
  useEffect(() => {
    if (isEdit) {
      api.get(`/api/subscription/plans/${editId}`)
        .then((res) => {
          const data = res.data.data;

          // Prepopulate individual cycle fields from prices array if loaded
          const monthlyAmt = data.prices?.find((p: any) => p.billingCycle === 'MONTHLY')?.amount || data.price || 0;
          const quarterlyAmt = data.prices?.find((p: any) => p.billingCycle === 'QUARTERLY')?.amount || Math.round(monthlyAmt * 3);
          const halfYearlyAmt = data.prices?.find((p: any) => p.billingCycle === 'HALF_YEARLY')?.amount || Math.round(monthlyAmt * 6);
          const yearlyAmt = data.prices?.find((p: any) => p.billingCycle === 'YEARLY')?.amount || data.yearlyPrice || Math.round(monthlyAmt * 12);

          setFormData({
            ...data,
            price: monthlyAmt,
            quarterlyPrice: quarterlyAmt,
            halfYearlyPrice: halfYearlyAmt,
            yearlyPrice: yearlyAmt,
            limits: {
              maxDepartments: data.limits?.maxDepartments ?? 1,
              maxDoctors: data.limits?.maxDoctors ?? 2,
              maxKiosks: data.limits?.maxKiosks ?? 0,
              freeSmsUnits: data.limits?.freeSmsUnits ?? 0,
              freeEmailUnits: data.limits?.freeEmailUnits ?? 0,
            },
          });

          // Save original prices for Razorpay check
          setOriginalPrices(data.prices || []);

          // Load dynamic features array from database
          if (data.features && data.features.length > 0) {
            setFeatures(data.features);
          } else {
            // Generate standard core features if empty
            generateCoreFeatures(data.limits || data);
          }

          setLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load subscription plan settings');
          setLoading(false);
        });
    } else {
      // Prepopulate standard base features for new plans
      generateCoreFeatures(DEFAULT_PLAN_LIMITS);
    }
  }, [isEdit, editId]);

  // Generate standard features dynamically based on limits
  const generateCoreFeatures = (limits: any) => {
    const maxDeps = limits.maxDepartments ?? 1;
    const maxDocs = limits.maxDoctors ?? 2;
    const maxKiosks = limits.maxKiosks ?? 0;
    const freeEmails = limits.freeEmailUnits ?? 0;
    const freeSms = limits.freeSmsUnits ?? 0;

    const baseFeatures = [
      { text: `${maxDeps >= 99999 ? 'Unlimited' : maxDeps} Department${maxDeps !== 1 ? 's' : ''}`, available: true },
      { text: `${maxDocs >= 99999 ? 'Unlimited' : 'Up to ' + maxDocs} Doctor${maxDocs !== 1 ? 's' : ''}`, available: true },
      { text: maxKiosks === 0 ? 'Digital Patient Kiosks' : `Up to ${maxKiosks === -1 ? 'Unlimited' : maxKiosks} Digital Kiosks`, available: maxKiosks !== 0 },
      { text: `${freeEmails} Free Email Credits / month`, available: freeEmails > 0 },
      { text: `${freeSms} Free SMS Credits / month`, available: freeSms > 0 },
    ];
    setFeatures(baseFeatures);
  };

  // Trigger manual sync of standard features with inputs
  const handleSyncCoreFeatures = () => {
    generateCoreFeatures(formData.limits);
    toast.success('Regenerated standard features from limit settings');
  };

  // Add a brand-new dynamic custom feature item
  const handleAddFeature = () => {
    setFeatures([...features, { text: '', available: true }]);
  };

  // Edit text of a specific feature
  const handleFeatureTextChange = (index: number, text: string) => {
    const newFeatures = [...features];
    newFeatures[index].text = text;
    setFeatures(newFeatures);
  };

  // Toggle availability of a specific feature
  const handleFeatureToggle = (index: number) => {
    const newFeatures = [...features];
    newFeatures[index].available = !newFeatures[index].available;
    setFeatures(newFeatures);
  };

  // Delete a feature
  const handleDeleteFeature = (index: number) => {
    const newFeatures = features.filter((_, idx) => idx !== index);
    setFeatures(newFeatures);
  };

  // Razorpay Plan ID Safeguard: Determines if we should recreate or preserve plan ID
  const getRazorpayPlanId = (cycle: string, newAmount: number) => {
    if (newAmount <= 0) {
      return null;
    }
    if (!isEdit) {
      return `temp_${cycle.toLowerCase()}`;
    }
    const orig = originalPrices.find((p: any) => p.billingCycle === cycle);
    if (orig && orig.amount === newAmount && orig.razorpayPlanId && !orig.razorpayPlanId.startsWith('temp_')) {
      return orig.razorpayPlanId;
    }
    // Price changed or not registered yet: triggers recreation via temp_ prefix
    return `temp_${cycle.toLowerCase()}`;
  };

  // Save the form
  const handleSave = async () => {
    if (!formData.name || !formData.planId) {
      toast.error('Plan Display Name and Code ID are required');
      return;
    }

    setSaving(true);
    try {
      const monthlyAmount = formData.price;
      const quarterlyAmount = formData.quarterlyPrice || Math.round(formData.price * 3);
      const halfYearlyAmount = formData.halfYearlyPrice || Math.round(formData.price * 6);
      const yearlyAmount = formData.yearlyPrice || Math.round(formData.price * 12);

      const payload = {
        ...formData,
        prices: [
          { billingCycle: 'MONTHLY', intervalMonths: 1, amount: monthlyAmount, razorpayPlanId: getRazorpayPlanId('MONTHLY', monthlyAmount) },
          { billingCycle: 'QUARTERLY', intervalMonths: 3, amount: quarterlyAmount, razorpayPlanId: getRazorpayPlanId('QUARTERLY', quarterlyAmount) },
          { billingCycle: 'HALF_YEARLY', intervalMonths: 6, amount: halfYearlyAmount, razorpayPlanId: getRazorpayPlanId('HALF_YEARLY', halfYearlyAmount) },
          { billingCycle: 'YEARLY', intervalMonths: 12, amount: yearlyAmount, razorpayPlanId: getRazorpayPlanId('YEARLY', yearlyAmount) }
        ],
        features: features, // Save fully dynamic user-managed features checklist
      };

      if (isEdit) {
        await api.put(`/api/subscription/plans/${editId}`, payload);
        toast.success('Subscription plan changes updated successfully');
      } else {
        await api.post('/api/subscription/plans', payload);
        toast.success('New premium subscription plan published');
      }
      router.push('/superadmin/plans');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save subscription plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-3 bg-slate-50 dark:bg-slate-950">
        <Zap className="w-10 h-10 animate-pulse text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Configuration</p>
      </div>
    );
  }

  // Compute live price rates for sticky checkout preview card
  const totalAmount = previewCycle === 'yearly'
    ? (formData.yearlyPrice || Math.round(formData.price * 12))
    : previewCycle === 'half_yearly'
      ? (formData.halfYearlyPrice || Math.round(formData.price * 6))
      : previewCycle === 'quarterly'
        ? (formData.quarterlyPrice || Math.round(formData.price * 3))
        : formData.price;

  const intervalMonths = previewCycle === 'yearly' ? 12 : (previewCycle === 'half_yearly' ? 6 : (previewCycle === 'quarterly' ? 3 : 1));
  const monthlyEquiv = Math.round(totalAmount / intervalMonths);

  const PreviewIcon = formData.planId === 'ENTERPRISE' ? Crown : (formData.planId === 'PRO' ? Zap : ShieldCheck);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-6 lg:p-10">
      {/* Sticky Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isEdit ? 'Configure Subscription Plan' : 'Publish New Subscription'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
              <span>{formData.name || 'Draft Tier'}</span>
              <span>·</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-primary">
                ID: {formData.planId || 'PENDING'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-2xl px-6 h-12 font-bold bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 hover:bg-slate-50"
          >
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-2xl px-6 h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : isEdit ? 'Update Settings' : 'Publish Plan'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Columns: Inputs Grid */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Plan Identity */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Plan Identity</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure basic details & identifiers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Display Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-semibold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                  placeholder="e.g. Professional Premium"
                />
              </div>

              {/* Plan ID */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Stable Identifier (Plan ID)
                </label>
                <input
                  disabled={isEdit}
                  value={formData.planId}
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value.toUpperCase() })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold font-mono outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white uppercase disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  placeholder="PRO"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Marketing Tagline / Description
                </label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-semibold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                  placeholder="e.g. Definitive queue management tool for growing medical centers"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Commercial Pricing */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Commercial Tiers</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Define pricing models for different cycles</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly price */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Monthly Price (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest">/mo</span>
                </div>
              </div>

              {/* Quarterly price */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Quarterly Price (3 Months - ₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.quarterlyPrice}
                    onChange={(e) => setFormData({ ...formData, quarterlyPrice: Number(e.target.value) })}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                    placeholder={String(Math.round(formData.price * 3))}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest">/3m</span>
                </div>
              </div>

              {/* Half Yearly price */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Half-Yearly Price (6 Months - ₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.halfYearlyPrice}
                    onChange={(e) => setFormData({ ...formData, halfYearlyPrice: Number(e.target.value) })}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                    placeholder={String(Math.round(formData.price * 6))}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest">/6m</span>
                </div>
              </div>

              {/* Yearly price */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Yearly Price (12 Months - ₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                    placeholder={String(Math.round(formData.price * 12))}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest">/year</span>
                </div>
              </div>

              {/* Trial days */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Trial Period Duration
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest">Days</span>
                </div>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Dashboard Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Limits & Thresholds */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resource limits</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cap usage values (Use 99999 or -1 for unlimited)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Max Departments */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1 flex items-center gap-1">
                  Max Departments
                </label>
                <input
                  type="number"
                  value={formData.limits.maxDepartments}
                  onChange={(e) => setFormData({
                    ...formData,
                    limits: { ...formData.limits, maxDepartments: Number(e.target.value) }
                  })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white text-sm"
                />
              </div>

              {/* Max Doctors */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Max Doctors
                </label>
                <input
                  type="number"
                  value={formData.limits.maxDoctors}
                  onChange={(e) => setFormData({
                    ...formData,
                    limits: { ...formData.limits, maxDoctors: Number(e.target.value) }
                  })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white text-sm"
                />
              </div>

              {/* Max Kiosks */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Max Kiosks
                </label>
                <input
                  type="number"
                  value={formData.limits.maxKiosks}
                  onChange={(e) => setFormData({
                    ...formData,
                    limits: { ...formData.limits, maxKiosks: Number(e.target.value) }
                  })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white text-sm"
                />
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            {/* Wallet Communications Credits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Emails */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Free Monthly Email Credits
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.limits.freeEmailUnits}
                    onChange={(e) => setFormData({
                      ...formData,
                      limits: { ...formData.limits, freeEmailUnits: Number(e.target.value) }
                    })}
                    className="w-full h-14 pl-5 pr-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white text-sm"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Emails</span>
                </div>
              </div>

              {/* Free SMS */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider ml-1">
                  Free Monthly SMS Credits
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.limits.freeSmsUnits}
                    onChange={(e) => setFormData({
                      ...formData,
                      limits: { ...formData.limits, freeSmsUnits: Number(e.target.value) }
                    })}
                    className="w-full h-14 pl-5 pr-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white text-sm"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase tracking-widest">SMS</span>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            {/* Plan Settings Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recommended Badge Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Most Popular Badge</p>
                  <p className="text-[9px] font-medium text-slate-400">Highlights card in checkout</p>
                </div>
                <Switch
                  checked={formData.recommended}
                  onCheckedChange={(v) => setFormData({ ...formData, recommended: v })}
                />
              </div>

              {/* Plan Live Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Active Live Status</p>
                  <p className="text-[9px] font-medium text-slate-400">Available for clinic purchases</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic Dynamic Features Checklist Builder */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-xl">
                  <ListPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dynamic Features Builder</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure client-facing pricing details checklist</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSyncCoreFeatures}
                  variant="outline"
                  type="button"
                  size="sm"
                  className="rounded-xl h-9 text-xs font-bold border border-slate-200 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  title="Generate features directly based on Cap Limit settings"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Sync Limits
                </Button>

                <Button
                  onClick={handleAddFeature}
                  variant="outline"
                  type="button"
                  size="sm"
                  className="rounded-xl h-9 text-xs font-bold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/15"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Custom
                </Button>
              </div>
            </div>

            {/* Features Array List */}
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Toggle availability checkbox */}
                  <button
                    type="button"
                    onClick={() => handleFeatureToggle(idx)}
                    className={cn(
                      'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border transition-all',
                      feature.available
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-slate-400'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  {/* Feature Text Input */}
                  <input
                    value={feature.text}
                    onChange={(e) => handleFeatureTextChange(idx, e.target.value)}
                    className={cn(
                      'flex-1 bg-transparent border-0 font-semibold text-xs text-slate-800 dark:text-slate-100 outline-none p-0 focus:ring-0',
                      !feature.available && 'text-slate-400 line-through'
                    )}
                    placeholder="e.g. 24/7 Dedicated Server Support"
                  />

                  {/* Delete button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => handleDeleteFeature(idx)}
                    className="w-8 h-8 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {features.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No dynamic features added yet</p>
                  <p className="text-[10px] text-slate-400 mt-1">Sync limits above to prepopulate core features checklist.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Live premium invoice checkout card preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 space-y-6">
            
            {/* INVOICE DESIGN PREVIEW */}
            <div className="bg-primary rounded-[3rem] p-8 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
              {/* Ambient Blurs inside card */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-black/10 rounded-full blur-[40px] pointer-events-none" />

              <div className="relative z-10 space-y-8">
                {/* Upper Header */}
                <div className="flex justify-between items-start">
                  <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-sm animate-bounce-subtle">
                    <PreviewIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Subscription Tier</p>
                    <p className="text-[10px] font-bold bg-white/15 text-white px-3 py-0.5 rounded-full inline-block mt-1 tracking-wider border border-white/5">
                      Live Preview
                    </p>
                  </div>
                </div>

                {/* Plan Metadata */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-wider">Plan Name</p>
                    <h3 className="text-3xl text-white tracking-tighter italic font-black leading-none truncate max-w-[280px]">
                      {formData.name || 'Draft Plan'}
                    </h3>
                  </div>

                  {/* Identifiers & Badges row */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/5 px-3 py-1.5 rounded-xl flex flex-col justify-center">
                      <span className="text-[8px] font-black uppercase text-white/50">Code ID</span>
                      <span className="text-[10px] font-bold font-mono text-white tracking-wider">{formData.planId || 'UNASSIGNED'}</span>
                    </div>

                    {formData.recommended && (
                      <div className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl flex items-center justify-center font-black text-[9px] tracking-wider uppercase shadow-md shadow-black/10">
                        Popular
                      </div>
                    )}

                    <div className={cn(
                      'px-3 py-1.5 rounded-xl flex items-center justify-center font-black text-[8px] tracking-wider uppercase border border-white/10',
                      formData.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500/50 text-white/70'
                    )}>
                      {formData.isActive ? 'Active' : 'Draft'}
                    </div>
                  </div>

                  <p className="text-xs text-white/75 leading-relaxed font-semibold h-10 line-clamp-2">
                    {formData.description || 'Provide a compelling description of what this tier delivers to onboarded clinics.'}
                  </p>
                </div>

                {/* Billing Cycle Tabs inside receipt card */}
                <div className="p-1 bg-black/20 rounded-2xl flex items-center justify-between gap-0.5 text-[9px] font-bold uppercase tracking-wider border border-white/5">
                  {(['monthly', 'quarterly', 'half_yearly', 'yearly'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setPreviewCycle(cycle)}
                      className={cn(
                        'flex-1 text-center py-2 rounded-xl transition-all duration-300',
                        previewCycle === cycle
                          ? 'bg-white text-primary font-black shadow-md scale-[1.02]'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {cycle === 'monthly' ? 'Mon' : cycle === 'quarterly' ? '3M' : cycle === 'half_yearly' ? '6M' : '1Y'}
                    </button>
                  ))}
                </div>

                {/* Commercial Price Splits */}
                <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/10">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-wider">Billing Type</p>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">
                      {intervalMonths === 1 ? 'Monthly' : `${intervalMonths} Months`} Cycle
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-wider">Equivalent Rate</p>
                    <p className="text-xl font-black text-amber-300 italic tracking-tight">
                      ₹{Math.round(monthlyEquiv).toLocaleString()}
                      <span className="text-[10px] text-white/75 font-medium ml-0.5">/mo</span>
                    </p>
                  </div>
                </div>

                {/* Features Checklist inside Preview Receipt */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/40">Included SaaS Features</p>
                  <ul className="space-y-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs font-bold">
                        {feat.available ? (
                          <div className="p-0.5 bg-white/25 rounded-full shrink-0 border border-white/10 shadow-sm">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="p-0.5 bg-black/20 rounded-full shrink-0 opacity-55 border border-white/5">
                            <X className="w-3.5 h-3.5 text-white/45" />
                          </div>
                        )}
                        <span className={cn(
                          'text-white leading-tight',
                          !feat.available && 'text-white/40 line-through font-medium'
                        )}>
                          {feat.text || `Dynamic Feature ${idx + 1}`}
                        </span>
                      </li>
                    ))}

                    {features.length === 0 && (
                      <li className="text-xs text-white/40 font-bold uppercase tracking-wider italic py-2 text-center">
                        No features added to list
                      </li>
                    )}
                  </ul>
                </div>

                {/* Confirm Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4.5 bg-white text-primary rounded-[2rem] font-black shadow-xl hover:shadow-2xl hover:shadow-black/15 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider"
                  >
                    {saving ? 'Saving...' : 'Confirm & Publish Tier'}
                  </button>
                  <p className="text-[9px] text-center text-white/50 font-bold uppercase mt-3 tracking-widest">
                    Trial period active for exactly {formData.trialDays} days
                  </p>
                </div>
              </div>
            </div>

            {/* Quick tips Box */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-[2rem] border border-blue-200/50 dark:border-blue-800/40 flex gap-3 shadow-sm">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 leading-relaxed">
                Ensure pricing cycle commercial entries, limits, and dynamic features are thoroughly reviewed. Savings will auto-calculate correctly across checkout interfaces.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
