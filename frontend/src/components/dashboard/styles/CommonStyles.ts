import { keyframes } from 'styled-components';

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
