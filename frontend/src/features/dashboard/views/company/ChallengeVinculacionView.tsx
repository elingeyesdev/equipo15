import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme, breakpoints } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import type { Challenge } from '../../../../types/models';
import { ChallengeJudgeSelector } from './components/ChallengeJudgeSelector';
import BackButton from '../../../../components/common/BackButton';
import { Users } from 'lucide-react';


const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const Page = styled.div`
  animation: ${fadeUp} 0.4s ease both;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChallengeCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 4px 16px rgba(72, 80, 84, 0.06);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #1a1f22;
  line-height: 1.25;
  flex: 1;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const StatusBadge = styled.span<{ $bg: string; $color: string; $dot?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  flex-shrink: 0;
  border: 1px solid ${p => p.$dot}30;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 13.5px;
  color: #6b7280;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > :last-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: ${breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

const StatChip = styled.div`
  background: rgba(72, 80, 84, 0.04);
  border-radius: 10px;
  padding: 18px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  gap: 4px;
`;

const StatLabel = styled.span`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
`;

const StatValue = styled.span`
  font-size: 17px;
  font-weight: 900;
  color: #1a1f22;
`;

const JudgeSection = styled.div`
  background: white;
  border-radius: 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 2px 12px rgba(72, 80, 84, 0.05);
  padding: 24px;
  animation: ${fadeUp} 0.35s 0.1s ease both;
`;

const LoadingBar = styled.div`
  height: 180px;
  border-radius: 20px;
  background: linear-gradient(90deg, #f1f3f5 25%, #e5e7eb 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ErrorWrap = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const ErrorTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #1a1f22;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
`;

const NoChallengeWrap = styled.div`
  text-align: center;
  padding: 80px 20px;
  animation: ${fadeUp} 0.4s ease both;
`;

const NoChallengeIconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #fff7ed;
  color: ${Pista8Theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  svg {
    width: 32px;
    height: 32px;
  }
`;

const NoChallengeTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 900;
  color: #1a1f22;
`;

const NoChallengeText = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  color: #9ca3af;
`;

const GoBackBtn = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e63a09;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254,65,10,0.25);
  }
`;

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  Borrador: { label: 'Borrador', bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  DRAFT: { label: 'Borrador', bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  Agendado: { label: 'Agendado', bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  SCHEDULED: { label: 'Agendado', bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  Activo: { label: 'Activo', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  PUBLISHED: { label: 'Activo', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  'En Evaluación': { label: 'En Evaluación', bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  EVALUATING: { label: 'En Evaluación', bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  EVALUATION: { label: 'En Evaluación', bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Finalizado: { label: 'Finalizado', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  CLOSED: { label: 'Finalizado', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] || STATUS_CONFIG['Borrador'];

const formatDate = (d?: string | Date) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const ChallengeVinculacionView = () => {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challengeId');
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    const fetchChallenge = async () => {
      try {
        const response = await challengeService.getChallengeById(challengeId);
        const data = (response as any)?.data || response;
        setChallenge(data as Challenge);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchChallenge();
  }, [challengeId]);

  if (loading) {
    return (
      <Page>
        <LoadingBar />
        <LoadingBar style={{ height: 240 }} />
      </Page>
    );
  }

  if (!challengeId) {
    return (
      <Page>
        <NoChallengeWrap>
          <NoChallengeIconWrap>
            <Users />
          </NoChallengeIconWrap>
          <NoChallengeTitle>Gestión de Jueces</NoChallengeTitle>
          <NoChallengeText>
            Selecciona un reto desde "Mis Retos" para vincular jueces evaluadores.
          </NoChallengeText>
          <GoBackBtn onClick={() => navigate('/dashboard/company/challenges')}>
            Ir a Mis Retos
          </GoBackBtn>
        </NoChallengeWrap>
      </Page>
    );
  }

  if (error || !challenge) {
    return (
      <Page>
        <ErrorWrap>
          <ErrorTitle>No se pudo cargar el reto</ErrorTitle>
          <ErrorText>Verifica que el enlace sea correcto o intenta de nuevo.</ErrorText>
        </ErrorWrap>
      </Page>
    );
  }

  const sc = getStatusConfig(challenge.status);
  const faculties = (challenge as any).faculties;
  const facultyName = Array.isArray(faculties) && faculties.length > 0
    ? faculties.map((f: any) => f.name.startsWith('Facultad') ? f.name : `Facultad de ${f.name}`).join(', ')
    : (challenge as any).faculty?.name || (challenge as any).facultyName || 'Todas las facultades';
  const ideasCount = (challenge as any)._count?.ideas ?? challenge.ideasCount ?? 0;

  return (
    <Page>
      <BackButton onClick={() => navigate('/dashboard/company/challenges')} />

      <ChallengeCard>
        <CardTop>
          <CardTitle>{challenge.title}</CardTitle>
          <StatusBadge $bg={sc.bg} $color={sc.color} $dot={sc.dot}>
            {sc.label}
          </StatusBadge>
        </CardTop>
        {challenge.problemDescription && (
          <CardDescription>{challenge.problemDescription}</CardDescription>
        )}
        <StatsRow>
          <StatChip>
            <StatLabel>Ideas</StatLabel>
            <StatValue style={{ fontSize: 24 }}>{ideasCount}</StatValue>
          </StatChip>
          <StatChip>
            <StatLabel>Inicio</StatLabel>
            <StatValue>{formatDate(challenge.startDate || challenge.submissionsOpenAt)}</StatValue>
            ...
            <StatValue>{formatDate(challenge.endDate || challenge.submissionsCloseAt)}</StatValue>
          </StatChip>
          <StatChip>
            <StatLabel>Facultad</StatLabel>
            <StatValue style={{ fontSize: 17, lineHeight: 1.25 }}>{facultyName}</StatValue>
          </StatChip>
        </StatsRow>
      </ChallengeCard>

      <JudgeSection>
        <ChallengeJudgeSelector challengeId={challenge.id} />
      </JudgeSection>
    </Page>
  );
};
