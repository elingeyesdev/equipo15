import axiosInstance from '../api/axiosConfig';
import type { Comment, CommentListResponse, CreateCommentPayload } from '../types/models';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface GetCommentsParams {
  ideaId: string;
  parentCommentId?: string;
  includeReplies?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
}

const COMMENTS_CACHE_TTL_MS = 15_000;

interface CachedComments {
  timestamp: number;
  promise: Promise<ApiResponse<CommentListResponse>>;
}

const commentsCache = new Map<string, CachedComments>();

const buildCommentsCacheKey = (params: {
  ideaId: string;
  parentCommentId?: string;
  includeReplies?: boolean;
  page: number;
  limit: number;
  sort: 'newest' | 'oldest';
}) =>
  [
    params.ideaId,
    params.parentCommentId ?? 'root',
    params.includeReplies ? 'withReplies' : 'flat',
    params.page,
    params.limit,
    params.sort,
  ].join(':');

const invalidateCommentsCache = (ideaId?: string) => {
  if (!ideaId) {
    commentsCache.clear();
    return;
  }

  for (const key of commentsCache.keys()) {
    if (key.startsWith(`${ideaId}:`)) {
      commentsCache.delete(key);
    }
  }
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertUuid = (value: string, fieldName: string) => {
  if (!UUID_REGEX.test(value)) {
    throw new Error(`${fieldName} inválido.`);
  }
};

const assertCommentPagination = (page: number, limit: number) => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('El número de página debe ser un entero mayor o igual a 1.');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new Error('El límite de comentarios debe estar entre 1 y 500.');
  }
};

export const commentService = {
  getComments: async (params: GetCommentsParams): Promise<ApiResponse<CommentListResponse>> => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const sort = params.sort ?? 'oldest';

    assertUuid(params.ideaId, 'ideaId');
    if (params.parentCommentId) {
      assertUuid(params.parentCommentId, 'parentCommentId');
    }
    assertCommentPagination(page, limit);

    const query = new URLSearchParams({
      ideaId: params.ideaId,
      page: String(page),
      limit: String(limit),
      sort,
    });

    if (params.parentCommentId) {
      query.set('parentCommentId', params.parentCommentId);
    }
    if (params.includeReplies) {
      query.set('includeReplies', 'true');
    }

    const cacheKey = buildCommentsCacheKey({
      ideaId: params.ideaId,
      parentCommentId: params.parentCommentId,
      includeReplies: params.includeReplies,
      page,
      limit,
      sort,
    });

    const cached = commentsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < COMMENTS_CACHE_TTL_MS) {
      return cached.promise;
    }

    const request = axiosInstance
      .get<ApiResponse<CommentListResponse>>(`/comentarios?${query.toString()}`)
      .then((response) => response.data)
      .catch((error) => {
        commentsCache.delete(cacheKey);
        throw error;
      });

    commentsCache.set(cacheKey, { timestamp: Date.now(), promise: request });
    return request;
  },

  createComment: async (payload: CreateCommentPayload): Promise<ApiResponse<Comment>> => {
    assertUuid(payload.ideaId, 'ideaId');
    if (payload.parentCommentId) {
      assertUuid(payload.parentCommentId, 'parentCommentId');
    }

    const response = await axiosInstance.post<ApiResponse<Comment>>('/comentarios', payload);
    invalidateCommentsCache(payload.ideaId);
    return response.data;
  },

  replyToComment: async (
    commentId: string,
    content: string,
    ideaId?: string,
  ): Promise<ApiResponse<Comment>> => {
    assertUuid(commentId, 'commentId');
    if (!content.trim()) {
      throw new Error('La respuesta no puede estar vacía.');
    }

    const response = await axiosInstance.post<ApiResponse<Comment>>(
      `/comentarios/${commentId}/responder`,
      { content },
    );
    invalidateCommentsCache(ideaId);
    return response.data;
  },

  updateComment: async (
    commentId: string,
    content: string,
    ideaId?: string,
  ): Promise<ApiResponse<Comment>> => {
    assertUuid(commentId, 'commentId');
    if (!content.trim()) {
      throw new Error('El comentario no puede estar vacío.');
    }

    const response = await axiosInstance.patch<ApiResponse<Comment>>(
      `/comentarios/${commentId}`,
      { content },
    );
    invalidateCommentsCache(ideaId);
    return response.data;
  },

  withdrawComment: async (commentId: string, ideaId?: string): Promise<ApiResponse<{ success: boolean; removedCount: number }>> => {
    assertUuid(commentId, 'commentId');

    const response = await axiosInstance.delete<ApiResponse<{ success: boolean; removedCount: number }>>(
      `/comentarios/${commentId}`,
    );
    invalidateCommentsCache(ideaId);
    return response.data;
  },

  invalidateCommentsCache,
};