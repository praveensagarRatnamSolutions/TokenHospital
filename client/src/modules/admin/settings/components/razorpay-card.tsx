// components/razorpay/razorpay-card.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  Settings,
  Link as LinkIcon,
  Loader2,
  Save,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  Globe,
  Info
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import api from '@/services/api';
import { settingsApi, RazorpayConfig } from '@/services/settingsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

type WebhookInfo = {
  webhookUrl: string;
  webhookSecret: string;
};

export default function RazorpayCard() {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<RazorpayConfig>({
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    webhookKey: '',
    enabled: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch everything from the Razorpay config endpoint
        const res = await api.get('/api/razorpay/config');

        setWebhookInfo({
          webhookUrl: res.data.webhookUrl,
          webhookSecret: res.data.webhookSecret
        });

        if (res.data.config) {
          setFormData({
            keyId: res.data.config.keyId || '',
            keySecret: res.data.config.keySecret || '',
            webhookSecret: res.data.webhookSecret || '',
            webhookKey: res.data.webhookKey || '',
            enabled: res.data.config.enabled || false
          });
        }
      } catch (err) {
        console.error('Failed to fetch Razorpay data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      setErrorMessage('');

      // Update specifically using the Razorpay endpoint
      await api.put('/api/razorpay/config', {
        keyId: formData.keyId,
        keySecret: formData.keySecret,
        enabled: formData.enabled
      });

      // Refresh to get any updated info
      const res = await api.get('/api/razorpay/config');
      setWebhookInfo({
        webhookUrl: res.data.webhookUrl,
        webhookSecret: res.data.webhookSecret
      });
      if (res.data.config) {
        setFormData(prev => ({
          ...prev,
          keyId: res.data.config.keyId || '',
          keySecret: res.data.config.keySecret || '',
          enabled: res.data.config.enabled || false
        }));
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const steps = [
    { icon: <Settings className="w-3.5 h-3.5" />, text: "Navigate to Settings → API Keys in Razorpay Dashboard" },
    { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: "Copy your Live Key ID and Secret into the fields below" },
    { icon: <LinkIcon className="w-3.5 h-3.5" />, text: "Add the Webhook URL provided here in Razorpay Settings" },
    { icon: <Globe className="w-3.5 h-3.5" />, text: "Select 'payment.captured' as the mandatory event" },
  ];

  if (loading) {
    return (
      <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-950 rounded-3xl py-24">
        <div className="flex flex-col items-center justify-center space-y-6">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Gateway...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 rounded-3xl">
      <CardHeader className="p-8 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Razorpay Payments</CardTitle>
              <p className="text-sm font-bold text-slate-400">Configure your hospital's direct payment gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className={`text-xs font-black tracking-tight px-2 ${formData.enabled ? 'text-blue-600' : 'text-slate-400'}`}>
              {formData.enabled ? 'ACTIVE' : 'DISABLED'}
            </span>
            <Switch
              disabled={saving}
              checked={formData.enabled}
              onCheckedChange={async (checked) => {
                setFormData(prev => ({ ...prev, enabled: checked }));
                // Immediate save for the toggle
                try {
                  setSaving(true);
                  await api.put('/api/razorpay/config', {
                    ...formData,
                    enabled: checked
                  });
                } catch (err) {
                  console.error('Failed to toggle Razorpay status:', err);
                  // Revert UI on failure
                  setFormData(prev => ({ ...prev, enabled: !checked }));
                } finally {
                  setSaving(false);
                }
              }}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-10 space-y-12">
        {/* Section 1: Authentication */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-900 pb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Authentication Keys</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Key ID</label>
              <Input
                placeholder="rzp_live_xxxxxxxxxxxxxx"
                value={formData.keyId}
                onChange={(e) => setFormData(prev => ({ ...prev, keyId: e.target.value }))}
                className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-xs focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Key Secret</label>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  {showSecret ? 'HIDE SECRET' : 'SHOW SECRET'}
                </button>
              </div>
              <div className="relative group">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder="Enter your razorpay secret"
                  value={formData.keySecret}
                  onChange={(e) => setFormData(prev => ({ ...prev, keySecret: e.target.value }))}
                  className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-xs focus-visible:ring-blue-500 pr-14"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                  {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Webhooks */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-900 pb-4">
            <LinkIcon className="w-5 h-5 text-purple-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Webhook Integration</h4>
          </div>

          {webhookInfo && webhookInfo.webhookUrl ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Payload URL</label>
                <div className="relative">
                  <Input
                    value={webhookInfo.webhookUrl}
                    readOnly
                    className="h-14 bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/30 dark:border-blue-800/30 rounded-2xl pr-28 font-mono text-[10px] text-blue-600 dark:text-blue-400"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(webhookInfo.webhookUrl, 'url')}
                    className="absolute right-2 top-2 bottom-2 px-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-blue-600 font-black transition-all"
                  >
                    {copiedField === 'url' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-2 text-[10px] uppercase">{copiedField === 'url' ? 'DONE' : 'COPY'}</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Webhook Secret</label>
                <div className="relative">
                  <Input
                    value={webhookInfo.webhookSecret}
                    readOnly
                    className="h-14 bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/30 dark:border-blue-800/30 rounded-2xl pr-28 font-mono text-[10px] text-blue-600 dark:text-blue-400"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(webhookInfo.webhookSecret, 'secret')}
                    className="absolute right-2 top-2 bottom-2 px-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-blue-600 font-black transition-all"
                  >
                    {copiedField === 'secret' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-2 text-[10px] uppercase">{copiedField === 'secret' ? 'DONE' : 'COPY'}</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600">
              <Info className="w-5 h-5" />
              <p className="text-xs font-bold uppercase tracking-tight">Save your API keys to generate your unique Webhook URL.</p>
            </div>
          )}
        </div>

        {/* Section 3: Guide & Actions */}
        <div className="grid grid-cols-1  gap-8 items-start pt-6 border-t border-slate-50 dark:border-slate-900">
          <div className="lg:col-span-8 space-y-6">
            <h5 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Quick Setup Guide</h5>
            <div className="grid grid-cols-2 gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <span className="text-[10px] font-black">{idx + 1}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>


        </div>
        <div className="lg:col-span-4 space-y-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${saveStatus === 'success'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
              : saveStatus === 'error'
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-95'
              }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : saveStatus === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Syncing...' : saveStatus === 'success' ? 'Synchronized' : saveStatus === 'error' ? 'Retry Save' : 'Save Config'}
          </Button>

          <AnimatePresence>
            {saveStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight leading-tight">
                  {errorMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
