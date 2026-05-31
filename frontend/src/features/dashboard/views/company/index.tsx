import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import type { ChallengePayload } from '../../../../services/challenge.service';
import type { Challenge, ChallengeStatus } from '../../../../types/models';
import { useAuth } from '../../../../context/AuthContext';
import ChallengeFormView from './ChallengeFormModal';
import { CompanyStatsView } from './CompanyStatsView';
import { CompanyPodiumView } from './CompanyPodiumView';
import { premiumTooltip } from '../../styles/CommonStyles';
import { toast } from 'sonner';
import { extractErrorMessage } from '../../../../utils/errors';


const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  Borrador: { label: 'Borrador', bg: '#f1f3f5', color: '#6b7280', dot: '#9ca3af' },
  DRAFT: { label: 'Borrador', bg: '#f1f3f5', color: '#6b7280', dot: '#9ca3af' },
  Activo: { label: 'Activo', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  PUBLISHED: { label: 'Activo', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  'En Evaluación': { label: 'En Evaluación', bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  EVALUATING: { label: 'En Evaluación', bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Finalizado: { label: 'Finalizado', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  CLOSED: { label: 'Finalizado', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const deriveDisplayStatus = (challenge: Challenge): string => {
  const closeDate = challenge.endDate || challenge.submissionsCloseAt;
  if (closeDate && new Date(closeDate) < new Date()) {
    return 'Finalizado';
  }
  const status = challenge.status;
  return STATUS_CONFIG[status]?.label || status;
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] || STATUS_CONFIG['Borrador'];

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

const ReadOnlyBanner = styled.div`
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.12), rgba(254, 65, 10, 0.05));
  color: #7c4a13;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
`;

const ReadOnlyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.16);
  color: #a16207;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const CreateBtn = styled.button<{ $tooltipText?: string }>`
  padding: 12px 28px;
  border-radius: 14px;
  border: none;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  background: ${Pista8Theme.primary};
  color: white;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(254,65,10,0.3);
  }
  &:active { transform: translateY(0); }
  &:disabled {
    background: rgba(72,80,84,0.12);
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  ${premiumTooltip}
`;

const FilterRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
`;

const Card = styled.div<{ $index: number }>`
  background: white;
  border-radius: 16px;
  padding: 22px 24px;
  border: 1.5px solid rgba(72,80,84,0.07);
  box-shadow: 0 2px 10px rgba(72,80,84,0.06);
  animation: ${fadeUp} 0.3s ${p => p.$index * 0.06}s ease both;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 14px;
  &:hover {
    border-color: rgba(254,65,10,0.2);
    box-shadow: 0 8px 24px rgba(72,80,84,0.12);
    transform: translateY(-2px);
  }
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

const StatusBadge = styled.span<{ $bg: string; $color: string; $dot: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  flex-shrink: 0;
  &::before {
    content: '';
    width: 7px; height: 7px;
    border-radius: 50%;
    background: ${p => p.$dot};
  }
`;

const TooltipBtn = styled.button<{ $tooltipText?: string }>`
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
  align-items: center;
  position: relative;
  ${premiumTooltip}
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

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(72,80,84,0.06);
  margin-top: auto;
`;

const ViewBtn = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e63a09;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254,65,10,0.25);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionBtn = styled.button<{ $danger?: boolean; $tooltipText?: string }>`
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: ${p => p.$danger ? '#fef2f2' : Pista8Theme.primary};
  color: ${p => p.$danger ? '#dc2626' : 'white'};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  &:hover {
    background: ${p => p.$danger ? '#fee2e2' : '#e63a09'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${p => p.$danger ? 'rgba(220,38,38,0.15)' : 'rgba(254,65,10,0.25)'};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  ${premiumTooltip}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  animation: ${fadeUp} 0.4s ease both;
`;

const EmptyIcon = styled.div`
  width: 72px; height: 72px;
  border-radius: 20px;
  background: #f1f3f5;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
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
  margin: 0 0 20px;
`;

const LoadingShimmer = styled.div`
  background: linear-gradient(90deg, #f1f3f5 25%, #e5e7eb 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 16px;
  height: 180px;
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const ViewModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.66);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ViewModal = styled.div`
  width: 100%;
  max-width: 620px;
  max-height: min(88vh, 760px);
  background: white;
  border-radius: 28px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeUp} 0.25s ease both;
`;

const ViewModalHeader = styled.div`
  position: relative;
  padding: 22px 24px 18px;
  background: linear-gradient(180deg, rgba(254, 65, 10, 0.06), rgba(254, 65, 10, 0.01));
  border-bottom: 1px solid rgba(72, 80, 84, 0.06);
  text-align: center;
`;

const ViewModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: center;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

const ViewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ViewStat = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  background: #fafbfc;
  border: 1px solid rgba(72, 80, 84, 0.08);
  text-align: center;
`;

const ViewStatLabel = styled.p`
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
`;

const ViewStatValue = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #1a1f22;
  line-height: 1.45;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const ViewModalTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 900;
  color: #1a1f22;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const ViewModalText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #5b6470;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const ViewModalFooter = styled.div`
  padding: 0 24px 24px;
  display: flex;
  justify-content: center;
`;

const ModalCloseX = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(72,80,84,0.12);
  background: white;
  color: #5b6470;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    color: ${Pista8Theme.primary};
    border-color: rgba(254,65,10,0.26);
    background: #fff7ed;
  }
`;

const CloseBtn = styled.button`
  width: min(280px, 100%);
  padding: 12px 16px;
  border-radius: 14px;
  border: none;
  background: #f1f3f5;
  color: #485054;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.18s;

  &:hover {
    background: #e5e7eb;
  }
`;

const formatDate = (d?: string | Date) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
};

type FilterValue = 'all' | ChallengeStatus;

export const CompanyChallengesView = () => {
  const navigate = useNavigate();
  const { impersonationSession } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [copyChallenge, setCopyChallenge] = useState<Challenge | null>(null);
  const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null);
  const readOnlyMode = Boolean(impersonationSession);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await challengeService.getPublicChallenges(1, 100);
      const data = res?.data?.data || res?.data || [];
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar retos:', err);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const filtered = filter === 'all'
    ? challenges
    : challenges.filter(c => {
      const displayStatus = deriveDisplayStatus(c);
      return displayStatus === filter || (filter === 'Borrador' && displayStatus === 'DRAFT');
    });

  const handleSave = async (formData: ChallengePayload) => {
    try {
      if (editingChallenge) {
        await challengeService.updateChallenge(editingChallenge.id, formData);
      } else {
        await challengeService.createChallenge(formData);
      }
      setModalOpen(false);
      setEditingChallenge(null);
      await fetchChallenges();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleEdit = (challenge: Challenge) => {
    if (readOnlyMode) {
      return;
    }
    const canEdit = !challenge.ideasCount || challenge.ideasCount === 0;
    if (!canEdit) {
      toast.error('Este reto ya tiene ideas asociadas y no puede ser editado.');
      return;
    }
    setEditingChallenge(challenge);
    setModalOpen(true);
  };

  const handleCreate = () => {
    if (readOnlyMode) {
      return;
    }
    setEditingChallenge(null);
    setModalOpen(true);
  };

  const handleFormBack = () => {
    setModalOpen(false);
    setEditingChallenge(null);
  };

  const handleViewChallenge = (challenge: Challenge) => {
    setViewChallenge(challenge);
  };

  const filters: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'Borrador', label: 'Borradores' },
    { value: 'Activo', label: 'Activos' },
    { value: 'Finalizado', label: 'Finalizados' },
  ];

  if (modalOpen) {
    return (
      <Container>
        <ChallengeFormView
          onBack={handleFormBack}
          onSave={async (data) => {
            await handleSave(data);
            handleFormBack();
          }}
          challenge={editingChallenge}
          readOnlyMode={readOnlyMode}
        />
      </Container>
    );
  }

  return (
    <Container>
      {readOnlyMode && (
        <ReadOnlyBanner>
          <ReadOnlyBadge>Modo lectura</ReadOnlyBadge>
          Estás en modo lectura ahora: crear o editar retos está bloqueado mientras dure esta sesión.
        </ReadOnlyBanner>
      )}

      <TopBar>
        <Title>Mis Retos</Title>
        <CreateBtn onClick={handleCreate} disabled={readOnlyMode} $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Crear Reto'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Crear Reto
        </CreateBtn>
      </TopBar>

      <FilterRow>
        {filters.map(f => (
          <FilterChip key={f.value} $active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </FilterChip>
        ))}
      </FilterRow>

      {loading ? (
        <Grid>
          {[0, 1, 2].map(i => <LoadingShimmer key={i} />)}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </EmptyIcon>
          <EmptyTitle>
            {filter === 'all' ? 'No tienes retos aún' : `No hay retos con estado "${filter}"`}
          </EmptyTitle>
          <EmptyText>
            {filter === 'all' ? 'Crea tu primer reto para que los participantes comiencen a enviar ideas.' : 'Intenta con otro filtro.'}
          </EmptyText>
          {filter === 'all' && (
            <CreateBtn onClick={handleCreate} disabled={readOnlyMode} $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Crear primer reto'} style={{ margin: '0 auto' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear primer reto
            </CreateBtn>
          )}
        </EmptyState>
      ) : (
        <Grid>
          {filtered.map((challenge, i) => {
            const displayStatus = deriveDisplayStatus(challenge);
            const sc = getStatusConfig(displayStatus);
            const canEdit = (!challenge.ideasCount || challenge.ideasCount === 0) && displayStatus !== 'Finalizado';
            return (
              <Card key={challenge.id} $index={i}>
                <CardHeader>
                  <CardTitle>{challenge.title}</CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {challenge.isPrivate && (
                      <TooltipBtn
                        $tooltipText="Copiar link"
                        onClick={(e) => { e.stopPropagation(); setCopyChallenge(challenge); }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      </TooltipBtn>
                    )}
                    <StatusBadge $bg={sc.bg} $color={sc.color} $dot={sc.dot}>
                      {sc.label}
                    </StatusBadge>
                  </div>
                </CardHeader>

                {challenge.problemDescription && (
                  <CardDescription>{challenge.problemDescription}</CardDescription>
                )}

                <CardMeta>
                  <MetaChip>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(challenge.startDate || challenge.submissionsOpenAt)} — {formatDate(challenge.endDate || challenge.submissionsCloseAt)}
                  </MetaChip>
                  {challenge.ideasCount !== undefined && (
                    <MetaChip>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {challenge.ideasCount} idea{challenge.ideasCount !== 1 ? 's' : ''}
                    </MetaChip>
                  )}
                  {challenge.isPrivate && (
                    <MetaChip>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Privado
                    </MetaChip>
                  )}
                </CardMeta>

                <CardActions>
                  <ViewBtn type="button" onClick={() => handleViewChallenge(challenge)}>
                    Ver Reto
                  </ViewBtn>
                  {canEdit && !readOnlyMode && (
                    <ActionBtn onClick={() => handleEdit(challenge)} $tooltipText="Editar reto">
                      Editar
                    </ActionBtn>
                  )}
                  {(displayStatus === 'Finalizado' || displayStatus === 'En Evaluación' || displayStatus === 'EVALUATION') && (
                    <ActionBtn onClick={() => navigate(`/dashboard/company/podium?challengeId=${challenge.id}`)}>
                      Gestionar Podio
                    </ActionBtn>
                  )}
                  {displayStatus !== 'Borrador' && displayStatus !== 'DRAFT' && (
                    <ActionBtn
                      onClick={() => navigate(`/dashboard/company/judges?challengeId=${challenge.id}`)}
                      disabled={readOnlyMode}
                      $tooltipText={readOnlyMode ? "Estás en modo lectura ahora" : "Vincular Jueces"}
                      style={{ marginLeft: 'auto' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-2.13-3.54" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        <path d="M12 15H8a4 4 0 0 0-4 4v2" />
                        <circle cx="8" cy="7" r="4" />
                        <path d="M22 11l-2 2-2-2" />
                        <path d="M20 13V8" />
                      </svg>
                    </ActionBtn>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Grid>
      )}

      {copyChallenge && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 800, color: '#1a1f22' }}>Compartir Reto Privado</h3>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280' }}>Copia el siguiente enlace para compartir este reto con los estudiantes autorizados.</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input
                readOnly
                value={`${window.location.origin}/reto/privado/${copyChallenge.id}`}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px', background: '#f9fafb', color: '#374151', outline: 'none' }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/reto/privado/${copyChallenge.id}`);
                  const btn = document.getElementById('copy-btn');
                  if (btn) {
                    btn.innerText = 'Copiado!';
                    setTimeout(() => { btn.innerText = 'Copiar'; }, 2000);
                  }
                }}
                id="copy-btn"
                style={{ padding: '0 16px', background: Pista8Theme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Copiar
              </button>
            </div>

            <button
              onClick={() => setCopyChallenge(null)}
              style={{ width: '100%', padding: '12px', background: '#f1f3f5', color: '#485054', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Cerrar
            </button>
          </div>
        </div>,
        document.body
      )}

      {viewChallenge && createPortal(
        <ViewModalOverlay onClick={() => setViewChallenge(null)}>
          <ViewModal onClick={(event) => event.stopPropagation()}>
            <ViewModalHeader>
              <ModalCloseX type="button" onClick={() => setViewChallenge(null)} aria-label="Cerrar modal">×</ModalCloseX>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                <ReadOnlyBadge style={{ background: 'rgba(254,65,10,0.12)', color: Pista8Theme.primary }}>Vista previa</ReadOnlyBadge>
                {viewChallenge.isPrivate && (
                  <ReadOnlyBadge style={{ background: 'rgba(245,158,11,0.16)', color: '#a16207' }}>Privado</ReadOnlyBadge>
                )}
              </div>
              <ViewModalTitle>{viewChallenge.title}</ViewModalTitle>
              <ViewModalText>
                {viewChallenge.problemDescription || 'Sin descripción registrada para este reto.'}
              </ViewModalText>
            </ViewModalHeader>

            <ViewModalBody>
              <ViewGrid>
                <ViewStat>
                  <ViewStatLabel>Estado</ViewStatLabel>
                  <ViewStatValue>{deriveDisplayStatus(viewChallenge)}</ViewStatValue>
                </ViewStat>
                <ViewStat>
                  <ViewStatLabel>Facultad</ViewStatLabel>
                  <ViewStatValue>{(viewChallenge as any).faculty?.name || (viewChallenge as any).facultyName || 'Todas las facultades'}</ViewStatValue>
                </ViewStat>
                <ViewStat>
                  <ViewStatLabel>Ideas</ViewStatLabel>
                  <ViewStatValue>{(viewChallenge as any)._count?.ideas ?? viewChallenge.ideasCount ?? 0} idea{((viewChallenge as any)._count?.ideas ?? viewChallenge.ideasCount ?? 0) === 1 ? '' : 's'}</ViewStatValue>
                </ViewStat>
                <ViewStat>
                  <ViewStatLabel>Vigencia</ViewStatLabel>
                  <ViewStatValue>{formatDate(viewChallenge.startDate || viewChallenge.submissionsOpenAt)} — {formatDate(viewChallenge.endDate || viewChallenge.submissionsCloseAt)}</ViewStatValue>
                </ViewStat>
              </ViewGrid>

              {viewChallenge.companyContext && (
                <ViewStat>
                  <ViewStatLabel>Contexto de la empresa</ViewStatLabel>
                  <ViewStatValue style={{ fontWeight: 600, color: '#5b6470' }}>{viewChallenge.companyContext}</ViewStatValue>
                </ViewStat>
              )}

              {viewChallenge.participationRules && (
                <ViewStat>
                  <ViewStatLabel>Reglas de participación</ViewStatLabel>
                  <ViewStatValue style={{ fontWeight: 600, color: '#5b6470' }}>{viewChallenge.participationRules}</ViewStatValue>
                </ViewStat>
              )}
            </ViewModalBody>

            <ViewModalFooter>
              <CloseBtn type="button" onClick={() => setViewChallenge(null)}>Cerrar</CloseBtn>
            </ViewModalFooter>
          </ViewModal>
        </ViewModalOverlay>,
        document.body
      )}
    </Container>
  );
};

export { CompanyStatsView, CompanyPodiumView };

export const CompanyCriteriaView = () => (
  <div>
    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#485054', margin: 0 }}>Criterios de Evaluación</h2>
    <p style={{ color: '#9ca3af', marginTop: 8 }}>Definir los criterios (Creatividad, Factibilidad, Costo) y su peso para los jueces.</p>
  </div>
);

export const CompanyJudgesView = () => (
  <div>
    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#485054', margin: 0 }}>Gestión de Jueces</h2>
    <p style={{ color: '#9ca3af', marginTop: 8 }}>Invitaciones y tracking de avance de calificación.</p>
  </div>
);
