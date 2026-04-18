import styled from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { fillBar } from './CommonStyles';

export const RightPanel = styled.div<{ $hasChallenge: boolean }>`
  background: ${Pista8Theme.secondary};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(72,80,84,0.1);
  opacity: ${p => p.$hasChallenge ? 1 : 0.35};
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const StatsHeader = styled.div``;

export const StatsTitle = styled.h3`
  font-size: 19px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px;
`;

export const StatsSub = styled.p`
  font-size: 13px;
  color: rgba(255,255,255,0.38);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

export const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

export const SummaryCard = styled.div`
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px 12px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.07);
  transition: background 0.18s;
  &:hover { background: rgba(255,255,255,0.1); }
`;

export const SummaryVal = styled.p`
  font-size: 30px;
  font-weight: 900;
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
`;

export const SummaryLabel = styled.p`
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const StatsColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 0 20px;
  flex: 1;
`;

export const StatsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

export const ColLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 4px;
`;

export const StatsDivider = styled.div`
  width: 1px;
  background: rgba(255,255,255,0.08);
  align-self: stretch;
`;

export const RankRow = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr 40px 28px;
  align-items: center;
  gap: 8px;
`;

export const RankNum = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.25);
`;

export const RankName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RankBar = styled.div`
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
`;

export const RankFill = styled.div<{ pct: number; delay: number }>`
  height: 100%;
  width: ${p => p.pct}%;
  background: ${Pista8Theme.primary};
  border-radius: 2px;
  animation: ${fillBar} 0.55s ${p => p.delay}ms ease both;
`;

export const RankVal = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-align: right;
`;

export const EmptyStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 14px;
  color: rgba(255,255,255,0.25);
  text-align: center;
  font-size: 13px;
  font-weight: 500;
`;

export const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PulseListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.02);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
`;

export const PulseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.2s;
  cursor: default;

  &:hover {
    background: rgba(255,255,255,0.05);
  }
`;

export const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.1);
`;

export const ParticipantInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const ParticipantName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RoleBadge = styled.span<{ $role: string }>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 2px;
  ${p => p.$role === 'student' ? `
    color: rgba(184, 232, 255, 0.8);
    background: rgba(184, 232, 255, 0.1);
  ` : p.$role === 'company' ? `
    color: rgba(255, 215, 0, 0.8);
    background: rgba(255, 215, 0, 0.1);
  ` : `
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
  `}
`;

export const PodiumItem = styled.div<{ $isFirst: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  margin-bottom: 8px;
  background: ${p => p.$isFirst ? 'linear-gradient(45deg, rgba(255,215,0,0.15), rgba(72,80,84,0.1))' : 'rgba(255,255,255,0.03)'};
  border: 1px solid ${p => p.$isFirst ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)'};
  box-shadow: ${p => p.$isFirst ? '0 4px 12px rgba(255,215,0,0.1)' : 'none'};
  transition: all 0.3s ease;
`;

export const PodiumRank = styled.div<{ $isFirst?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${p => p.$isFirst ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)'};
  color: ${p => p.$isFirst ? '#FFD700' : 'rgba(255,255,255,0.6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
`;

export const PodiumTitle = styled.div`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PodiumImpact = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${Pista8Theme.primary};
  display: flex;
  align-items: center;
  gap: 4px;
`;
