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

export const commentService = {
  getComments: async (params: GetCommentsParams): Promise<ApiResponse<CommentListResponse>> => {
    const query = new URLSearchParams({
      ideaId: params.ideaId,
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
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
    const response = await axiosInstance.post<ApiResponse<Comment>>('/comentarios', payload);
    return response.data;
  },

  replyToComment: async (commentId: string, content: string): Promise<ApiResponse<Comment>> => {
    const response = await axiosInstance.post<ApiResponse<Comment>>(
      `/comentarios/${commentId}/responder`,
      { content },
    );
    return response.data;
  },
};