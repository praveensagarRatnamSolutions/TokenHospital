// components/razorpay/razorpay-card.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Settings, 
  Link as LinkIcon, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Config = {
  webhookUrl: string;
  webhookSecret: string;
};

export default function RazorpayCard() {
  const searchParams = useSearchParams();
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check if we just returned from a successful connection
    if (searchParams.get('connected') === 'true') {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/api/razorpay/config');
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to fetch Razorpay config:', err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchConfig();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      // Hit the API to get the connection URL
      const res = await api.get('/api/razorpay/connect');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Failed to initiate Razorpay connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const steps = [
    { icon: <Settings className="w-4 h-4" />, text: "Go to Razorpay Dashboard → Webhooks" },
    { icon: <LinkIcon className="w-4 h-4" />, text: "Add new webhook with the URL below" },
    { icon: <CheckCircle2 className="w-4 h-4" />, text: "Enable the 'payment.captured' event" },
  ];

  return (
    <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950 rounded-[2rem]">
      {/* Premium Header Gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Razorpay Integration</CardTitle>
              <p className="text-xs font-medium text-slate-500">Secure automated payments for tokens</p>
            </div>
          </div>
          <AnimatePresence>
            {config && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-bold border border-emerald-100 dark:border-emerald-900/30"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CONNECTED
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-slate-400 animate-pulse">Fetching connection status...</p>
            </motion.div>
          ) : !config ? (
            <motion.div 
              key="connect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Connect your account</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Enable your hospital to accept online payments for consultation tokens directly into your Razorpay merchant account.
                </p>
              </div>

              <Button 
                onClick={handleConnect}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Connect Razorpay <ExternalLink className="w-5 h-5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="config"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {showSuccessMessage && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="p-4 rounded-2xl bg-emerald-500 text-white flex items-center gap-3 overflow-hidden shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">Successfully linked Razorpay account!</p>
                </motion.div>
              )}

              {/* Webhook Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Webhook Configuration</h4>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Endpoint URL</label>
                    <div className="relative group">
                      <Input 
                        value={config.webhookUrl} 
                        readOnly 
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pr-24 font-mono text-xs focus-visible:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(config.webhookUrl, 'url')}
                        className="absolute right-1 top-1 bottom-1 px-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-blue-600 font-bold transition-all"
                      >
                        {copiedField === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="ml-1.5 text-[10px]">{copiedField === 'url' ? 'COPIED' : 'COPY'}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Webhook Secret</label>
                    <div className="relative group">
                      <Input 
                        value={config.webhookSecret} 
                        readOnly 
                        type="password"
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pr-24 font-mono text-xs focus-visible:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(config.webhookSecret, 'secret')}
                        className="absolute right-1 top-1 bottom-1 px-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-blue-600 font-bold transition-all"
                      >
                        {copiedField === 'secret' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="ml-1.5 text-[10px]">{copiedField === 'secret' ? 'COPIED' : 'COPY'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Stepper */}
              <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 space-y-4">
                <h5 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Setup Instructions</h5>
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-tight">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}