import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import PodiumSection from './PodiumSection';
import { useWallEventListener } from '../../../hooks/useWallEvents';
import { Sparkles } from 'lucide-react';

const CommentSvg = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BulbSvg = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" /><path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const UsersSvg = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Card = styled.div`
  background: ${Pista8Theme.white};
  border-radius: 20px;
  border: 0.5px solid ${Pista8Theme.shadow};
  box-shadow: 0 4px 24px ${Pista8Theme.shadow};
  padding: 28px 28px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;

  @media (max-width: 768px) {
    padding: 20px 16px 16px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 22px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #1a1f22;
  line-height: 1.2;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: ${Pista8Theme.secondary};
  margin-top: 6px;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
`;

const Divider = styled.div`
  height: 0.5px;
  background: rgba(72, 80, 84, 0.12);
  margin-bottom: 22px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 24px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCardContainer = styled.div`
  background: ${Pista8Theme.background};
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;

  &:hover {
    background: ${Pista8Theme.white};
    border-color: rgba(254, 65, 10, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${Pista8Theme.shadow};
  }

  @media (max-width: 768px) {
    padding: 16px 8px;
    gap: 8px;
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(254, 65, 10, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.primary};
  flex-shrink: 0;
`;

const MetricLabel = styled.span`
  font-size: 16px;
  color: #1a1f22;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.2px;
  text-align: center;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const MetricVal = styled.div`
  font-size: 40px;
  font-weight: 900;
  color: #1a1f22;
  line-height: 1;
  letter-spacing: -1.5px;
  text-align: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

interface MetricCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label }) => {
  return (
    <MetricCardContainer>
      <MetricHeader>
        <MetricIcon>{icon}</MetricIcon>
        <MetricLabel>{label}</MetricLabel>
      </MetricHeader>
      <MetricVal>{value}</MetricVal>
    </MetricCardContainer>
  );
};

interface StatsPanelProps {
  selectedChallenge: any;
  challengeStats: any;
  onSelectIdea?: (idea: any) => void;
  style?: React.CSSProperties;
  isNarrow?: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedChallenge, challengeStats, onSelectIdea, style, isNarrow }) => {
  const [liveTotalLikes, setLiveTotalLikes] = useState<number | null>(null);
  const [liveTotalComments, setLiveTotalComments] = useState<number | null>(null);
  const [liveTotalIdeas, setLiveTotalIdeas] = useState<number | null>(null);
  const [liveTotalParticipants, setLiveTotalParticipants] = useState<number | null>(null);
  const [newParticipantIds, setNewParticipantIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLiveTotalLikes(null);
    setLiveTotalComments(null);
    setLiveTotalIdeas(null);
    setLiveTotalParticipants(null);
    setNewParticipantIds(new Set());
  }, [selectedChallenge?.id]);

  useWallEventListener('vote_changed', (payload: any) => {
    setLiveTotalLikes(prev => (prev ?? challengeStats?.totalLikes ?? 0) + (payload.hasVoted ? 1 : -1));
  });

  useWallEventListener('comment_count_changed', (payload: any) => {
    setLiveTotalComments(prev => {
      const base = prev ?? challengeStats?.totalComments ?? 0;
      const delta = typeof payload.delta === 'number' ? payload.delta : 1;
      return base + delta;
    });
  });

  useWallEventListener('idea_created', (payload: any) => {
    setLiveTotalIdeas(prev => (prev ?? challengeStats?.totalIdeas ?? 0) + 1);

    if (payload.authorId) {
      const existingIds = challengeStats?.communityPulse?.map((p: any) => p.id) || [];
      if (!existingIds.includes(payload.authorId) && !newParticipantIds.has(payload.authorId)) {
        setNewParticipantIds(prev => new Set(prev).add(payload.authorId!));
        setLiveTotalParticipants(prev => (prev ?? challengeStats?.totalParticipants ?? 0) + 1);
      }
    }
  });

  const totalIdeas = liveTotalIdeas ?? challengeStats?.totalIdeas ?? 0;
  const totalLikes = liveTotalLikes ?? challengeStats?.totalLikes ?? 0;
  const totalComments = liveTotalComments ?? challengeStats?.totalComments ?? 0;
  const totalParticipants = liveTotalParticipants ?? challengeStats?.totalParticipants ?? 0;
  const topIdeas = challengeStats?.topIdeas || [];

  const handlePodiumClick = (idea: any) => {
    onSelectIdea?.(idea);
  };

  return (
    <Card style={style}>
      <Header>
        <Title>Estadísticas</Title>
        {selectedChallenge?.title && (
          <Subtitle>{selectedChallenge.title}</Subtitle>
        )}
      </Header>

      <Divider />

      <MetricsGrid>
        <MetricCard icon={<Sparkles size={20} strokeWidth={2.5} />} value={totalLikes} label="Interacciones" />
        <MetricCard icon={<CommentSvg />} value={totalComments} label="Comentarios" />
        <MetricCard icon={<BulbSvg />} value={totalIdeas} label="Ideas en Vuelo" />
        <MetricCard icon={<UsersSvg />} value={totalParticipants} label="Participantes" />
      </MetricsGrid>

      <PodiumSection
        topIdeas={topIdeas}
        onSelectIdea={handlePodiumClick}
        challengeStatus={selectedChallenge?.status}
        isNarrow={isNarrow}
      />
    </Card>
  );
};

export default StatsPanel;