'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertCircle, CreditCard, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const SubscriptionBanner = () => {
  const { status, loading } = useSubscription();

  if (loading || !status) return null;

  // 1. If trial is active
  if (status.status === 'TRIAL' && status.isValid) {
    const daysLeft = status.trialDaysLeft;
    
    // Only show if 10 days or less left, or if always want to show it
    if (daysLeft > 20) return null; // Too early to annoy them?

    return (
      <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-200" />
          <span>
            Your <strong>Free Trial</strong> ends in <strong>{daysLeft} days</strong> ({new Date(status.trialEndDate).toLocaleDateString()}). Upgrade to avoid service interruption.
          </span>
        </div>
        <Link href="/admin/settings/billing">
          <Button variant="secondary" size="sm" className="h-7 bg-white text-indigo-600 hover:bg-indigo-50">
            Upgrade Now
          </Button>
        </Link>
      </div>
    );
  }

  // 2. If subscription has expired
  if (!status.isValid) {
    return (
      <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>
            <strong>Subscription Expired!</strong> Your hospital features are currently locked. Please renew to continue.
          </span>
        </div>
        <Link href="/admin/settings/billing">
          <Button variant="secondary" size="sm" className="h-7 bg-white text-red-600 hover:bg-red-50">
            Renew Now
          </Button>
        </Link>
      </div>
    );
  }

  // 3. If in Grace Period
  if (status.status === 'GRACE_PERIOD') {
    return (
      <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>
            <strong>Payment Failed!</strong> We couldn't process your renewal. Please update your payment method to avoid losing access.
          </span>
        </div>
        <Link href="/admin/settings/billing">
          <Button variant="secondary" size="sm" className="h-7 bg-white text-orange-600 hover:bg-orange-50">
            Fix Now
          </Button>
        </Link>
      </div>
    );
  }

  return null;
};
