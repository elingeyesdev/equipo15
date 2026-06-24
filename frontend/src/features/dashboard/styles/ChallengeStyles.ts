import styled, { css } from 'styled-components';
import { Pista8Theme, breakpoints } from '../../../config/theme';
import { fadeUp, premiumTooltip } from './CommonStyles';

export const LeftPanel = styled.div<{ $visibleLimit?: number }>`
  background: ${Pista8Theme.white};
  border-radius: 24px;
  padding: 28px 28px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 2px 16px ${Pista8Theme.shadow};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  
  /* Scrollbar invisible */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
  
  ${p => p.$visibleLimit === 4 && `
    min-height: 850px;
  `}

  ${p => p.$visibleLimit === 1 && `
    max-height: 420px;
  `}

  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px 16px;
    border-radius: 18px;
  }

  @media (max-width: ${breakpoints.small}) {
    padding: 16px 14px;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  position: sticky;
  top: 0;
  background: ${Pista8Theme.white};
  z-index: 10;
  padding-top: 4px;
  padding-bottom: 8px;
  margin-top: -4px;
  padding-left: 20px;
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

export const ClearBtn = styled.button`
  font-size: 10px;
  font-weight: 800;
  color: ${Pista8Theme.white};
  background: ${Pista8Theme.primary};
  border: none;
  border-radius: 6px;
  padding: 4px 9px;
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${Pista8Theme.primary}40;
  }
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

