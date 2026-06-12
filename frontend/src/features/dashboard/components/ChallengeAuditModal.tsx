import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { ClipboardList, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pista8Theme } from '@/config/theme';
import { adminService } from '@/services/admin.service';
import { AdminIdeaUnifiedModal } from './admin/AdminIdeaUnifiedModal';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: ${fadeIn} 0.2s ease;
  padding: 24px;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  animation: ${slideUp} 0.3s ease;
  overflow: hidden;
`;

const AuditBanner = styled.div`
  background: ${Pista8Theme.primary};
  color: white;
  text-align: center;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Header = styled.div`
  padding: 22px 26px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
`;

const CloseBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 26px 24px;
`;

const IdeaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const IdeaMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const IdeaTitle = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
`;

const IdeaAuthor = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
`;

const AuditBtn = styled.button`
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(254, 65, 10, 0.2);
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover:not(:disabled) {
    background: #e63a09;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254, 65, 10, 0.3);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 36px 16px;
  color: #64748b;
  font-weight: 600;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 16px;
  color: #64748b;
  font-weight: 600;
`;

interface AuditIdea {
  id: string;
  title: string;
  status: string;
  finalScore: number;
  authorName: string;
  evaluationsCount: number;
  problem?: string;
  solution?: string;
  tags?: string[];
  createdAt?: string;
}

interface ChallengeAuditModalProps {
  challengeId: string;
  challengeTitle: string;
  onClose: () => void;
}

export function ChallengeAuditModal({
  challengeId,
  challengeTitle,
  onClose,
}: ChallengeAuditModalProps) {
  const [ideas, setIdeas] = useState<AuditIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<AuditIdea | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      try {
        const result = await adminService.getChallengeAuditIdeas(challengeId);
        setIdeas(result.ideas);
      } catch {
        toast.error('No se pudo cargar las ideas finalistas del reto.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    void fetchIdeas();
  }, [challengeId, onClose]);

  return (
    <>
      {createPortal(
        <Overlay onClick={onClose}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <AuditBanner>Auditoría de Rúbricas</AuditBanner>
            <Header>
              <div>
                <Title>
                  <ClipboardList size={20} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                  Auditoría de finalistas
                </Title>
                <Subtitle>{challengeTitle}</Subtitle>
              </div>
              <CloseBtn type="button" onClick={onClose} aria-label="Cerrar">
                <X size={18} />
              </CloseBtn>
            </Header>

            <Body>
              {loading ? (
                <LoadingState>
                  <Loader2 size={18} />
                  Cargando ideas finalistas...
                </LoadingState>
              ) : ideas.length === 0 ? (
                <EmptyState>
                  Este reto no tiene ideas finalistas o ganadoras para auditar.
                </EmptyState>
              ) : (
                ideas.map((idea) => (
                  <IdeaRow key={idea.id}>
                    <IdeaMeta>
                      <IdeaTitle>{idea.title}</IdeaTitle>
                      <IdeaAuthor>
                        {idea.authorName} · {idea.evaluationsCount} evaluación{idea.evaluationsCount !== 1 ? 'es' : ''}
                        {idea.finalScore > 0 && ` · ${idea.finalScore.toFixed(2)} pts`}
                      </IdeaAuthor>
                    </IdeaMeta>
                    <AuditBtn
                      type="button"
                      onClick={() => setSelectedIdea(idea)}
                    >
                      Gestionar
                    </AuditBtn>
                  </IdeaRow>
                ))
              )}
            </Body>
          </ModalCard>
        </Overlay>,
        document.body,
      )}

      {selectedIdea && (
        <AdminIdeaUnifiedModal
          ideaId={selectedIdea.id}
          ideaTitle={selectedIdea.title}
          defaultTab="evaluaciones"
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </>
  );
}
