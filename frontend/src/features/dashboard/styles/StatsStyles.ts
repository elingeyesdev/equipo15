import styled from 'styled-components';
import { Pista8Theme, breakpoints } from '../../../config/theme';
import { fillBar } from './CommonStyles';

export const RightPanel = styled.div<{ $hasChallenge: boolean }>`
  background: white;
  border-radius: 24px;
  padding: 28px 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  opacity: ${p => p.$hasChallenge ? 1 : 0.28};
  transition: opacity 0.35s ease;
  display: flex;
  flex-direction: column;
  gap: 22px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -70px;
    right: -70px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, ${Pista8Theme.primary}18 0%, transparent 68%);
    pointer-events: none;
  }
`;


export const StatsHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  position: relative;
  z-index: 1;
`;

export const StatsTitle = styled.h3`
  font-size: 20px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.4px;
`;

export const StatsSub = styled.p`
  font-size: 12.5px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
  max-width: 88%;
`;


export const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  position: relative;
  z-index: 1;

  @media (max-width: ${breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px 10px 16px;
  text-align: center;
  border: 1.5px solid rgba(0,0,0,0.05);
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: ${Pista8Theme.primary}66;
    transition: width 0.22s, background 0.22s;
  }

  &:hover {
    background: #fafafa;
    border-color: ${Pista8Theme.primary}40;
    transform: translateY(-1px);

    &::after {
      width: 44px;
      background: ${Pista8Theme.primary};
    }
  }
`;

export const SummaryVal = styled.p`
  font-size: 32px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0 0 5px;
  letter-spacing: -1.5px;
  line-height: 1;
`;

export const SummaryLabel = styled.p`
  font-size: 10px;
  color: #9ca3af;
  margin: 0;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;


export const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.06) 75%,
    transparent
  );
  position: relative;
  z-index: 1;
`;


export const StatsColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  gap: 0 18px;
  position: relative;
  z-index: 1;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 18px 0;
  }
`;

export const StatsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

export const PodiumList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

export const ColLabel = styled.p`
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 4px;
`;

export const StatsDivider = styled.div`
  width: 1px;
  background: rgba(0, 0, 0, 0.06);
  align-self: stretch;

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
    height: 1px;
  }
`;


export const RankRow = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr;
  align-items: center;
  gap: 7px;
  row-gap: 3px;
`;

export const RankNum = styled.span`
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  text-align: center;
`;

export const RankName = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: #1a1f22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RankBarWrap = styled.div`
  grid-column: 2;
  display: grid;
  grid-template-columns: 1fr 30px;
  gap: 7px;
  align-items: center;
`;

export const RankBar = styled.div`
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  overflow: hidden;
`;

export const RankFill = styled.div<{ pct: number; delay: number }>`
  height: 100%;
  width: ${p => p.pct}%;
  background: linear-gradient(90deg, ${Pista8Theme.primary}bb, ${Pista8Theme.primary});
  border-radius: 2px;
  animation: ${fillBar} 0.55s ${p => p.delay}ms cubic-bezier(0.22, 1, 0.36, 1) both;
`;

export const RankVal = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-align: right;
`;


export const EmptyStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px 0;
  color: #9ca3af;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
`;

export const EmptyIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
`;


export const PulseListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
`;

export const PulseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 9px;
  border-radius: 11px;
  transition: background 0.18s;
  cursor: default;

  &:hover { background: rgba(0, 0, 0, 0.03); }
`;

export const Avatar = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;

export const ParticipantInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

export const ParticipantName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1a1f22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RoleBadge = styled.span<{ $role: string }>`
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  display: inline-block;
  width: fit-content;
  ${p => p.$role === 'student' ? `
    color: #0284c7;
    background: rgba(2, 132, 199, 0.1);
  ` : p.$role === 'company' ? `
    color: ${Pista8Theme.primary};
    background: ${Pista8Theme.primary}22;
  ` : `
    color: #6b7280;
    background: rgba(0, 0, 0, 0.05);
  `}
`;


export const PodiumItem = styled.div<{ $isFirst: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 12px;
  background: ${p => p.$isFirst ? 'linear-gradient(45deg, rgba(254,65,10,0.05), rgba(254,65,10,0.02))' : 'white'};
  border: 1px solid ${p => p.$isFirst ? 'rgba(254,65,10,0.2)' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${p => p.$isFirst ? '0 4px 12px rgba(254,65,10,0.08)' : 'none'};
  transition: all 0.3s ease;

  &:hover {
    background: ${p => p.$isFirst
    ? `linear-gradient(135deg, ${Pista8Theme.primary}1a 0%, rgba(254,65,10,0.05) 100%)`
    : `${Pista8Theme.primary}08`};
    border-color: ${Pista8Theme.primary}40;
  }
`;

export const PodiumRank = styled.div<{ $isFirst?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: ${p => p.$isFirst
    ? `${Pista8Theme.primary}1a`
    : 'rgba(0, 0, 0, 0.05)'};
  color: ${p => p.$isFirst
    ? Pista8Theme.primary
    : '#9ca3af'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
`;

export const PodiumTitle = styled.div`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #1a1f22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PodiumImpact = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${Pista8Theme.primary};
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;