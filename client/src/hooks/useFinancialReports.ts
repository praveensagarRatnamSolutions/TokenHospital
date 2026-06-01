import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function useFinancialReports() {
  // 1. State for Filters & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [method, setMethod] = useState('');
  const [dateRange, setDateRange] = useState('daily'); // daily, weekly, monthly
  // derive explicit startDate/endDate from the selected range to match backend
  const computeDateRange = (range: string) => {
    const today = new Date();
    const start = new Date(today);

    if (range === 'weekly') {
      start.setDate(today.getDate() - 7);
    } else if (range === 'monthly') {
      start.setMonth(today.getMonth() - 1);
    } else {
      // daily
      start.setHours(0, 0, 0, 0);
    }

    const format = (d: Date) => d.toISOString().split('T')[0];
    return { startDate: format(start), endDate: format(today) };
  };
  const { startDate, endDate } = computeDateRange(dateRange);

  // 2. Fetch Summary Stats
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['financialSummary', dateRange],
    queryFn: async () => {
      const response = await api.get('/api/reports/financial', {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
  });

  // 3. Fetch Detailed Transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', page, search, doctorId, departmentId, method, dateRange],
    queryFn: async () => {
      const response = await api.get('/api/reports/transactions', {
        params: {
          page,
          search,
          doctorId,
          departmentId,
          method,
          startDate,
          endDate,
          limit: 10,
        },
      });
      return response.data;
    },
  });

  // 4. Fetch Doctors for Filter
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: async () => {
      const response = await api.get('/api/doctor');
      // The backend returns { success: true, doctors: [...], ... }
      return response.data.doctors || response.data.data || [];
    },
  });

  // 5. Fetch Departments for Filter
  const { data: departmentsData } = useQuery({
    queryKey: ['departments-list'],
    queryFn: async () => {
      const response = await api.get('/api/department');
      // Check for both departments or data properties
      return response.data.departments || response.data.data || [];
    },
  });

  const [isExporting, setIsExporting] = useState(false);

  const stats = summaryData?.summary || {
    totalRevenue: 0,
    transactionCount: 0,
    avgTransactionValue: 0,
  };
  const methodSplit = summaryData?.methodSplit || [];

  const resetFilters = () => {
    setSearch('');
    setDoctorId('');
    setDepartmentId('');
    setMethod('');
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await api.get('/api/reports/export-transactions', {
        params: {
          search,
          doctorId,
          departmentId,
          method,
          startDate,
          endDate,
        },
        responseType: 'blob', // Important for binary files
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Set filename
      const filename = `Hospital_Report_${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    // ... rest of the return object
    page,
    setPage,
    search,
    setSearch,
    doctorId,
    setDoctorId,
    departmentId,
    setDepartmentId,
    method,
    setMethod,
    dateRange,
    setDateRange,

    // Data
    stats,
    methodSplit,
    transactions: transactionsData?.data || [],
    pagination: transactionsData?.pagination || { total: 0, pages: 1 },
    doctors: Array.isArray(doctorsData) ? doctorsData : [],
    departments: Array.isArray(departmentsData) ? departmentsData : [],

    // Loading states
    isLoading: transactionsLoading || summaryLoading,
    isExporting,

    // Actions
    resetFilters,
    handleExport,
  };
}
