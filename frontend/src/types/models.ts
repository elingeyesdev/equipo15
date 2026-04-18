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
  bio?: string;
  avatarUrl?: string;
  facultyId?: number;
  career?: string;
  specialty?: string;
}

export type ChallengeStatus = 'Borrador' | 'Activo' | 'Finalizado' | 'En Evaluación';

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
