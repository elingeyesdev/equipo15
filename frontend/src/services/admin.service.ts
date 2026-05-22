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

  async getWhitelist(): Promise<import('@/types/models').AllowedDomain[]> {
    try {
      const response = await axiosInstance.get<import('@/types/models').AllowedDomain[] | ApiResponse<import('@/types/models').AllowedDomain[]>>(
        '/admin/whitelist-domains',
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.get<import('@/types/models').AllowedDomain[] | ApiResponse<import('@/types/models').AllowedDomain[]>>(
        '/admin/whitelist',
      );
      return unwrapApiData(response.data);
    }
  },

  async addDomain(domain: string): Promise<import('@/types/models').AllowedDomain> {
    try {
      const response = await axiosInstance.post<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
        '/admin/whitelist-domains',
        { domain },
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.post<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
        '/admin/whitelist',
        { domain },
      );
      return unwrapApiData(response.data);
    }
  },

  async removeDomain(id: string): Promise<import('@/types/models').AllowedDomain> {
    try {
      const response = await axiosInstance.delete<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
        `/admin/whitelist-domains/${id}`,
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.delete<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
        `/admin/whitelist/${id}`,
      );
      return unwrapApiData(response.data);
    }
  },

  async setDomainStatus(id: string, isActive: boolean): Promise<import('@/types/models').AllowedDomain> {
    try {
      const response = await axiosInstance.patch<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
        `/admin/whitelist-domains/${id}/status`,
        { isActive },
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.patch<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
        `/admin/whitelist/${id}/status`,
        { isActive },
      );
      return unwrapApiData(response.data);
    }
  },

  async getFaculties(): Promise<import('@/types/models').FacultyCatalogItem[]> {
    try {
      const response = await axiosInstance.get<import('@/types/models').FacultyCatalogItem[] | ApiResponse<import('@/types/models').FacultyCatalogItem[]>>(
        '/users/faculties',
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.get<import('@/types/models').FacultyCatalogItem[] | ApiResponse<import('@/types/models').FacultyCatalogItem[]>>(
        '/admin/facultades',
      );
      return unwrapApiData(response.data);
    }
  },

  async addFaculty(name: string): Promise<import('@/types/models').FacultyCatalogItem> {
    try {
      const response = await axiosInstance.post<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
        '/users/faculties',
        { name },
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.post<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
        '/admin/facultades',
        { name },
      );
      return unwrapApiData(response.data);
    }
  },

  async updateFaculty(id: string, name: string): Promise<import('@/types/models').FacultyCatalogItem> {
    try {
      const response = await axiosInstance.put<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
        `/users/faculties/${id}`,
        { name },
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.put<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
        `/admin/facultades/${id}`,
        { name },
      );
      return unwrapApiData(response.data);
    }
  },

  async setFacultyStatus(id: string, isActive: boolean): Promise<import('@/types/models').FacultyCatalogItem> {
    try {
      const response = await axiosInstance.patch<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
        `/users/faculties/${id}/status`,
        { isActive },
      );
      return unwrapApiData(response.data);
    } catch (error) {
      const response = await axiosInstance.patch<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
        `/admin/facultades/${id}/status`,
        { isActive },
      );
      return unwrapApiData(response.data);
    }
  },
};

