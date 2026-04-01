import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

export type IdeaStatus = 'draft' | 'public' | 'top5' | 'archived';

export interface CreateIdeaPayload {
  title: string;
  description: string;
  author: string;
  tags?: string[];
  status?: IdeaStatus;
  isAnonymous?: boolean;
}

export interface CreateDraftIdeaPayload {
  title?: string;
  description?: string;
  author: string;
  tags?: string[];
  isAnonymous?: boolean;
}

const ensureToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Usuario no autenticado');
  }
  return token;
};

export const ideaService = {
  getAllIdeas: async () => {
    const token = await ensureToken();
    const response = await axios.get(`${API_URL}/ideas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createIdea: async (payload: CreateIdeaPayload) => {
    const token = await ensureToken();
    const response = await axios.post(`${API_URL}/ideas`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  saveDraftIdea: async (payload: CreateDraftIdeaPayload) => {
    const token = await ensureToken();
    const response = await axios.post(`${API_URL}/ideas/drafts`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
