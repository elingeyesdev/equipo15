import axiosInstance from '../api/axiosConfig';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type PublicIdeasResponse = ApiResponse<{ data: unknown[]; total: number }>;

const PUBLIC_IDEAS_CACHE_TTL_MS = 60_000;
const publicIdeasCache = new Map<string, { timestamp: number; promise: Promise<PublicIdeasResponse> }>();

export type IdeaStatus = 'draft' | 'public' | 'top5' | 'archived';

export interface CreateIdeaPayload {
  title: string;
  problem: string;
  solution: string;
  challengeId: string;
  tags?: string[];
  status?: IdeaStatus;
  isAnonymous?: boolean;
}

export interface CreateDraftIdeaPayload {
  title?: string;
  problem?: string;
  solution?: string;
  challengeId?: string;
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

  getIdeasByChallenge: async (challengeId: string) => {
    const response = await axiosInstance.get(`/ideas?public=true&challengeId=${challengeId}`);
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
