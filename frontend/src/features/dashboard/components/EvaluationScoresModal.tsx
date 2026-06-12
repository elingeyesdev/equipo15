import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { ChevronDown, Loader2, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pista8Theme } from '@/config/theme';
import {
  evaluationService,
  type IdeaEvaluationBreakdown,
} from '@/services/evaluation.service';
import {
  AdminAuditBanner,
  AdminCloseBtn,
  AdminCriteriaCard,
  AdminCriteriaGrid,
  AdminCriteriaName,
  AdminCriteriaValue,
  AdminCriteriaWeight,
  AdminHeaderContent,
  AdminModalBody,
  AdminModalCard,
  AdminModalHeader,
  AdminModalOverlay,
  AdminModalSubtitle,
  AdminModalTitle,
  AdminSectionTitle,
  AdminSummaryCard,
  AdminSummaryGrid,
  AdminSummaryLabel,
  AdminSummaryValue,
} from './admin/AdminModalStyles';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const CriteriaSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled(AdminSectionTitle)`
`;

const AccordionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AccordionItem = styled.div<{ $open: boolean }>`
  border: 1px solid ${({ $open }) => ($open ? `${Pista8Theme.primary}33` : '#e2e8f0')};
  border-radius: 16px;
  overflow: hidden;
  background: ${({ $open }) => ($open ? '#fff7f5' : 'white')};
  transition: border-color 0.2s ease, background 0.2s ease;
`;

const AccordionHeader = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  text-align: left;
`;

const JudgeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const JudgeAvatar = styled.div<{ $url?: string | null }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : '#f1f5f9')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: #94a3b8;
  flex-shrink: 0;
`;

const JudgeMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const JudgeName = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
`;

const JudgeEmail = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JudgeScore = styled.span`
  font-size: 15px;
  font-weight: 900;
  color: ${Pista8Theme.primary};
  flex-shrink: 0;
`;

const ChevronWrap = styled.span<{ $open: boolean }>`
  display: flex;
  color: #64748b;
  transition: transform 0.2s ease;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
`;

const AccordionBody = styled.div`
  padding: 0 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
`;

const ScoreCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ScoreCardName = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
`;

const ScoreCardValue = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
`;

const ScoreCardWeight = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 2px;
`;

const FeedbackBox = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
`;

const FeedbackLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
`;

const FeedbackText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  font-weight: 600;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 20px;
  color: #64748b;
  font-weight: 600;