export const FilterBtn = styled.button<{ $active: boolean; $tooltipText?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1.5px solid ${p => p.$active ? Pista8Theme.primary : 'rgba(72,80,84,0.13)'};
  background: ${p => p.$active ? `${Pista8Theme.primary}10` : 'transparent'};
  color: ${p => p.$active ? Pista8Theme.primary : Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
  ${premiumTooltip}
`;

export const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${Pista8Theme.white};
  border: 1px solid rgba(72,80,84,0.09);
  border-radius: 16px;
  padding: 6px;
  z-index: 1000;
  min-width: 160px;
  box-shadow: 0 12px 32px ${Pista8Theme.shadow};
  animation: ${fadeUp} 0.18s ease both;
`;

export const FilterOption = styled.button<{ $active: boolean }>`
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-weight: ${p => p.$active ? '700' : '500'};
  color: ${p => p.$active ? Pista8Theme.primary : Pista8Theme.secondary};
  background: ${p => p.$active ? `${Pista8Theme.primary}10` : 'transparent'};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(72,80,84,0.05); }
`;




export const ChallengeCard = styled.div<{ $active: boolean }>`
  position: relative;
  background: ${Pista8Theme.white};
  border-radius: 20px;
  padding: 24px 20px 24px 20px;
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1.5px solid ${p => p.$active ? Pista8Theme.primary : 'rgba(72,80,84,0.08)'};
  box-shadow: ${p => p.$active 
    ? `0 12px 32px ${Pista8Theme.primary}25` 
    : '0 8px 24px rgba(0,0,0,0.04)'};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 160px;
  gap: 12px;

  &:hover {
    border-color: ${p => p.$active ? Pista8Theme.primary : 'rgba(72,80,84,0.18)'};
    box-shadow: 0 6px 24px ${Pista8Theme.shadow};
    transform: translateY(-1px);
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 18px 16px;
    border-radius: 16px;
  }

  @media (max-width: ${breakpoints.small}) {
    padding: 16px 14px;
  }
`;

export const CardLogoWrap = styled.div`
  height: 42px;
  max-width: 80px;
  min-width: 42px;
  border-radius: 8px;
  border: 1.5px solid rgba(72,80,84,0.09);
  flex-shrink: 0;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

export const CardLogo = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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
  padding-right: 60px;
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
  background: #ffffff;
  border: 1px solid #eaeaea;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
`;

export const StatusBadge = styled.span<{ expired?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${p => p.expired ? Pista8Theme.error : Pista8Theme.primary};
  background: #ffffff;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid ${p => p.expired ? Pista8Theme.error : Pista8Theme.primary};
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
`;


export const CardTitle = styled.p`
  font-size: clamp(13px, 2.5vw, 14.5px);
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 10px;
  line-height: 1.45;
  padding-right: 4px;
  word-break: break-word;
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

export const ClosingBadge = styled.span<{ $urgent?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.$urgent ? Pista8Theme.primary : 'rgba(72,80,84,0.45)'};
`;


export const CardBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;

  @media (max-width: ${breakpoints.small}) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

export const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StatChip = styled.span<{ $tooltipText?: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 700;
  color: rgba(72, 80, 84, 0.5);
  transition: color 0.15s;
  ${premiumTooltip}

  &::after {
    left: -8px;
    transform: translateY(5px);
  }
  &::before {
    left: 8px;
    transform: translateY(5px);
  }
  &:hover::after, &:hover::before {
    transform: translateY(0);
  }
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
  justify-content: center;
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

  @media (max-width: ${breakpoints.small}) {
    width: 100%;
    padding: 11px 16px;
    font-size: 12px;
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

export const ChallengeList = styled.div<{ $isFullWidth?: boolean; $forceColumn?: boolean; $flexCards?: boolean; $cardCount?: number; $visibleLimit?: number; $podiumCount?: number }>`
  display: flex;
  flex-direction: ${p => (p.$forceColumn || !p.$isFullWidth) ? 'column' : 'row'};
  flex-wrap: ${p => (!p.$forceColumn && p.$isFullWidth) ? 'wrap' : 'nowrap'};
  justify-content: ${p => (!p.$forceColumn && p.$isFullWidth) ? 'center' : 'flex-start'};
  gap: 14px;

  @media (max-width: 1024px) {
    ${p => p.$isFullWidth && !p.$forceColumn && css`
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar { display: none; }
      padding-bottom: 12px;
      
      > * {
        width: 100% !important;
        flex-shrink: 0 !important;
        scroll-snap-align: start;
      }
    `}
  }

  > * {
    flex-shrink: 0;
    ${p => (!p.$forceColumn && p.$isFullWidth) && `
      width: calc(33.33% - 10px);
      min-width: min(100%, 300px);

      @media (max-width: ${breakpoints.tablet}) {
        width: calc(50% - 7px);
      }
      
      @media (max-width: ${breakpoints.mobile}) {
        width: 100%;
      }
    `}
    ${p => p.$forceColumn && 'width: 100%;'}
    box-sizing: border-box;
  }

  ${p => (p.$forceColumn || !p.$isFullWidth) && `
    flex: 1;
    min-height: 0;
    height: ${p.$visibleLimit === 4 ? 'calc(100% - 50px)' : 'auto'};
    max-height: 100%;
    overflow-y: auto;
    padding-right: 6px;

    ${p.$visibleLimit === 4 && p.$podiumCount === 3 ? `
      > * {
        height: calc((100% - ((${Math.min(p.$cardCount || 4, 4)} - 1) * 14px)) / ${Math.min(p.$cardCount || 4, 4)});
        min-height: 160px;
        max-height: 240px;
        flex-shrink: 0;
      }
    ` : `
      > * {
        height: auto;
        min-height: 160px;
        flex-shrink: 0;
      }
    `}

    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
  `}

  ${p => p.$flexCards && `
    max-height: none;
    flex: 1;
    height: 100%;
    > * { 
      ${CardLogoWrap} {
        height: 54px;
        min-width: 54px;
        max-width: 90px;
        padding: 6px;
      }
      ${CardTitle} {
        font-size: 16.5px;
        margin-bottom: 12px;
      }
      ${CardMeta} {
        font-size: 13px;
        margin-bottom: 18px;
      }
      ${RespondButton} {
        font-size: 12.5px;
        padding: 11px 20px;
      }
      ${CategoryTag} {
        font-size: 12px;
        padding: 5px 12px;
      }
      ${StatusBadge} {
        font-size: 10.5px;
        padding: 5px 11px;
      }
      ${StatChip} {
        font-size: 13.5px;
        gap: 6px;
        svg { width: 15px; height: 15px; }
      }
    }
  `}
`;