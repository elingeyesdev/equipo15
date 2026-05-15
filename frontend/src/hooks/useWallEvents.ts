import { useEffect } from 'react';

type WallEventPayloads = {
  'vote_changed': { ideaId: string; hasVoted: boolean; likesCount: number; fireScore?: number };
  'favorite_changed': { ideaId: string; isFavorite: boolean };
  'comment_count_changed': {
    ideaId: string;
    challengeId: string;
    count: number;
    previousCount?: number;
    delta: number;
  };
  'idea_created': { ideaId: string; challengeId: string; likesCount: number };
};

type EventName = keyof WallEventPayloads;
type Listener<T extends EventName> = (payload: WallEventPayloads[T]) => void;

class WallEventEmitter {
  private listeners: { [K in EventName]?: Listener<K>[] } = {};

  on<T extends EventName>(event: T, listener: Listener<T>) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(listener);
  }

  off<T extends EventName>(event: T, listener: Listener<T>) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter(l => l !== listener) as any;
  }

  emit<T extends EventName>(event: T, payload: WallEventPayloads[T]) {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach(listener => listener(payload));
  }
}

export const wallEvents = new WallEventEmitter();

export function useWallEventListener<T extends EventName>(event: T, listener: Listener<T>) {
  useEffect(() => {
    wallEvents.on(event, listener);
    return () => wallEvents.off(event, listener);
  }, [event, listener]);
}
