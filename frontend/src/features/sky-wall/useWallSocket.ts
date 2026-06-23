import { useEffect, useRef, useState, useCallback } from 'react';
import type { PlaneIdea, WallPhase, IdeaUpdatedPayload, IdeaVotedPayload, RawIdea } from './types';
import { LANE_HEIGHT_PER_IDEA, TOP_PADDING } from './flight.engine';
import { resolveDisplayName } from '../../utils/user.utils';

import { useSocket } from '../../hooks/useSocket';
import { useWallEventListener } from '../../hooks/useWallEvents';

const DEBOUNCE_MS = 200;

const resolveAuthorFacultyName = (_facultyId?: number | string, facultyName?: string) => {
  return facultyName;
};

const buildPlanes = (
  rawIdeas: RawIdea[],
  fallbackChallengeTitle?: string,
): PlaneIdea[] => {
  return rawIdeas.map((idea, i) => ({
    id: idea.id ?? idea._id ?? String(i),
    title: idea.title,
    challengeId: idea.challengeId,
    challengeTitle: idea.challengeTitle ?? fallbackChallengeTitle,
    authorName: resolveDisplayName(idea.author),
    authorAvatar: idea.author?.avatarUrl,
    likesCount: idea.likesCount ?? 0,
    commentsCount: idea.commentsCount ?? 0,
    fireScore: idea.fireScore ?? 0,
    finalScore: idea.finalScore ?? 0,
    laneY: TOP_PADDING + (i * LANE_HEIGHT_PER_IDEA),
    floatDelay: (i % 5) * 0.4,
    authorFacultyId: idea.author?.studentProfile?.facultyId || idea.author?.facultyId,
    authorFacultyName: resolveAuthorFacultyName(idea.author?.studentProfile?.facultyId || idea.author?.facultyId, idea.author?.studentProfile?.faculty?.name || idea.author?.faculty?.name),
    problem: idea.problem,
    solution: idea.solution,
    hasVoted: idea.hasVoted ?? false,
    hasFavorited: idea.hasFavorited ?? false,
    authorId: idea.authorId || '',
    createdAt: idea.createdAt,
    authorRealName: idea.author?.displayName,
    authorStudentCode: idea.author?.studentCode,
    authorPhone: idea.author?.phone,
  }));
};

interface UseWallSocketResult {
  ideas: PlaneIdea[];
  phase: WallPhase;
  serverTimeOffset: number;
}

