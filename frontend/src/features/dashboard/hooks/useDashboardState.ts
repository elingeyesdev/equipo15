import { useState, useEffect } from 'react';
import { userService } from '../../../services/user.service';
import type { UserProfile } from '../../../types/models';
import type { Challenge } from '../../../types/models';

import { useChallengeSelection } from './useChallengeSelection';
import { useIdeationInteraction } from './useIdeationInteraction';

export const useDashboardState = () => {

  const [userProfile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cs = useChallengeSelection();
  const ix = useIdeationInteraction();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const profile = await userService.getProfile();
        if (!active) return;
        const profileData = (profile as any)?.success ? (profile as any).data : profile;
        setProfile(profileData as UserProfile);
      } catch (error: unknown) {
        if (active) {
          const message = error instanceof Error ? error.message : 'Error de conexión.';
          setProfileError(message);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  const handleOpenForm = (challenge: Challenge, resetForm: () => void) => {
    ix.setFormChallenge(challenge);
    cs.setSelectedChallenge(challenge);
    resetForm();
    ix.setFormOpen(true);
  };

  const handleCloseForm = (resetForm: () => void) => {
    ix.setFormOpen(false);
    ix.setFormChallenge(null);
    resetForm();
    ix.setConfirmSubmitOpen(false);
  };

  return {
    userProfile, profileError,
    sidebarOpen, setSidebarOpen,
    ...cs,
    ...ix,
    handleOpenForm, handleCloseForm,
  };
};

