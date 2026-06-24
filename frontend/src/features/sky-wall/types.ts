export type SortMode = 'newest' | 'oldest' | 'likes' | 'comments';

export interface PlaneIdea {
  id: string;
  title: string;
  challengeTitle?: string;
  challengeId?: string;
  authorName: string;
  authorAvatar?: string;
  likesCount: number;
  commentsCount: number;
  fireScore?: number;
  finalScore?: number;
  goodCount?: number;
  futureCount?: number;
  complexCount?: number;
  laneY: number;
  floatDelay: number;
  authorFacultyId?: number | string;
  authorFacultyName?: string;
  problem?: string;
  solution?: string;
  hasVoted?: boolean;
  hasFavorited?: boolean;
  votedType?: string | null;
  authorId: string;
  createdAt?: string;
  authorRealName?: string;
  authorStudentCode?: string;
  authorPhone?: string;
  challengeStatus?: string;
}

export type WallPhase = 'active' | 'race' | 'podium';

export interface IdeaUpdatedPayload {
  id: string;
  likesCount: number;
  commentsCount: number;
  fireScore?: number;
}

export interface IdeaVotedPayload {
  ideaId: string;
  likesCount: number;
  fireScore?: number;
  challengeId: string;
}

export interface RawAuthor {
  displayName?: string;
  nickname?: string;
  email?: string;
  facultyId?: number | string;
  faculty?: { name: string };
  studentProfile?: { facultyId?: string; faculty?: { name?: string }; };
  phone?: string;
  studentCode?: string;
  role?: { name: string };
  avatarUrl?: string;
}

export interface RawIdea {
  _id?: string;
  id?: string;
  title: string;
  challengeTitle?: string;
  challengeId?: string;
  problem?: string;
  solution?: string;
  author?: RawAuthor;
  likesCount?: number;
  commentsCount?: number;
  fireScore?: number;
  finalScore?: number;
  goodCount?: number;
  futureCount?: number;
  complexCount?: number;
  isAnonymous?: boolean;
  hasVoted?: boolean;
  hasFavorited?: boolean;
  authorId?: string;
  createdAt?: string;
}

export interface AxiosLikeError {
  response?: {
    status: number;
  };
}
