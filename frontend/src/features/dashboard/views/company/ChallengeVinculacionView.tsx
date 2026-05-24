import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import type { Challenge } from '../../../../types/models';
import { ChallengeJudgeSelector } from './components/ChallengeJudgeSelector';

/* ─── Animations ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

/* ─── Styled Components ─── */
const Page = styled.div`
  animation: ${fadeUp} 0.4s ease both;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Breadcrumb = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  padding: 0;
  transition: color 0.18s;

  &:hover {
    color: ${Pista8Theme.primary};
  }

  svg {
    transition: transform 0.18s;
  }
  &:hover svg {
    transform: translateX(-3px);
  }
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 4px 16px rgba(72, 80, 84, 0.06);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #1a1f22;
  line-height: 1.2;
`;

const Description = styled.p`
  margin: 0;
  font-size: 13.5px;
  color: #6b7280;
  line-height: 1.5;
  max-width: 680px;
`;

const StatusBadge = styled.span<{ $bg: string; $color: string; $dot: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  flex-shrink: 0;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${p => p.$dot};
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
`;

const StatCard = styled.div<{ $delay?: number }>`
  background: linear-gradient(135deg, rgba(254, 65, 10, 0.04), rgba(254, 65, 10, 0.01));
  border: 1px solid rgba(72, 80, 84, 0.06);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: ${fadeUp} 0.35s ${p => (p.$delay || 0) * 0.08}s ease both;
`;

const StatLabel = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
`;

const StatValue = styled.span`
  font-size: 18px;
  font-weight: 900;
  color: #1a1f22;
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
`;

const SectionCard = styled.div<{ $index: number }>`
  background: white;
  border-radius: 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 2px 12px rgba(72, 80, 84, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeUp} 0.35s ${p => p.$index * 0.08}s ease both;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(254, 65, 10, 0.2);
    box-shadow: 0 8px 24px rgba(72, 80, 84, 0.1);
    transform: translateY(-2px);
  }
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(254, 65, 10, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.primary};
  flex-shrink: 0;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #1a1f22;
`;

const SectionText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.55;
`;

const ComingSoonPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
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

/* ─── Status config ─── */
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  Borrador: { label: 'Borrador', bg: '#f1f3f5', color: '#6b7280', dot: '#9ca3af' },
  DRAFT: { label: 'Borrador', bg: '#f1f3f5', color: '#6b7280', dot: '#9ca3af' },
  Activo: { label: 'Activo', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  'En Evaluación': { label: 'En Evaluación', bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Finalizado: { label: 'Finalizado', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] || STATUS_CONFIG['Borrador'];

const formatDate = (d?: string | Date) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ─── Component ─── */
export const ChallengeVinculacionView = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!challengeId) {
      setError(true);
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
        <StatsRow>
          {[0, 1, 2, 3].map(i => <LoadingBar key={i} style={{ height: 90 }} />)}
        </StatsRow>
        <LoadingBar style={{ height: 240 }} />
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

  const sections = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Participantes vinculados',
      description: 'Gestión de los estudiantes que han enviado ideas a este reto. Visualiza su progreso y aportes.',
      comingSoon: true,
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: 'Métricas del reto',
      description: 'Estadísticas detalladas: participación, engagement, distribución de ideas por facultad y tendencias.',
      comingSoon: true,
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: 'Línea de tiempo',
      description: 'Cronología visual con hitos clave del reto: publicación, cierre de ideas, evaluación y anuncio de resultados.',
      comingSoon: true,
    },
  ];

  return (
    <Page>
      {/* Breadcrumb */}
      <Breadcrumb type="button" onClick={() => navigate('/dashboard/company/challenges')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Mis Retos
      </Breadcrumb>

      {/* Header */}
      <Header>
        <HeaderTop>
          <TitleBlock>
            <Eyebrow>Panel de Vinculación</Eyebrow>
            <Title>{challenge.title}</Title>
            {challenge.problemDescription && (
              <Description>{challenge.problemDescription}</Description>
            )}
          </TitleBlock>
          <StatusBadge $bg={sc.bg} $color={sc.color} $dot={sc.dot}>
            {sc.label}
          </StatusBadge>
        </HeaderTop>
      </Header>

      {/* Stats */}
      <StatsRow>
        <StatCard $delay={0}>
          <StatLabel>Ideas recibidas</StatLabel>
          <StatValue>{challenge.ideasCount ?? 0}</StatValue>
        </StatCard>
        <StatCard $delay={1}>
          <StatLabel>Fecha de inicio</StatLabel>
          <StatValue style={{ fontSize: 15 }}>{formatDate(challenge.startDate)}</StatValue>
        </StatCard>
        <StatCard $delay={2}>
          <StatLabel>Fecha de cierre</StatLabel>
          <StatValue style={{ fontSize: 15 }}>{formatDate(challenge.endDate)}</StatValue>
        </StatCard>
        <StatCard $delay={3}>
          <StatLabel>Tipo de acceso</StatLabel>
          <StatValue style={{ fontSize: 15 }}>{challenge.isPrivate ? 'Privado' : 'Público'}</StatValue>
        </StatCard>
      </StatsRow>

      {/* Interactive Tool: Multiselect de Jueces */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
        <SectionCard $index={0} style={{ padding: '24px' }}>
          <ChallengeJudgeSelector challengeId={challenge.id} />
        </SectionCard>
      </div>

      {/* Placeholder Sections */}
      <SectionsGrid>
        {sections.map((section, index) => (
          <SectionCard key={section.title} $index={index + 1}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <SectionIcon>{section.icon}</SectionIcon>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SectionTitle>{section.title}</SectionTitle>
                {section.comingSoon && <ComingSoonPill>Próximamente</ComingSoonPill>}
              </div>
            </div>
            <SectionText>{section.description}</SectionText>
          </SectionCard>
        ))}
      </SectionsGrid>
    </Page>
  );
};
