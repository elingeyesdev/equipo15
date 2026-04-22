export type SortMode = 'newest' | 'oldest' | 'likes' | 'comments';

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
  hasVoted?: boolean;
  createdAt?: string;
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

export interface RawAuthor {
  displayName?: string;
  nickname?: string;
  email?: string;
  facultyId?: number;
}

export interface RawIdea {
  _id?: string;
  id?: string;
  title: string;
  problem?: string;
  solution?: string;
  author?: RawAuthor;
  likesCount?: number;
  commentsCount?: number;
  isAnonymous?: boolean;
  hasVoted?: boolean;
  createdAt?: string;
}

export interface AxiosLikeError {
  response?: {
    status: number;
  };
}
