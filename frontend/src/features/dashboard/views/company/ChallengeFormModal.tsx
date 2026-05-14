import React from 'react';
import type { Challenge } from '../../../../types/models';
import { useChallengeForm, type ChallengeFormData } from './useChallengeForm';
import { ChallengeFormFields } from './ChallengeFormFields';

interface ChallengeFormViewProps {
  onBack: () => void;
  onSave: (data: ChallengeFormData) => Promise<void>;
  challenge?: Challenge | null;
}

const ChallengeFormView: React.FC<ChallengeFormViewProps> = ({ onBack, onSave, challenge }) => {
  const state = useChallengeForm({ onBack, onSave, challenge });

  return <ChallengeFormFields {...state} />;
};

export default ChallengeFormView;
