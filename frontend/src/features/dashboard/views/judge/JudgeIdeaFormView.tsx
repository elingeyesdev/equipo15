import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import BackButton from '../../../../components/common/BackButton';
import { useAuth } from '../../../../context/AuthContext';
import InfoTooltip from '../../../../components/common/InfoTooltip';

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
`;

const checkPop = keyframes`
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`;

/* ─── Types ─── */
interface CriterionItem {
  id: string;
  name: string;
  weight: number;
}

interface IdeaItem {
  id: string;
  title: string;
  problem: string;
  solution: string;
  isAnonymous: boolean;
  author: { id: string; displayName: string; avatarUrl?: string } | null;
  challengeId: string;
  challengeTitle: string;
  challengeContext: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  multimediaLinks?: string[] | null;
}

/* ─── Layout ─── */
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  animation: ${fadeIn} 0.35s ease both;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const PageTitle = styled.h2`
  font-size: 20px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  flex: 1;
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ─── Left Column: Idea Context ─── */
const ContextPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const IdeaCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px;
  border: 1.5px solid rgba(72,80,84,0.08);
  box-shadow: 0 2px 12px rgba(72,80,84,0.06);
`;

const IdeaBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(254,65,10,0.1), rgba(254,65,10,0.05));
  border: 1px solid rgba(254,65,10,0.15);
  font-size: 11px;
  font-weight: 700;
  color: #c2410c;
  margin-bottom: 16px;
  align-self: flex-start;
`;

const IdeaTitle = styled.h1`
  font-size: 22px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0 0 20px;
  line-height: 1.3;
`;

const SectionLabel = styled.p`
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
`;

const SectionContent = styled.p`
  font-size: 14px;
  color: #374151;
  line-height: 1.75;
  margin: 0 0 20px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(72,80,84,0.07);
  margin: 8px 0 20px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const MetaChip = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 12px;
`;

const AuthorAvatar = styled.div<{ $url?: string }>`
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: ${p => p.$url ? `url(${p.$url}) center/cover` : '#e5e7eb'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #9ca3af;
  flex-shrink: 0;
`;

const ContextBox = styled.div`
  background: linear-gradient(135deg, rgba(72,80,84,0.04), rgba(72,80,84,0.02));
  border: 1px solid rgba(72,80,84,0.08);
  border-radius: 14px;
  padding: 20px;
`;

/* ─── Right Column: Evaluation Form ─── */
const StickyPanel = styled.div`
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${slideInRight} 0.4s ease both;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1.5px solid rgba(72,80,84,0.08);
  box-shadow: 0 4px 20px rgba(72,80,84,0.08);
`;

const FormTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0 0 20px;
`;

const CriterionBlock = styled.div<{ $index: number }>`
  margin-bottom: 22px;
  animation: ${fadeIn} 0.3s ${p => p.$index * 0.06}s ease both;
`;

const CriterionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CriterionName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #374151;
`;

const CriterionWeight = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  background: #f1f3f5;
  padding: 3px 8px;
  border-radius: 6px;
`;

const ScoreDisplay = styled.span<{ $score: number }>`
  font-size: 22px;
  font-weight: 900;
  color: ${p =>
    p.$score <= 3 ? '#ef4444' :
    p.$score <= 6 ? '#f97316' :
    p.$score <= 8 ? '#eab308' :
    '#22c55e'
  };
  min-width: 36px;
  text-align: right;
  line-height: 1;
`;

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScoreLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #9ca3af;
  font-weight: 600;
  margin-top: 4px;
`;

