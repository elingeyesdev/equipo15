import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { PlaneIdea, WallPhase, IdeaUpdatedPayload } from './types';
import { assignLanes, computeCanvasHeight } from './flight.engine';

const SOCKET_URL = 'http://localhost:3000';
const DEBOUNCE_MS = 200;

const buildPlanes = (rawIdeas: any[]): PlaneIdea[] => {
  const height = computeCanvasHeight(rawIdeas.length);
  const lanes = assignLanes(rawIdeas.length, height);
  return rawIdeas.map((idea, i) => ({
    id: idea._id ?? String(i),
    title: idea.title,
    authorName: idea.author?.displayName ?? 'Anónimo',
    likesCount: idea.likesCount ?? 0,
    commentsCount: idea.commentsCount ?? 0,
    laneY: lanes[i],
    floatDelay: Math.random() * 2,
  }));
};

interface UseWallSocketResult {
  ideas: PlaneIdea[];
  phase: WallPhase;
  serverTimeOffset: number;
}

export const useWallSocket = (initialIdeas: any[] = []): UseWallSocketResult => {
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
    const socket = io(SOCKET_URL, { reconnection: true, reconnectionDelay: 1000 });
    socketRef.current = socket;

    socket.on('idea:updated', (payload: IdeaUpdatedPayload) => {
      pendingUpdates.current.set(payload.id, payload);
      scheduleFlush();
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
  }, [scheduleFlush]);

  return { ideas, phase, serverTimeOffset };
};
