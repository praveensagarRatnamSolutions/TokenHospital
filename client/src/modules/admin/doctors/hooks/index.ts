'use client';

import { useState, useCallback, useEffect } from 'react';
import { doctorApi } from '../api/doctorApi';
import { Doctor } from '../types';

export const useDoctors = (params: any = {}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorApi.getAll(params);
      if (response.success) {
        setDoctors(response.doctors || []);
      } else {
        setError(response.message || 'Failed to fetch doctors');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return { doctors, loading, error, refetch: fetchDoctors };
};
