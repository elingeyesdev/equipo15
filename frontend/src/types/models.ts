export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  firebaseUid: string;
  roleId: string;
  roleInfo?: Role;
  role?: string;
  avatarUrl?: string;
  bio?: string;
  nickname?: string;
  phone?: string;
  studentCode?: string;
  studentProfile?: { studentCode?: string; facultyId?: string; enrollmentYear?: number; faculty?: { id: string; name: string } | null; };
  facultyName?: string;
  facultyId?: string | number | null;
  career?: string;
  specialty?: string;
  institution?: string;
  ageRange?: string;
  status?: 'ACTIVE' | 'SOFT_BLOCK' | 'SUSPENDED' | 'DELETED';
  penaltyExpiresAt?: string | Date;
  sessionMode?: 'LIVE' | 'READ_ONLY';
  impersonationCompanyId?: string;
  impersonationCompanyName?: string;
  originalAdminUid?: string;
  impersonationReadOnly?: boolean;
}

export type ChallengeStatus = 'Borrador' | 'Activo' | 'Finalizado' | 'En Evaluación' | 'DRAFT' | 'PUBLISHED' | 'EVALUATING' | 'CLOSED';

export interface EvaluationCriterion {
  id: string;           // 'desirability' | 'feasibility' | 'alignment' | 'viability' | 'speed' | 'scalability' | custom uuid
  name: string;
  description?: string;
  enabled: boolean;
  weight: number;       // 1-100
  isCustom?: boolean;
  isOptional?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  problemDescription?: string;
  companyContext?: string;
  participationRules?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  publicationDate?: string | Date;
  isPrivate: boolean;
  status: ChallengeStatus;
  facultyId?: string | number | null;
  faculty?: { id: string; name: string } | null;

  category?: string;
  badge?: string;
  ideasCount?: number;
  likesCount?: number;
  commentsCount?: number;
  logoUrl?: string;
  evaluationCriteria?: EvaluationCriterion[];
  publishedAt?: string | Date;
  submissionsOpenAt?: string | Date;
  submissionsCloseAt?: string | Date;
}

export interface InnovationIdeasByFacultyItem {
  facultyId: number;
  facultyName: string;
  ideasCount: number;
  votesCount: number;
}

export interface InnovationInteractionByDayItem {
  date: string;
  likes: number;
  comments: number;
}

export interface InnovationMostActiveUser {
  name: string;
  ideaCount: number;
}

export interface InnovationLeadingFaculty {
  facultyId: number;
  facultyName: string;
  ideasCount: number;
}

export interface InnovationStatsResponse {
  ideasByFaculty: InnovationIdeasByFacultyItem[];
  interactionsByDay: InnovationInteractionByDayItem[];
  kpis: {
    totalIdeas: number;
    totalVotes: number;
    mostActiveUser: InnovationMostActiveUser | null;
    leadingFaculty: InnovationLeadingFaculty | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export type IdeaStatus = 'draft' | 'public' | 'top5' | 'archived' | 'DRAFT' | 'PUBLISHED' | 'FINALIST' | 'WINNER' | 'DISQUALIFIED';

export type CommentStatus = 'visible' | 'hidden' | 'deleted' | 'VISIBLE' | 'HIDDEN' | 'FLAGGED';

export interface CommentAuthor {
  id: string;
  displayName: string;
  nickname?: string;
  avatarUrl?: string;
  role?: string;
  facultyId?: number;
}

export interface Comment {
  id: string;
  ideaId: string;
  authorId: string;
  parentCommentId?: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  editedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  author?: CommentAuthor;
  replies?: Comment[];
  canWithdraw?: boolean;
  canEdit?: boolean;
}

export interface CommentListResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCommentPayload {
  content: string;
  ideaId: string;
  parentCommentId?: string;
}

export interface Idea {
  id: string;
  title: string;
  problem: string;
  solution: string;
  status: IdeaStatus;
  votesCount: number;
  likesCount: number;
  commentsCount: number;
  isAnonymous: boolean;
  tags: string[];
  authorId: string;
  challengeId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  favoritesCount?: number;
  multimediaLinks?: string[];
  finalScore?: number;
}

export interface ChallengeAnalytics {
  all: number;
  active: number;
}

export interface ChallengePerformance {
  id: string;
  title: string;
  companyName: string;
  status: string;
  totalInteractions: number;
  averageScore: number | null;
}

export interface GlobalAnalytics {
  totalCompanies: number;
  totalChallenges: ChallengeAnalytics;
  totalIdeas: number;
  challengesPerformance: ChallengePerformance[];
}

export interface CompanySupportItem {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  status: 'ACTIVE' | 'SOFT_BLOCK' | 'SUSPENDED';
  activeChallenges: number;
  closedChallenges: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ImpersonationSession {
  token: string;
  expiresAt: string;
  readOnly: true;
  sessionMode: 'READ_ONLY';
  company: CompanySupportItem;
}

export interface AllowedDomain {
  id: string;
  domain: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface FacultyCatalogItem {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