`;

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export interface EvaluationScoresModalProps {
  ideaId: string;
  ideaTitle?: string;
  auditMode?: boolean;
  onClose: () => void;
}

export function EvaluationScoresModal({
  ideaId,
  ideaTitle,
  auditMode = false,
  onClose,
}: EvaluationScoresModalProps) {
  const [data, setData] = useState<IdeaEvaluationBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [openJudgeId, setOpenJudgeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreakdown = async () => {
      setLoading(true);
      try {
        const result = await evaluationService.getByIdea(ideaId);
        setData(result);
        if (result.evaluations.length > 0) {
          setOpenJudgeId(result.evaluations[0].id);
        }
      } catch {
        toast.error('No se pudo cargar el desglose de evaluaciones.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    void fetchBreakdown();
  }, [ideaId, onClose]);

  const toggleJudge = (evaluationId: string) => {
    setOpenJudgeId((current) => (current === evaluationId ? null : evaluationId));
  };

  return createPortal(
    <AdminModalOverlay onClick={onClose}>
      <AdminModalCard onClick={(e) => e.stopPropagation()}>
        {auditMode && <AdminAuditBanner>Auditoría de Rúbricas</AdminAuditBanner>}

        <AdminModalHeader>
          <AdminHeaderContent>
            <AdminModalTitle>{data?.ideaTitle || ideaTitle || 'Desglose de evaluaciones'}</AdminModalTitle>
            {data?.challengeTitle && (
              <AdminModalSubtitle>{data.challengeTitle}</AdminModalSubtitle>
            )}
          </AdminHeaderContent>
          <AdminCloseBtn type="button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </AdminCloseBtn>
        </AdminModalHeader>

        <AdminModalBody>
          {loading ? (
            <LoadingState>
              <SpinIcon size={18} />
              Cargando evaluaciones...
            </LoadingState>
          ) : !data || data.evaluations.length === 0 ? (
            <EmptyState>
              Esta idea aún no tiene evaluaciones de jueces registradas.
            </EmptyState>
          ) : (
            <>
              <AdminSummaryGrid>
                <AdminSummaryCard $accent={Pista8Theme.primary}>
                  <AdminSummaryValue $accent={Pista8Theme.primary}>
                    {data.summary.averageFinalScore.toFixed(2)}
                  </AdminSummaryValue>
                  <AdminSummaryLabel>Puntaje promedio</AdminSummaryLabel>
                </AdminSummaryCard>
                <AdminSummaryCard $accent="#2563eb">
                  <AdminSummaryValue $accent="#2563eb">
                    {data.summary.judgesCount}
                  </AdminSummaryValue>
                  <AdminSummaryLabel>Jueces evaluadores</AdminSummaryLabel>
                </AdminSummaryCard>
                <AdminSummaryCard $accent="#16a34a">
                  <AdminSummaryValue $accent="#16a34a">
                    {data.finalScore > 0 ? data.finalScore.toFixed(2) : data.summary.averageFinalScore.toFixed(2)}
                  </AdminSummaryValue>
                  <AdminSummaryLabel>Nota consolidada</AdminSummaryLabel>
                </AdminSummaryCard>
              </AdminSummaryGrid>

              {data.summary.criteriaAverages.length > 0 && (
                <CriteriaSection>
                  <AdminSectionTitle>Promedio por criterio</AdminSectionTitle>
                  <AdminCriteriaGrid>
                    {data.summary.criteriaAverages.map((criterion) => (
                      <AdminCriteriaCard key={criterion.id}>
                        <AdminCriteriaValue>{criterion.averageScore.toFixed(1)}/10</AdminCriteriaValue>
                        <AdminCriteriaName>{criterion.name}</AdminCriteriaName>
                        <AdminCriteriaWeight>Peso: {criterion.weight}%</AdminCriteriaWeight>
                      </AdminCriteriaCard>
                    ))}
                  </AdminCriteriaGrid>
                </CriteriaSection>
              )}

              <SectionTitle>Evaluaciones por juez</SectionTitle>
              <AccordionList>
                {data.evaluations.map((evaluation) => {
                  const isOpen = openJudgeId === evaluation.id;
                  const judgeName =
                    evaluation.judge.nickname ||
                    evaluation.judge.displayName ||
                    evaluation.judge.email.split('@')[0];

                  return (
                    <AccordionItem key={evaluation.id} $open={isOpen}>
                      <AccordionHeader
                        type="button"
                        onClick={() => toggleJudge(evaluation.id)}
                      >
                        <JudgeInfo>
                          <JudgeAvatar $url={evaluation.judge.avatarUrl}>
                            {!evaluation.judge.avatarUrl && judgeName[0]?.toUpperCase()}
                          </JudgeAvatar>
                          <JudgeMeta>
                            <JudgeName>{judgeName}</JudgeName>
                            <JudgeEmail>{evaluation.judge.email}</JudgeEmail>
                          </JudgeMeta>
                        </JudgeInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <JudgeScore>{evaluation.judgeScore.toFixed(2)}</JudgeScore>
                          <ChevronWrap $open={isOpen}>
                            <ChevronDown size={18} />
                          </ChevronWrap>
                        </div>
                      </AccordionHeader>

                      {isOpen && (
                        <AccordionBody>
                          <ScoreGrid>
                            {evaluation.scores.map((item) => (
                              <ScoreCard key={item.criterion.id}>
                                <ScoreCardName>{item.criterion.name}</ScoreCardName>
                                <ScoreCardValue>{item.score}/10</ScoreCardValue>
                                <ScoreCardWeight>Peso: {item.criterion.weight}%</ScoreCardWeight>
                              </ScoreCard>
                            ))}
                          </ScoreGrid>

                          <FeedbackBox>
                            <FeedbackLabel>
                              <MessageSquare size={13} />
                              Retroalimentación · {formatDate(evaluation.createdAt)}
                            </FeedbackLabel>
                            <FeedbackText>
                              {evaluation.feedback?.trim()
                                ? evaluation.feedback
                                : 'El juez no dejó comentarios adicionales.'}
                            </FeedbackText>
                          </FeedbackBox>
                        </AccordionBody>
                      )}
                    </AccordionItem>
                  );
                })}
              </AccordionList>
            </>
          )}
        </AdminModalBody>
      </AdminModalCard>
    </AdminModalOverlay>,
    document.body,
  );
}
