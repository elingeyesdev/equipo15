import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import BackButton from '../../../../components/common/BackButton';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { History, Eye } from 'lucide-react';

/* ─── Animations ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;



/* ─── Types ─── */
interface JudgeIdeaItem {
  id: string;
  title: string;
  problem: string;
  solution: string;
  isAnonymous: boolean;
  author: { id: string; displayName: string; avatarUrl?: string } | null;
  challengeId: string;
  challengeTitle: string;
  challengeStatus: string;
  challengeContext: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  evaluated: boolean;
  evaluationId: string | null;
  evaluatedAt: string | null;
}

type FilterValue = 'all' | 'pending' | 'evaluated';

/* ─── Styled Components ─── */
const Container = styled.div`
  animation: ${fadeUp} 0.4s ease both;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: clamp(18px, 3.5vw, 22px);
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  margin-left: 10px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 7px 16px;
  border-radius: 10px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  background: ${p => p.$active ? Pista8Theme.primary : '#f1f3f5'};
  color: ${p => p.$active ? 'white' : '#6b7280'};
  &:hover {
    background: ${p => p.$active ? Pista8Theme.primary : '#e5e7eb'};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const Card = styled.div<{ $index: number; $evaluated?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 22px 24px;
  border: 1.5px solid ${p => p.$evaluated ? 'rgba(34,197,94,0.2)' : 'rgba(72,80,84,0.07)'};
  box-shadow: 0 2px 10px rgba(72,80,84,0.06);
  animation: ${fadeUp} 0.3s ${p => p.$index * 0.04}s ease both;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: ${p => p.$evaluated ? 'default' : 'pointer'};

  &:hover {
    border-color: ${p => p.$evaluated ? 'rgba(34,197,94,0.35)' : `rgba(254,65,10,0.2)`};
    box-shadow: 0 8px 24px rgba(72,80,84,0.12);
    transform: translateY(-2px);
  }
`;

const CardChallengeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(254,65,10,0.08), rgba(254,65,10,0.04));
  border: 1px solid rgba(254,65,10,0.12);
  font-size: 11px;
  font-weight: 700;
  color: #c2410c;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: break-word;
  align-self: flex-start;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: #1a1f22;
  margin: 0;
  line-height: 1.35;
  flex: 1;
  word-break: break-word;
  overflow-wrap: break-word;
`;



const CardDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const MetaChip = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: #9ca3af;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(72,80,84,0.06);
  margin-top: auto;
`;

const PrimaryBtn = styled.button`
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #e63a09;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254,65,10,0.25);
  }
`;

const LargeBtn = styled(PrimaryBtn)`
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 12px;
`;

const CompletedTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
`;

const AuthorAvatar = styled.div<{ $url?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: ${p => p.$url ? `url(${p.$url}) center/cover` : '#e5e7eb'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  flex-shrink: 0;
`;

/* ─── Empty / Loading ─── */
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  animation: ${fadeUp} 0.4s ease both;
`;

const EmptyIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #fff7ed;
  color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  svg {
    width: 32px;
    height: 32px;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0 0 6px;
`;

const EmptyText = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  margin-bottom: 24px;
`;

const LoadingShimmer = styled.div`
  background: linear-gradient(90deg, #f1f3f5 25%, #e5e7eb 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 16px;
  height: 200px;
`;

/* ─── Helpers ─── */
const formatDate = (d?: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ─── Component: Judge Inbox (Retos Asignados) ─── */
export const JudgeInboxView = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const data = await challengeService.getJudgeAssignedChallenges();
      const allChallenges = Array.isArray(data) ? data : [];
      // Filtramos para asegurar que el juez solo vea retos que ya terminaron su fase de recepción
      // y están listos para evaluar (EVALUATING / CLOSED)
      const readyChallenges = allChallenges.filter(
        c => c.status === 'EVALUATION' || c.status === 'EVALUATING' || c.status === 'CLOSED' || c.status === 'Finalizado'
      );
      setChallenges(readyChallenges);
    } catch (err) {
      console.error('Error al cargar retos asignados:', err);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  return (
    <Container>
      <Title style={{ marginBottom: 24 }}>Retos Asignados</Title>
      
      {loading ? (
        <Grid>
          {[0, 1].map(i => <LoadingShimmer key={i} />)}
        </Grid>
      ) : challenges.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </EmptyIcon>
          <EmptyTitle>No tienes retos asignados</EmptyTitle>
          <EmptyText>Cuando la empresa te asigne como juez a un reto, aparecerá aquí.</EmptyText>
        </EmptyState>
      ) : (
        <Grid>
          {challenges.map((challenge, i) => (
            <Card key={challenge.id} $index={i} onClick={() => navigate(`/dashboard/judge/evaluation/${challenge.id}`)}>
              <CardChallengeBadge>Reto Asignado</CardChallengeBadge>
              
              <CardHeader>
                <CardTitle>{challenge.title}</CardTitle>
                <StatusBadge status={challenge.status} />
              </CardHeader>

              <CardDescription>{challenge.problemDescription}</CardDescription>

              <CardMeta>
                <MetaChip>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Cierre: {formatDate(challenge.submissionsCloseAt || challenge.endDate)}
                </MetaChip>
              </CardMeta>

              <CardFooter>
                <div />
                <PrimaryBtn onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/judge/evaluation/${challenge.id}`); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Evaluar Ideas
                </PrimaryBtn>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};


