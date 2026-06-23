import { useState, useEffect, useCallback } from 'react';
import type { Challenge } from '../../../types/models';
import { challengeService } from '../../../services/challenge.service';

import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { SortMode } from '../../../features/sky-wall/types';
import { useSocket } from '../../../hooks/useSocket';
import { useWallEventListener } from '../../../hooks/useWallEvents';
import { toast } from 'sonner';

export const useChallengeSelection = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [topFacultades, setTopFacultades] = useState<any[]>([]);
  const [topLideres, setTopLideres] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeStats, setChallengeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Activos');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortMode | null>(null);

  useEffect(() => {
    let active = true;

    const pendingPrivateId = (location.state as any)?.privateChallengeId as string | undefined;

    if (pendingPrivateId) {
      window.history.replaceState({}, '', location.pathname);
    }

    (async () => {
      try {
        setLoading(true);

        if (pendingPrivateId) {
          try {
            await challengeService.getChallengeById(pendingPrivateId);
          } catch (err) {
            console.error('Error linking private challenge:', err);
            toast.error('No tienes acceso a este reto privado o no pertenece a tu facultad.');
          }
        }

        const [cloudChallenges, globalStats] = await Promise.all([
          challengeService.getPublicChallenges(1, 40, undefined),
          challengeService.getGlobalStats().catch(() => null)
        ]);

        if (globalStats) {
          const finalStats = (globalStats as any)?.success ? (globalStats as any).data : globalStats;
          setTopFacultades(finalStats?.topFacultades || []);
          setTopLideres(finalStats?.topLeaders || []);
        }

        if (!active) return;

        const challengesResult = (cloudChallenges as any)?.success ? (cloudChallenges as any).data : cloudChallenges;
        const rawData = Array.isArray(challengesResult?.data) ? (challengesResult.data as Challenge[]) : [];

        let mapped: Challenge[] = rawData.map((c: any) => ({
          ...c,
          ideasCount: c._count?.ideas || 0,
          likesCount: c.ideas?.reduce((sum: number, idea: any) => sum + (idea.likesCount || 0), 0) || 0,
          commentsCount: c.ideas?.reduce((sum: number, idea: any) => sum + (idea.commentsCount || 0), 0) || 0,
          category: c.faculties && c.faculties.length > 0
            ? c.faculties.map((f: any) => f.name).join(', ')
            : c.faculty?.name || 'General',
          badge: c.status === 'Activo' ? 'ACTIVO' : 'NUEVO'
        }));

        if (pendingPrivateId) {
          const exists = mapped.some(c => c.id === pendingPrivateId);
          if (!exists) {
            try {
              const privateChallengeResp = await challengeService.getChallengeById(pendingPrivateId);
              const privateChallengeRaw = (privateChallengeResp as any)?.success ? (privateChallengeResp as any).data : privateChallengeResp;
              if (privateChallengeRaw && privateChallengeRaw.id) {
                const mappedPrivate = {
                  ...privateChallengeRaw,
                  ideasCount: privateChallengeRaw._count?.ideas || privateChallengeRaw.ideas?.length || 0,
                  likesCount: privateChallengeRaw.ideas?.reduce((sum: number, idea: any) => sum + (idea.likesCount || 0), 0) || 0,
                  commentsCount: privateChallengeRaw.ideas?.reduce((sum: number, idea: any) => sum + (idea.commentsCount || 0), 0) || 0,
                  category: privateChallengeRaw.faculties && privateChallengeRaw.faculties.length > 0
                    ? privateChallengeRaw.faculties.map((f: any) => f.name).join(', ')
                    : privateChallengeRaw.faculty?.name || 'General',
                  badge: privateChallengeRaw.status === 'Activo' ? 'ACTIVO' : 'NUEVO'
                };
                mapped = [mappedPrivate, ...mapped];
              }
            } catch (err) {
              console.error('Error fetching private challenge:', err);
            }
          }
        }

        setChallenges(mapped);
      } catch (error: unknown) {
        if (active) {
          setChallenges([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedChallenge?.id || !user) return;

    let active = true;

    const fetchStats = async () => {
      try {
        const stats = await challengeService.getChallengeStats(selectedChallenge.id);
        if (active) {
          const finalStats = (stats as any)?.success ? (stats as any).data : stats;
          setChallengeStats(finalStats);
        }
      } catch (e) {
      }
    };

    fetchStats();
  }, [selectedChallenge?.id, user]);

  const socket = useSocket();

  useEffect(() => {
    if (!selectedChallenge?.id || !socket) return;

    const handleIdeaVoted = (payload: any) => {
      setChallenges(prev => prev.map(c =>
        c.id === payload.challengeId
          ? { ...c, likesCount: (c.likesCount || 0) + 1 }
          : c
      ));
      if (payload.challengeId === selectedChallenge.id) {
        setChallengeStats((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalLikes: (prev.totalLikes || 0) + 1,
            topIdeas: prev.topIdeas?.map((idea: any) =>
              idea.id === payload.ideaId
                ? { ...idea, likesCount: payload.likesCount }
                : idea
            ).sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0))
          };
        });
      }
    };

    const handleIdeaUnvoted = (payload: any) => {
      setChallenges(prev => prev.map(c =>
        c.id === payload.challengeId
          ? { ...c, likesCount: Math.max(0, (c.likesCount || 0) - 1) }
          : c
      ));
      if (payload.challengeId === selectedChallenge.id) {
        setChallengeStats((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalLikes: Math.max(0, (prev.totalLikes || 0) - 1),
            topIdeas: prev.topIdeas?.map((idea: any) =>
              idea.id === payload.ideaId
                ? { ...idea, likesCount: payload.likesCount }
                : idea
            ).sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0))
          };
        });
      }
    };

    const handleIdeaCommented = (payload: any) => {
      if (payload.challengeId === selectedChallenge.id) {
        setChallengeStats((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalComments: (prev.totalComments || 0) + 1,
            topIdeas: prev.topIdeas?.map((idea: any) =>
              idea.id === payload.ideaId
                ? { ...idea, commentsCount: payload.commentsCount }
                : idea
            )
          };
        });
      }
    };

    const handleIdeaCreated = (payload: any) => {
      setChallenges(prev => prev.map(c =>
        c.id === payload.challengeId
          ? { ...c, ideasCount: (c.ideasCount || 0) + 1 }
          : c
      ));
      if (payload.challengeId === selectedChallenge.id) {
        setChallengeStats((prev: any) => {
          if (!prev) return prev;
          const isAnon = payload.isAnonymous || false;
          const authorName = isAnon
            ? 'Participante'
            : (payload.author?.nickname || payload.author?.displayName || 'Participante');
          const newIdea = {
            id: payload.id ?? payload._id,
            title: payload.title || 'Idea sin título',
            likesCount: 0,
            commentsCount: 0,
            impact: 0,
            authorName,
            author: {
              name: authorName,
              nickname: isAnon ? undefined : (payload.author?.nickname || undefined),
              avatar: isAnon ? undefined : (payload.author?.avatarUrl || undefined),
            }
          };
          return {
            ...prev,
            totalIdeas: (prev.totalIdeas || 0) + 1,
            topIdeas: [...(prev.topIdeas || []), newIdea].sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 5)
          };
        });
      }
    };

    socket.on('idea:voted', handleIdeaVoted);
    socket.on('idea:unvoted', handleIdeaUnvoted);
    socket.on('idea_commented', handleIdeaCommented);
    socket.on('idea_created', handleIdeaCreated);

    return () => {
      socket.off('idea:voted', handleIdeaVoted);
      socket.off('idea:unvoted', handleIdeaUnvoted);
      socket.off('idea_commented', handleIdeaCommented);
      socket.off('idea_created', handleIdeaCreated);
    };
  }, [selectedChallenge?.id, socket]);

  useWallEventListener('comment_count_changed', useCallback(({ challengeId, delta }) => {
    if (!challengeId || typeof delta !== 'number') return;

    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, commentsCount: Math.max(0, (challenge.commentsCount || 0) + delta) }
          : challenge,
      ),
    );

    setSelectedChallenge((prev) =>
      prev && prev.id === challengeId
        ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) + delta) }
        : prev,
    );
  }, []));

  const clearSelectedChallenge = () => {
    setSelectedChallenge(null);
    setChallengeStats(null);
    setSortOrder(null);
  };

  const selectChallenge = (c: Challenge | null) => {
    setSelectedChallenge(c);
    if (c) setSortOrder('newest');
  };

  return {
    challenges, topFacultades, topLideres,
    selectedChallenge, setSelectedChallenge, challengeStats,
    loading,
    activeFilter, setActiveFilter,
    filterOpen, setFilterOpen,
    searchQuery, setSearchQuery, debouncedSearch,
    sortOrder, setSortOrder,
    clearSelectedChallenge, selectChallenge,
  };
};
