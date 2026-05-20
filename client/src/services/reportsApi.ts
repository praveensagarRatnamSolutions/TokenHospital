import api from './api';

export interface SuperAdminReportParams {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  hospitalId?: string;
  hospitalStatus?: string;
  subscriptionStatus?: string;
  transactionType?: string;
}

const toQueryString = (params?: SuperAdminReportParams) => {
  const queryParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value && value !== 'ALL') {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString();
};

export const reportsApi = {
  getSuperAdminReports: async (params?: SuperAdminReportParams) => {
    const query = toQueryString(params);
    const response = await api.get(
      `/api/reports/superadmin-dashboard${query ? `?${query}` : ''}`,
    );
    return response.data.data;
  },

  exportSuperAdminReports: async (params?: SuperAdminReportParams) => {
    const query = toQueryString(params);
    const response = await api.get(
      `/api/reports/superadmin-dashboard/export${query ? `?${query}` : ''}`,
      {
        responseType: 'blob',
      },
    );
    return response.data;
  },
};