/* ─── Component: Judge Evaluation (Evaluar Ideas) ─── */
export const JudgeEvaluationView = () => {
  const navigate = useNavigate();
  const { challengeId } = useParams<{ challengeId: string }>();
  
  const [ideas, setIdeas] = useState<JudgeIdeaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');

  const fetchIdeas = useCallback(async () => {
    if (!challengeId) return; // Si no hay challengeId, no buscar nada
    setLoading(true);
    try {
      const data = await challengeService.getJudgeAssignedIdeas();
      // Filtrar ideas únicamente para el challengeId de la URL
      const allIdeas = Array.isArray(data) ? data : [];
      setIdeas(allIdeas.filter(i => i.challengeId === challengeId));
    } catch (err) {
      console.error('Error al cargar ideas asignadas:', err);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => { 
    if (challengeId) fetchIdeas(); 
  }, [fetchIdeas, challengeId]);

  if (!challengeId) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </EmptyIcon>
          <EmptyTitle>Selecciona un reto primero</EmptyTitle>
          <EmptyText>Para empezar a evaluar ideas, primero debes seleccionar un reto desde tu bandeja de entrada.</EmptyText>
          <LargeBtn onClick={() => navigate('/dashboard/judge/inbox')}>
            Ir a Retos Asignados
          </LargeBtn>
        </EmptyState>
      </Container>
    );
  }

  const filtered = ideas.filter(idea => {
    if (filter === 'pending' && idea.evaluated) return false;
    if (filter === 'evaluated' && !idea.evaluated) return false;
    return true;
  });

  const pendingCount = ideas.filter(i => !i.evaluated).length;
  const evaluatedCount = ideas.filter(i => i.evaluated).length;

  const filters: { value: FilterValue; label: string; count?: number }[] = [
    { value: 'all', label: 'Todas', count: ideas.length },
    { value: 'pending', label: 'Pendientes', count: pendingCount },
    { value: 'evaluated', label: 'Evaluadas', count: evaluatedCount },
  ];

  const handleCardClick = (idea: JudgeIdeaItem) => {
    if (!idea.evaluated) {
      navigate(`/dashboard/judge/evaluation/${idea.challengeId}/idea/${idea.id}`);
    }
  };

  return (
    <Container>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton onClick={() => navigate('/dashboard/judge/inbox')} />
          <Title>
            Evaluar Ideas {ideas.length > 0 && <span style={{ fontSize: 16, color: '#9ca3af', fontWeight: 600, marginLeft: 8 }}>— {ideas[0].challengeTitle}</span>}
          </Title>
          {pendingCount > 0 && <CountBadge>{pendingCount}</CountBadge>}
        </div>
      </TopBar>

      <FilterRow>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <FilterChip key={f.value} $active={filter === f.value} onClick={() => setFilter(f.value)}>
              {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
            </FilterChip>
          ))}
        </div>
      </FilterRow>

      {loading ? (
        <Grid>
          {[0, 1, 2].map(i => <LoadingShimmer key={i} />)}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </EmptyIcon>
          <EmptyTitle>
            {filter === 'all'
              ? 'No hay ideas finalistas asignadas'
              : filter === 'pending'
                ? 'No tienes ideas pendientes'
                : 'Aún no has evaluado ninguna idea'}
          </EmptyTitle>
          <EmptyText>
            {filter === 'all'
              ? 'Cuando la empresa envíe ideas a la fase de finalistas para este reto, aparecerán aquí para que las califiques.'
              : filter === 'pending'
                ? '¡Excelente trabajo! Has evaluado todas las ideas asignadas de este reto.'
                : 'Selecciona una idea pendiente para empezar a evaluar.'}
          </EmptyText>
        </EmptyState>
      ) : (
        <Grid>
          {filtered.map((idea, i) => (
            <Card
              key={idea.id}
              $index={i}
              $evaluated={idea.evaluated}
              onClick={() => handleCardClick(idea)}
            >
              <CardChallengeBadge>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Idea Finalista
              </CardChallengeBadge>

              <CardHeader>
                <CardTitle>{idea.title}</CardTitle>
                <StatusBadge status={idea.evaluated ? 'completado' : 'pendiente'} />
              </CardHeader>

              <CardDescription>{idea.problem}</CardDescription>

              <CardMeta>
                <MetaChip>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {idea.likesCount}
                </MetaChip>
                <MetaChip>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {idea.commentsCount}
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
              </CardMeta>

              <CardFooter>
                {idea.author ? (
                  <AuthorInfo>
                    <AuthorAvatar $url={idea.author.avatarUrl || undefined}>
                      {!idea.author.avatarUrl && idea.author.displayName?.[0]?.toUpperCase()}
                    </AuthorAvatar>
                    {idea.author.displayName}
                  </AuthorInfo>
                ) : (
                  <AuthorInfo>
                    <AuthorAvatar>?</AuthorAvatar>
                    Anónimo
                  </AuthorInfo>
                )}

                {idea.evaluated ? (
                  <CompletedTag>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Evaluado {formatDate(idea.evaluatedAt)}
                  </CompletedTag>
                ) : (
                  <PrimaryBtn onClick={(e) => { e.stopPropagation(); handleCardClick(idea); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Evaluar
                  </PrimaryBtn>
                )}
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export const JudgeHistoryView = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await challengeService.getMyEvaluations();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCardClick = (evaluation: any) => {
    const challengeId = evaluation.idea?.challenge?.id || evaluation.idea?.challengeId;
    if (evaluation.idea && challengeId) {
      navigate(`/dashboard/judge/history/evaluation/${challengeId}/idea/${evaluation.idea.id}`);
    }
  };

  return (
    <Container>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Title>Mis Evaluaciones</Title>
          <CountBadge>{evaluations.length}</CountBadge>
        </div>
      </TopBar>

      {loading ? (
        <Grid>
          {[0, 1, 2].map(i => <LoadingShimmer key={i} />)}
        </Grid>
      ) : evaluations.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <History size={32} />
          </EmptyIcon>
          <EmptyTitle>No hay evaluaciones en tu historial</EmptyTitle>
          <EmptyText>Una vez que califiques una idea, aparecerá aquí como un registro inmutable de tu participación.</EmptyText>
        </EmptyState>
      ) : (
        <Grid>
          {evaluations.map((ev, i) => (
            <Card
              key={ev.id}
              $index={i}
              $evaluated={true}
              onClick={() => handleCardClick(ev)}
            >
              <CardChallengeBadge>
                <History size={12} style={{ marginRight: 4 }} />
                Registro Histórico
              </CardChallengeBadge>

              <CardHeader>
                <CardTitle>{ev.idea?.title}</CardTitle>
                <StatusBadge status="completado" label="Completado" />
              </CardHeader>

              <CardDescription>{ev.idea?.problem}</CardDescription>

              <CardMeta>
                <MetaChip>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Enviado el {formatDate(ev.createdAt)}
                </MetaChip>
              </CardMeta>

              <CardFooter>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 600 }}>Tú calificaste con:</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: Pista8Theme.primary }}>{ev.judgeScore}/10</span>
                </div>
                <PrimaryBtn onClick={(e) => { e.stopPropagation(); handleCardClick(ev); }}>
                  <Eye size={14} style={{ marginRight: 6 }} />
                  Ver Detalles
                </PrimaryBtn>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};
