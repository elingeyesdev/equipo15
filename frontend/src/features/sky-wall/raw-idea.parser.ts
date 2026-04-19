import type { RawIdea, RawAuthor } from './types';

const parseAuthor = (author: unknown): RawAuthor | undefined => {
  if (typeof author !== 'object' || author === null) return undefined;

  const record = author as Record<string, unknown>;
  return {
    displayName: typeof record.displayName === 'string' ? record.displayName : undefined,
    email: typeof record.email === 'string' ? record.email : undefined,
    facultyId: typeof record.facultyId === 'number' ? record.facultyId : undefined,
  };
};

const parseRawIdea = (item: Record<string, unknown>): RawIdea => ({
  _id: typeof item._id === 'string' ? item._id : undefined,
  id: typeof item.id === 'string' ? item.id : undefined,
  title: typeof item.title === 'string' ? item.title : 'Idea sin titulo',
  problem: typeof item.problem === 'string' ? item.problem : undefined,
  solution: typeof item.solution === 'string' ? item.solution : undefined,
  author: parseAuthor(item.author),
  likesCount: typeof item.likesCount === 'number' ? item.likesCount : 0,
  commentsCount: typeof item.commentsCount === 'number' ? item.commentsCount : 0,
  isAnonymous: typeof item.isAnonymous === 'boolean' ? item.isAnonymous : false,
  hasVoted: typeof item.hasVoted === 'boolean' ? item.hasVoted : false,
  createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
});

export const extractRawIdeas = (payload: unknown): RawIdea[] => {
  const candidate = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!candidate || !Array.isArray(candidate)) return [];

  return candidate
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(parseRawIdea);
};
