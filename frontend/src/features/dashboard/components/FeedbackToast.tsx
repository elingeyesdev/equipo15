import React from 'react';
import * as S from '../styles/FeedbackAndMiscStyles';
import { FEEDBACK_GLYPH } from '../styles/CommonStyles';
import type { FeedbackMessage } from '../hooks/useIdeationForm';

interface FeedbackToastProps {
  message: FeedbackMessage | null;
  onDismiss: () => void;
}

const FeedbackToast: React.FC<FeedbackToastProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <S.ToastViewport role="status" aria-live="polite">
      <S.ToastCard data-tone={message.tone} $tone={message.tone}>
        <S.ToastGlyph $tone={message.tone} aria-hidden="true">{FEEDBACK_GLYPH[message.tone]}</S.ToastGlyph>
        <S.ToastContent>
          {message.title && <S.ToastTitle>{message.title}</S.ToastTitle>}
          <p>{message.message}</p>
        </S.ToastContent>
        <S.ToastDismiss type="button" onClick={onDismiss} aria-label="Cerrar notificación">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </S.ToastDismiss>
      </S.ToastCard>
    </S.ToastViewport>
  );
};

export default FeedbackToast;
