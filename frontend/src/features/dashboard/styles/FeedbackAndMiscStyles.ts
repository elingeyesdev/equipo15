import styled from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { fadeUp } from './CommonStyles';


export const Hangar = styled.section`
  position: relative;
  width: 100%;
  height: 180px;
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  border-radius: 24px;
  margin-bottom: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: ${fadeUp} 0.4s 0.05s ease both;
`;

export const HangarGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

export const HangarLabel = styled.p`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  margin: 0;
`;

export const HangarSub = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.18);
  margin: 0;
`;


export const ToastViewport = styled.div`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100000;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ToastCard = styled.div<{ $tone: string }>`
  min-width: 320px;
  padding: 16px 20px;
  border-radius: 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.12);
  animation: ${fadeUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  background: #ffffff;
  color: ${Pista8Theme.secondary};
  border: 1px solid rgba(72,80,84,0.08);
  border-left: 5px solid ${p => p.$tone === 'success' ? Pista8Theme.success : p.$tone === 'info' ? Pista8Theme.secondary : p.$tone === 'error' ? Pista8Theme.error : Pista8Theme.primary};
`;

export const ToastGlyph = styled.span<{ $tone?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${p => p.$tone === 'success' ? 'rgba(52,168,83,0.1)' : p.$tone === 'info' ? 'rgba(72,80,84,0.1)' : p.$tone === 'error' ? 'rgba(255,51,51,0.1)' : 'rgba(254,65,10,0.1)'};
  color: ${p => p.$tone === 'success' ? Pista8Theme.success : p.$tone === 'info' ? Pista8Theme.secondary : p.$tone === 'error' ? Pista8Theme.error : Pista8Theme.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
`;

export const ToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  p { margin: 0; font-size: 14px; font-weight: 500; color: rgba(72,80,84,0.8); }
`;

export const ToastTitle = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: #1a1f22;
`;

export const ToastDismiss = styled.button`
  border: none;
  background: rgba(72,80,84,0.06);
  color: #485054;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: rgba(72,80,84,0.12); }
`;


export const ConfirmBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(7,10,13,0.65);
  backdrop-filter: blur(3px);
  z-index: 10001;
`;

export const ConfirmDialog = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 10002;
`;

export const ConfirmCard = styled.div`
  width: min(420px, 100%);
  background: white;
  border-radius: 26px;
  padding: 28px 32px;
  border: 1px solid rgba(72,80,84,0.08);
  box-shadow: 0 35px 80px rgba(10,12,15,0.35);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeUp} 0.2s ease both;
`;

export const ConfirmTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
`;

export const ConfirmText = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(72,80,84,0.75);
  line-height: 1.5;
  word-break: break-word;
`;

export const ConfirmSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const SummaryPill = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(72,80,84,0.08);
  color: ${Pista8Theme.secondary};
  font-size: 12px;
  font-weight: 600;
  word-break: break-word;
`;

export const ConfirmActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  @media (min-width: 420px) {
    flex-direction: row;
  }
`;

export const ConfirmGhost = styled.button`
  flex: 1;
  width: 100%;
  border: 1.5px solid rgba(72,80,84,0.25);
  background: transparent;
  color: ${Pista8Theme.secondary};
  font-weight: 700;
  padding: 14px 18px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
`;

export const ConfirmCTA = styled.button`
  flex: 1;
  width: 100%;
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-weight: 800;
  padding: 14px 28px;
  border-radius: 18px;
  box-shadow: 0 20px 30px rgba(254,65,10,0.3);
  cursor: pointer;
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.2s ease;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:not(:disabled):hover { transform: translateY(-2px); }
`;
