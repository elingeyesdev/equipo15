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
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
}

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
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('El límite de comentarios debe estar entre 1 y 100.');
  }
};

export const commentService = {
  getComments: async (params: GetCommentsParams): Promise<ApiResponse<CommentListResponse>> => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    assertUuid(params.ideaId, 'ideaId');
    if (params.parentCommentId) {
      assertUuid(params.parentCommentId, 'parentCommentId');
    }
    assertCommentPagination(page, limit);

    const query = new URLSearchParams({
      ideaId: params.ideaId,
      page: String(page),
      limit: String(limit),
      sort: params.sort ?? 'oldest',
    });

    if (params.parentCommentId) {
      query.set('parentCommentId', params.parentCommentId);
    }

    const response = await axiosInstance.get<ApiResponse<CommentListResponse>>(
      `/comentarios?${query.toString()}`,
    );
    return response.data;
  },

  createComment: async (payload: CreateCommentPayload): Promise<ApiResponse<Comment>> => {
    assertUuid(payload.ideaId, 'ideaId');
    if (payload.parentCommentId) {
      assertUuid(payload.parentCommentId, 'parentCommentId');
    }

    const response = await axiosInstance.post<ApiResponse<Comment>>('/comentarios', payload);
    return response.data;
  },

  replyToComment: async (commentId: string, content: string): Promise<ApiResponse<Comment>> => {
    assertUuid(commentId, 'commentId');
    if (!content.trim()) {
      throw new Error('La respuesta no puede estar vacía.');
    }

    const response = await axiosInstance.post<ApiResponse<Comment>>(
      `/comentarios/${commentId}/responder`,
      { content },
    );
    return response.data;
  },
};