export const useWallSocket = (
  initialIdeas: RawIdea[] = [],
  fallbackChallengeTitle?: string,
): UseWallSocketResult => {
  const [ideas, setIdeas] = useState<PlaneIdea[]>(() =>
    buildPlanes(initialIdeas, fallbackChallengeTitle),
  );
  const [phase, setPhase] = useState<WallPhase>('active');
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const socket = useSocket();
  const pendingUpdates = useRef<Map<string, IdeaUpdatedPayload>>(new Map());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushUpdates = useCallback(() => {
    const batch = new Map(pendingUpdates.current);
    pendingUpdates.current.clear();
    setIdeas(prev =>
      prev.map(plane => {
        const update = batch.get(plane.id);
        if (!update) return plane;
        return { ...plane, likesCount: update.likesCount, commentsCount: update.commentsCount, fireScore: update.fireScore ?? plane.fireScore };
      }),
    );
  }, []);

  const scheduleFlush = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flushUpdates, DEBOUNCE_MS);
  }, [flushUpdates]);

  useEffect(() => {
    setIdeas(buildPlanes(initialIdeas, fallbackChallengeTitle));
  }, [initialIdeas, fallbackChallengeTitle]);

  useWallEventListener('vote_changed', useCallback(({ ideaId, hasVoted, likesCount, fireScore }) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, hasVoted, likesCount, fireScore: fireScore ?? idea.fireScore } : idea
    ));
  }, []));

  useWallEventListener('favorite_changed', useCallback(({ ideaId, isFavorite }) => {
    setIdeas(prev => prev.map(idea =>
      idea.id === ideaId ? { ...idea, hasFavorited: isFavorite } : idea
    ));
  }, []));

  useEffect(() => {
    if (!socket) return;

    socket.on('idea:updated', (payload: IdeaUpdatedPayload) => {
      pendingUpdates.current.set(payload.id, payload);
      scheduleFlush();
    });

    socket.on('idea:voted', (payload: IdeaVotedPayload) => {
      setIdeas(prev => prev.map(idea => 
        idea.id === payload.ideaId 
          ? { ...idea, likesCount: payload.likesCount, fireScore: payload.fireScore ?? idea.fireScore } 
          : idea
      ));
    });

    socket.on('idea:unvoted', (payload: IdeaVotedPayload) => {
      setIdeas(prev => prev.map(idea => 
        idea.id === payload.ideaId 
          ? { ...idea, likesCount: payload.likesCount, fireScore: payload.fireScore ?? idea.fireScore } 
          : idea
      ));
    });

    socket.on('idea_created', (rawIdea: RawIdea) => {
      setIdeas(prev => {
        if (prev.some(p => p.id === rawIdea.id || p.id === rawIdea._id)) return prev;
        const i = prev.length;
        const newPlane: PlaneIdea = {
          id: rawIdea.id ?? rawIdea._id ?? String(i),
          title: rawIdea.title || 'Idea sin título',
          challengeId: rawIdea.challengeId,
          challengeTitle: rawIdea.challengeTitle ?? fallbackChallengeTitle,
          authorName: resolveDisplayName(rawIdea.author),
          authorAvatar: rawIdea.author?.avatarUrl,
          likesCount: rawIdea.likesCount ?? 0,
          commentsCount: rawIdea.commentsCount ?? 0,
          fireScore: rawIdea.fireScore ?? 0,
          finalScore: rawIdea.finalScore ?? 0,
          laneY: TOP_PADDING + (i * LANE_HEIGHT_PER_IDEA),
          floatDelay: (i % 5) * 0.4,
          authorFacultyId: rawIdea.author?.studentProfile?.facultyId || rawIdea.author?.facultyId,
          authorFacultyName: resolveAuthorFacultyName(rawIdea.author?.studentProfile?.facultyId || rawIdea.author?.facultyId, rawIdea.author?.studentProfile?.faculty?.name || rawIdea.author?.faculty?.name),
          problem: rawIdea.problem,
          solution: rawIdea.solution,
          hasFavorited: rawIdea.hasFavorited ?? false,
          authorId: rawIdea.authorId || '',
          createdAt: rawIdea.createdAt,
          authorRealName: rawIdea.author?.displayName,
          authorStudentCode: rawIdea.author?.studentCode,
          authorPhone: rawIdea.author?.phone,
        };
        return [...prev, newPlane];
      });
    });

    socket.on('user:profile_updated', (payload: { userId: string; displayName: string; nickname?: string; avatarUrl?: string }) => {
      setIdeas(prev => prev.map(idea =>
        idea.authorId === payload.userId
          ? { 
              ...idea, 
              authorName: payload.nickname || payload.displayName,
              ...(payload.avatarUrl && { authorAvatar: payload.avatarUrl })
            }
          : idea
      ));
    });

    socket.on('challenge:close', () => {
      setPhase('race');
    });

    socket.on('timer:sync', ({ serverTime }: { serverTime: number }) => {
      const offset = serverTime - Date.now();
      setServerTimeOffset(offset);
    });

    return () => {
      socket.off('idea:updated');
      socket.off('idea:voted');
      socket.off('idea:unvoted');
      socket.off('idea_created');
      socket.off('user:profile_updated');
      socket.off('challenge:close');
      socket.off('timer:sync');
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [scheduleFlush, socket, fallbackChallengeTitle]);

  return { ideas, phase, serverTimeOffset };
};

