import { useState } from 'react';
import styled from 'styled-components';

interface CommentFormProps {
  placeholder?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
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

const COMMENT_FORM_RULES = {
  minLength: 2,
  maxLength: 2000,
  maxWords: 350,
  maxConsecutiveLineBreaks: 2,
  maxRepeatedCharacterStreak: 8,
} as const;

const normalizeCommentInput = (value: string): string =>
  value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const countWords = (value: string): number =>
  value.trim().split(/\s+/).filter(Boolean).length;

const isOnlyNumbers = (value: string): boolean => {
  const compact = value.replace(/\s+/g, '');
  return /^[0-9]+$/.test(compact);
};

const getCommentValidationError = (value: string): string | null => {
  if (!value) return 'El comentario no puede estar vacío.';
  if (value.length < COMMENT_FORM_RULES.minLength) {
    return `El comentario debe tener al menos ${COMMENT_FORM_RULES.minLength} caracteres.`;
  }
  if (value.length > COMMENT_FORM_RULES.maxLength) {
    return `El comentario no puede superar ${COMMENT_FORM_RULES.maxLength} caracteres.`;
  }
  if (!/[A-Za-z0-9\u00C0-\u024F]/.test(value)) {
    return 'El comentario debe incluir letras o números legibles.';
  }

  if (isOnlyNumbers(value)) {
    return 'El comentario no puede contener solo números.';
  }

  const words = countWords(value);
  if (words > COMMENT_FORM_RULES.maxWords) {
    return `El comentario no puede superar ${COMMENT_FORM_RULES.maxWords} palabras.`;
  }

  const repeatedCharsRegex = new RegExp(`(.)\\1{${COMMENT_FORM_RULES.maxRepeatedCharacterStreak - 1},}`);
  if (repeatedCharsRegex.test(value)) {
    return 'El comentario contiene repeticiones excesivas de caracteres.';
  }

  const consecutiveBreaksRegex = new RegExp(`\\n{${COMMENT_FORM_RULES.maxConsecutiveLineBreaks + 1},}`);
  if (consecutiveBreaksRegex.test(value.replace(/\r\n/g, '\n'))) {
    return 'El comentario tiene demasiados saltos de línea consecutivos.';
  }

  if (/(https?:\/\/|www\.)/i.test(value)) {
    return 'Por seguridad, evita incluir enlaces en los comentarios.';
  }

  return null;
};

export const CommentForm = ({
  placeholder = 'Escribe un comentario...',
  submitLabel = 'Enviar',
  cancelLabel = 'Cancelar',
  helperText = 'Necesitas iniciar sesión y escribir entre 2 y 2000 caracteres.',
  isSubmitting = false,
  onSubmit,
  onCancel,
  initialContent = '',
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);

  const normalizedPreview = normalizeCommentInput(content);
  const words = countWords(normalizedPreview);
  const isNearLimit = normalizedPreview.length > COMMENT_FORM_RULES.maxLength * 0.9;

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
        maxLength={COMMENT_FORM_RULES.maxLength}
      />

      <HelperText>{helperText}</HelperText>
      <CounterText $danger={isNearLimit}>
        {normalizedPreview.length}/{COMMENT_FORM_RULES.maxLength} caracteres - {words} palabras
      </CounterText>

      {error && <ErrorText>{error}</ErrorText>}

      <Actions>
        {onCancel && (
          <Button type="button" $variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" $variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : submitLabel}
        </Button>
      </Actions>
    </Form>
  );
};

export default CommentForm;