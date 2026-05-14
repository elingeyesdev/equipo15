import styled from 'styled-components';
import { Pista8Theme, breakpoints } from '../../../config/theme';
import { fadeUp } from './CommonStyles';

export const Root = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  position: relative;
  overflow-x: hidden;
`;

export const Page = styled.div`
  padding: 2.5rem 4%;
  max-width: 1400px;
  margin: 0 auto;

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

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 12px;
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
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  ${p => p.$active ? `
    color: ${Pista8Theme.success};
    background: ${Pista8Theme.success}14;
    border: 1px solid ${Pista8Theme.success}30;
  ` : `
    color: #9ca3af;
    background: rgba(156,163,175,0.1);
    border: 1px solid rgba(156,163,175,0.2);
  `}
`;

export const DetailTitle = styled.h2`
  font-size: 22px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.3px;
`;

export const DetailFaculty = styled.span`
  font-size: 10.5px;
  font-weight: 800;
  color: ${Pista8Theme.primary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: ${Pista8Theme.primary}0d;
  padding: 5px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid ${Pista8Theme.primary}20;
`;

export const DetailDescription = styled.p`
  font-size: 14px;
  color: #4b5563;
  line-height: 1.75;
  margin: 0;
  max-width: 720px;
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
  gap: 8px;
  letter-spacing: 0.02em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px ${Pista8Theme.primary}40;
  }

  &:active { transform: scale(0.97); }
`;
