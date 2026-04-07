import axiosInstance from '../api/axiosConfig';

export type IdeaStatus = 'draft' | 'public' | 'top5' | 'archived';

export interface CreateIdeaPayload {
  title: string;
  problem: string;
  solution: string;
  author: string;
  challengeId: string;
  tags?: string[];
  status?: IdeaStatus;
  isAnonymous?: boolean;
}

export interface CreateDraftIdeaPayload {
  title?: string;
  problem?: string;
  solution?: string;
  author: string;
  challengeId?: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export const ideaService = {
  getAllIdeas: async () => {
    const response = await axiosInstance.get('/ideas');
    return response.data;
  },

  createIdea: async (payload: CreateIdeaPayload) => {
    const response = await axiosInstance.post('/ideas', payload);
    return response.data;
  },

  saveDraftIdea: async (payload: CreateDraftIdeaPayload) => {
    const response = await axiosInstance.post('/ideas/drafts', payload);
    return response.data;
  },
};
