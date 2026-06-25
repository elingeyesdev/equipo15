import { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { wallEvents } from '../hooks/useWallEvents';
import { useAuth } from '../context/AuthContext';

export const SocketBridge: React.FC = () => {
  const socket = useSocket();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const handleIdeaCommented = (payload: any) => {
      if (payload?.authorId === (userProfile as any)?.id) return;
      wallEvents.emit('comment_count_changed', {
        ideaId: payload?.ideaId || '',
        challengeId: payload?.challengeId,
        count: typeof payload?.commentsCount === 'number' ? payload.commentsCount : 0,
        previousCount: payload?.previousCount,
        delta: typeof payload?.delta === 'number' ? payload.delta : 0,
      });
    };

    const handleIdeaVoted = (payload: any) => {
      if (payload?.authorId === (userProfile as any)?.id) return;
      wallEvents.emit('vote_changed', {
        ideaId: payload?.ideaId || '',
        hasVoted: true,
        likesCount: typeof payload?.likesCount === 'number' ? payload.likesCount : 0,
      });
    };

    const handleIdeaUnvoted = (payload: any) => {
      if (payload?.authorId === (userProfile as any)?.id) return;
      wallEvents.emit('vote_changed', {
        ideaId: payload?.ideaId || '',
        hasVoted: false,
        likesCount: typeof payload?.likesCount === 'number' ? payload.likesCount : 0,
      });
    };

    const handleIdeaCreated = (payload: any) => {
      wallEvents.emit('idea_created', {
        ideaId: payload?.id || payload?.ideaId || '',
        challengeId: payload?.challengeId || '',
        likesCount: typeof payload?.likesCount === 'number' ? payload.likesCount : 0,
        authorId: payload?.authorId,
      });
    };

    const handleIdeaDeleted = (payload: any) => {
      wallEvents.emit('idea_deleted', {
        ideaId: payload?.ideaId || '',
      });
    };

    socket.on('idea_commented', handleIdeaCommented);
    socket.on('idea:voted', handleIdeaVoted);
    socket.on('idea:unvoted', handleIdeaUnvoted);
    socket.on('idea_created', handleIdeaCreated);
    socket.on('idea:deleted', handleIdeaDeleted);

    return () => {
      socket.off('idea_commented', handleIdeaCommented);
      socket.off('idea:voted', handleIdeaVoted);
      socket.off('idea:unvoted', handleIdeaUnvoted);
      socket.off('idea_created', handleIdeaCreated);
      socket.off('idea:deleted', handleIdeaDeleted);
    };
  }, [socket, user, userProfile]);

  return null;
};

export default SocketBridge;
