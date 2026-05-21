import axiosInstance from '@/api/axiosConfig';
import type { ApiResponse } from '@/types/api';
import type { CompanySupportItem, GlobalAnalytics, ImpersonationSession } from '@/types/models';

const unwrapApiData = <T>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const adminService = {
  async getGlobalAnalytics(): Promise<GlobalAnalytics> {
    const response = await axiosInstance.get<GlobalAnalytics | ApiResponse<GlobalAnalytics>>(
      '/admin/analytics/global',
    );
    return unwrapApiData(response.data);
  },

  async getCompanies(): Promise<CompanySupportItem[]> {
    const response = await axiosInstance.get<CompanySupportItem[] | ApiResponse<CompanySupportItem[]>>(
      '/admin/companies',
    );
    return unwrapApiData(response.data);
  },

  async impersonateCompany(companyId: string): Promise<ImpersonationSession> {
    const response = await axiosInstance.post<ImpersonationSession | ApiResponse<ImpersonationSession>>(
      `/admin/companies/${companyId}/impersonate`,
    );
    return unwrapApiData(response.data);
  },
};
