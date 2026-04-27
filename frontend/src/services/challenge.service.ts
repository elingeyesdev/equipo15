import axiosInstance from '../api/axiosConfig';
import type {
  Challenge,
  ChallengeStatus,
  EvaluationCriterion,
  InnovationStatsResponse,
} from '../types/models';

export interface ChallengePayload {
  title: string;
  problemDescription?: string;
  companyContext?: string;
  participationRules?: string;
  startDate?: string;
  endDate?: string;
  publicationDate?: string;
  isPrivate?: boolean;
  status?: ChallengeStatus;
  facultyId?: number | null;
  logoUrl?: string;
  evaluationCriteria?: EvaluationCriterion[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const unwrapApiData = <T>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const challengeService = {
  getPublicChallenges: async (page = 1, limit = 10, status?: string): Promise<ApiResponse<{ data: Challenge[]; total: number }>> => {
    let url = `/challenges?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await axiosInstance.get<ApiResponse<{ data: Challenge[]; total: number }>>(url);
    return response.data;
  },

  getChallengeById: async (id: string): Promise<ApiResponse<Challenge>> => {
    const response = await axiosInstance.get<ApiResponse<Challenge>>(`/challenges/${id}`);
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

  getChallengeStats: async (id: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await axiosInstance.get<ApiResponse<Record<string, unknown>>>(`/challenges/${id}/stats`);
    return response.data;
  },

  getGlobalStats: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await axiosInstance.get<ApiResponse<Record<string, unknown>>>('/challenges/global-stats');
    return response.data;
  },

  getInnovationStats: async (): Promise<InnovationStatsResponse> => {
    const response = await axiosInstance.get<InnovationStatsResponse | ApiResponse<InnovationStatsResponse>>('/challenges/company/innovation-stats');
    return unwrapApiData(response.data);
  }
};
