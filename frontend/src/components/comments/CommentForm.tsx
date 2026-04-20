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
  onSubmit,
  onCancel,
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      setError('El comentario no puede estar vacío.');
      return;
    }

    try {
      setError(null);
      await onSubmit(trimmed);
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
          if (error) setError(null);
        }}
        placeholder={placeholder}
        aria-label="Contenido del comentario"
      />

      <HelperText>{helperText}</HelperText>

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