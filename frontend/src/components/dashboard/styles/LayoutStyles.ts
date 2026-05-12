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

export const FullWidthContainer = styled.div`
  width: 100%;
  animation: ${fadeUp} 0.4s 0.2s ease both;
`;

