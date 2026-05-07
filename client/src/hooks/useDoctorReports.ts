'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function useDoctorReports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-performance', dateRange, search, departmentId],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...dateRange,
        ...(search ? { search } : {}),
        ...(departmentId ? { departmentId } : {}),
      });
      const res = await api.get(`/api/reports/doctor-performance?${params.toString()}`);
      return res.data.data;
    },
  });

  const setStartDate = (date: string) => setDateRange((prev) => ({ ...prev, startDate: date }));
  const setEndDate = (date: string) => setDateRange((prev) => ({ ...prev, endDate: date }));

  return {
    data,
    isLoading,
    dateRange,
    search,
    departmentId,
    setStartDate,
    setEndDate,
    setSearch,
    setDepartmentId,
  };
}
