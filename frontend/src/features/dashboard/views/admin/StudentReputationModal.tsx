import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { toast } from 'sonner';
import { Pista8Theme } from '@/config/theme';
import { adminService } from '@/services/admin.service';
import { ModalContentSkeleton } from '../../../../components/SkeletonLoaders';
import type { UserReputation, ReputationIdea } from '@/types/models';
import { AdminIdeaUnifiedModal } from '../../components/admin/AdminIdeaUnifiedModal';
import { Eye } from 'lucide-react';
import { premiumTooltip } from '../../styles/CommonStyles';
import { StatusBadge } from '../../../../components/common/StatusBadge';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(248, 249, 250, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: ${fadeIn} 0.2s ease;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }

  @media (min-width: 1025px) {
    padding-left: 324px; /* 300px sidebar + 24px default padding */
  }
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 28px;
  width: 100%;
  max-width: 820px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(72, 80, 84, 0.14), 0 0 0 1px rgba(72, 80, 84, 0.06);
  animation: ${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  @media (max-width: 768px) {
    max-height: 95vh;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    max-height: 95vh;
    border-radius: 16px;
  }
`;

const ModalHeader = styled.div`
  padding: 28px 32px 20px;
  border-bottom: 1px solid rgba(72, 80, 84, 0.08);
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 20px 20px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 16px 14px;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const UserInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.div<{ $url?: string | null }>`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : '#fff2ee')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: ${Pista8Theme.primary};
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid rgba(72, 80, 84, 0.06);
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
`;

const UserEmail = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
`;

const UserFaculty = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CloseBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(72, 80, 84, 0.1);
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #64748b;
  flex-shrink: 0;

  &:hover {
    background: #f1f5f9;
    border-color: rgba(72, 80, 84, 0.18);
    color: #0f172a;
  }
`;

const MetricsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  animation: ${fadeUp} 0.4s ease 0.1s both;

  > * {
    flex: 1 1 120px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    > * {
      flex: 1 1 auto;
    }
  }
`;

const MetricCard = styled.div<{ $accent: string }>`
  background: ${({ $accent }) => `${$accent}0a`};
  border: 1px solid ${({ $accent }) => `${$accent}1a`};
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
`;

const MetricValue = styled.span<{ $accent: string }>`
  font-size: 24px;
  font-weight: 900;
  color: ${({ $accent }) => $accent};
  line-height: 1;
`;

const MetricLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(72, 80, 84, 0.15);
    border-radius: 99px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  padding: 20px 32px 12px;
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionCount = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: white;
  background: #fe410a;
  border-radius: 999px;
  padding: 2px 8px;
  line-height: 1.4;
`;

const IdeaTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
`;

const IdeaTableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(72, 80, 84, 0.2);
    border-radius: 4px;
  }
`;

const ITH = styled.th`
  padding: 10px 24px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;

`;

const ITR = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: #f8fafc;
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const ITD = styled.td`
  padding: 14px 24px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 13px;
  color: #1e293b;
  text-align: center;
`;

const ChallengeName = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ChallengeLogo = styled.div<{ $url?: string | null }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : 'linear-gradient(135deg, #fe410a 0%, #ff6b3d 100%)')};
  flex-shrink: 0;
  border: 1px solid rgba(0,0,0,0.06);
`;

const ChallengeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ChallengeTitle = styled.span`
  font-weight: 700;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.3;
`;

const IdeaTitle = styled.span`
  font-weight: 600;
  color: #334155;
  font-size: 13px;
`;



const ActionBtnGroup = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const IconAction = styled.button<{ $disabled?: boolean; $tooltipText?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(254, 65, 10, 0.18);
  background: ${Pista8Theme.primary};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(254, 65, 10, 0.18);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(254, 65, 10, 0.28);
  }

  &:disabled {
    filter: grayscale(0.4);
  }

  ${premiumTooltip}
`;


const EmptyIdeas = styled.div`
  padding: 40px 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
`;

const PenaltySection = styled.div`
  margin: 0 32px 16px;
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.14);
  animation: ${fadeUp} 0.4s ease 0.2s both;
`;

const PenaltyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(239, 68, 68, 0.08);
  }
`;

const PenaltyReason = styled.span`
  font-weight: 700;
  color: #dc2626;
`;

const PenaltyDate = styled.span`
  font-weight: 500;
  color: #94a3b8;
  font-size: 12px;
`;

const ModalFooter = styled.div`
  padding: 20px 32px;
  border-top: 1px solid rgba(72, 80, 84, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  background: #fafbfc;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    padding: 16px;
    gap: 8px;
  }
`;

const WarningBanner = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
  line-height: 1.4;
`;

