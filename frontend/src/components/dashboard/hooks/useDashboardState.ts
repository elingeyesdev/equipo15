import { useState, useEffect } from 'react';
import { userService } from '../../../services/user.service';
import type { UserProfile } from '../../../types/models';
import type { Challenge } from '../../../types/models';
import { challengeService } from '../../../services/challenge.service';
import { getFacultySlug } from '../../../config/faculties';
import type { FeedbackMessage } from './useIdeationForm';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { io } from 'socket.io-client';

export const useDashboardState = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { user } = useAuth();
  const [userProfile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [topFacultades, setTopFacultades] = useState<any[]>([]);
  const [topLideres, setTopLideres] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeStats, setChallengeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formChallenge, setFormChallenge] = useState<Challenge | null>(null);
  const [toastMessage, setToastMessage] = useState<FeedbackMessage | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'likes' | 'comments' | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [profile, cloudChallenges, globalStats] = await Promise.all([
          userService.getProfile(),
          challengeService.getPublicChallenges(1, 40, 'Activo'),
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
          category: getFacultySlug(c.facultyId || null),
          badge: c.status === 'Activo' ? 'ACTIVO' : 'NUEVO'
        }));

        if (challengeId) {
          try {
            const privateChallengeResp = await challengeService.getChallengeById(challengeId);
            const privateChallengeRaw = (privateChallengeResp as any)?.success ? (privateChallengeResp as any).data : privateChallengeResp;
            if (privateChallengeRaw && privateChallengeRaw.id) {
              const exists = mapped.some(c => c.id === privateChallengeRaw.id);
              if (!exists) {
                const mappedPrivate = {
                  ...privateChallengeRaw,
                  ideasCount: privateChallengeRaw._count?.ideas || privateChallengeRaw.ideas?.length || 0,
                  likesCount: privateChallengeRaw.ideas?.reduce((sum: number, idea: any) => sum + (idea.likesCount || 0), 0) || 0,
                  category: getFacultySlug(privateChallengeRaw.facultyId || null),
                  badge: privateChallengeRaw.status === 'Activo' ? 'ACTIVO' : 'NUEVO'
                };
                mapped = [mappedPrivate, ...mapped];
              }
            }
          } catch (err) {
            console.error('Error fetching private challenge:', err);
          }
        }

        const profileData = (profile as any)?.success ? (profile as any).data : profile;
        setProfile(profileData as UserProfile);
        setChallenges(mapped);

        if (challengeId && mapped.some(c => c.id === challengeId)) {
          setSelectedChallenge(mapped.find(c => c.id === challengeId) || mapped[0]);
        }
      } catch (error: unknown) {
        if (active) {
          const message = error instanceof Error ? error.message : 'Error de conexión.';
          setProfileError(message);
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
    let socket: any = null;

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

    user.getIdToken().then(token => {
      if (!active) return;
      const socketURL = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : 'http://localhost:3000';

      socket = io(socketURL, {
        reconnection: true,
        auth: { token }
      });

      socket.on('idea:voted', (payload: any) => {
        setChallenges(prev => prev.map(c => 
          c.id === payload.challengeId 
            ? { ...c, likesCount: (c.likesCount || 0) + 1 } 
            : c
        ));
        if (payload.challengeId === selectedChallenge.id) {
          fetchStats();
        }
      });

      socket.on('idea_commented', (payload: any) => {
        if (payload.challengeId === selectedChallenge.id) {
          fetchStats();
        }
      });
    });

    return () => {
      active = false;
      if (socket) socket.disconnect();
    };
  }, [selectedChallenge?.id, user]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = formOpen ? 'hidden' : originalOverflow;
    return () => { document.body.style.overflow = originalOverflow; };
  }, [formOpen]);

  useEffect(() => {
    if (!toastMessage || toastMessage.persist) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 4800);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const showToast = (payload: FeedbackMessage) => setToastMessage(payload);
  const dismissToast = () => setToastMessage(null);

  const handleOpenForm = (challenge: Challenge, resetForm: () => void) => {
    setFormChallenge(challenge);
    setSelectedChallenge(challenge);
    resetForm();
    setFormOpen(true);
  };

  const handleCloseForm = (resetForm: () => void) => {
    setFormOpen(false);
    setFormChallenge(null);
    resetForm();
    setConfirmSubmitOpen(false);
  };

  return {
    userProfile, profileError, loading,
    challenges, topFacultades, topLideres,
    selectedChallenge, setSelectedChallenge, challengeStats,
    sidebarOpen, setSidebarOpen,
    activeFilter, setActiveFilter,
    filterOpen, setFilterOpen,
    formOpen, setFormOpen,
    formChallenge, setFormChallenge,
    toastMessage, setToastMessage, showToast, dismissToast,
    confirmSubmitOpen, setConfirmSubmitOpen,
    handleOpenForm, handleCloseForm,
    searchQuery, setSearchQuery, debouncedSearch,
    sortOrder, setSortOrder,
    clearSelectedChallenge: () => {
      setSelectedChallenge(null);
      setChallengeStats(null);
      setSortOrder(null);
    }
  };
};
