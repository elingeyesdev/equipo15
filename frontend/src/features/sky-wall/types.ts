export interface PlaneIdea {
  id: string;
  title: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  laneY: number;
  floatDelay: number;
}

export type WallPhase = 'active' | 'race' | 'podium';

export interface IdeaUpdatedPayload {
  id: string;
  likesCount: number;
  commentsCount: number;
}
