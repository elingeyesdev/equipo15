import React from 'react';
import type { Challenge } from '../../../../types/models';
import { useChallengeForm, type ChallengeFormData } from './useChallengeForm';
import { ChallengeFormFields } from './ChallengeFormFields';

interface ChallengeFormViewProps {
  onBack: () => void;
  onSave: (data: ChallengeFormData) => Promise<void>;
  challenge?: Challenge | null;
  readOnlyMode?: boolean;
}

const ChallengeFormView: React.FC<ChallengeFormViewProps> = ({ onBack, onSave, challenge, readOnlyMode }) => {
  const state = useChallengeForm({ onBack, onSave, challenge, readOnlyMode });

  return <ChallengeFormFields {...state} readOnlyMode={readOnlyMode ?? false} />;
};

export default ChallengeFormView;
