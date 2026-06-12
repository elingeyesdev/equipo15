import IdeaForm from './IdeaForm';
import IdeaDetailModal from '../../../features/sky-wall/components/IdeaDetailModal';
import { ModerationModals } from './ModerationModals';
import type { PlaneIdea } from '../../../features/sky-wall/types';
import type { FeedbackMessage } from '../hooks/useIdeationForm';
import type { IdeaDraft } from '../../../services/idea.service';

interface IdeationOverlayProps {
  selectedListIdea: PlaneIdea | null;
  setSelectedListIdea: (idea: PlaneIdea | null) => void;
  formOpen: boolean;
  formChallenge: any;
  fullName: string;
  isGuest: boolean;
  onCloseForm: () => void;
  form: any;
  onConfirm: () => Promise<void>;
  confirmOpen: boolean;
  setConfirmOpen: (v: boolean) => void;
  showToast: (payload: FeedbackMessage) => void;
  onContinueDraft: (draft: IdeaDraft) => void;
}

const IdeationOverlay: React.FC<IdeationOverlayProps> = ({
  selectedListIdea,
  setSelectedListIdea,
  formOpen,
  formChallenge,
  fullName,
  isGuest,
  onCloseForm,
  form,
  onConfirm,
  confirmOpen,
  setConfirmOpen,
  showToast,
  onContinueDraft,
}) => {
  return (
    <>
      <ModerationModals />

      {selectedListIdea && (
        <IdeaDetailModal
          idea={selectedListIdea}
          onClose={() => setSelectedListIdea(null)}
        />
      )}

      <IdeaForm
        open={formOpen}
        challenge={formChallenge}
        fullName={fullName}
        isGuest={isGuest}
        onClose={onCloseForm}
        form={form}
        onConfirm={onConfirm}
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        showToast={showToast}
        onContinueDraft={onContinueDraft}
      />
    </>
  );
};

export default IdeationOverlay;
