import React from 'react';
import * as S from '../styles/StatsStyles';
import { Pista8Theme } from '../../../config/theme';
import { getFacultyName } from '../../../config/faculties';
import PodiumSection from './PodiumSection';

interface StatsPanelProps {
  selectedChallenge: any;
  challengeStats: any;
  onSelectIdea?: (idea: any) => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedChallenge, challengeStats, onSelectIdea }) => {
  const topIdeas = challengeStats?.topIdeas || [];

  return (
    <S.RightPanel $hasChallenge={!!selectedChallenge}>
      {selectedChallenge ? (
        <>
          <S.StatsHeader>
            <S.StatsTitle>Estadisticas</S.StatsTitle>
            <S.StatsSub>{selectedChallenge.title}</S.StatsSub>
            {selectedChallenge.facultyId && (
              <S.StatsSub style={{ fontSize: 11, color: Pista8Theme.primary, fontWeight: 700, marginTop: 4 }}>
                {getFacultyName(selectedChallenge.facultyId, selectedChallenge.faculty?.name)}
              </S.StatsSub>
            )}
          </S.StatsHeader>

          <S.StatsSummary>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.totalIdeas || 0}</S.SummaryVal>
              <S.SummaryLabel>Ideas en Vuelo</S.SummaryLabel>
            </S.SummaryCard>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.totalLikes || 0}</S.SummaryVal>
              <S.SummaryLabel>Likes Totales</S.SummaryLabel>
            </S.SummaryCard>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.totalComments || 0}</S.SummaryVal>
              <S.SummaryLabel>Comentarios</S.SummaryLabel>
            </S.SummaryCard>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.totalParticipants || 0}</S.SummaryVal>
              <S.SummaryLabel>Participantes</S.SummaryLabel>
            </S.SummaryCard>
          </S.StatsSummary>

          <PodiumSection
            topIdeas={topIdeas}
            onSelectIdea={onSelectIdea}
          />
        </>
      ) : (
        <S.EmptyStats>
          <S.EmptyIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" />
            </svg>
          </S.EmptyIcon>
          <p>Selecciona un reto para ver sus estadisticas</p>
        </S.EmptyStats>
      )}
    </S.RightPanel>
  );
};

export default StatsPanel;
