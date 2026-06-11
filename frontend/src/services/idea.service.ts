import axiosInstance from '@/api/axiosConfig';
import type { ApiResponse } from '@/types/api';
import type { IdeaStatus } from '@/types/models';

type PublicIdeasResponse = ApiResponse<{ data: unknown[]; total: number }>;

const PUBLIC_IDEAS_CACHE_TTL_MS = 60_000;
const publicIdeasCache = new Map<string, { timestamp: number; promise: Promise<PublicIdeasResponse> }>();


export interface CreateIdeaPayload {
  title: string;
  problem: string;
  solution: string;
  challengeId: string;
  tags?: string[];
  status?: IdeaStatus;
  isAnonymous?: boolean;
  impactArea?: 'PRODUCTIVITY' | 'COSTS' | 'CUSTOMERS' | 'TEAM' | 'GROWTH' | 'SUSTAINABILITY' | 'SOCIAL_IMPACT';
  improvementType?: 'OPTIMIZES' | 'ENHANCES' | 'EXPANDS' | 'TRANSFORMS';
  effortLevel?: 'EASY' | 'COORDINATION' | 'DEVELOPMENT' | 'TRANSFORMATION';
}

export interface CreateDraftIdeaPayload {
  title?: string;
  problem?: string;
  solution?: string;
  challengeId?: string;
  tags?: string[];
  isAnonymous?: boolean;
  impactArea?: 'PRODUCTIVITY' | 'COSTS' | 'CUSTOMERS' | 'TEAM' | 'GROWTH' | 'SUSTAINABILITY' | 'SOCIAL_IMPACT';
  improvementType?: 'OPTIMIZES' | 'ENHANCES' | 'EXPANDS' | 'TRANSFORMS';
  effortLevel?: 'EASY' | 'COORDINATION' | 'DEVELOPMENT' | 'TRANSFORMATION';
}

export interface IdeaDraft {
  id: string;
  title: string;
  problem: string;
  solution: string;
  status: string;
  impactArea?: string | null;
  improvementType?: string | null;
  effortLevel?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  challengeId: string;
  tags: string[];
  challenge?: {
    id: string;
    title: string;
    status: string;
    facultyId?: number | null;
    faculty?: { id: string; name: string } | null;
  };
}

export interface UpdateIdeaPayload {
  title?: string;
  problem?: string;
  solution?: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export const ideaService = {
  getAllIdeas: async () => {
    const response = await axiosInstance.get('/ideas');
    return response.data;
  },

  getPublicIdeas: async (page = 1, limit = 100): Promise<PublicIdeasResponse> => {
    const cacheKey = `${page}:${limit}`;
    const cached = publicIdeasCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < PUBLIC_IDEAS_CACHE_TTL_MS) {
      return cached.promise;
    }

    const request = axiosInstance
      .get<PublicIdeasResponse>(`/ideas?public=true&page=${page}&limit=${limit}`)
      .then(response => response.data)
      .catch(error => {
        publicIdeasCache.delete(cacheKey);
        throw error;
      });

    publicIdeasCache.set(cacheKey, { timestamp: Date.now(), promise: request });
    return request;
  },

  getIdeasByChallenge: async (challengeId?: string, search?: string, sort?: string) => {
    let url = `/ideas?public=true`;
    if (challengeId) url += `&challengeId=${challengeId}`;
    if (search && search.trim().length > 0) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (sort) url += `&sort=${sort}`;
    const response = await axiosInstance.get(url);
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

  updateDraftIdea: async (draftId: string, payload: CreateDraftIdeaPayload) => {
    const response = await axiosInstance.patch(`/ideas/${draftId}/draft`, payload);
    return response.data;
  },

  getMyDrafts: async (): Promise<IdeaDraft[]> => {
    const response = await axiosInstance.get('/ideas/me/drafts');
    const body = response.data;
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    return [];
  },

  deleteDraftIdea: async (draftId: string) => {
    const response = await axiosInstance.delete(`/ideas/${draftId}/draft`);
    return response.data;
  },

  voteIdea: async (ideaId: string, reactionType?: string | null) => {
    const response = await axiosInstance.post(`/ideas/${ideaId}/like`, { reactionType });
    return response.data;
  },

  favoriteIdea: async (ideaId: string) => {
    const response = await axiosInstance.post(`/ideas/${ideaId}/favorite`);
    return response.data;
  },

  getMyFavorites: async () => {
    const response = await axiosInstance.get('/ideas/me/favorites');
    return response.data;
  },

  updateIdea: async (ideaId: string, payload: UpdateIdeaPayload) => {
    const response = await axiosInstance.patch(`/ideas/${ideaId}`, payload);
    return response.data;
  },

  getMyIdeas: async () => {
    const response = await axiosInstance.get('/ideas/me');
    return response.data;
  },
};
