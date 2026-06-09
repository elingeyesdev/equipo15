import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { ChevronDown, Loader2, MessageSquare, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pista8Theme } from '@/config/theme';
import {
  evaluationService,
  type IdeaEvaluationBreakdown,
} from '@/services/evaluation.service';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  animation: ${fadeIn} 0.2s ease;
  padding: 24px;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
`;

const AuditBanner = styled.div`
  background: #1e293b;
  color: #f8fafc;
  text-align: center;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Header = styled.div`
  padding: 24px 28px 18px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  margin: 0;
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
  flex-shrink: 0;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 28px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(15, 23, 42, 0.15);
    border-radius: 99px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div<{ $accent: string }>`
  background: ${({ $accent }) => `${$accent}0d`};
  border: 1px solid ${({ $accent }) => `${$accent}22`};
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SummaryValue = styled.span<{ $accent: string }>`
  font-size: 24px;
  font-weight: 900;
  color: ${({ $accent }) => $accent};
  line-height: 1;
`;

const SummaryLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const CriteriaSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const CriteriaList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CriteriaPill = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
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
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        {auditMode && <AuditBanner>Modo: Auditoría de Rúbricas</AuditBanner>}

        <Header>
          <HeaderContent>
            <Title>{data?.ideaTitle || ideaTitle || 'Desglose de evaluaciones'}</Title>
            {data?.challengeTitle && (
              <Subtitle>Reto: {data.challengeTitle}</Subtitle>
            )}
          </HeaderContent>
          <CloseBtn type="button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </CloseBtn>
        </Header>

        <Body>
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
              <SummaryGrid>
                <SummaryCard $accent={Pista8Theme.primary}>
                  <SummaryValue $accent={Pista8Theme.primary}>
                    {data.summary.averageFinalScore.toFixed(2)}
                  </SummaryValue>
                  <SummaryLabel>Puntaje promedio</SummaryLabel>
                </SummaryCard>
                <SummaryCard $accent="#2563eb">
                  <SummaryValue $accent="#2563eb">
                    {data.summary.judgesCount}
                  </SummaryValue>
                  <SummaryLabel>Jueces evaluadores</SummaryLabel>
                </SummaryCard>
                <SummaryCard $accent="#16a34a">
                  <SummaryValue $accent="#16a34a">
                    {data.finalScore > 0 ? data.finalScore.toFixed(2) : data.summary.averageFinalScore.toFixed(2)}
                  </SummaryValue>
                  <SummaryLabel>Nota consolidada</SummaryLabel>
                </SummaryCard>
              </SummaryGrid>

              {data.summary.criteriaAverages.length > 0 && (
                <CriteriaSection>
                  <SectionTitle>Promedio por criterio</SectionTitle>
                  <CriteriaList>
                    {data.summary.criteriaAverages.map((criterion) => (
                      <CriteriaPill key={criterion.id}>
                        <Trophy size={13} color={Pista8Theme.primary} />
                        {criterion.name}: {criterion.averageScore.toFixed(1)}/10
                        <span style={{ color: '#94a3b8' }}>({criterion.weight}%)</span>
                      </CriteriaPill>
                    ))}
                  </CriteriaList>
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
        </Body>
      </ModalCard>
    </Overlay>,
    document.body,
  );
}
