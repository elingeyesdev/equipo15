import { useState, useEffect } from 'react';
import { userService } from '../../../services/user.service';
import type { UserProfile } from '../../../services/user.service';
import type { FeedbackMessage } from './useIdeationForm';

export const useDashboardState = (initialChallenges: any[]) => {
  const [userProfile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(initialChallenges[0]);
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
        setProfileError('');
        const data = await userService.getProfile();
        if (active) setProfile(data);
      } catch (error: any) {
        if (active) setProfileError(error?.message || 'No pudimos cargar tu perfil.');
      }
    })();
    return () => { active = false; };
  }, []);

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
    userProfile, profileError,
    selectedChallenge, setSelectedChallenge,
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
