import api from '@/services/api';

export const doctorApi = {
    getAll: (params?: any) => api.get('/api/doctor', { params }),
    getById: (id: string) => api.get(`/api/doctor/${id}`),
    create: (data: any) => api.post('/api/doctor', data),
    update: (id: string, data: any) => api.put(`/api/doctor/${id}`, data),
    getUploadUrl: (fileName: string, fileType: string) => api.get('/api/doctor/upload-url', { params: { fileName, fileType } }),
    toggleStatus: (id: string) => api.patch(`/api/doctor/${id}/status`),

    delete: (id: string) => api.delete(`/api/doctor/${id}`),
};
