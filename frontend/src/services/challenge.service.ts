import axiosInstance from '../api/axiosConfig';

export interface ChallengePayload {
  title: string;
  problemDescription?: string;
  companyContext?: string;
  participationRules?: string;
  startDate: string;
  endDate: string;
  publicationDate?: string;
  isPrivate?: boolean;
  status?: 'Borrador' | 'Activo' | 'Finalizado' | 'En Evaluación';
}

export const challengeService = {
  getPublicChallenges: async (page = 1, limit = 10, status?: string) => {
    let url = `/challenges?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  createChallenge: async (payload: ChallengePayload) => {
    const response = await axiosInstance.post('/challenges', payload);
    return response.data;
  },

  updateChallenge: async (id: string, payload: Partial<ChallengePayload>) => {
    const response = await axiosInstance.patch(`/challenges/${id}`, payload);
    return response.data;
  },

  getChallengeStats: async (id: string) => {
    const response = await axiosInstance.get(`/challenges/${id}/stats`);
    return response.data;
  },

  getGlobalStats: async () => {
    const response = await axiosInstance.get('/challenges/global-stats');
    return response.data;
  }
};
