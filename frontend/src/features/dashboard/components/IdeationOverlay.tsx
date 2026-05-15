import FeedbackToast from './FeedbackToast';
import IdeaForm from './IdeaForm';
import IdeaDetailModal from '../../../features/sky-wall/components/IdeaDetailModal';
import { ModerationModals } from './ModerationModals';
import type { PlaneIdea } from '../../../features/sky-wall/types';
import type { FeedbackMessage } from '../hooks/useIdeationForm';

interface IdeationOverlayProps {
  toastMessage: FeedbackMessage | null;
  dismissToast: () => void;
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
}

const IdeationOverlay: React.FC<IdeationOverlayProps> = ({
  toastMessage,
  dismissToast,
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
}) => {
  return (
    <>
      <FeedbackToast message={toastMessage} onDismiss={dismissToast} />

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
      />
    </>
  );
};

export default IdeationOverlay;
