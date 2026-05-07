import api from './api';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  webhookKey?: string;
  enabled: boolean;
}

export interface HospitalSettings {
  hospitalId: string;
  hospitalName: string;
  hospitalType: 'small' | 'large';
  features: {
    doctorSelection: boolean;
    payment: boolean;
    ads: boolean;
    reports: boolean;
    autoAssign: boolean;
  };
  paymentConfig?: {
    razorpay: RazorpayConfig;
  };
  tokenResetTime: string;
}

export const settingsApi = {
  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data.data as HospitalSettings;
  },

  updateSettings: async (settings: Partial<HospitalSettings>) => {
    const response = await api.put('/api/settings', settings);
    return response.data.data as HospitalSettings;
  },
};
