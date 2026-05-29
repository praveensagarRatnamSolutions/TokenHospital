'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader,
  Hospital as HospitalIcon,
  MapPin,
  ShieldCheck,
  User,
  Lock,
  RefreshCw,
  CreditCard,
  Zap,
  Mail,
  Check,
  Info,
  CheckCircle,
  Infinity as InfinityIcon,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { hospitalApi } from '@/services/hospitalApi';
import api from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import PhoneNumberInput, { type PhoneData } from '@/components/common/phone-input';

const INITIAL_STATE = {
  hospitalName: '',
  adminName: '',
  email: '',
  password: '',
  phone: {
    full: '',
    countryCode: '+91',
    country: 'IN',
    nationalNumber: '',
  } as PhoneData,
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  },
  registrationNumber: '',
  licenseNumber: '',
  subscription: {
    isCustom: false,
    planId: 'PRO', // default standard plan
    billingCycle: 'MONTHLY',
    price: 0,
    sendInvoice: true,
  },
};

type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';

export default function HospitalCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = editId !== null && editId !== undefined && editId !== '';

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_STATE);

  // Plans listing
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'BILLING'>('DETAILS');

  // Real-time validations
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch plans and load hospital details
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetchingPlans(true);
        const plansResponse = await api.get('/api/subscription/plans');
        const activePlans = plansResponse.data.data.filter((p: any) => p.isActive);
        setAvailablePlans(activePlans);

        if (isEdit) {
          const res = await hospitalApi.getHospitalById(editId);
          const hospital = res.data;

          const phoneData =
            typeof hospital.phone === 'object'
              ? hospital.phone
              : {
                  full: hospital.phone || '',
                  countryCode: '+91',
                  country: 'IN',
                  nationalNumber: (hospital.phone || '').replace(/^\+\d+/, ''),
                };
          setFormData({
            ...INITIAL_STATE,
            hospitalName: hospital.name || '',
            email: hospital.email || '',
            phone: phoneData,
            address: {
              street: hospital.address?.street || '',
              city: hospital.address?.city || '',
              state: hospital.address?.state || '',
              zipCode: hospital.address?.zipCode || '',
              country: hospital.address?.country || 'India',
            },
            registrationNumber: hospital.registrationNumber || '',
            licenseNumber: hospital.licenseNumber || '',
          });
        } else {
          // Select first available plan by default if standard
          const proPlan = activePlans.find((p: any) => p.planId === 'PRO' && !p.isCustom);
          if (proPlan) {
            setFormData((prev) => ({
              ...prev,
              subscription: {
                ...prev.subscription,
                planId: proPlan.planId,
                price: proPlan.price,
              },
            }));
          } else if (activePlans.length > 0) {
            const firstPlan = activePlans.find((p: any) => !p.isCustom) || activePlans[0];
            setFormData((prev) => ({
              ...prev,
              subscription: {
                ...prev.subscription,
                planId: firstPlan.planId,
                price: firstPlan.price,
              },
            }));
          }
        }
      } catch (err: any) {
        console.error('Failed to load initial page details', err);
        setError('Failed to load page configurations');
        toast.error('Onboarding resources loading failed');
      } finally {
        setFetchingPlans(false);
        setLoading(false);
      }
    };

    loadData();
  }, [isEdit, editId]);

  const generatePass = () => {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const pass = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
    setFormData((prev) => ({ ...prev, password: pass }));
    setValidationErrors((prev) => ({ ...prev, password: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    if (type === 'number') parsedValue = Number(value);

    // Clear validation error on type
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parsedValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handlePhoneChange = (phoneData: PhoneData) => {
    setFormData((prev) => ({ ...prev, phone: phoneData }));
    if (validationErrors.phone) {
      setValidationErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  // Grouped active plans
  const standardPlans = availablePlans.filter((p) => !p.isCustom);
  const customPlans = availablePlans.filter((p) => p.isCustom);

  // Retrieve current selected plan object
  const selectedPlan = availablePlans.find(
    (p) => p.planId === formData.subscription.planId,
  );

  // Compute pricing detail based on billingCycle
  const computedPrice = (() => {
    if (!selectedPlan) return 0;
    const pricingCycle = formData.subscription.billingCycle as BillingCycle;

    // Find amount from prices array if loaded
    const priceObj = selectedPlan.prices?.find(
      (p: any) => p.billingCycle === pricingCycle,
    );
    if (priceObj) return priceObj.amount;

    // Fallback calculation matching backend / plans component
    if (pricingCycle === 'MONTHLY') return selectedPlan.price;
    if (pricingCycle === 'QUARTERLY')
      return selectedPlan.quarterlyPrice || Math.round(selectedPlan.price * 3);
    if (pricingCycle === 'HALF_YEARLY')
      return selectedPlan.halfYearlyPrice || Math.round(selectedPlan.price * 6);
    return selectedPlan.yearlyPrice || Math.round(selectedPlan.price * 12);
  })();

  const computedMonthlyEquivalent = (() => {
    const pricingCycle = formData.subscription.billingCycle as BillingCycle;
    const intervalMonths =
      pricingCycle === 'MONTHLY'
        ? 1
        : pricingCycle === 'QUARTERLY'
          ? 3
          : pricingCycle === 'HALF_YEARLY'
            ? 6
            : 12;
    return Math.round(computedPrice / intervalMonths);
  })();

  const validateDetailsTab = () => {
    const errors: Record<string, string> = {};
    if (!formData.hospitalName.trim()) errors.hospitalName = 'Hospital Name is required';
    if (!isEdit && !formData.adminName.trim())
      errors.adminName = 'Admin Full Name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!formData.phone.full || formData.phone.full.replace(/\D/g, '').length < 8) {
      errors.phone = 'Enter a valid phone number';
    }

    if (!isEdit && !formData.password.trim()) {
      errors.password = 'A temporary password is required';
    } else if (!isEdit && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.address.street.trim())
      errors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) errors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) errors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim())
      errors['address.zipCode'] = 'Zip code is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextTab = () => {
    if (validateDetailsTab()) {
      setActiveTab('BILLING');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fix validation errors before moving forward.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetailsTab()) {
      setActiveTab('DETAILS');
      toast.error('Facility details require corrections.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEdit) {
        // Send only facility payload
        const updatePayload = {
          hospitalName: formData.hospitalName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          registrationNumber: formData.registrationNumber,
          licenseNumber: formData.licenseNumber,
        };
        await hospitalApi.updateHospital(editId, updatePayload);
        toast.success('Hospital record updated successfully.');
        router.push(`/superadmin/hospitals/${editId}`);
      } else {
        // Create hospital with subscription
        const createPayload = {
          hospitalName: formData.hospitalName,
          adminName: formData.adminName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          registrationNumber: formData.registrationNumber,
          licenseNumber: formData.licenseNumber,
          subscription: {
            isCustom: selectedPlan?.isCustom ?? false,
            planId: formData.subscription.planId,
            billingCycle: formData.subscription.billingCycle,
            price: computedPrice,
            sendInvoice: formData.subscription.sendInvoice,
          },
        };
        const response = await hospitalApi.createHospital(createPayload);
        toast.success('Hospital node successfully created!');

        if (response.invoiceLink) {
          toast.info('Onboarding invoice & credentials emailed to administrator.');
        }
        router.push('/superadmin/hospitals');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failure occurred while saving the hospital.',
      );
      toast.error(err.response?.data?.message || 'Action unsuccessful');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-3 bg-slate-50 dark:bg-slate-950">
        <Loader className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading Node Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-6 lg:p-10 space-y-8 animate-fade-in">
      {/* Sticky Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[150px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {isEdit ? 'Refine Facility Record' : 'Onboard Global Node'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
              <span>{isEdit ? 'Edit Mode' : 'New Hospital Provisioning'}</span>
              <span>·</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-primary">
                {isEdit ? `ID: ${editId}` : 'Terminal Node Ready'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="outline"
            onClick={() => router.push('/superadmin/hospitals')}
            className="rounded-2xl px-6 h-12 font-bold bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 hover:bg-slate-50"
          >
            Discard
          </Button>

          {!isEdit && activeTab === 'DETAILS' ? (
            <Button
              onClick={handleNextTab}
              className="bg-primary hover:bg-primary/95 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Next: Configure Billing
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Confirm & Provision Node'}
            </Button>
          )}
        </div>
      </div>

      {/* Multi-Step Horizontal Indicator (Only if onboarding) */}
      {!isEdit && (
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="glass p-2 rounded-2xl flex items-center gap-4 w-full md:w-fit shadow-sm">
            <button
              onClick={() => setActiveTab('DETAILS')}
              className={cn(
                'flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                activeTab === 'DETAILS'
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <span className="flex h-5 w-5 rounded-full border-2 border-current items-center justify-center text-[10px]">
                1
              </span>
              Facility details
            </button>
            <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={handleNextTab}
              className={cn(
                'flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                activeTab === 'BILLING'
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <span className="flex h-5 w-5 rounded-full border-2 border-current items-center justify-center text-[10px]">
                2
              </span>
              Subscription & billing
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="max-w-7xl mx-auto p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <p className="text-xs font-bold text-rose-800 dark:text-rose-200">{error}</p>
        </div>
      )}

      {/* Primary Layout Form Grid */}
      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left column inputs */}
        <div
          className={cn(
            'space-y-8',
            isEdit ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-7',
          )}
        >
          {/* TABS: FACILITY DETAILS */}
          <div
            className={cn(
              'space-y-8',
              isEdit || activeTab === 'DETAILS' ? 'block' : 'hidden',
            )}
          >
            {/* Facility Identity */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                  <HospitalIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Facility & Admin Profile
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Configure basic details & administrative contacts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hospital name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    Hospital Name *
                  </label>
                  <input
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    className={cn(
                      'form-input-style',
                      validationErrors.hospitalName &&
                        'border-rose-450 focus:border-rose-450 focus:ring-rose-200/20',
                    )}
                    placeholder="e.g. Apollo Super Specialty"
                  />
                  {validationErrors.hospitalName && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {validationErrors.hospitalName}
                    </p>
                  )}
                </div>

                {/* Admin full name (disabled in edit) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    Admin Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                    <input
                      name="adminName"
                      disabled={isEdit}
                      value={formData.adminName}
                      onChange={handleChange}
                      className={cn(
                        'form-input-style pr-12',
                        validationErrors.adminName &&
                          'border-rose-450 focus:border-rose-450',
                        isEdit && 'opacity-60',
                      )}
                      placeholder="e.g. Dr. Rajesh Kumar"
                    />
                  </div>
                  {validationErrors.adminName && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {validationErrors.adminName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    Official Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        'form-input-style pr-12',
                        validationErrors.email && 'border-rose-450 focus:border-rose-450',
                      )}
                      placeholder="e.g. admin@apollo.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone contact */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    Official Phone Contact *
                  </label>
                  <PhoneNumberInput
                    value={formData.phone.full}
                    onChange={handlePhoneChange}
                    showLabel={false}
                  />
                  {validationErrors.phone && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                {/* Password (Only in create flow) */}
                {!isEdit && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1 flex justify-between">
                      <span>Temporary Admin Password *</span>
                      <button
                        type="button"
                        onClick={generatePass}
                        className="text-primary hover:text-primary/80 lowercase font-bold flex items-center gap-1 bg-primary/10 px-2.5 py-0.5 rounded-md text-[9px] transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> auto-generate
                      </button>
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={cn(
                          'form-input-style pr-12 font-mono',
                          validationErrors.password &&
                            'border-rose-450 focus:border-rose-450',
                        )}
                        placeholder="••••••••••••"
                      />
                    </div>
                    {validationErrors.password && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address Location */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Location Details
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Specify registered location address details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Street */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    Street Address *
                  </label>
                  <input
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={cn(
                      'form-input-style',
                      validationErrors['address.street'] &&
                        'border-rose-450 focus:border-rose-450',
                    )}
                    placeholder="e.g. 45, Residency Road, Near MG Marg"
                  />
                  {validationErrors['address.street'] && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {validationErrors['address.street']}
                    </p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    City *
                  </label>
                  <input
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={cn(
                      'form-input-style',
                      validationErrors['address.city'] &&
                        'border-rose-450 focus:border-rose-450',
                    )}
                    placeholder="e.g. Bangalore"
                  />
                  {validationErrors['address.city'] && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {validationErrors['address.city']}
                    </p>
                  )}
                </div>

                {/* State & Zip Code Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                      State *
                    </label>
                    <input
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className={cn(
                        'form-input-style',
                        validationErrors['address.state'] &&
                          'border-rose-450 focus:border-rose-450',
                      )}
                      placeholder="Karnataka"
                    />
                    {validationErrors['address.state'] && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1">
                        {validationErrors['address.state']}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                      Zip Code *
                    </label>
                    <input
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className={cn(
                        'form-input-style',
                        validationErrors['address.zipCode'] &&
                          'border-rose-450 focus:border-rose-450',
                      )}
                      placeholder="560001"
                    />
                    {validationErrors['address.zipCode'] && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1">
                        {validationErrors['address.zipCode']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Records */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Compliance & Licensing
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Verify licensing compliance records
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gov Registration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    Gov. Registration Number
                  </label>
                  <input
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="form-input-style"
                    placeholder="e.g. REG-5678-KAR"
                  />
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider ml-1">
                    Medical License Number
                  </label>
                  <input
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="form-input-style"
                    placeholder="e.g. LIC-1234-MED"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TABS: SUBSCRIPTION & BILLING */}
          <div
            className={cn(
              'space-y-8',
              !isEdit && activeTab === 'BILLING'
                ? 'block animate-in fade-in slide-in-from-bottom duration-300'
                : 'hidden',
            )}
          >
            {/* PREDEFINED PLANS GRID */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Predefined Tiers Selection
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Select standard pricing packages or predefined custom configurations
                    </p>
                  </div>
                </div>
              </div>

              {fetchingPlans ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Standard Tiers */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Standard Public Plans
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {standardPlans.map((plan) => (
                        <div
                          key={plan.planId}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              subscription: { ...prev.subscription, planId: plan.planId },
                            }))
                          }
                          className={cn(
                            'p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 relative overflow-hidden group flex flex-col justify-between h-36',
                            formData.subscription.planId === plan.planId
                              ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                              : 'border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-primary/20',
                          )}
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-slate-800 dark:text-white text-base tracking-tight">
                                {plan.name}
                              </h4>
                              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide mt-1">
                                {plan.planId}
                              </p>
                            </div>

                            {formData.subscription.planId === plan.planId && (
                              <div className="bg-primary text-white p-1 rounded-full shadow">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              ₹{plan.price.toLocaleString()}
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                                /mo
                              </span>
                            </span>
                            <span className="text-[9px] font-bold bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                              {plan.limits.maxDoctors >= 99999
                                ? 'Unlimited'
                                : `${plan.limits.maxDoctors} Docs`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Predefined Tiers */}
                  <div className="space-y-4 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      Predefined Custom Plans (Created in Plan Module)
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customPlans.map((plan) => (
                        <div
                          key={plan.planId}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              subscription: { ...prev.subscription, planId: plan.planId },
                            }))
                          }
                          className={cn(
                            'p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 relative overflow-hidden group flex flex-col justify-between h-36',
                            formData.subscription.planId === plan.planId
                              ? 'border-orange-500 bg-orange-500/5 shadow-md shadow-orange-500/5'
                              : 'border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-orange-500/20',
                          )}
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-slate-800 dark:text-white text-base tracking-tight flex items-center gap-1">
                                {plan.name}
                                <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                              </h4>
                              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide mt-1">
                                {plan.planId}
                              </p>
                            </div>

                            {formData.subscription.planId === plan.planId && (
                              <div className="bg-orange-500 text-white p-1 rounded-full shadow">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                              ₹{plan.price.toLocaleString()}
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                                /mo
                              </span>
                            </span>
                            <span className="text-[9px] font-bold bg-orange-500/10 text-orange-650 dark:text-orange-300 px-2 py-0.5 rounded-md">
                              {plan.limits.maxDoctors >= 99999
                                ? 'Unlimited'
                                : `${plan.limits.maxDoctors} Docs`}
                            </span>
                          </div>
                        </div>
                      ))}

                      {customPlans.length === 0 && (
                        <div className="col-span-2 text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/20">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            No predefined custom plans configured
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Configure custom commercial tiers in the Plans page first.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PREFERENCES */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl border border-slate-850 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

              <div className="flex items-center gap-2 text-emerald-450 font-black uppercase tracking-widest text-xs border-b border-slate-800 pb-3 mb-6 relative z-10">
                <CreditCard className="w-4.5 h-4.5" /> Billing Cycle & Invoice Settings
              </div>

              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Selected Billing Cycle
                  </label>
                  <select
                    name="subscription.billingCycle"
                    value={formData.subscription.billingCycle}
                    onChange={handleChange}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-emerald-500 transition-all text-sm"
                  >
                    <option value="MONTHLY">Monthly Billing Cycle</option>
                    <option value="QUARTERLY">Quarterly Billing Cycle (3 Months)</option>
                    <option value="HALF_YEARLY">
                      Semi-Annual Billing Cycle (6 Months)
                    </option>
                    <option value="YEARLY">Annual Billing Cycle (12 Months)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-slate-800/40 p-5 rounded-2xl border border-slate-800/80">
                  <div className="pr-4">
                    <p className="text-sm font-black text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-450" /> Dispatch Invoice &
                      Credentials
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 leading-relaxed">
                      Automatically generates and emails the secure payment links and
                      onboarding terminal credentials to the administrator.
                    </p>
                  </div>
                  <Switch
                    checked={formData.subscription.sendInvoice}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        subscription: { ...prev.subscription, sendInvoice: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Checkout Sidebar Receipt (Only visible if onboarding) */}
        {!isEdit && (
          <div className="lg:col-span-5 sticky top-10 space-y-6">
            {/* Live Invoice Preview receipt */}
            <div className="bg-primary rounded-[3rem] p-8 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-black/10 rounded-full blur-[40px] pointer-events-none" />

              <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-sm animate-bounce-subtle">
                    {selectedPlan?.isCustom ? (
                      <Zap className="w-7 h-7 text-white fill-amber-300" />
                    ) : (
                      <CreditCard className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/50">
                      onboarding invoice
                    </p>
                    <p className="text-[9px] font-bold bg-white/15 text-white px-3.5 py-1 rounded-full inline-block mt-1 tracking-wider border border-white/5 shadow-inner">
                      Checkout Live Preview
                    </p>
                  </div>
                </div>

                {/* Plan Metadata */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-wider">
                      Selected Plan Name
                    </p>
                    <h3 className="text-2xl text-white tracking-tighter italic font-black leading-none truncate max-w-[280px]">
                      {selectedPlan?.name || 'Draft Hospital'}
                    </h3>
                  </div>

                  {/* Identifiers Row */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/5 px-3 py-1.5 rounded-xl flex flex-col justify-center">
                      <span className="text-[8px] font-black uppercase text-white/50">
                        PLAN ID
                      </span>
                      <span className="text-[10px] font-bold font-mono text-white tracking-wider">
                        {selectedPlan?.planId || 'PENDING'}
                      </span>
                    </div>

                    {selectedPlan?.isCustom && (
                      <div className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl flex items-center justify-center font-black text-[9px] tracking-wider uppercase shadow-md shadow-black/10">
                        Custom Plan
                      </div>
                    )}

                    {formData.subscription.sendInvoice && (
                      <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl flex items-center justify-center font-black text-[8px] tracking-wider uppercase border border-white/10">
                        Invoice Enabled
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-white/75 leading-relaxed font-semibold h-10 line-clamp-2">
                    {selectedPlan?.description ||
                      'Predefined sSaaS resources caps and feature access sets.'}
                  </p>
                </div>

                {/* Billing Summary Receipt */}
                <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/10">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-wider">
                      Billing Interval
                    </p>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">
                      {formData.subscription.billingCycle.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-wider">
                      Rate Total
                    </p>
                    <p className="text-xl font-black text-amber-300 italic tracking-tight">
                      ₹{computedPrice.toLocaleString()}
                      <span className="text-[10px] text-white/75 font-medium ml-0.5">
                        /cycle
                      </span>
                    </p>
                  </div>
                </div>

                {/* Monthly Equivalent */}
                <div className="flex justify-between items-center text-xs font-semibold text-white/90">
                  <span>Monthly Equivalent Rate:</span>
                  <span className="font-mono font-black text-sm text-white bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/5">
                    ₹{computedMonthlyEquivalent.toLocaleString()}/mo
                  </span>
                </div>

                {/* Plan limits receipt */}
                {selectedPlan && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/40">
                      Authorized Plan Limits
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase text-white">
                      {/* Depts */}
                      <div className="bg-white/10 p-2.5 rounded-2xl border border-white/5 flex flex-col justify-center">
                        <span className="text-sm font-black flex items-center justify-center gap-0.5">
                          {selectedPlan.limits?.maxDepartments >= 99999 ? (
                            <InfinityIcon className="w-3.5 h-3.5" />
                          ) : (
                            (selectedPlan.limits?.maxDepartments ?? 1)
                          )}
                        </span>
                        <span className="text-[8px] font-bold text-white/60 tracking-wider mt-0.5">
                          Depts
                        </span>
                      </div>

                      {/* Doctors */}
                      <div className="bg-white/10 p-2.5 rounded-2xl border border-white/5 flex flex-col justify-center">
                        <span className="text-sm font-black flex items-center justify-center gap-0.5">
                          {selectedPlan.limits?.maxDoctors >= 99999 ? (
                            <InfinityIcon className="w-3.5 h-3.5" />
                          ) : (
                            (selectedPlan.limits?.maxDoctors ?? 2)
                          )}
                        </span>
                        <span className="text-[8px] font-bold text-white/60 tracking-wider mt-0.5">
                          Doctors
                        </span>
                      </div>

                      {/* Kiosks */}
                      <div className="bg-white/10 p-2.5 rounded-2xl border border-white/5 flex flex-col justify-center">
                        <span className="text-sm font-black flex items-center justify-center gap-0.5">
                          {selectedPlan.limits?.maxKiosks === -1 ? (
                            <InfinityIcon className="w-3.5 h-3.5" />
                          ) : (
                            (selectedPlan.limits?.maxKiosks ?? 0)
                          )}
                        </span>
                        <span className="text-[8px] font-bold text-white/60 tracking-wider mt-0.5">
                          Kiosks
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-white text-primary rounded-[2rem] font-black shadow-xl hover:shadow-2xl hover:shadow-black/15 hover:scale-[1.01] active:scale-95 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <Loader className="w-4 h-4 animate-spin text-primary" />
                    )}
                    Confirm & Provision Node
                  </button>
                  <p className="text-[8px] text-center text-white/50 font-bold uppercase mt-3 tracking-widest leading-relaxed">
                    Auto-sends secure credentials & onboarding invoice link via email
                  </p>
                </div>
              </div>
            </div>

            {/* Quick tips Box */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-[2rem] border border-blue-200/50 dark:border-blue-800/40 flex gap-3 shadow-sm">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 leading-relaxed">
                Selecting a standard or custom commercial tier registers this hospital
                node inside the active platform billing network instantly.
              </p>
            </div>
          </div>
        )}
      </form>

      <style jsx>{`
        .form-input-style {
          width: 100%;
          height: 3.5rem;
          padding: 0 1.25rem;
          border-radius: 1rem;
          border-width: 1px;
          background-color: #f8fafc;
          border-color: #e2e8f0;
          outline: none;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
        }
        :global(.dark) .form-input-style {
          background-color: #020617;
          border-color: #1e293b;
          color: white;
        }
        .form-input-style:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          background-color: white;
        }
        :global(.dark) .form-input-style:focus {
          background-color: #0f172a;
        }
        .form-input-style::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }
        :global(.dark) .form-input-style::placeholder {
          color: #475569;
        }
      `}</style>
    </div>
  );
}
