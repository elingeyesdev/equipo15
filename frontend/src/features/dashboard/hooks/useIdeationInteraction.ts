import { useState, useEffect } from 'react';
import type { Challenge } from '../../../types/models';
import type { FeedbackMessage } from './useIdeationForm';

export const useIdeationInteraction = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [formChallenge, setFormChallenge] = useState<Challenge | null>(null);
  const [toastMessage, setToastMessage] = useState<FeedbackMessage | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

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

  return {
    formOpen, setFormOpen,
    formChallenge, setFormChallenge,
    toastMessage, setToastMessage, showToast, dismissToast,
    confirmSubmitOpen, setConfirmSubmitOpen,
  };
};
