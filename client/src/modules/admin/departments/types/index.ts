/**
 * Department Type Definitions
 */

export interface Department {
  _id: string;
  name: string;
  prefix: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentPayload {
  name: string;
  prefix: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  prefix?: string;
}

export interface DepartmentResponse {
  success: boolean;
  message: string;
  data?: Department | Department[];
  error?: string;
}

export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
  message?: string;
}

export interface PaginatedDepartmentResponse {
  success: boolean;
  data: Department[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

export type DepartmentFormData = Omit<Department, '_id' | 'createdAt' | 'updatedAt'>;
