import React, { useState, useEffect } from 'react';
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

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: Pista8Theme.white,
    borderRadius: 20,
    border: `0.5px solid ${Pista8Theme.shadow}`,
    boxShadow: `0 4px 24px ${Pista8Theme.shadow}`,
    padding: '28px 28px 24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#1a1f22',
    lineHeight: 1.2,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: Pista8Theme.secondary,
    marginTop: 6,
  },
  divider: {
    height: '0.5px',
    background: 'rgba(72,80,84,0.12)',
    marginBottom: 22,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    background: Pista8Theme.background,
    borderRadius: 16,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 14,
    border: '1.5px solid transparent',
    transition: 'all 0.2s ease',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(254,65,10,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: Pista8Theme.primary,
    flexShrink: 0,
  },
  metricLabel: {
    fontSize: 16,
    color: '#1a1f22',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.2px',
  },
  metricVal: {
    fontSize: 40,
    fontWeight: 900,
    color: '#1a1f22',
    lineHeight: 1,
    letterSpacing: '-1.5px',
    textAlign: 'center' as const,
    width: '100%',
  },
};

interface MetricCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.metricCard,
        background: hovered ? Pista8Theme.white : Pista8Theme.background,
        borderColor: hovered ? 'rgba(254,65,10,0.2)' : 'transparent',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 6px 20px ${Pista8Theme.shadow}` : 'none',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.metricHeader}>
        <div style={styles.metricIcon}>{icon}</div>
        <span style={styles.metricLabel}>{label}</span>
      </div>
      <div style={styles.metricVal}>{value}</div>
    </div>
  );
};

interface StatsPanelProps {
  selectedChallenge: any;
  challengeStats: any;
  onSelectIdea?: (idea: any) => void;
  style?: React.CSSProperties;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedChallenge, challengeStats, onSelectIdea, style }) => {
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
    <div style={{ ...styles.card, ...style }}>
      <div style={styles.header}>
        <h2 style={styles.title}>Estadisticas</h2>
        {selectedChallenge?.title && (
          <p style={styles.subtitle}>{selectedChallenge.title}</p>
        )}
      </div>

      <div style={styles.divider} />

      <div style={styles.metricsGrid}>
        <MetricCard icon={<Sparkles size={20} strokeWidth={2.5} />} value={totalLikes} label="Interacciones" />
        <MetricCard icon={<CommentSvg />} value={totalComments} label="Comentarios" />
        <MetricCard icon={<BulbSvg />} value={totalIdeas} label="Ideas en Vuelo" />
        <MetricCard icon={<UsersSvg />} value={totalParticipants} label="Participantes" />
      </div>

      <PodiumSection
        topIdeas={topIdeas}
        onSelectIdea={handlePodiumClick}
        challengeStatus={selectedChallenge?.status}
      />
    </div>
  );
};

export default StatsPanel;