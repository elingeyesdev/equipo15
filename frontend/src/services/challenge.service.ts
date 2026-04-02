import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

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

const ensureToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Usuario no autenticado');
  }
  return token;
};

export const challengeService = {
  getPublicChallenges: async () => {
    const response = await axios.get(`${API_URL}/challenges`);
    return response.data;
  },

  createChallenge: async (payload: ChallengePayload) => {
    const token = await ensureToken();
    const response = await axios.post(`${API_URL}/challenges`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateChallenge: async (id: string, payload: Partial<ChallengePayload>) => {
    const token = await ensureToken();
    const response = await axios.patch(`${API_URL}/challenges/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getChallengeStats: async (id: string) => {
    const response = await axios.get(`${API_URL}/challenges/${id}/stats`);
    return response.data;
  },

  getGlobalStats: async () => {
    const response = await axios.get(`${API_URL}/challenges/global-stats`);
    return response.data;
  }
};
