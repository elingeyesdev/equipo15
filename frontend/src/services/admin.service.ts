import axiosInstance from '@/api/axiosConfig';
import type { ApiResponse } from '@/types/api';
import type { GlobalAnalytics } from '@/types/models';

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
};
