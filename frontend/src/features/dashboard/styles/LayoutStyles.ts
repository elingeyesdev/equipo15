import styled, { css } from 'styled-components';

import { Pista8Theme, breakpoints } from '../../../config/theme';
import { fadeUp } from './CommonStyles';

export const Root = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
`;

export const Page = styled.div`
  padding: 2.5rem 4%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;

  @media (min-width: 1025px) {
    padding: 2.5rem calc(2% + 300px) 2.5rem 4%;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 1.5rem 3%;
  }

  @media (max-width: ${breakpoints.small}) {
    padding: 1rem 2.5%;
  }
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.4s ease both;
  gap: 16px;
  position: relative;
  z-index: 1000;
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
    gap: 12px;
    padding: 0 16px;

    & > div:last-child {
      width: 100%;
      justify-content: flex-end;
    }

    & > button {
      align-self: flex-end;
    }
  }
`;

export const SupportBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 1.25rem;
  padding: 14px 18px;
  border-radius: 18px;
  border: 1px solid rgba(254, 65, 10, 0.18);
  background: linear-gradient(135deg, rgba(254, 65, 10, 0.12), rgba(255, 255, 255, 0.92));
  box-shadow: 0 10px 30px rgba(72, 80, 84, 0.08);

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const SupportBannerCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SupportBannerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const SupportBannerTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
`;

export const SupportBannerText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #5b6470;
  line-height: 1.5;
`;

export const SupportBannerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

export const SupportBannerButton = styled.button`
  border: 1px solid rgba(254, 65, 10, 0.22);
  background: ${Pista8Theme.primary};
  color: white;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

  &:hover {
    box-shadow: 0 10px 20px rgba(254, 65, 10, 0.18);
    transform: translateY(-1px);
  }
`;

export const WelcomeZone = styled.div``;

export const Greeting = styled.h1`
  font-size: clamp(22px, 3.2vw, 36px);
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;
  span { color: ${Pista8Theme.primary}; }
`;

export const Sub = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  margin: 6px 0 0;
  font-weight: 500;

  @media (max-width: ${breakpoints.small}) {
    font-size: 12px;
  }
`;

export const HamburgerBtn = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s, transform 0.12s;
  flex-shrink: 0;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; transform: scale(1.04); }
  &:active { transform: scale(0.96); }

  @media (min-width: 1025px) {
    display: none;
  }
`;

export const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.4s 0.1s ease both;

  > * {
    min-height: 0;
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
    height: auto !important;
  }

  @media (max-width: ${breakpoints.small}) {
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

export const SplitGridEqual = styled(SplitGrid)`
  align-items: stretch;
  > * {
    display: flex;
    flex-direction: column;
  }
`;

export const FullWidthContainer = styled.div`
  width: 100%;
  animation: ${fadeUp} 0.4s 0.2s ease both;
`;

export const ChallengeDetailCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 0;
  border: 1px solid rgba(72,80,84,0.06);
  box-shadow: 0 4px 24px rgba(72,80,84,0.08), 0 1px 3px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, ${Pista8Theme.primary}, #ff6b3d, ${Pista8Theme.primary});
    background-size: 200% 100%;
  }

  &::after {
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, ${Pista8Theme.primary}0c 0%, transparent 70%);
    pointer-events: none;
  }
`;

export const DetailCardBody = styled.div`
  padding: 32px 36px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  position: relative;
  z-index: 1;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 24px 20px 20px;
  }
`;

export const DetailBadgeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const DetailStatusBadge = styled.span<{ $active?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${p => p.$active ? '#059669' : '#6b7280'};
  }

  ${p => p.$active ? css`
    color: #059669;
    background: rgba(5, 150, 105, 0.06);
    border: 1.5px solid rgba(5, 150, 105, 0.2);
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.03);
  ` : css`
    color: #6b7280;
    background: rgba(107, 114, 128, 0.06);
    border: 1.5px solid rgba(107, 114, 128, 0.2);
    box-shadow: 0 2px 4px rgba(107, 114, 128, 0.03);
  `}
`;

export const DetailTitle = styled.h2`
  font-size: clamp(17px, 3.5vw, 22px);
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.3px;
  word-break: break-word;

  @media (max-width: ${breakpoints.small}) {
    font-size: 16px;
  }
`;

export const DetailFaculty = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  color: ${Pista8Theme.primary};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
`;

export const DetailDescription = styled.p`
  font-size: 14px;
  color: #4b5563;
  line-height: 1.75;
  margin: 0;
  max-width: 720px;
  word-break: break-word;
  white-space: pre-wrap;

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 13px;
    line-height: 1.65;
  }
`;

export const DetailMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
`;

export const DetailMetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(72,80,84,0.04);
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
  color: #6b7280;
`;

export const DetailActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 36px;
  border-top: 1px solid rgba(72,80,84,0.06);
  background: rgba(248,249,250,0.5);

  @media (max-width: ${breakpoints.mobile}) {
    padding: 16px 20px;
  }
`;

export const RespondBtn = styled.button`
  padding: 13px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, ${Pista8Theme.primary}, #e8370a);
  color: white;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 6px 20px ${Pista8Theme.primary}30;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.02em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px ${Pista8Theme.primary}40;
  }

  &:active { transform: scale(0.97); }

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
    padding: 13px 20px;
    font-size: 13px;
  }
`;
