import { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';

export const interactiveHover = css`
  &:hover:not(:disabled) {
    background: ${Pista8Theme.primary}08;
    border-color: ${Pista8Theme.primary}40;
    color: ${Pista8Theme.primary};
  }
`;

export const interactiveActive = css`
  background: ${Pista8Theme.primary}12;
  color: ${Pista8Theme.primary};
  border-color: ${Pista8Theme.primary}50;
  box-shadow: 0 0 0 3px ${Pista8Theme.primary}18;
`;

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const slideIn = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

export const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

export const fillBar = keyframes`
  from { width: 0%; }
  to   { width: 100%; }
`;

export const FEEDBACK_PALETTE: Record<string, { border: string; background: string; color: string }> = {
  success: {
    border: 'rgba(34,134,58,0.3)',
    background: 'rgba(34,134,58,0.1)',
    color: '#205732',
  },
  error: {
    border: 'rgba(198,40,40,0.32)',
    background: 'rgba(198,40,40,0.12)',
    color: '#7a1b1b',
  },
  info: {
    border: 'rgba(21,83,138,0.3)',
    background: 'rgba(21,83,138,0.12)',
    color: '#12446c',
  },
  critical: {
    border: 'rgba(156,80,0,0.32)',
    background: 'rgba(156,80,0,0.14)',
    color: '#6d3800',
  },
};

export const FEEDBACK_GLYPH: Record<string, string> = {
  success: 'OK',
  error: '✕',
  info: 'i',
  critical: '!',
};

export const premiumTooltip = css<{ $tooltipText?: string }>`
  position: relative;

  ${p => p.$tooltipText && css`
    &::after {
      content: "${p.$tooltipText}";
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%) translateY(5px);
      background: #1a1f22;
      color: white;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 10000;
      pointer-events: none;
      letter-spacing: 0.02em;
    }

    &::before {
      content: '';
      position: absolute;
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%) translateY(5px);
      border: 6px solid transparent;
      border-top-color: #1a1f22;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 10000;
      pointer-events: none;
    }

    &:hover, &:focus-within {
      &::after, &::before {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0);
      }
    }
  `}
`;
