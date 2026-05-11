import { useState, useEffect, useCallback } from 'react';
import { subscriptionApi, SubscriptionStatus } from '../services/subscriptionApi';

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getStatus();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscription status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const isFeatureLocked = (feature: 'doctor' | 'department' | 'kiosk') => {
    if (!status) return true;
    if (!status.isValid) return true;

    if (feature === 'doctor') {
      return status.limits.currentDoctors >= status.limits.maxDoctors;
    }
    if (feature === 'department') {
      return status.limits.currentDepartments >= status.limits.maxDepartments;
    }
    if (feature === 'kiosk') {
      if (status.limits.maxKiosks === 0) return true;
      if (status.limits.maxKiosks === -1) return false; // unlimited
      return status.limits.currentKiosks >= status.limits.maxKiosks;
    }
    return false;
  };

  return {
    status,
    loading,
    error,
    isFeatureLocked,
    refresh: fetchStatus,
  };
};
