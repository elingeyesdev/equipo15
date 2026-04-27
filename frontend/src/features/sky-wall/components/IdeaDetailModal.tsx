import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import type { PlaneIdea } from '../types';
import LikeButton from './LikeButton';
import { Pista8Theme } from '../../../config/theme';
import CommentsSection from '../../../components/comments/CommentsSection';
import { useAuth } from '../../../context/AuthContext';
import { ideaService } from '../../../services/idea.service';

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(28px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 25, 28, 0.55);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: ${overlayIn} 0.22s ease-out;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  overflow-y: auto;
  border: 1px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 40px 80px rgba(20, 25, 28, 0.22);
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);
`;

const ModalBanner = styled.div`
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  border-radius: 31px 31px 0 0;
  padding: 36px 36px 32px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;
`;

const BannerDots = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.13); color: white; }
`;

const IdeaTag = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 5px 12px;
  border-radius: 20px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px;
  color: white;
  font-size: 21px;
  font-weight: 900;
  line-height: 1.35;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 1;
  max-width: 440px;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
`;

const AuthorDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${Pista8Theme.primary};
`;

const AuthorName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.38);
  letter-spacing: 0.02em;
`;

const DateChip = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.28);
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 2px 9px;
  border-radius: 20px;
  letter-spacing: 0.02em;
  margin-left: 4px;
`;

const EvaluationBanner = styled.div`
  width: 100%;
  padding: 12px;
  background: #fff7ed;
  border-bottom: 1px solid #ffedd5;
  color: #c2410c;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Body = styled.div`
  padding: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
`;

const SectionBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 0;
  text-align: center;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(72, 80, 84, 0.07);
  }
`;

const SectionLabel = styled.p`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
  margin: 0;
`;

const SectionContent = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.75;
  color: #5a6470;
  font-weight: 500;
  max-width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const EmptyContent = styled.p`
  margin: 0;
  font-size: 14px;
  color: #c8d0d8;
  font-weight: 500;
  font-style: italic;
`;

const ActionsRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CommentToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(p) => (p.$active ? `${Pista8Theme.primary}12` : 'rgba(248,249,250,0.9)')};
  color: ${(p) => (p.$active ? Pista8Theme.primary : '#94a3b8')};
  border: 1.5px solid ${(p) => (p.$active ? `${Pista8Theme.primary}50` : 'rgba(72,80,84,0.1)')};
  border-radius: 99px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: ${(p) => (p.$active ? `0 0 0 3px ${Pista8Theme.primary}18` : 'none')};

  &:hover {
    background: ${(p) => (p.$active ? `${Pista8Theme.primary}16` : `${Pista8Theme.primary}08`)};
    border-color: ${(p) => (p.$active ? `${Pista8Theme.primary}66` : `${Pista8Theme.primary}40`)};
    color: ${Pista8Theme.primary};
  }
`;

const Counter = styled.span`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
`;

const EditButton = styled.button`
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.35);
  }
`;

const EditForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EditInput = styled.input`
  width: 100%;
  border: 1px solid rgba(72, 80, 84, 0.18);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
`;

const EditTextArea = styled.textarea`
  width: 100%;
  border: 1px solid rgba(72, 80, 84, 0.18);
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 140px;
`;

const EditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const EditActionButton = styled.button<{ $primary?: boolean }>`
  border: ${({ $primary }) => ($primary ? 'none' : '1px solid rgba(72, 80, 84, 0.2)')};
  background: ${({ $primary }) => ($primary ? Pista8Theme.primary : 'transparent')};
  color: ${({ $primary }) => ($primary ? 'white' : '#374151')};
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;

const EditError = styled.p`
  margin: 0;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
`;

interface IdeaDetailModalProps {
  idea: PlaneIdea;
  onClose: () => void;
}

