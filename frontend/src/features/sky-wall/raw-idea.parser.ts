import type { RawIdea, RawAuthor } from './types';

const parseAuthor = (author: unknown): RawAuthor | undefined => {
  if (typeof author !== 'object' || author === null) return undefined;

  const record = author as Record<string, unknown>;
  const facultyObj = typeof record.faculty === 'object' && record.faculty !== null
    ? record.faculty as { name?: string }
    : undefined;

  const studentProfileObj = typeof record.studentProfile === 'object' && record.studentProfile !== null
    ? record.studentProfile as { facultyId?: string; faculty?: { name?: string }; }
    : undefined;

  const facultyIdFromSP = studentProfileObj?.facultyId !== undefined ? studentProfileObj.facultyId : undefined;
  const facultyNameFromSP = studentProfileObj?.faculty?.name;

  return {
    displayName: typeof record.displayName === 'string' ? record.displayName : undefined,
    nickname: typeof record.nickname === 'string' ? record.nickname : undefined,
    email: typeof record.email === 'string' ? record.email : undefined,
    facultyId: typeof record.facultyId === 'number' ? record.facultyId
      : typeof record.facultyId === 'string' ? record.facultyId
      : facultyIdFromSP,
    faculty: (facultyObj?.name ? { name: facultyObj.name } : undefined) ?? (facultyNameFromSP ? { name: facultyNameFromSP } : undefined),
    phone: typeof record.phone === 'string' ? record.phone : undefined,
    studentCode: typeof record.studentCode === 'string' ? record.studentCode : undefined,
    studentProfile: studentProfileObj,
    role: typeof record.role === 'object' && record.role !== null ? record.role as { name: string } : undefined,
    avatarUrl: typeof record.avatarUrl === 'string' ? record.avatarUrl : undefined,
  };
};

const parseRawIdea = (item: Record<string, unknown>): RawIdea => ({
  _id: typeof item._id === 'string' ? item._id : undefined,
  id: typeof item.id === 'string' ? item.id : undefined,
  title: typeof item.title === 'string' ? item.title : 'Idea sin titulo',
  challengeId: typeof item.challengeId === 'string'
    ? item.challengeId
    : (typeof (item.challenge as Record<string, unknown> | undefined)?.id === 'string'
        ? ((item.challenge as Record<string, unknown>).id as string)
        : undefined),
  challengeTitle:
    typeof item.challengeTitle === 'string'
      ? item.challengeTitle
      : (typeof (item.challenge as Record<string, unknown> | undefined)?.title === 'string'
          ? ((item.challenge as Record<string, unknown>).title as string)
          : undefined),
  problem: typeof item.problem === 'string' ? item.problem : undefined,
  solution: typeof item.solution === 'string' ? item.solution : undefined,
  author: parseAuthor(item.author),
  likesCount: typeof item.likesCount === 'number' ? item.likesCount : 0,
  commentsCount: typeof item.commentsCount === 'number' ? item.commentsCount : 0,
  fireScore: typeof item.fireScore === 'number' ? item.fireScore : 0,
  finalScore: typeof item.finalScore === 'number' ? item.finalScore : (typeof item.finalScore === 'string' ? parseFloat(item.finalScore) : 0),
  isAnonymous: typeof item.isAnonymous === 'boolean' ? item.isAnonymous : false,
  hasVoted: typeof item.hasVoted === 'boolean' ? item.hasVoted : false,
  hasFavorited:
    typeof item.hasFavorited === 'boolean' ? item.hasFavorited : false,
  authorId: typeof item.authorId === 'string' ? item.authorId : undefined,
  createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
});

export const extractRawIdeas = (payload: unknown): RawIdea[] => {
  const candidate = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!candidate || !Array.isArray(candidate)) return [];

  return candidate
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(parseRawIdea);
};
