export type SortMode = 'newest' | 'oldest' | 'likes' | 'comments';

export interface PlaneIdea {
  id: string;
  title: string;
  challengeTitle?: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  laneY: number;
  floatDelay: number;
  authorFacultyId?: number;
  problem?: string;
  solution?: string;
  hasVoted?: boolean;
  authorId: string;
  createdAt?: string;
  authorRealName?: string;
  authorStudentCode?: string;
  authorPhone?: string;
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
  phone?: string;
  studentCode?: string;
  role?: { name: string };
}

export interface RawIdea {
  _id?: string;
  id?: string;
  title: string;
  challengeTitle?: string;
  problem?: string;
  solution?: string;
  author?: RawAuthor;
  likesCount?: number;
  commentsCount?: number;
  isAnonymous?: boolean;
  hasVoted?: boolean;
  authorId?: string;
  createdAt?: string;
}

export interface AxiosLikeError {
  response?: {
    status: number;
  };
}