export const IdeaDetailModal = ({ idea, onClose }: IdeaDetailModalProps) => {
  const { userProfile } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(idea.commentsCount);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState(idea.title);
  const [editableSolution, setEditableSolution] = useState(idea.solution || '');

  useEffect(() => {
    setCommentsCount(idea.commentsCount);
    setIsCommentsOpen(false);
    setIsEditing(false);
    setIsSaving(false);
    setEditError(null);
    setEditableTitle(idea.title);
    setEditableSolution(idea.solution || '');
  }, [idea.id, idea.commentsCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isAuthor = idea.authorId === userProfile?.id;

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = editableTitle.trim();
    const solution = editableSolution.trim();

    if (!title || !solution) {
      setEditError('El título y la solución son obligatorios para editar la idea.');
      return;
    }

    setIsSaving(true);
    setEditError(null);
    try {
      await ideaService.updateIdea(idea.id, {
        title,
        solution,
      });
      setIsEditing(false);
    } catch (error) {
      const message = (error as any)?.response?.data?.message;
      if (Array.isArray(message)) {
        setEditError(message[0]);
      } else if (typeof message === 'string') {
        setEditError(message);
      } else {
        setEditError('No se pudo guardar la edición. Intenta nuevamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalBanner>
          <BannerDots />
          <CloseButton onClick={onClose} aria-label="Cerrar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseButton>

          <IdeaTag>Idea en vuelo</IdeaTag>
          <ModalTitle>{editableTitle}</ModalTitle>
          <AuthorRow>
            <AuthorDot />
            <AuthorName>{idea.authorName}</AuthorName>
            {idea.createdAt && (
              <DateChip>
                {new Date(idea.createdAt).toLocaleDateString('es', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </DateChip>
            )}
            {isAuthor && (
              <EditButton type="button" onClick={() => setIsEditing((current) => !current)}>
                {isEditing ? 'Cancelar edición' : 'Editar idea'}
              </EditButton>
            )}
          </AuthorRow>
        </ModalBanner>

        {idea.challengeStatus === 'EVALUATION' && (
          <EvaluationBanner>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Este reto ha pasado a fase de evaluación técnica.
          </EvaluationBanner>
        )}

        <Body>
          {isEditing && isAuthor && (
            <SectionBlock>
              <SectionLabel>Editar idea</SectionLabel>
              <EditForm onSubmit={handleSaveEdit}>
                <EditInput
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  placeholder="Título de la idea"
                  maxLength={150}
                />
                <EditTextArea
                  value={editableSolution}
                  onChange={(e) => setEditableSolution(e.target.value)}
                  placeholder="Describe la solución"
                  maxLength={2000}
                />
                {editError && <EditError>{editError}</EditError>}
                <EditActions>
                  <EditActionButton type="button" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </EditActionButton>
                  <EditActionButton type="submit" $primary disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </EditActionButton>
                </EditActions>
              </EditForm>
            </SectionBlock>
          )}

          {(idea.authorRealName || idea.authorStudentCode || idea.authorPhone) && (
            <SectionBlock style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginTop: '-10px', marginBottom: '10px' }}>
              <SectionLabel style={{ color: '#475569', marginBottom: '12px' }}>Datos Institucionales (Solo Autorizados)</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                {idea.authorRealName && (
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    <strong style={{ color: '#64748b' }}>Nombre:</strong> {idea.authorRealName}
                  </div>
                )}
                {idea.authorStudentCode && (
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    <strong style={{ color: '#64748b' }}>Código:</strong> {idea.authorStudentCode}
                  </div>
                )}
                {idea.authorPhone && (
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    <strong style={{ color: '#64748b' }}>Teléfono:</strong> {idea.authorPhone}
                  </div>
                )}
              </div>
            </SectionBlock>
          )}
          <SectionBlock>
            <SectionLabel>El reto</SectionLabel>
            {idea.challengeTitle
              ? <SectionContent>{idea.challengeTitle}</SectionContent>
              : <EmptyContent>No se pudo identificar el reto asignado.</EmptyContent>
            }
          </SectionBlock>

          <SectionBlock>
            <SectionLabel>La Solución</SectionLabel>
            {editableSolution
              ? <SectionContent>{editableSolution}</SectionContent>
              : <EmptyContent>No se detalló la solución.</EmptyContent>
            }
          </SectionBlock>

          <SectionBlock>
            <ActionsRow>
              <LikeButton 
                ideaId={idea.id} 
                initialLikes={idea.likesCount} 
                hasVoted={idea.hasVoted} 
                isAuthor={isAuthor}
                disabled={idea.challengeStatus === 'EVALUATION'}
              />

              <CommentToggleButton
                type="button"
                $active={isCommentsOpen}
                onClick={() => setIsCommentsOpen((current) => !current)}
                aria-label={isCommentsOpen ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                disabled={idea.challengeStatus === 'EVALUATION'}
                style={idea.challengeStatus === 'EVALUATION' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
                <Counter>{commentsCount}</Counter>
              </CommentToggleButton>
            </ActionsRow>
          </SectionBlock>

          {isCommentsOpen && (
            <SectionBlock>
              <CommentsSection
                ideaId={idea.id}
                title="Debate y feedback"
                onCountChange={setCommentsCount}
              />
            </SectionBlock>
          )}
        </Body>
      </ModalContainer>
    </ModalOverlay>
  );

  return createPortal(modalContent, document.body);
};

export default IdeaDetailModal;