'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { walletApi } from '@/services/walletApi';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronLeft, 
  Save, 
  Zap, 
  Package, 
  Tag, 
  MessageSquare,
  Mail,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function TopupPackageFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = editId !== null && editId !== undefined && editId !== '';

  const [loading, setLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: '',
    service: 'SMS',
    credits: 0,
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    if (isEdit) {
      walletApi.getPackageById(editId)
        .then(res => {
          setFormData(res.data.data);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load package details");
          setLoading(false);
        });
    }
  }, [isEdit, editId]);

  const handleSave = async () => {
    if (!formData.name || formData.credits <= 0) {
      toast.error("Please provide a name and valid credits amount");
      return;
    }

    try {
      if (isEdit) {
        await walletApi.updatePackage(editId, formData);
        toast.success('Package updated successfully');
      } else {
        await walletApi.createPackage(formData);
        toast.success('New package created');
      }
      router.push('/superadmin/wallet-packages');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Zap className="w-8 h-8 animate-pulse text-primary" />
    </div>
  );

  const isSms = formData.service === 'SMS';
  const Icon = isSms ? MessageSquare : Mail;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      {/* Sticky Action Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              {isEdit ? 'Edit Wallet Package' : 'Create Wallet Package'}
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
              {formData.service} BUNDLE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-2xl px-6 h-12 font-bold bg-white dark:bg-slate-900">Discard</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-12 font-bold shadow-xl shadow-primary/20 hover:shadow-2xl transition-all">
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? 'Save Changes' : 'Publish Package'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Side: Form Filling Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Package className="text-primary" /> Package Configuration
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Package Name
                </label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/20 text-slate-800 dark:text-white"
                  placeholder="e.g. Starter SMS Pack"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Service Type
                </label>
                <div className="flex gap-4 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => setFormData({ ...formData, service: 'SMS' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isSms ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <MessageSquare className="w-4 h-4" /> SMS Credits
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, service: 'EMAIL' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!isSms ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Mail className="w-4 h-4" /> Email Credits
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Credit Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={formData.credits || ''}
                      onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                      className="w-full h-14 pl-5 pr-16 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/20 text-slate-800 dark:text-white"
                      placeholder="e.g. 1000"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price || ''}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/20 text-slate-800 dark:text-white"
                    placeholder="e.g. 299"
                  />
                </div>
              </div>
              
              <hr className="border-slate-100 dark:border-slate-800 my-6" />

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Active Status</p>
                  <p className="text-[9px] font-bold text-slate-400">Available for hospitals to purchase</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={v => setFormData({ ...formData, isActive: v })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Premium Preview Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 space-y-6">
            <div className={`rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden transition-colors duration-500 ${isSms ? 'bg-blue-600 shadow-blue-500/30' : 'bg-purple-600 shadow-purple-500/30'}`}>
              {/* Decorative blurs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-2xl" />

              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">
                      Top-up Package
                    </p>
                    <p className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block mt-1">
                      {isSms ? 'SMS Wallet' : 'Email Wallet'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl text-white tracking-tighter italic font-black">
                    {formData.name || 'Untitled Package'}
                  </h3>
                  <div className="flex gap-2">
                    <div className={`${formData.isActive ? 'bg-emerald-500' : 'bg-slate-500'} text-white px-3 py-1.5 rounded-xl flex items-center justify-center font-black text-[9px] tracking-widest uppercase`}>
                      {formData.isActive ? 'Live' : 'Draft'}
                    </div>
                  </div>
                </div>

                <div className="py-6 border-y border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60">Credits Included</p>
                    <p className="text-4xl font-black tracking-tighter">
                      {formData.credits ? formData.credits.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60">Package Price</p>
                    <p className="text-3xl font-black text-yellow-300 italic">
                      ₹{formData.price ? formData.price.toLocaleString() : '0'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Confirm & Publish Package
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tip / Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                Purchased wallet top-ups never expire and roll over indefinitely. They are automatically utilized when free monthly plan units are exhausted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
