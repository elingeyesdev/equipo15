import styled from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { fadeUp } from './CommonStyles';

export const LeftPanel = styled.div`
  background: ${Pista8Theme.white};
  border-radius: 24px;
  padding: 28px 28px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 2px 16px ${Pista8Theme.shadow};
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
`;

export const PanelTitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PanelTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.2px;
`;

export const PanelCount = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: rgba(72, 80, 84, 0.4);
  background: rgba(72, 80, 84, 0.07);
  padding: 3px 8px;
  border-radius: 20px;
`;

export const FilterWrap = styled.div`
  position: relative;
`;

export const FilterBtn = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.13)'};
  background: ${p => p.active ? `${Pista8Theme.primary}10` : 'transparent'};
  color: ${p => p.active ? Pista8Theme.primary : Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
`;

export const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${Pista8Theme.white};
  border: 1px solid rgba(72,80,84,0.09);
  border-radius: 16px;
  padding: 6px;
  z-index: 10;
  min-width: 160px;
  box-shadow: 0 12px 32px ${Pista8Theme.shadow};
  animation: ${fadeUp} 0.18s ease both;
`;

export const FilterOption = styled.button<{ active: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: ${p => p.active ? '700' : '500'};
  color: ${p => p.active ? Pista8Theme.primary : Pista8Theme.secondary};
  background: ${p => p.active ? `${Pista8Theme.primary}10` : 'transparent'};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(72,80,84,0.05); }
`;

export const ChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;


export const ChallengeCard = styled.div<{ active: boolean }>`
  position: relative;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.08)'};
  background: ${p => p.active
    ? `linear-gradient(135deg, ${Pista8Theme.primary}07 0%, ${Pista8Theme.background} 100%)`
    : Pista8Theme.background};
  cursor: pointer;
  transition: all 0.22s ease;
  overflow: hidden;

  &:hover {
    border-color: ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.18)'};
    box-shadow: 0 6px 24px ${Pista8Theme.shadow};
    transform: translateY(-1px);
  }
`;

export const CardLogoWrap = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid rgba(72,80,84,0.09);
  flex-shrink: 0;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ActiveBar = styled.div`
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  background: ${Pista8Theme.primary};
  border-radius: 0 3px 3px 0;
`;


export const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`;

export const CardTopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

export const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${Pista8Theme.primary};
  background: ${Pista8Theme.primary}14;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

export const StatusBadge = styled.span<{ expired?: boolean }>`
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${Pista8Theme.white};
  background: ${p => p.expired ? Pista8Theme.error : Pista8Theme.primary};
  padding: 4px 9px;
  border-radius: 6px;
`;


export const CardTitle = styled.p`
  font-size: 14.5px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 10px;
  line-height: 1.45;
  padding-right: 4px;
`;


export const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(72, 80, 84, 0.45);
  font-weight: 500;
  margin-bottom: 14px;
`;

export const MetaDot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(72, 80, 84, 0.25);
  flex-shrink: 0;
`;

export const ClosingBadge = styled.span<{ urgent?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.urgent ? Pista8Theme.primary : 'rgba(72,80,84,0.45)'};
`;


export const CardBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StatChip = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 700;
  color: rgba(72, 80, 84, 0.5);
  transition: color 0.15s;
`;

export const RespondButton = styled.button<{ disabled?: boolean }>`
  border: none;
  background: ${p => p.disabled ? 'rgba(72,80,84,0.1)' : Pista8Theme.primary};
  color: ${p => p.disabled ? 'rgba(72,80,84,0.35)' : Pista8Theme.white};
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 9px 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${p => p.disabled ? 'none' : `0 8px 22px ${Pista8Theme.primary}30`};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px ${Pista8Theme.primary}42;
  }

  svg {
    width: 12px;
    height: 12px;
    stroke-width: 3;
  }
`;

export const TopRight = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

export const BadgeCorner = StatusBadge;

export const CardTop = CardTopRow;

export const LikesChip = StatChip;
export const CommentsChip = StatChip;
export const CardActionRow = CardBottomRow;