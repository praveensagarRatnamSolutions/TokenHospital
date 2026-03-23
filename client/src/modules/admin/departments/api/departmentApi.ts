/**
 * Department API Service
 * Handles all department-related API calls
 */

import api from '@/services/api';
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentResponse,
  DepartmentListResponse,
} from '../types';

const ENDPOINT = '/api/department';

/**
 * Get all departments
 */
export const getDepartments = async (): Promise<DepartmentListResponse> => {
  try {
    const response = await api.get<DepartmentListResponse>(ENDPOINT);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch departments',
    };
  }
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (id: string): Promise<DepartmentResponse> => {
  try {
    const response = await api.get<DepartmentResponse>(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch department',
    };
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (
  payload: CreateDepartmentPayload,
): Promise<DepartmentResponse> => {
  try {
    const response = await api.post<DepartmentResponse>(ENDPOINT, {
      name: payload.name.trim(),
      prefix: payload.prefix.trim().toUpperCase(),
    });
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create department',
    };
  }
};

/**
 * Update department by ID
 */
export const updateDepartment = async (
  id: string,
  payload: UpdateDepartmentPayload,
): Promise<DepartmentResponse> => {
  try {
    const updatePayload: any = {};
    if (payload.name) updatePayload.name = payload.name.trim();
    if (payload.prefix) updatePayload.prefix = payload.prefix.trim().toUpperCase();

    const response = await api.put<DepartmentResponse>(
      `${ENDPOINT}/${id}`,
      updatePayload,
    );
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update department',
    };
  }
};

/**
 * Delete department by ID
 */
export const deleteDepartment = async (id: string): Promise<DepartmentResponse> => {
  try {
    const response = await api.delete<DepartmentResponse>(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete department',
    };
  }
};
