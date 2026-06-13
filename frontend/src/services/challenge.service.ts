import axiosInstance from '@/api/axiosConfig';
import type {
  Challenge,
  ChallengeStatus,
  EvaluationCriterion,
  InnovationStatsResponse,
} from '@/types/models';
import type { ApiResponse } from '@/types/api';

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
  facultyId?: string | number | null;
  logoUrl?: string;
  evaluationCriteria?: EvaluationCriterion[];
}

export interface CriterionItem {
  id: string;
  name: string;
  description?: string;
  weight: number;
}

export interface CompanyChallengeOption {
  id: string;
  title: string;
  status: ChallengeStatus;
  facultyId?: string | number | null;
  facultyName?: string | null;
  faculty?: { id?: string | number; name?: string } | null;
  endDate?: string;
  publicationDate?: string;
  submissionsCloseAt?: string;
  publishedAt?: string;
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

  deleteChallenge: async (id: string): Promise<ApiResponse<Challenge>> => {
    const response = await axiosInstance.delete<ApiResponse<Challenge>>(`/challenges/${id}`);
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

  getInnovationStats: async (challengeId?: string): Promise<InnovationStatsResponse> => {
    const query = challengeId ? `?challengeId=${encodeURIComponent(challengeId)}` : '';
    const response = await axiosInstance.get<InnovationStatsResponse | ApiResponse<InnovationStatsResponse>>(`/challenges/company/innovation-stats${query}`);
    return unwrapApiData(response.data);
  },

  getCompanyChallenges: async (): Promise<CompanyChallengeOption[]> => {
    const response = await axiosInstance.get<ApiResponse<CompanyChallengeOption[]> | CompanyChallengeOption[]>('/challenges/company/challenges');
    return unwrapApiData(response.data);
  },

  getPodiumIdeas: async (id: string): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]> | any[]>(`/challenges/${id}/podium-ideas`);
    return unwrapApiData(response.data);
  },

  getPodiumStatus: async (id: string): Promise<{
    challengeId: string;
    status: string;
    phase: 'SELECT_FINALISTS' | 'AWAITING_JUDGES' | 'COMPLETED';
    podiumSize: number | null;
    finalistCount: number;
    winnerCount: number;
    evaluationCount: number;
    assignedJudgesCount: number;
    ideasWithEvaluations: number;
    canGenerateResults: boolean;
  }> => {
    const response = await axiosInstance.get(`/challenges/${id}/podium-status`);
    return unwrapApiData(response.data);
  },

  finalizePodium: async (id: string, payload: { category: string; limit: number }): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/challenges/${id}/finalize-podium`, payload);
    return response.data;
  },

  getJudgeAssignedChallenges: async (): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]> | any[]>('/challenges/judge/assigned-challenges');
    return unwrapApiData(response.data);
  },

  getJudgeAssignedIdeas: async (): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]> | any[]>('/challenges/judge/assigned-ideas');
    return unwrapApiData(response.data);
  },

  getChallengeCriteria: async (challengeId: string): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]> | any[]>(`/challenges/${challengeId}/criteria`);
    return unwrapApiData(response.data);
  },

  submitEvaluation: async (payload: {
    ideaId: string;
    judgeId: string;
    feedback?: string;
    scores: { criterionId: string; score: number }[];
  }): Promise<any> => {
    const response = await axiosInstance.post<ApiResponse<any>>('/evaluations', payload);
    return unwrapApiData(response.data);
  },

  downloadEvaluationExcel: async (challengeId: string): Promise<void> => {
    const response = await axiosInstance.get(`/challenges/${challengeId}/export-evaluations`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Try to extract filename from Content-Disposition header
    const disposition = response.headers['content-disposition'];
    let fileName = `evaluaciones_${challengeId}.xlsx`;
    if (disposition) {
      const match = disposition.match(/filename="?([^";\n]+)"?/);
      if (match?.[1]) fileName = match[1];
    }

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  getMyEvaluations: async (): Promise<any[]> => {
    const response = await axiosInstance.get<ApiResponse<any[]> | any[]>('/evaluations/me');
    return unwrapApiData(response.data);
  },

  closeChallenge: async (id: string): Promise<any> => {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/challenges/${id}/close`);
    return unwrapApiData(response.data);
  },
};
