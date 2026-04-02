import styled from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { fillBar } from './CommonStyles';

export const RightPanel = styled.div<{ hasChallenge: boolean }>`
  background: ${Pista8Theme.secondary};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(72,80,84,0.1);
  opacity: ${p => p.hasChallenge ? 1 : 0.35};
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
  grid-template-columns: 1fr auto 1fr;
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
