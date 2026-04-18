import React from 'react';
import * as S from '../styles/StatsStyles';

import { motion, AnimatePresence } from 'framer-motion';

interface StatsPanelProps {
  selectedChallenge: any;
  challengeStats: any;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedChallenge, challengeStats }) => {
  const pulse = challengeStats?.communityPulse || [];
  const topIdeas = challengeStats?.topIdeas || [];

  return (
    <S.RightPanel $hasChallenge={!!selectedChallenge}>
      {selectedChallenge ? (
        <>
          <S.StatsHeader>
            <S.StatsTitle>Estadísticas</S.StatsTitle>
            <S.StatsSub>{selectedChallenge.title}</S.StatsSub>
          </S.StatsHeader>

          <S.StatsSummary>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.impactoTotal || 0}</S.SummaryVal>
              <S.SummaryLabel>Impacto Total</S.SummaryLabel>
            </S.SummaryCard>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.totalIdeas || 0}</S.SummaryVal>
              <S.SummaryLabel>Ideas en Vuelo</S.SummaryLabel>
            </S.SummaryCard>
            <S.SummaryCard>
              <S.SummaryVal>{challengeStats?.facultadesUnidas || 0}</S.SummaryVal>
              <S.SummaryLabel>Facultades Unidas</S.SummaryLabel>
            </S.SummaryCard>
          </S.StatsSummary>

          <S.StatsColumns>
            <S.StatsCol>
              <S.ColLabel>Tripulación del Reto</S.ColLabel>
              <S.PulseListContainer>
                {pulse.map((p: any) => (
                  <S.PulseItem key={p.id}>
                    <S.Avatar src={p.avatar} alt={p.name} />
                    <S.ParticipantInfo>
                      <S.ParticipantName>{p.name}</S.ParticipantName>
                      <div><S.RoleBadge $role={p.role}>{p.role === 'student' ? 'Estudiante' : p.role === 'company' ? 'Empresa' : p.role}</S.RoleBadge></div>
                    </S.ParticipantInfo>
                  </S.PulseItem>
                ))}
                {pulse.length === 0 && <S.StatsSub style={{ textAlign: 'center', marginTop: '20px' }}>No hay tripulación aún.</S.StatsSub>}
              </S.PulseListContainer>
            </S.StatsCol>

            <S.StatsDivider />

            <S.StatsCol>
              <S.ColLabel>Líderes de la Pista</S.ColLabel>
              <ul style={{ padding: 0, margin: 0 }}>
                <AnimatePresence>
                  {topIdeas.map((idea: any, i: number) => (
                    <motion.li
                      key={idea.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ listStyle: 'none' }}
                    >
                      <S.PodiumItem $isFirst={i === 0}>
                        <S.PodiumRank $isFirst={i === 0}>{i + 1}</S.PodiumRank>
                        <S.PodiumTitle>{idea.title}</S.PodiumTitle>
                        <S.PodiumImpact>♥ {idea.impact}</S.PodiumImpact>
                      </S.PodiumItem>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              {topIdeas.length === 0 && <S.StatsSub style={{ textAlign: 'center', marginTop: '20px' }}>No hay ideas en vuelo.</S.StatsSub>}
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
