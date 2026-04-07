import axiosInstance from '../api/axiosConfig';
import type { Challenge, ChallengeStatus } from '../types/models';

export interface ChallengePayload {
  title: string;
  problemDescription?: string;
  companyContext?: string;
  participationRules?: string;
  startDate: string;
  endDate: string;
  publicationDate?: string;
  isPrivate?: boolean;
  status?: ChallengeStatus;
  facultyId?: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const challengeService = {
  getPublicChallenges: async (page = 1, limit = 10, status?: string): Promise<ApiResponse<{ data: Challenge[]; total: number }>> => {
    let url = `/challenges?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await axiosInstance.get<ApiResponse<{ data: Challenge[]; total: number }>>(url);
    return response.data;
  },

  createChallenge: async (payload: ChallengePayload): Promise<ApiResponse<Challenge>> => {
    const response = await axiosInstance.post<ApiResponse<Challenge>>('/challenges', payload);
    return response.data;
  },

  updateChallenge: async (id: string, payload: Partial<ChallengePayload>): Promise<ApiResponse<Challenge>> => {
    const response = await axiosInstance.patch<ApiResponse<Challenge>>(`/challenges/${id}`, payload);
    return response.data;
  },

  getChallengeStats: async (id: string): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get<ApiResponse<any>>(`/challenges/${id}/stats`);
    return response.data;
  },

  getGlobalStats: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get<ApiResponse<any>>('/challenges/global-stats');
    return response.data;
  }
};
