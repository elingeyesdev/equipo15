import styled, { keyframes } from 'styled-components';
import { Pista8Theme, breakpoints } from '@/config/theme';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const Wrapper = styled.section`
  animation: ${fadeIn} 0.3s ease both;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #1a1a2e; /* Color oscuro para contraste en fondo blanco */
  margin: 0 0 ${Pista8Theme.spacing.xl}px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: ${Pista8Theme.spacing.lg}px;
  width: 100%;
  max-width: 1000px;
  margin-bottom: 40px;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

export const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: ${Pista8Theme.spacing.lg}px ${Pista8Theme.spacing.xl}px;
  border-radius: ${Pista8Theme.radius.lg}px;
  font-size: ${Pista8Theme.fontSize.md}px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${Pista8Theme.spacing.md}px;
`;

export const RetryButton = styled.button`
  border: none;
  border-radius: ${Pista8Theme.radius.md}px;
  padding: ${Pista8Theme.spacing.sm}px ${Pista8Theme.spacing.md}px;
  background: ${Pista8Theme.primary};
  color: ${Pista8Theme.white};
  font-size: ${Pista8Theme.fontSize.sm}px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity ${Pista8Theme.transition.fast} ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
`;