const PromoteBtn = styled.button<{ $disabled?: boolean }>`
  padding: 12px 24px;
  border-radius: 14px;
  border: none;
  font-size: 14px;
  font-weight: 800;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  background: ${({ $disabled }) => ($disabled ? '#e2e8f0' : '#FE410A')};
  color: ${({ $disabled }) => ($disabled ? '#94a3b8' : 'white')};
  box-shadow: ${({ $disabled }) => ($disabled ? 'none' : '0 4px 16px rgba(254, 65, 10, 0.3)')};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(254, 65, 10, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const CancelBtn = styled.button`
  padding: 12px 20px;
  border-radius: 14px;
  border: 1px solid rgba(72, 80, 84, 0.14);
  background: white;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f8fafc;
    border-color: rgba(72, 80, 84, 0.22);
  }
`;


const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(248, 249, 250, 0.90);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  animation: ${fadeIn} 0.15s ease;

  @media (min-width: 1025px) {
    padding-left: 300px;
  }
`;

const ConfirmCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px 36px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 16px 48px rgba(72, 80, 84, 0.14), 0 0 0 1px rgba(72, 80, 84, 0.06);
  text-align: center;
  animation: ${slideUp} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 900;
  color: #1a1f22;
`;

const ConfirmText = styled.p`
  margin: 0 0 24px;
  color: #5b6470;
  line-height: 1.6;
  font-size: 14px;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Publicada',
  FINALIST: 'Finalista',
  WINNER: 'Ganadora',
  DISQUALIFIED: 'Descalificada',
  DRAFT: 'Borrador',
};


const PENALTY_LABELS: Record<string, string> = {
  EXCESSIVE_LIKE_REMOVAL: 'Retiro excesivo de likes',
  COMMENT_ABUSE: 'Abuso en comentarios',
  SPAM: 'Spam',
  ADMIN_MANUAL: 'Penalización manual',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(date);
};



interface StudentReputationModalProps {
  userId: string;
  onClose: () => void;
  onPromoted: (userId: string) => void;
}

