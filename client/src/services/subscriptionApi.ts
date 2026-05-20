import api from './api';

export interface PlanFeature {
  text: string;
  available: boolean;
}

export interface PlanPrice {
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
  intervalMonths: number;
  amount: number;
  razorpayPlanId: string;
}

export interface Plan {
  _id: string;
  name: string;
  planId: string;
  description: string;
  price: number;
  quarterlyPrice?: number;
  halfYearlyPrice?: number;
  yearlyPrice: number;
  prices?: PlanPrice[]; // 👈 Dynamic pricing options
  displayOrder: number;
  recommended: boolean;
  limits: {
    maxDepartments: number;
    maxDoctors: number;
    maxKiosks: number;
    allowCustomBranding: boolean;
  };
  features: PlanFeature[];
  trialDays: number;
  isActive: boolean;
}

export interface SubscriptionStatus {
  planId: string;
  planName: string;
  planDescription: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'GRACE_PERIOD';
  isValid: boolean;
  trialDaysLeft: number;
  trialEndDate: string;
  limits: {
    maxDepartments: number;
    maxDoctors: number;
    maxKiosks: number;
    currentDoctors: number;
    currentDepartments: number;
    currentKiosks: number;
  };
}

export const subscriptionApi = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get('/api/subscription/status');
    return response.data.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/subscription/history');
    return response.data.data;
  },

  getPublicPlans: async (): Promise<Plan[]> => {
    const response = await api.get('/api/subscription/public-plans');
    return response.data.data;
  },

  changePlan: async (planId: string) => {
    const response = await api.post('/api/subscription/change-plan', { planId });
    return response.data;
  },

  startTrial: async (): Promise<any> => {
    const response = await api.post('/api/subscription/start-trial');
    return response.data;
  },

  createCheckout: async (
    planId: string,
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'
  ): Promise<{
    success: boolean;
    data: {
      subscriptionId: string;
      keyId: string;
      amount: number;
      planId: string;
      billingCycle: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
    };
  }> => {
    const response = await api.post('/api/subscription/create-checkout', { planId, billingCycle });
    return response.data;
  },

  verifyCheckout: async (payload: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
    planId: string;
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
  }): Promise<any> => {
    const response = await api.post('/api/subscription/verify-checkout', payload);
    return response.data;
  },
};
