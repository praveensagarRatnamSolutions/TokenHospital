'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertCircle, Info, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const SubscriptionBanner = () => {
  const { status, loading } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  // Read dismissed state from sessionStorage on mount to keep dashboard clean
  useEffect(() => {
    const dismissed = sessionStorage.getItem('dismissed_subscription_banner');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dismissed_subscription_banner', 'true');
  };

  if (loading || !status || isDismissed) return null;

  // 1. If trial is active
  if (status.status === 'TRIAL' && status.isValid) {
    const daysLeft = status.trialDaysLeft;

    return (
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-md relative z-30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="size-2 rounded-full bg-white animate-ping shrink-0" />
            <Info className="w-4 h-4 text-indigo-200 shrink-0" />
            <span>
              Hospital is currently on a <strong>Free Trial ({status.planName})</strong>. Only <strong>{daysLeft} days remaining</strong>. Upgrade to avoid any digital queue interruptions.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
            <Link href="/admin/settings/billing" className="shrink-0">
              <Button variant="secondary" size="sm" className="h-8 bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl transition-all shadow-sm">
                Upgrade Now ⚡
              </Button>
            </Link>
            <button 
              onClick={handleDismiss}
              className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. If subscription has expired
  if (!status.isValid) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-md relative z-30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="flex items-center gap-2.5 mr-auto animate-pulse">
            <AlertCircle className="w-4 h-4 text-red-200 shrink-0" />
            <span>
              <strong>Subscription Expired!</strong> Digital queue controls, patient kiosks, and automated stats are temporarily locked. Please renew.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
            <Link href="/admin/settings/billing" className="shrink-0">
              <Button variant="secondary" size="sm" className="h-8 bg-white text-red-600 hover:bg-red-50 font-black rounded-xl transition-all shadow-sm">
                Renew / Purchase Now 💳
              </Button>
            </Link>
            <button 
              onClick={handleDismiss}
              className="p-1 rounded-lg text-red-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. If in Grace Period
  if (status.status === 'GRACE_PERIOD') {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-md relative z-30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="flex items-center gap-2.5 mr-auto">
            <AlertCircle className="w-4 h-4 text-amber-200 shrink-0" />
            <span>
              <strong>Payment Unsuccessful!</strong> We were unable to charge your renewal card. Update billing credentials to preserve full clinic access.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
            <Link href="/admin/settings/billing" className="shrink-0">
              <Button variant="secondary" size="sm" className="h-8 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-xl transition-all shadow-sm">
                Update Payment method 💳
              </Button>
            </Link>
            <button 
              onClick={handleDismiss}
              className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