export const StudentReputationModal = ({ userId, onClose, onPromoted }: StudentReputationModalProps) => {
  const [data, setData] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailIdea, setDetailIdea] = useState<ReputationIdea | null>(null);
  const [evaluationIdea, setEvaluationIdea] = useState<ReputationIdea | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    const fetchReputation = async () => {
      setLoading(true);
      try {
        const result = await adminService.getUserReputation(userId);
        setData(result);
      } catch {
        toast.error('No se pudo cargar el perfil de reputación.');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    void fetchReputation();
  }, [userId]);

  const handlePromote = async () => {
    setPromoting(true);
    try {
      await adminService.updateUserRole(userId, 'JUDGE');
      toast.success(`${data?.user.displayName} ha sido promovido a Juez.`);
      setShowConfirm(false);
      onPromoted(userId);
    } catch {
      toast.error('Error al promover al usuario.');
    } finally {
      setPromoting(false);
    }
  };

  const hasActivePenalties = (data?.metrics.activePenalties ?? 0) > 0;

  return createPortal(
    <>
      <Overlay onClick={onClose}>
        <ModalCard onClick={(e) => e.stopPropagation()}>
          {loading || !data ? (
            <div style={{ padding: '40px' }}>
              <ModalContentSkeleton rows={8} />
            </div>
          ) : (
            <>
              <ModalHeader>
                <HeaderTop>
                  <UserInfoRow>
                    <Avatar $url={data.user.avatarUrl}>
                      {!data.user.avatarUrl && (data.user.displayName?.[0]?.toUpperCase() || '?')}
                    </Avatar>
                    <UserMeta>
                      <UserName>{data.user.displayName}</UserName>
                      <UserEmail>{data.user.email}</UserEmail>
                      {data.user.faculty && <UserFaculty>{data.user.faculty}</UserFaculty>}
                    </UserMeta>
                  </UserInfoRow>
                  <CloseBtn type="button" onClick={onClose} aria-label="Cerrar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </CloseBtn>
                </HeaderTop>

                <MetricsGrid>
                  <MetricCard $accent={Pista8Theme.primary}>
                    <MetricValue $accent={Pista8Theme.primary}>{data.metrics.totalIdeas}</MetricValue>
                    <MetricLabel>Ideas</MetricLabel>
                  </MetricCard>
                  <MetricCard $accent={Pista8Theme.primary}>
                    <MetricValue $accent={Pista8Theme.primary}>{data.metrics.finalistIdeas}</MetricValue>
                    <MetricLabel>Finalista</MetricLabel>
                  </MetricCard>
                  <MetricCard $accent={Pista8Theme.primary}>
                    <MetricValue $accent={Pista8Theme.primary}>{data.metrics.winnerIdeas}</MetricValue>
                    <MetricLabel>Ganadora</MetricLabel>
                  </MetricCard>
                  <MetricCard $accent={Pista8Theme.primary}>
                    <MetricValue $accent={Pista8Theme.primary}>{data.user.totalPoints}</MetricValue>
                    <MetricLabel>Puntos</MetricLabel>
                  </MetricCard>
                  <MetricCard $accent={Pista8Theme.primary}>
                    <MetricValue $accent={Pista8Theme.primary}>
                      {data.metrics.activePenalties}
                    </MetricValue>
                    <MetricLabel>Sanciones</MetricLabel>
                  </MetricCard>
                </MetricsGrid>
              </ModalHeader>

              <ModalBody>
                {data.penalties.length > 0 && (
                  <>
                    <SectionTitle>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Penalizaciones
                    </SectionTitle>
                    <PenaltySection>
                      {data.penalties.map((p) => (
                        <PenaltyRow key={p.id}>
                          <PenaltyReason>
                            {PENALTY_LABELS[p.reason] || p.reason}
                            {p.isAutomatic && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginLeft: 6 }}>AUTO</span>
                            )}
                          </PenaltyReason>
                          <PenaltyDate>{formatDate(p.createdAt)}</PenaltyDate>
                        </PenaltyRow>
                      ))}
                    </PenaltySection>
                  </>
                )}

                <SectionTitle>
                  Historial de Ideas
                  <SectionCount>{data.ideas.length}</SectionCount>
                </SectionTitle>

                {data.ideas.length === 0 ? (
                  <EmptyIdeas>Este participante aún no ha publicado ideas.</EmptyIdeas>
                ) : (
                  <IdeaTableWrapper>
                  <IdeaTable>
                    <thead>
                      <tr>
                        <ITH>Reto</ITH>
                        <ITH>Idea</ITH>
                        <ITH>Estado</ITH>
                        <ITH>Fecha</ITH>
                        <ITH>Acción</ITH>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ideas.map((idea) => (
                        <ITR key={idea.id}>
                          <ITD>
                            <ChallengeName>
                              <ChallengeLogo $url={idea.challenge.logoUrl} />
                              <ChallengeText>
                                <ChallengeTitle>{idea.challenge.title}</ChallengeTitle>
                              </ChallengeText>
                            </ChallengeName>
                          </ITD>
                          <ITD>
                            <IdeaTitle>{idea.title}</IdeaTitle>
                          </ITD>
                          <ITD>
                            <StatusBadge status={idea.status} label={STATUS_LABELS[idea.status] || idea.status} />
                          </ITD>
                          <ITD style={{ fontSize: 12, color: '#94a3b8' }}>
                            {formatDate(idea.createdAt)}
                          </ITD>
                          <ITD>
                            <ActionBtnGroup>
                              <IconAction
                                type="button"
                                aria-label="Auditar Propuesta"
                                $tooltipText="Auditar Propuesta"
                                onClick={() => setDetailIdea(idea)}
                              >
                                <Eye color="white" size={16} />
                              </IconAction>
                            </ActionBtnGroup>
                          </ITD>
                        </ITR>
                      ))}
                    </tbody>
                  </IdeaTable>
                  </IdeaTableWrapper>
                )}
              </ModalBody>

              <ModalFooter>
                {hasActivePenalties && (
                  <WarningBanner>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Tiene penalizaciones activas — no se puede promover.
                  </WarningBanner>
                )}
                <CancelBtn type="button" onClick={onClose}>Cerrar</CancelBtn>
                <PromoteBtn
                  type="button"
                  $disabled={hasActivePenalties}
                  disabled={hasActivePenalties}
                  onClick={() => setShowConfirm(true)}
                >
                  Promover a Juez
                </PromoteBtn>
              </ModalFooter>
            </>
          )}
        </ModalCard>
      </Overlay>

      {detailIdea && (
        <AdminIdeaUnifiedModal
          ideaId={detailIdea.id}
          ideaTitle={detailIdea.title}
          initialIdea={detailIdea}
          defaultTab="propuesta"
          onClose={() => setDetailIdea(null)}
        />
      )}

      {evaluationIdea && (
        <AdminIdeaUnifiedModal
          ideaId={evaluationIdea.id}
          ideaTitle={evaluationIdea.title}
          initialIdea={evaluationIdea}
          defaultTab="evaluaciones"
          onClose={() => setEvaluationIdea(null)}
        />
      )}

      {showConfirm && data && (
        <ConfirmOverlay onClick={() => setShowConfirm(false)}>
          <ConfirmCard onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle>Confirmar promoción a Juez</ConfirmTitle>
            <ConfirmText>
              ¿Estás seguro de promover a <strong>{data.user.displayName}</strong> al rol de{' '}
              <strong style={{ color: '#FE410A' }}>Juez</strong>? Esta acción es inmediata.
            </ConfirmText>
            <ConfirmActions>
              <CancelBtn type="button" onClick={() => setShowConfirm(false)} disabled={promoting}>
                Cancelar
              </CancelBtn>
              <PromoteBtn type="button" onClick={() => void handlePromote()} disabled={promoting}>
                {promoting ? 'Promoviendo...' : 'Confirmar'}
              </PromoteBtn>
            </ConfirmActions>
          </ConfirmCard>
        </ConfirmOverlay>
      )}
    </>,
    document.body
  );
};
