import api from './api';

export interface Hospital {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  registrationNumber?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateHospitalDto {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  registrationNumber?: string;
  licenseNumber?: string;
}

export interface UpdateHospitalDto extends Partial<CreateHospitalDto> {}

export const hospitalApi = {
  // Get all hospitals
  getAllHospitals: async (filters?: { isActive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    const response = await api.get(`/api/hospital${params.toString() ? `?${params}` : ''}`);
    return response.data;
  },

  // Get hospital by ID
  getHospitalById: async (id: string) => {
    const response = await api.get(`/api/hospital/${id}`);
    return response.data;
  },

  // Create hospital
  createHospital: async (data: CreateHospitalDto) => {
    const response = await api.post('/api/hospital', data);
    return response.data;
  },

  // Update hospital
  updateHospital: async (id: string, data: UpdateHospitalDto) => {
    const response = await api.patch(`/api/hospital/${id}`, data);
    return response.data;
  },

  // Delete hospital
  deleteHospital: async (id: string) => {
    const response = await api.delete(`/api/hospital/${id}`);
    return response.data;
  },

  // Deactivate hospital
  deactivateHospital: async (id: string) => {
    const response = await api.patch(`/api/hospital/${id}/deactivate`);
    return response.data;
  },

  // Activate hospital
  activateHospital: async (id: string) => {
    const response = await api.patch(`/api/hospital/${id}/activate`);
    return response.data;
  },
};
