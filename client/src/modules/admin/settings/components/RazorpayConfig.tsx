'use client';

import React, { useState } from 'react';
import { CreditCard, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { RazorpayConfig } from '@/services/settingsApi';

interface RazorpayConfigProps {
  config: RazorpayConfig;
  onSave: (config: RazorpayConfig) => Promise<void>;
}

export const RazorpayConfigComponent: React.FC<RazorpayConfigProps> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<RazorpayConfig>(config);
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Razorpay Configuration</h3>
          <p className="text-sm text-slate-500">Manage your payment gateway credentials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg mb-6">
          <div>
            <p className="font-medium">Enable Razorpay</p>
            <p className="text-xs text-slate-500">Accept payments via Razorpay</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              formData.enabled ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Key ID</label>
          <input
            type="text"
            value={formData.keyId}
            onChange={(e) => setFormData({ ...formData, keyId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="rzp_test_..."
            disabled={!formData.enabled}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Key Secret</label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={formData.keySecret}
              onChange={(e) => setFormData({ ...formData, keySecret: e.target.value })}
              className="w-full px-3 py-2 pr-10 border rounded-lg bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••••••••••"
              disabled={!formData.enabled}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Webhook Secret (Optional)</label>
          <div className="relative">
            <input
              type={showWebhookSecret ? 'text' : 'password'}
              value={formData.webhookSecret}
              onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
              className="w-full px-3 py-2 pr-10 border rounded-lg bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••••••••••"
              disabled={!formData.enabled}
            />
            <button
              type="button"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showWebhookSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.enabled}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
};
