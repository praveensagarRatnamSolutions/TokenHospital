'use client';

import React, { useEffect, useState } from 'react';
import { Settings, BarChart3, Bell, Shield, Loader2, AlertCircle } from 'lucide-react';
import { RazorpayConfigComponent } from '@/modules/admin/settings/components/RazorpayConfig';
import { settingsApi, HospitalSettings, RazorpayConfig } from '@/services/settingsApi';


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

  const handleSaveRazorpay = async (razorpayConfig: RazorpayConfig) => {
    try {
      const updated = await settingsApi.updateSettings({
        paymentConfig: {
          razorpay: razorpayConfig,
        },
      });
      setSettings(updated);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update Razorpay settings')

    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={fetchSettings}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500">System configuration and preferences for your hospital</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Razorpay Section */}
        <section>
          <RazorpayConfigComponent
            config={settings?.paymentConfig?.razorpay || {
              keyId: '',
              keySecret: '',
              webhookSecret: '',
              enabled: false
            }}
            onSave={handleSaveRazorpay}
          />
        </section>

        {/* Other Settings Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Reports Configuration</h3>
                <p className="text-xs text-slate-500">Analytics & reporting data</p>
              </div>
            </div>
            <p className="text-sm italic text-slate-400">Section coming soon</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-xs text-slate-500">Alerts & message templates</p>
              </div>
            </div>
            <p className="text-sm italic text-slate-400">Section coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
