import axiosInstance from '@/api/axiosConfig';
import type { ApiResponse } from '@/types/api';

export interface EvaluationCriterionScore {
  score: number;
  criterion: {
    id: string;
    name: string;
    description?: string | null;
    weight: number;
  };
}

export interface EvaluationBreakdownItem {
  id: string;
  feedback?: string | null;
  createdAt: string;
  judgeScore: number;
  judge: {
    id: string;
    displayName: string | null;
    nickname: string | null;
    email: string;
    avatarUrl: string | null;
  };
  scores: EvaluationCriterionScore[];
}

export interface IdeaEvaluationBreakdown {
  ideaId: string;
  ideaTitle: string;
  challengeId: string;
  challengeTitle: string;
  finalScore: number;
  summary: {
    judgesCount: number;
    averageJudgeScore: number;
    averageFinalScore: number;
    criteriaAverages: {
      id: string;
      name: string;
      weight: number;
      averageScore: number;
    }[];
  };
  evaluations: EvaluationBreakdownItem[];
}

const unwrapApiData = <T>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const evaluationService = {
  getByIdea: async (ideaId: string): Promise<IdeaEvaluationBreakdown> => {
    const response = await axiosInstance.get<
      IdeaEvaluationBreakdown | ApiResponse<IdeaEvaluationBreakdown>
    >(`/evaluations/idea/${ideaId}`);
    return unwrapApiData(response.data);
  },
};
