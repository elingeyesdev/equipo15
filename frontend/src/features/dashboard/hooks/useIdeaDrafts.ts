import { useCallback, useEffect, useState } from 'react';
import { ideaService, type IdeaDraft } from '../../../services/idea.service';
import type { FeedbackMessage } from './useIdeationForm';

export const useIdeaDrafts = (
  enabled: boolean,
  showToast: (payload: FeedbackMessage) => void,
) => {
  const [drafts, setDrafts] = useState<IdeaDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ideaService.getMyDrafts();
      setDrafts(data);
    } catch {
      showToast({
        tone: 'error',
        title: 'No pudimos cargar tus borradores',
        message: 'Intenta nuevamente en unos segundos.',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (enabled) {
      fetchDrafts();
    }
  }, [enabled, fetchDrafts]);

  const deleteDraft = useCallback(
    async (draftId: string): Promise<boolean> => {
      setDeletingId(draftId);
      try {
        await ideaService.deleteDraftIdea(draftId);
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        showToast({
          tone: 'info',
          title: 'Borrador eliminado',
          message: 'El borrador se eliminó correctamente.',
        });
        return true;
      } catch {
        showToast({
          tone: 'error',
          title: 'No pudimos eliminar el borrador',
          message: 'Intenta nuevamente en unos segundos.',
        });
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [showToast],
  );

  return {
    drafts,
    draftsLoading: loading,
    deletingDraftId: deletingId,
    fetchDrafts,
    deleteDraft,
  };
};
