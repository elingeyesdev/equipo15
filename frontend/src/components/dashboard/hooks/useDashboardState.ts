import { useState, useEffect } from 'react';
import { userService } from '../../../services/user.service';
import type { UserProfile } from '../../../types/models';
import type { Challenge } from '../../../types/models';
import { challengeService } from '../../../services/challenge.service';
import { getFacultySlug } from '../../../config/faculties';
import type { FeedbackMessage } from './useIdeationForm';

export const useDashboardState = () => {
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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [profile, cloudChallenges, stats] = await Promise.all([
          userService.getProfile(),
          challengeService.getPublicChallenges(1, 40, 'Activo'),
          challengeService.getGlobalStats()
        ]);

        if (!active) return;

        const challengesResult = (cloudChallenges as any)?.success ? (cloudChallenges as any).data : cloudChallenges;
        const rawData = Array.isArray(challengesResult?.data) ? (challengesResult.data as Challenge[]) : [];

        const mapped: Challenge[] = rawData.map((c) => ({
          ...c,
          category: getFacultySlug(c.facultyId || null),
          badge: c.status === 'Activo' ? 'ACTIVO' : 'NUEVO'
        }));

        const profileData = (profile as any)?.success ? (profile as any).data : profile;
        setProfile(profileData as UserProfile);
        setChallenges(mapped);

        const finalStats = (stats as any)?.success ? (stats as any).data : stats;
        setTopFacultades(finalStats?.topFacultades || []);
        setTopLideres(finalStats?.topLeaders || []);

        if (mapped.length > 0) {
          setSelectedChallenge(mapped[0]);
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
    if (!selectedChallenge?.id) return;
    (async () => {
      try {
        const stats = await challengeService.getChallengeStats(selectedChallenge.id);
        setChallengeStats(stats);
      } catch (e) {
      }
    })();
  }, [selectedChallenge?.id]);

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
    handleOpenForm, handleCloseForm
  };
};
