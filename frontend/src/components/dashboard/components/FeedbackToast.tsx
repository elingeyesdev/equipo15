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
        <S.ToastGlyph aria-hidden="true">{FEEDBACK_GLYPH[message.tone]}</S.ToastGlyph>
        <S.ToastContent>
          {message.title && <S.ToastTitle>{message.title}</S.ToastTitle>}
          <p>{message.message}</p>
        </S.ToastContent>
        <S.ToastDismiss type="button" onClick={onDismiss}>
          Cerrar
        </S.ToastDismiss>
      </S.ToastCard>
    </S.ToastViewport>
  );
};

export default FeedbackToast;
