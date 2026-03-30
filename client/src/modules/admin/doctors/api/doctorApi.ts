import api from '@/services/api';
import { DoctorResponse, DoctorListResponse } from '../types';

export const doctorApi = {
    getAll: async (params?: any): Promise<DoctorListResponse> => {
        const response = await api.get<DoctorListResponse>('/api/doctor', { params });
        return response.data;
    },
    getById: async (id: string): Promise<DoctorResponse> => {
        const response = await api.get<DoctorResponse>(`/api/doctor/${id}`);
        return response.data;
    },
    create: async (data: any): Promise<DoctorResponse> => {
        const response = await api.post<DoctorResponse>('/api/doctor', data);
        return response.data;
    },
    update: async (id: string, data: any): Promise<DoctorResponse> => {
        const response = await api.put<DoctorResponse>(`/api/doctor/${id}`, data);
        return response.data;
    },
    getUploadUrl: async (fileName: string, fileType: string) => {
        const response = await api.get('/api/doctor/upload-url', { params: { fileName, fileType } });
        return response.data;
    },
    toggleStatus: async (id: string): Promise<DoctorResponse> => {
        const response = await api.patch<DoctorResponse>(`/api/doctor/${id}/status`);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/api/doctor/${id}`);
        return response.data;
    },
};
