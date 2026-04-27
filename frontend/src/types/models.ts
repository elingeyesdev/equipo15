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
  facultyId?: number;
  career?: string;
  specialty?: string;
  status?: 'ACTIVE' | 'SOFT_BLOCK' | 'SUSPENDED';
  penaltyExpiresAt?: string | Date;
}

export type ChallengeStatus = 'Borrador' | 'Activo' | 'Finalizado' | 'En Evaluación';

export interface EvaluationCriterion {
  id: string;           // 'desirability' | 'feasibility' | 'viability' | custom uuid
  name: string;
  enabled: boolean;
  weight: number;       // 1-100
  isCustom?: boolean;
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
  facultyId?: number;

  category?: string;
  badge?: string;
  ideasCount?: number;
  likesCount?: number;
  logoUrl?: string;
  evaluationCriteria?: EvaluationCriterion[];
}

export interface InnovationIdeasByFacultyItem {
  facultyId: number;
  facultyName: string;
  ideasCount: number;
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

export type IdeaStatus = 'draft' | 'public' | 'top5' | 'archived';

export type CommentStatus = 'visible' | 'hidden' | 'deleted';

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
}
