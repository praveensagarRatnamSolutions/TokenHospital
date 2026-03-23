/**
 * Custom Hooks for Department Management
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '../types';
import * as departmentApi from '../api/departmentApi';

interface UseDeparmentsReturn {
  departments: Department[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch departments
 */
export const useDepartments = (): UseDeparmentsReturn => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentApi.getDepartments();
      if (response.success) {
        setDepartments(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.message || 'Failed to fetch departments');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch departments';
      setError(errorMessage);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
  };
};

interface UseCreateDepartmentReturn {
  createDepartment: (payload: CreateDepartmentPayload) => Promise<Department | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to create a department
 */
export const useCreateDepartment = (): UseCreateDepartmentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (payload: CreateDepartmentPayload): Promise<Department | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await departmentApi.createDepartment(payload);
        if (response.success && response.data) {
          return response.data as Department;
        } else {
          setError(response.message || 'Failed to create department');
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create department';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    createDepartment: create,
    loading,
    error,
  };
};

interface UseUpdateDepartmentReturn {
  updateDepartment: (
    id: string,
    payload: UpdateDepartmentPayload,
  ) => Promise<Department | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to update a department
 */
export const useUpdateDepartment = (): UseUpdateDepartmentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: string, payload: UpdateDepartmentPayload): Promise<Department | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await departmentApi.updateDepartment(id, payload);
        if (response.success && response.data) {
          return response.data as Department;
        } else {
          setError(response.message || 'Failed to update department');
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update department';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    updateDepartment: update,
    loading,
    error,
  };
};

interface UseDeleteDepartmentReturn {
  deleteDepartment: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to delete a department
 */
export const useDeleteDepartment = (): UseDeleteDepartmentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentApi.deleteDepartment(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete department');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete department';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteDepartment: remove,
    loading,
    error,
  };
};
