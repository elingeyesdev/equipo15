import { useState } from 'react';
import styled from 'styled-components';
import { getCommentValidationError, normalizeCommentInput } from '@/utils/validation/commentValidation';

interface CommentFormProps {
  placeholder?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  onSubmit: (content: string) => Promise<void> | void;
  onCancel?: () => void;
  cancelLabel?: string;
  helperText?: string;
  initialContent?: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  resize: vertical;
  border: 1px solid rgba(72, 80, 84, 0.14);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #1a1f22;
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    outline: none;
    border-color: rgba(254, 65, 10, 0.35);
    box-shadow: 0 0 0 3px rgba(254, 65, 10, 0.08);
  }

  &::placeholder {
    color: #a8b0b8;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #d33c3c;
  font-weight: 600;
`;

const HelperText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #8a92a5;
  font-weight: 600;
`;

const CounterText = styled.span<{ $danger?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $danger }) => ($danger ? '#d33c3c' : '#8a92a5')};
  align-self: flex-end;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s, background 0.15s;

  ${({ $variant }) => $variant === 'ghost' ? `
    background: transparent;
    color: #485054;
    border: 1px solid rgba(72, 80, 84, 0.14);
  ` : `
    background: #FE410A;
    color: white;
    box-shadow: 0 10px 24px rgba(254, 65, 10, 0.18);
  `}

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CommentForm = ({
  placeholder = 'Escribe un comentario...',
  submitLabel = 'Enviar',
  cancelLabel = 'Cancelar',
  helperText = 'Necesitas iniciar sesión y escribir entre 2 y 2000 caracteres.',
  isSubmitting = false,
  disabled = false,
  disabledMessage,
  onSubmit,
  onCancel,
  initialContent = '',
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);

  const normalizedPreview = normalizeCommentInput(content);
  const words = normalizedPreview.trim().split(/\s+/).filter(Boolean).length;
  const isNearLimit = normalizedPreview.length > 1800;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeCommentInput(content);
    const validationError = getCommentValidationError(normalized);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      await onSubmit(normalized);
      setContent('');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'No se pudo enviar el comentario.',
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        value={content}
        disabled={disabled || isSubmitting}
        onChange={(event) => {
          setContent(event.target.value);
          if (error) {
            const nextError = getCommentValidationError(
              normalizeCommentInput(event.target.value),
            );
            setError(nextError);
          }
        }}
        placeholder={placeholder}
        aria-label="Contenido del comentario"
        maxLength={2000}
      />

      <HelperText>{disabled ? (disabledMessage || 'Tu cuenta está en modo solo lectura durante la sanción.') : helperText}</HelperText>
      <CounterText $danger={isNearLimit}>
        {normalizedPreview.length}/2000 caracteres - {words} palabras
      </CounterText>

      {error && <ErrorText>{error}</ErrorText>}

      <Actions>
        {onCancel && (
          <Button type="button" $variant="ghost" onClick={onCancel} disabled={disabled || isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" $variant="primary" disabled={disabled || isSubmitting}>
          {isSubmitting ? 'Enviando...' : submitLabel}
        </Button>
      </Actions>
    </Form>
  );
};

export default CommentForm;