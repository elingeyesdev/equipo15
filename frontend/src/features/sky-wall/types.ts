export interface PlaneIdea {
  id: string;
  title: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  laneY: number;
  floatDelay: number;
  authorFacultyId?: number;
  problem?: string;
  solution?: string;
}

export type WallPhase = 'active' | 'race' | 'podium';

export interface IdeaUpdatedPayload {
  id: string;
  likesCount: number;
  commentsCount: number;
}
export interface IdeaVotedPayload {
  ideaId: string;
  likesCount: number;
  challengeId: string;
}
