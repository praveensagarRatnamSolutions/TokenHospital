import { AdListResponse } from '@/modules/admin/ads';
import api from '@/services/api';

const ADS_ENDPOINT = '/api/ads';

export const getAds = async (): Promise<AdListResponse> => {
  try {
    const response = await api.get<AdListResponse>(`${ADS_ENDPOINT}`);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch ads',
    };
  }
};
