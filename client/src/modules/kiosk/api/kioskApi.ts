import api from '@/services/api';
import { 
  KioskResponse, 
  KioskListResponse, 
  CreateKioskPayload, 
  UpdateKioskPayload 
} from '../types';

const ENDPOINT = '/api/kiosk';

export const getKiosks = async (hospitalId: string, params: any = {}): Promise<KioskListResponse> => {
  const response = await api.get<KioskListResponse>(ENDPOINT, { 
    params: { hospitalId, ...params } 
  });
  return response.data;
};

export const getKioskById = async (id: string): Promise<KioskResponse> => {
  const response = await api.get<KioskResponse>(`${ENDPOINT}/${id}`);
  return response.data;
};

export const getKioskByCode = async (code: string): Promise<KioskResponse> => {
  const response = await api.get<KioskResponse>(`${ENDPOINT}/code/${code}`);
  return response.data;
};

export const createKiosk = async (payload: CreateKioskPayload): Promise<KioskResponse> => {
  const response = await api.post<KioskResponse>(ENDPOINT, payload);
  return response.data;
};

export const updateKiosk = async (id: string, payload: UpdateKioskPayload): Promise<KioskResponse> => {
  const response = await api.put<KioskResponse>(`${ENDPOINT}/${id}`, payload);
  return response.data;
};

export const deleteKiosk = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};
