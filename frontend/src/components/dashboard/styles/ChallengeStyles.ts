import styled from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { fadeUp } from './CommonStyles';

export const LeftPanel = styled.div`
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255,255,255,0.9);
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const PanelTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
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
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.15)'};
  background: ${p => p.active ? `${Pista8Theme.primary}12` : 'transparent'};
  color: ${p => p.active ? Pista8Theme.primary : Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
`;

export const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 16px;
  padding: 6px;
  z-index: 10;
  min-width: 160px;
  box-shadow: 0 12px 32px rgba(72,80,84,0.14);
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
  gap: 14px;
`;

export const ChallengeCard = styled.div<{ active: boolean }>`
  position: relative;
  padding: 20px 22px;
  border-radius: 18px;
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.07)'};
  background: ${p => p.active ? `${Pista8Theme.primary}07` : 'rgba(248,249,250,0.8)'};
  cursor: pointer;
  transition: all 0.22s ease;
  overflow: hidden;
  &:hover {
    border-color: ${Pista8Theme.primary};
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(254,65,10,0.08);
  }
`;

export const ActiveBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: ${Pista8Theme.primary};
  border-radius: 0 4px 4px 0;
`;

export const TopRight = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

export const BadgeCorner = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 3px 8px;
  border-radius: 6px;
`;

export const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${Pista8Theme.primary};
  background: ${Pista8Theme.primary}15;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

export const LikesChip = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a8b0b8;
  font-weight: 600;
  svg { color: #e8a0a0; }
`;

export const CardTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 8px;
  line-height: 1.45;
`;

export const CardMeta = styled.p`
  font-size: 12px;
  color: #b8c0c8;
  margin: 0;
  font-weight: 500;
`;

export const CardActionRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

export const RespondButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(254,65,10,0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  span { font-size: 14px; }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 32px rgba(254,65,10,0.35);
  }
`;
