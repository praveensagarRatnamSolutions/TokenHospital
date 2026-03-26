'use client';

import React, { useEffect, useState } from 'react';
import { Settings, BarChart3, Bell, Shield, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { settingsApi, HospitalSettings, RazorpayConfig } from '@/services/settingsApi';
import RazorpayCard from '@/modules/admin/settings/components/razorpay-card';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse" />
        </div>
        <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Initializing Settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-6">
        <div className="p-4 rounded-3xl bg-red-50 dark:bg-red-900/10 text-red-500 shadow-xl shadow-red-500/10">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="text-center">
          <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Something went wrong</p>
          <p className="text-sm font-medium text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchSettings}
          className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl hover:scale-105 transition-all font-bold shadow-lg active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
            <Settings className="w-4 h-4" />
            Control Center
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your hospital's digital infrastructure and payment gateways.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Configuration Content */}
        <div className="lg:col-span-7 space-y-12">
          {/* Razorpay Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Payment Gateway</h2>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>
            <RazorpayCard />
          </section>

          {/* Placeholder sections with premium skeleton look */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Analytics & Logs</h2>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-20 h-20" />
                </div>
                <div className="size-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg tracking-tight">Reports Configuration</h3>
                <p className="text-sm font-medium text-slate-400 mt-2">Advanced data visualization settings coming soon.</p>
              </div>

              <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Bell className="w-20 h-20" />
                </div>
                <div className="size-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg tracking-tight">Notification System</h3>
                <p className="text-sm font-medium text-slate-400 mt-2">Real-time alerts and template engine setup.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info/Status */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-black tracking-tight">Platform Status</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hospital Engine</span>
                  <span className="text-emerald-400 font-black">OPERATIONAL</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Sync</span>
                  <span className="text-emerald-400 font-black">LIVE</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Data Protection</span>
                  <span className="text-blue-400 font-black">ENCRYPTED</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed pt-4">
                All changes made to the settings undergo immediate synchronization across your hospital's digital kiosks and appointment portals.
              </p>
            </div>
          </div>
          
          <div className="p-8 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
            <h4 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-xs mb-4">Security Note</h4>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              Never share your Webhook Secret or Razorpay Keys with anyone. The platform uses AES-256 encryption to store your sensitive configuration once saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
