import React from 'react';
import * as S from '../styles/StatsStyles';

interface StatsPanelProps {
  selectedChallenge: any;
  challengeStats: any;
  topFacultades: any[];
  topLideres: any[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedChallenge, challengeStats, topFacultades, topLideres }) => {
  return (
    <S.RightPanel hasChallenge={!!selectedChallenge}>
      {selectedChallenge ? (
        <>
          <S.StatsHeader>
            <S.StatsTitle>Estadísticas</S.StatsTitle>
            <S.StatsSub>{selectedChallenge.title}</S.StatsSub>
          </S.StatsHeader>

          <S.StatsSummary>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.totalIdeas || 0}</S.SummaryVal>
              <S.SummaryLabel>Ideas</S.SummaryLabel>
            </S.SummaryCard>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.totalLikes || 0}</S.SummaryVal>
              <S.SummaryLabel>Likes</S.SummaryLabel>
            </S.SummaryCard>
            <S.SummaryCard>
              <S.SummaryVal>{topLideres.length}</S.SummaryVal>
              <S.SummaryLabel>Líderes</S.SummaryLabel>
            </S.SummaryCard>
          </S.StatsSummary>

          <S.StatsColumns>
            <S.StatsCol>
              <S.ColLabel>Top Facultades</S.ColLabel>
              {topFacultades.map((f, i) => (
                <S.RankRow key={f.name}>
                  <S.RankNum>{i + 1}</S.RankNum>
                  <S.RankName>{f.name}</S.RankName>
                  <S.RankBar>
                    <S.RankFill pct={topFacultades[0]?.likes > 0 ? Math.round((f.likes / topFacultades[0].likes) * 100) : 0} delay={i * 80} />
                  </S.RankBar>
                  <S.RankVal>{f.likes}</S.RankVal>
                </S.RankRow>
              ))}
            </S.StatsCol>

            <S.StatsDivider />

            <S.StatsCol>
              <S.ColLabel>Top Líderes</S.ColLabel>
              {topLideres.map((l, i) => (
                <S.RankRow key={l.name}>
                  <S.RankNum>{i + 1}</S.RankNum>
                  <S.RankName>{l.name}</S.RankName>
                  <S.RankBar>
                    <S.RankFill pct={topLideres[0]?.ideas > 0 ? Math.round((l.ideas / topLideres[0].ideas) * 100) : 0} delay={i * 80} />
                  </S.RankBar>
                  <S.RankVal>{l.ideas}</S.RankVal>
                </S.RankRow>
              ))}
            </S.StatsCol>
          </S.StatsColumns>
        </>
      ) : (
        <S.EmptyStats>
          <S.EmptyIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" />
            </svg>
          </S.EmptyIcon>
          <p>Seleccioná un reto para ver sus estadísticas</p>
        </S.EmptyStats>
      )}
    </S.RightPanel>
  );
};

export default StatsPanel;
