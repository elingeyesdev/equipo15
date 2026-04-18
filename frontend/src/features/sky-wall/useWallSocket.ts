import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { PlaneIdea, WallPhase, IdeaUpdatedPayload } from './types';
import { LANE_HEIGHT_PER_IDEA, TOP_PADDING } from './flight.engine';

const DEFAULT_SOCKET_URL = 'http://localhost:3000';
const DEBOUNCE_MS = 200;

interface RawIdea {
  _id?: string;
  id?: string;
  title: string;
  author?: { displayName?: string; facultyId?: number };
  likesCount?: number;
  commentsCount?: number;
}

const buildPlanes = (rawIdeas: RawIdea[]): PlaneIdea[] => {
  return rawIdeas.map((idea, i) => ({
    id: idea.id ?? idea._id ?? String(i),
    title: idea.title,
    authorName: idea.author?.displayName ?? 'Anónimo',
    likesCount: idea.likesCount ?? 0,
    commentsCount: idea.commentsCount ?? 0,
    laneY: TOP_PADDING + (i * LANE_HEIGHT_PER_IDEA),
    floatDelay: (i % 5) * 0.4,
    authorFacultyId: idea.author?.facultyId,
  }));
};

interface UseWallSocketResult {
  ideas: PlaneIdea[];
  phase: WallPhase;
  serverTimeOffset: number;
}

export const useWallSocket = (token?: string, initialIdeas: RawIdea[] = []): UseWallSocketResult => {
  const [ideas, setIdeas] = useState<PlaneIdea[]>(() => buildPlanes(initialIdeas));
  const [phase, setPhase] = useState<WallPhase>('active');
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const pendingUpdates = useRef<Map<string, IdeaUpdatedPayload>>(new Map());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushUpdates = useCallback(() => {
    const batch = new Map(pendingUpdates.current);
    pendingUpdates.current.clear();
    setIdeas(prev =>
      prev.map(plane => {
        const update = batch.get(plane.id);
        if (!update) return plane;
        return { ...plane, likesCount: update.likesCount, commentsCount: update.commentsCount };
      }),
    );
  }, []);

  const scheduleFlush = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flushUpdates, DEBOUNCE_MS);
  }, [flushUpdates]);

  useEffect(() => {
    setIdeas(buildPlanes(initialIdeas));
  }, [initialIdeas]);

  useEffect(() => {
    if (!token) return;


    let socketURL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : DEFAULT_SOCKET_URL;

    const socket = io(socketURL, {
      reconnection: true,
      reconnectionDelay: 1000,
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('idea:updated', (payload: IdeaUpdatedPayload) => {
      pendingUpdates.current.set(payload.id, payload);
      scheduleFlush();
    });

    socket.on('idea_created', (rawIdea: RawIdea) => {
      setIdeas(prev => {
        if (prev.some(p => p.id === rawIdea.id || p.id === rawIdea._id)) return prev;
        const i = prev.length;
        const newPlane: PlaneIdea = {
          id: rawIdea.id ?? rawIdea._id ?? String(i),
          title: rawIdea.title,
          authorName: rawIdea.author?.displayName ?? 'Anónimo',
          likesCount: rawIdea.likesCount ?? 0,
          commentsCount: rawIdea.commentsCount ?? 0,
          laneY: TOP_PADDING + (i * LANE_HEIGHT_PER_IDEA),
          floatDelay: (i % 5) * 0.4,
          authorFacultyId: rawIdea.author?.facultyId,
        };
        return [...prev, newPlane];
      });
    });

    socket.on('challenge:close', () => {
      setPhase('race');
    });

    socket.on('timer:sync', ({ serverTime }: { serverTime: number }) => {
      const offset = serverTime - Date.now();
      setServerTimeOffset(offset);
      console.debug('[Pista8] Timer Sincronizado. Offset:', offset, 'ms');
    });

    return () => {
      socket.disconnect();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [scheduleFlush, token]);

  return { ideas, phase, serverTimeOffset };
};