const StyledSlider = styled.input<{ $score: number }>`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: ${p => {
    const pct = ((p.$score - 1) / 9) * 100;
    const color = p.$score <= 3 ? '#ef4444' : p.$score <= 6 ? '#f97316' : p.$score <= 8 ? '#eab308' : '#22c55e';
    return `linear-gradient(to right, ${color} ${pct}%, #e5e7eb ${pct}%)`;
  }};
  outline: none;
  cursor: pointer;
  flex: 1;
  transition: background 0.2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${p =>
      p.$score <= 3 ? '#ef4444' :
      p.$score <= 6 ? '#f97316' :
      p.$score <= 8 ? '#eab308' :
      '#22c55e'
    };
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    transition: transform 0.15s, background 0.2s;

    &:hover { transform: scale(1.15); }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: ${p =>
      p.$score <= 3 ? '#ef4444' :
      p.$score <= 6 ? '#f97316' :
      p.$score <= 8 ? '#eab308' :
      '#22c55e'
    };
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
`;

const ScoreSummary = styled.div`
  background: linear-gradient(135deg, ${Pista8Theme.secondary}, #2d3748);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0 20px;
`;

const SummaryLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
`;

const SummaryScore = styled.span`
  font-size: 28px;
  font-weight: 900;
  color: white;
`;

const FeedbackTextarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${Pista8Theme.primary};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: ${p => p.$loading ? '#9ca3af' : `linear-gradient(135deg, ${Pista8Theme.primary}, #e63a09)`};
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: ${p => p.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(254,65,10,0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${p => !p.$loading && css`animation: ${pulse} 3s ease-in-out infinite;`}
`;

/* ─── Success Overlay ─── */
const SuccessOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px 48px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
`;

const CheckCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  animation: ${checkPop} 0.5s ease both;
`;

const LoadingShimmer = styled.div`
  background: linear-gradient(90deg, #f1f3f5 25%, #e5e7eb 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 20px;
`;

/* ─── Helpers ─── */
const formatDate = (d?: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ─── Component ─── */
const JudgeIdeaFormView: React.FC = () => {
  const navigate = useNavigate();
  const { challengeId, ideaId } = useParams<{ challengeId: string; ideaId: string }>();
  const { userProfile } = useAuth();

  const [idea, setIdea] = useState<IdeaItem | null>(null);
  const [criteria, setCriteria] = useState<CriterionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    if (!challengeId || !ideaId) return;
    setLoading(true);
    try {
      const [ideasData, criteriaData] = await Promise.all([
        challengeService.getJudgeAssignedIdeas(),
        challengeService.getChallengeCriteria(challengeId),
      ]);

      const found = Array.isArray(ideasData)
        ? ideasData.find(i => i.id === ideaId) ?? null
        : null;
      setIdea(found);

      const criList = Array.isArray(criteriaData) ? criteriaData : [];
      setCriteria(criList);

      // Initialize scores at 5 (middle)
      const initial: Record<string, number> = {};
      criList.forEach(c => { initial[c.id] = 5; });
      setScores(initial);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, [challengeId, ideaId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Weighted partial score calculation
  const partialScore = criteria.length > 0
    ? criteria.reduce((sum, c) => sum + (scores[c.id] || 0) * (c.weight / 100), 0)
    : 0;

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores(prev => ({ ...prev, [criterionId]: value }));
  };

  const handleSubmit = async () => {
    if (!idea || !userProfile) return;
    setSubmitting(true);
    setError(null);
    try {
      const firebaseUid = userProfile.uid || (userProfile as any).firebaseUid || '';
      await challengeService.submitEvaluation({
        ideaId: idea.id,
        judgeId: firebaseUid,
        feedback: feedback.trim() || undefined,
        scores: criteria.map(c => ({ criterionId: c.id, score: scores[c.id] || 5 })),
      });
      setSuccess(true);
      toastRef.current = setTimeout(() => {
        navigate(`/dashboard/judge/evaluation/${challengeId}`);
      }, 2200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Ocurrió un error al guardar la evaluación.';
      setError(Array.isArray(msg) ? msg.join(' • ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <TwoColumns>
          <LoadingShimmer style={{ height: 500 }} />
          <LoadingShimmer style={{ height: 400 }} />
        </TwoColumns>
      </PageWrapper>
    );
  }

  if (!idea) {
    return (
      <PageWrapper>
        <TopBar>
          <BackButton onClick={() => navigate(`/dashboard/judge/evaluation/${challengeId}`)} />
          <PageTitle>Idea no encontrada</PageTitle>
        </TopBar>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>No se pudo cargar la información de esta idea. Vuelve al listado e intenta de nuevo.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {success && (
        <SuccessOverlay>
          <SuccessCard>
            <CheckCircle>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </CheckCircle>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: Pista8Theme.secondary }}>¡Evaluación Enviada!</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Tu calificación ha sido guardada correctamente.<br />Redirigiendo...</p>
          </SuccessCard>
        </SuccessOverlay>
      )}

      <TopBar>
        <BackButton onClick={() => navigate(`/dashboard/judge/evaluation/${challengeId}`)} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {idea.challengeTitle}
          </p>
          <PageTitle>Calificar Idea</PageTitle>
        </div>
      </TopBar>

      <TwoColumns>
        {/* ── LEFT: Idea Context ── */}
        <ContextPanel>
          <IdeaCard>
            <IdeaBadge>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Idea Finalista
            </IdeaBadge>

            <IdeaTitle>{idea.title}</IdeaTitle>

            {idea.problem === idea.solution ? (
              <>
                <SectionLabel>Descripción de la Idea</SectionLabel>
                <SectionContent>{idea.problem}</SectionContent>
              </>
            ) : (
              <>
                <SectionLabel>Problema que resuelve</SectionLabel>
                <SectionContent>{idea.problem}</SectionContent>
                <Divider />
                <SectionLabel>Solución propuesta</SectionLabel>
                <SectionContent>{idea.solution}</SectionContent>
              </>
            )}

            <Divider />

            <MetaRow>
              <MetaChip>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {idea.likesCount} likes
              </MetaChip>
              <MetaChip>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {idea.commentsCount} comentarios
              </MetaChip>
              <MetaChip>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(idea.createdAt)}
              </MetaChip>
            </MetaRow>

            {!idea.isAnonymous && idea.author && (
              <AuthorRow>
                <AuthorAvatar $url={idea.author.avatarUrl}>
                  {!idea.author.avatarUrl && idea.author.displayName?.[0]?.toUpperCase()}
                </AuthorAvatar>
                {idea.author.displayName}
              </AuthorRow>
            )}

            {idea.isAnonymous && (
              <AuthorRow>
                <AuthorAvatar>?</AuthorAvatar>
                Autor anónimo
              </AuthorRow>
            )}
          </IdeaCard>

          {idea.challengeContext && (
            <ContextBox>
              <SectionLabel style={{ margin: '0 0 8px' }}>Contexto del Reto</SectionLabel>
              <SectionContent style={{ margin: 0 }}>{idea.challengeContext}</SectionContent>
            </ContextBox>
          )}
        </ContextPanel>

        {/* ── RIGHT: Evaluation Form ── */}
        <StickyPanel>
          <FormCard>
            <FormTitle>
              <span style={{ marginRight: 8 }}>⚖️</span>
              Formulario de Calificación
            </FormTitle>

            {criteria.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Este reto no tiene criterios de evaluación configurados.
              </p>
            ) : (
              <>
                {criteria.map((criterion, idx) => (
                  <CriterionBlock key={criterion.id} $index={idx}>
                    <CriterionHeader>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CriterionName>{criterion.name}</CriterionName>
                        {criterion.description && (
                          <InfoTooltip text={criterion.description} size={16} width={260} />
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CriterionWeight>Peso: {criterion.weight}%</CriterionWeight>
                        <ScoreDisplay $score={scores[criterion.id] || 5}>
                          {scores[criterion.id] || 5}
                        </ScoreDisplay>
                      </div>
                    </CriterionHeader>
                    <SliderWrapper>
                      <StyledSlider
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={scores[criterion.id] || 5}
                        $score={scores[criterion.id] || 5}
                        onChange={e => handleScoreChange(criterion.id, Number(e.target.value))}
                      />
                    </SliderWrapper>
                    <ScoreLabels>
                      <span>1 — Muy bajo</span>
                      <span>5 — Medio</span>
                      <span>10 — Excelente</span>
                    </ScoreLabels>
                  </CriterionBlock>
                ))}

                <ScoreSummary>
                  <div>
                    <SummaryLabel>Puntaje Parcial Ponderado</SummaryLabel>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                      Basado en los pesos de cada criterio
                    </p>
                  </div>
                  <SummaryScore>{partialScore.toFixed(1)}<span style={{ fontSize: 14, opacity: 0.6 }}>/10</span></SummaryScore>
                </ScoreSummary>
              </>
            )}

            <SectionLabel style={{ margin: '0 0 8px' }}>Comentario / Retroalimentación (opcional)</SectionLabel>
            <FeedbackTextarea
              placeholder="Describe tus observaciones sobre esta idea de manera constructiva..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              maxLength={1000}
            />
            <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', margin: '4px 0 16px' }}>
              {feedback.length}/1000
            </p>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>
                {error}
              </div>
            )}

            <SubmitBtn
              onClick={handleSubmit}
              disabled={submitting || criteria.length === 0 || success}
              $loading={submitting}
            >
              {submitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Enviar Evaluación
                </>
              )}
            </SubmitBtn>
          </FormCard>
        </StickyPanel>
      </TwoColumns>
    </PageWrapper>
  );
};

export default JudgeIdeaFormView;
