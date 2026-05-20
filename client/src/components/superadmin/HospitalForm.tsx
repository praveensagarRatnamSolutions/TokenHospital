'use client';

import { useState, useEffect } from 'react';
import {
  X,
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
  Infinity as InfinityIcon
} from 'lucide-react';
import { Hospital, hospitalApi } from '@/services/hospitalApi';
import api from '@/services/api'; // Using generic api to fetch plans
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Switch } from '@/components/ui/switch';

interface HospitalFormProps {
  hospital?: Hospital | null;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_STATE = {
  hospitalName: '',
  adminName: '',
  email: '',
  password: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  },
  registrationNumber: '',
  licenseNumber: '',
  // NEW SUBSCRIPTION PAYLOAD
  subscription: {
    isCustom: false,
    planId: 'PRO', // default standard plan
    billingCycle: 'MONTHLY',
    price: 0,
    maxDoctors: 5,
    maxDepartments: 3,
    maxKiosks: 1,
    sendInvoice: true,
  }
};

export function HospitalForm({ hospital, onClose, onSuccess }: HospitalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'BILLING'>('DETAILS');

  useEffect(() => {
    if (hospital) {
      setFormData({
        ...INITIAL_STATE,
        hospitalName: hospital.name || '',
        email: hospital.email || '',
        phone: typeof hospital.phone === 'object' ? hospital.phone.full : hospital.phone || '',
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
      setFormData(INITIAL_STATE);
      fetchPlans();
    }
  }, [hospital]);

  const fetchPlans = async () => {
    try {
      setFetchingPlans(true);
      const response = await api.get('/api/subscription/plans');
      setAvailablePlans(response.data.data.filter((p: any) => p.isActive));
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setFetchingPlans(false);
    }
  };

  const generatePass = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const pass = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') parsedValue = Number(value);

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

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (hospital?._id) {
        await hospitalApi.updateHospital(hospital._id, formData);
      } else {
        await hospitalApi.createHospital(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:px-8 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {hospital ? 'Update Facility' : 'Provision New Hospital'}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Secure Onboarding Terminal
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Only show if creating new) */}
        {!hospital && (
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setActiveTab('DETAILS')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'DETAILS' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
            >
              1. Facility Details
            </button>
            <button 
              onClick={() => setActiveTab('BILLING')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'BILLING' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
            >
              2. Subscription & Billing
            </button>
          </div>
        )}

        {/* Form Body */}
        <form id="hospital-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm text-red-800 dark:text-red-200 font-bold">{error}</p>
            </div>
          )}

          <div className={activeTab === 'DETAILS' ? 'space-y-8 block' : 'hidden'}>
            {/* Section: Facility & Admin */}
            <section className="space-y-5 p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <HospitalIcon className="w-4 h-4" /> Facility & Administrator
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Hospital Name *</label>
                  <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} required className="form-input-style" placeholder="City General" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Admin Full Name *</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} required className="form-input-style" placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Official Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input-style" placeholder="admin@hospital.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Phone Number</label>
                  <PhoneInput
                    country={'in'}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputClass="!w-full !h-[3.25rem] !px-4 !py-2 !border-slate-200 dark:!border-slate-700 !rounded-2xl !bg-slate-50 dark:!bg-slate-950 !focus:!bg-white dark:!focus:!bg-slate-900 !focus:!ring-2 !focus:!ring-primary/20 !outline-none !font-bold !text-sm dark:!text-white"
                    containerClass="!w-full"
                    buttonClass="!border-r !border-slate-200 dark:!border-slate-700 !rounded-l-2xl !bg-slate-100 dark:!bg-slate-900"
                    dropdownClass="!bg-white dark:!bg-slate-950 !border !rounded-xl"
                  />
                </div>
                {!hospital && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 flex justify-between">
                      Temp Password *
                      <button type="button" onClick={generatePass} className="text-primary hover:text-primary/80 lowercase font-bold flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md">
                        <RefreshCw className="w-3 h-3" /> auto-generate
                      </button>
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" name="password" value={formData.password || ''} onChange={handleChange} required className="form-input-style" placeholder="••••••••" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section: Address */}
            <section className="space-y-5 p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <MapPin className="w-4 h-4" /> Location Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Street Address *</label>
                  <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} required className="form-input-style" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">City *</label>
                  <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} required className="form-input-style" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500">State *</label>
                    <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} required className="form-input-style" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500">Zip Code *</label>
                    <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} required className="form-input-style" />
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Compliance */}
            <section className="space-y-5 p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4" /> Compliance Records
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Gov. Registration Number</label>
                  <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="form-input-style" placeholder="REG-1234" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Medical License Number</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="form-input-style" placeholder="LIC-5678" />
                </div>
              </div>
            </section>
          </div>

          {/* BILLING TAB */}
          <div className={activeTab === 'BILLING' ? 'space-y-6 block animate-in fade-in duration-300' : 'hidden'}>
            
            {/* Plan Selection Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, isCustom: false } }))}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!formData.subscription.isCustom ? 'bg-white dark:bg-slate-950 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Standard Plans
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, isCustom: true } }))}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.subscription.isCustom ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Custom Plan Limits
              </button>
            </div>

            {/* Standard Plan Selection */}
            {!formData.subscription.isCustom && (
              <section className="space-y-5 p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <CreditCard className="w-4 h-4" /> Select Public Tier
                </div>
                {fetchingPlans ? (
                  <div className="flex justify-center py-6"><Loader className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availablePlans.map((plan) => (
                      <div 
                        key={plan.planId} 
                        onClick={() => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, planId: plan.planId } }))}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.subscription.planId === plan.planId ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-primary/30 bg-slate-50 dark:bg-slate-950'}`}
                      >
                        <h4 className="font-black text-slate-800 dark:text-white">{plan.name}</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">₹{plan.price}/month</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Custom Plan Definition */}
            {formData.subscription.isCustom && (
              <section className="space-y-5 p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-primary/20 shadow-lg shadow-primary/5">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Zap className="w-4 h-4" /> Custom Specifications
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500">Custom Monthly Price (₹) *</label>
                    <input type="number" min={0} name="subscription.price" value={formData.subscription.price} onChange={handleChange} required className="form-input-style !text-xl !font-black !text-emerald-600" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500">Max Doctors</label>
                    <input type="number" name="subscription.maxDoctors" value={formData.subscription.maxDoctors} onChange={handleChange} required className="form-input-style font-bold" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500">Max Departments</label>
                    <input type="number" name="subscription.maxDepartments" value={formData.subscription.maxDepartments} onChange={handleChange} required className="form-input-style font-bold" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500">Max Kiosks (-1 for unlimited)</label>
                    <input type="number" name="subscription.maxKiosks" value={formData.subscription.maxKiosks} onChange={handleChange} required className="form-input-style font-bold" />
                  </div>
                </div>
              </section>
            )}

            {/* Billing Cycle & Invoice Settings */}
            <section className="space-y-5 p-6 bg-slate-900 rounded-[1.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
               <div className="relative z-10">
                 <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-xs border-b border-slate-800 pb-3 mb-5">
                    <CreditCard className="w-4 h-4" /> Billing Preferences
                 </div>
                 
                 <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">Payment Cycle</label>
                      <select name="subscription.billingCycle" value={formData.subscription.billingCycle} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-emerald-500">
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="HALF_YEARLY">Half-Yearly</option>
                        <option value="YEARLY">Annually</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                      <div>
                        <p className="text-sm font-black text-white flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> Auto-Dispatch Invoice</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Generates payment link and emails credentials to admin</p>
                      </div>
                      <Switch 
                        checked={formData.subscription.sendInvoice} 
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, sendInvoice: checked } }))}
                      />
                    </div>
                 </div>
               </div>
            </section>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 md:px-8 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
            Discard
          </button>
          
          {(!hospital && activeTab === 'DETAILS') ? (
             <button 
                type="button"
                onClick={() => setActiveTab('BILLING')}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest transition-all"
             >
               Next: Setup Billing
             </button>
          ) : (
            <button
              form="hospital-form"
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {hospital ? 'Save Record' : 'Confirm & Provision'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .form-input-style {
          width: 100%;
          height: 3.25rem;
          padding: 0 1rem;
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
      `}</style>
    </div>
  );
}
