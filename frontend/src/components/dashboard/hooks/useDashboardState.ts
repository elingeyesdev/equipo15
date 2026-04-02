import { useState, useEffect } from 'react';
import { userService } from '../../../services/user.service';
import type { UserProfile } from '../../../services/user.service';
import { challengeService } from '../../../services/challenge.service';
import { getFacultySlug } from '../../../config/faculties';
import type { FeedbackMessage } from './useIdeationForm';

export const useDashboardState = (
  initialChallenges: any[] = [], 
  initialFacultades: any[] = [], 
  initialLideres: any[] = []
) => {
  const [userProfile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [challenges, setChallenges] = useState<any[]>(initialChallenges);
  const [topFacultades, setTopFacultades] = useState<any[]>(initialFacultades);
  const [topLideres, setTopLideres] = useState<any[]>(initialLideres);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [challengeStats, setChallengeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formChallenge, setFormChallenge] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<FeedbackMessage | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [profile, cloudChallenges, stats] = await Promise.all([
          userService.getProfile(),
          challengeService.getPublicChallenges(),
          challengeService.getGlobalStats()
        ]);
        
        if (!active) return;
        
        const mapped = cloudChallenges.map((c: any) => ({
          ...c,
          id: c._id,
          category: getFacultySlug(c.facultyId),
          badge: c.status === 'Activo' ? 'ACTIVO' : 'NUEVO'
        }));

        setProfile(profile);
        setChallenges([...mapped, ...initialChallenges]);
        setTopFacultades(stats.topFacultades.length > 0 ? stats.topFacultades : initialFacultades);
        setTopLideres(stats.topLeaders.length > 0 ? stats.topLeaders : initialLideres);
        
        if (mapped.length > 0) {
          setSelectedChallenge(mapped[0]);
        } else if (initialChallenges.length > 0) {
          setSelectedChallenge(initialChallenges[0]);
        }
      } catch (error: any) {
        if (active) setProfileError(error?.message || 'Error de conexión.');
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
        console.error('Error stats:', e);
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

  const handleOpenForm = (challenge: any, resetForm: () => void) => {
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
