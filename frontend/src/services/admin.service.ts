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
    const response = await axiosInstance.get<import('@/types/models').AllowedDomain[] | ApiResponse<import('@/types/models').AllowedDomain[]>>(
      '/admin/whitelist-domains',
    );
    return unwrapApiData(response.data);
  },

  async addDomain(domain: string): Promise<import('@/types/models').AllowedDomain> {
    const response = await axiosInstance.post<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
      '/admin/whitelist-domains',
      { domain },
    );
    return unwrapApiData(response.data);
  },

  async removeDomain(id: string): Promise<import('@/types/models').AllowedDomain> {
    const response = await axiosInstance.delete<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
      `/admin/whitelist-domains/${id}`,
    );
    return unwrapApiData(response.data);
  },

  async setDomainStatus(id: string, isActive: boolean): Promise<import('@/types/models').AllowedDomain> {
    const response = await axiosInstance.patch<import('@/types/models').AllowedDomain | ApiResponse<import('@/types/models').AllowedDomain>>(
      `/admin/whitelist-domains/${id}/status`,
      { isActive },
    );
    return unwrapApiData(response.data);
  },

  async getFaculties(): Promise<import('@/types/models').FacultyCatalogItem[]> {
    const response = await axiosInstance.get<import('@/types/models').FacultyCatalogItem[] | ApiResponse<import('@/types/models').FacultyCatalogItem[]>>(
      '/users/faculties',
    );
    return unwrapApiData(response.data);
  },

  async addFaculty(name: string): Promise<import('@/types/models').FacultyCatalogItem> {
    const response = await axiosInstance.post<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
      '/users/faculties',
      { name },
    );
    return unwrapApiData(response.data);
  },

  async updateFaculty(id: string, name: string): Promise<import('@/types/models').FacultyCatalogItem> {
    const response = await axiosInstance.put<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
      `/users/faculties/${id}`,
      { name },
    );
    return unwrapApiData(response.data);
  },

  async setFacultyStatus(id: string, isActive: boolean): Promise<import('@/types/models').FacultyCatalogItem> {
    const response = await axiosInstance.patch<import('@/types/models').FacultyCatalogItem | ApiResponse<import('@/types/models').FacultyCatalogItem>>(
      `/users/faculties/${id}/status`,
      { isActive },
    );
    return unwrapApiData(response.data);
  },

  async searchUsers(
    search?: string,
    role?: string,
    page = 1,
    limit = 20,
  ): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const response = await axiosInstance.get(`/admin/users?${params.toString()}`);
    return unwrapApiData(response.data);
  },

  async updateUserRole(userId: string, role: string): Promise<any> {
    const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
    return unwrapApiData(response.data);
  },

  async getUserReputation(userId: string): Promise<import('@/types/models').UserReputation> {
    const response = await axiosInstance.get<import('@/types/models').UserReputation | ApiResponse<import('@/types/models').UserReputation>>(
      `/admin/users/${userId}/reputation`,
    );
    return unwrapApiData(response.data);
  },

  async getChallengeAuditIdeas(challengeId: string): Promise<{
    challenge: { id: string; title: string; status: string };
    ideas: Array<{
      id: string;
      title: string;
      status: string;
      finalScore: number;
      createdAt: string;
      authorName: string;
      evaluationsCount: number;
    }>;
  }> {
    const response = await axiosInstance.get(`/admin/challenges/${challengeId}/audit-ideas`);
    return unwrapApiData(response.data);
  },

  async moderateComment(commentId: string, reason: string): Promise<any> {
    const response = await axiosInstance.patch(`/admin/comments/${commentId}/moderate`, { reason });
    return unwrapApiData(response.data);
  },
};
