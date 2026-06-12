import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Pista8Theme } from '@/config/theme';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  animation: ${fadeIn} 0.2s ease;
  padding: 16px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: ${slideUp} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  border: 1px solid #f1f5f9;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const Body = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PromptText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${Pista8Theme.primary};
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const HelpText = styled.span<{ $valid: boolean }>`
  font-size: 11px;
  color: ${({ $valid }) => ($valid ? '#10b981' : '#f43f5e')};
  font-weight: 600;
  margin-top: -8px;
`;

const Footer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f8fafc;
`;

const Button = styled.button<{ $variant?: 'danger' | 'cancel' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  ${({ $variant }) =>
    $variant === 'danger'
      ? `
    background: #dc2626;
    color: white;
    border: none;
    &:hover:not(:disabled) {
      background: #b91c1c;
    }
    &:disabled {
      background: #fca5a5;
      cursor: not-allowed;
    }
  `
      : `
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
  `}
`;

interface CommentModerationModalProps {
  commentId: string;
  onClose: () => void;
  onConfirm: (commentId: string, reason: string) => void;
}

export function CommentModerationModal({
  commentId,
  onClose,
  onConfirm,
}: CommentModerationModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isReasonValid = reason.trim().length >= 10;

  const handleModerate = async () => {
    if (!isReasonValid) return;
    setLoading(true);
    try {
      await adminService.moderateComment(commentId, reason.trim());
      toast.success('Comentario moderado con éxito.');
      onConfirm(commentId, reason.trim());
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al moderar el comentario.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <AlertTriangle size={18} color="#dc2626" />
            Moderar Comentario
          </Title>
          <CloseBtn type="button" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </CloseBtn>
        </Header>

        <Body>
          <PromptText>
            ¿Por qué estás ocultando este comentario? Esta acción es irreversible y quedará registrada en la bitácora de auditoría.
          </PromptText>
          <Textarea
            placeholder="Escribe la justificación obligatoria aquí (mínimo 10 caracteres)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
          <HelpText $valid={isReasonValid}>
            {reason.trim().length} / 10 caracteres mínimo
          </HelpText>
        </Body>

        <Footer>
          <Button type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            $variant="danger"
            disabled={!isReasonValid || loading}
            onClick={handleModerate}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Confirmar Ocultado
          </Button>
        </Footer>
      </Card>
    </Overlay>
  );
}
