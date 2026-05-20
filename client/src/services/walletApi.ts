import api from './api';

export const walletApi = {
  getPackages: async (): Promise<any[]> => {
    const response = await api.get('/api/wallet/packages');
    return response.data.data;
  },
  
  getPackageById: async (id: string) => {
    return await api.get(`/api/wallet/packages/${id}`);
  },
  
  createPackage: async (data: any) => {
    return await api.post('/api/wallet/packages', data);
  },
  
  updatePackage: async (id: string, data: any) => {
    return await api.put(`/api/wallet/packages/${id}`, data);
  },
  
  deletePackage: async (id: string) => {
    return await api.delete(`/api/wallet/packages/${id}`);
  },

  getBalances: async (): Promise<{ smsCredits: number; emailCredits: number }> => {
    const response = await api.get('/api/wallet/balances');
    return response.data.data;
  },

  getLedger: async (): Promise<any[]> => {
    const response = await api.get('/api/wallet/ledger');
    return response.data.data;
  },

  buyPackage: async (packageId: string): Promise<{
    success: boolean;
    data: {
      orderId: string;
      keyId: string;
      amount: number;
      packageId: string;
      service: 'SMS' | 'EMAIL';
      name: string;
    };
  }> => {
    const response = await api.post(`/api/wallet/buy-package/${packageId}`);
    return response.data;
  },

  verifyPayment: async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    packageId: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/wallet/verify-payment', payload);
    return response.data;
  }
};
