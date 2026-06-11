import styled, { css, keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { fadeUp, FEEDBACK_PALETTE } from './CommonStyles';

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 22, 26, 0.65);
  backdrop-filter: blur(3px);
  z-index: 9999;
`;

export const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  z-index: 10000;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

export const ModalCard = styled.section`
  width: min(1100px, 100%);
  padding: 48px;
  border-radius: 32px;
  background: linear-gradient(135deg, #fff5ed 0%, #eef2ff 60%, #f8fbff 100%);
  border: 1px solid rgba(72,80,84,0.08);
  position: relative;
  overflow: hidden;
  animation: ${fadeUp} 0.3s ease both;
  box-shadow: 0 45px 90px rgba(26,31,36,0.25);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ModalHalo = styled.div`
  position: absolute;
  inset: -20% auto auto -15%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(254,65,10,0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
`;

export const ModalHeader = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
`;

export const ModalEyebrow = styled.p`
  font-size: 12px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 800;
  color: rgba(72,80,84,0.6);
  margin: 0 0 12px;
`;

export const ModalTitle = styled.h2`
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 10px;
  color: ${Pista8Theme.secondary};
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const ModalLead = styled.p`
  font-size: 16px;
  color: rgba(72,80,84,0.8);
  line-height: 1.6;
  margin: 0;
`;

export const ModalClose = styled.button`
  border: none;
  background: rgba(255,255,255,0.7);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover { transform: scale(1.05); background: white; }
`;

export const FormGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 28px;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

export const MetaColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const FormCard = styled.form`
  background: white;
  border-radius: 28px;
  border: 1px solid rgba(72,80,84,0.08);
  box-shadow: 0 30px 60px rgba(72,80,84,0.12);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Label = styled.label`
  font-size: 15px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
`;

const flagPulse = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
    box-shadow: 0 0 0 0 rgba(254,65,10,0.14);
  }
  50% {
    transform: translateY(-1px) scale(1.04);
    box-shadow: 0 0 0 5px rgba(254,65,10,0.06);
  }
`;

export const TooltipWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-left: 8px;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(254,65,10,0.08);
  border: 1px solid rgba(254,65,10,0.22);
  animation: ${flagPulse} 2.2s ease-in-out infinite;
  vertical-align: middle;
  svg {
    display: block;
    transition: transform 180ms ease, filter 180ms ease;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    svg { transition: none; }
  }
`;

export const TooltipBubble = styled.span`
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%) translateY(6px) scale(0.98);
  transform-origin: top center;
  min-width: 200px;
  max-width: 320px;
  background: rgba(26,31,36,0.96);
  color: white;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  white-space: normal;
  line-height: 1.3;
  z-index: 2000;
  display: none;
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms ease, transform 180ms cubic-bezier(.2,.9,.2,1);

  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent rgba(26,31,36,0.96) transparent;
  }
`;

export const TooltipHost = styled.span`
  display: inline-flex;
  align-items: center;
  position: relative;
  &:hover ${TooltipBubble}, &:focus-within ${TooltipBubble} {
    display: block;
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  &:hover ${TooltipWrap}, &:focus-within ${TooltipWrap} {
    background: rgba(254,65,10,0.14);
    border-color: rgba(254,65,10,0.42);
  }

  &:hover ${TooltipWrap} svg, &:focus-within ${TooltipWrap} svg {
    transform: scale(1.12) rotate(-8deg);
    filter: drop-shadow(0 2px 6px rgba(254,65,10,0.35));
  }

  &:hover .info-badge, &:focus-within .info-badge {
    transform: translateY(-2px) scale(1.02);
  }
`;

export const InfoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 2px solid #FE410A;
  box-shadow: 0 6px 18px rgba(254,65,10,0.12);
  margin-left: 8px;
  transition: transform 160ms ease, box-shadow 160ms ease;
  flex-shrink: 0;
  & > svg { display: block; }
`;

export const InfoBadgeHost = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-left: 8px;
  &:before {
    content: '';
    position: absolute;
    left: -8px;
    top: -6px;
    bottom: -6px;
    width: 8px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    background: #FE410A;
    opacity: 0.12;
  }
`;

export const TagCounter = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(72,80,84,0.5);
`;

export const CharCounter = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(72,80,84,0.5);
`;

export const Tip = styled.p`
  font-size: 13px;
  color: rgba(72,80,84,0.65);
  margin: 0;
`;

export const TextInput = styled.input<{ $invalid?: boolean }>`
  border: 1.5px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.15)')};
  border-radius: 16px;
  padding: 16px 18px;
  font-size: 15px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  transition: border 0.2s ease, box-shadow 0.2s ease;
  &:focus { outline: none; border-color: ${Pista8Theme.primary}; box-shadow: 0 0 0 3px ${Pista8Theme.primary}25; }
`;

export const TextArea = styled.textarea<{ $invalid?: boolean }>`
  border: 1.5px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.15)')};
  border-radius: 18px;
  padding: 18px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  color: ${Pista8Theme.secondary};
  transition: border 0.2s ease, box-shadow 0.2s ease;
  &:focus { outline: none; border-color: ${Pista8Theme.primary}; box-shadow: 0 0 0 3px ${Pista8Theme.primary}25; }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
`;

export const GhostButton = styled.button`
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

export const ButtonHint = styled.p`
  text-align: right;
  font-size: 12px;
  color: rgba(72,80,84,0.55);
  margin: -8px 0 0;
`;

export const CTAButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-weight: 800;
  padding: 14px 28px;
  border-radius: 18px;
  box-shadow: 0 20px 30px rgba(254,65,10,0.3);
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.2s ease;
  &:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
  &:not(:disabled):hover { transform: translateY(-2px); }
`;

export const FieldError = styled.p`
  font-size: 12px;
  color: #c62828;
  margin: -4px 0 0;
  font-weight: 600;
`;

export const MetaCard = styled.div<{ $invalid?: boolean }>`
  background: rgba(255,255,255,0.92);
  border-radius: 22px;
  padding: 22px;
  border: 1px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.08)')};
  box-shadow: 0 20px 35px rgba(72,80,84,0.1);
`;

export const MetaLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(72,80,84,0.55);
  margin: 0 0 6px;
`;

export const MetaValue = styled.p`
  font-size: 20px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const MetaBadge = styled.span`
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${Pista8Theme.primary}18;
  color: ${Pista8Theme.primary};
  font-size: 11px;
  font-weight: 700;
`;

export const MetaFoot = styled.p`
  font-size: 13px;
  color: rgba(72,80,84,0.65);
  margin: 6px 0 0;
`;

export const MetaError = styled(FieldError)`
  margin-top: 8px;
`;

export const Checklist = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ChecklistItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.8);
  border: 1px dashed rgba(72,80,84,0.15);
`;

export const StatusDot = styled.span<{ done: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${p => (p.done ? Pista8Theme.primary : 'rgba(72,80,84,0.25)')};
  background: ${p => (p.done ? Pista8Theme.primary : 'transparent')};
`;

export const ChecklistLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
`;

export const DraftsPanel = styled.div`
  background: linear-gradient(135deg, rgba(254, 65, 10, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(254, 65, 10, 0.08);
  box-shadow: 0 12px 28px rgba(254, 65, 10, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(254, 65, 10, 0.15);
    box-shadow: 0 16px 36px rgba(254, 65, 10, 0.08);
    transform: translateY(-2px);
  }
`;

export const DraftsPanelLabel = styled.p`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
  margin: 0;
  opacity: 0.85;
`;

export const DraftsPanelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(72, 80, 84, 0.1);
  background: white;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);

  svg {
    color: rgba(72, 80, 84, 0.45);
    transition: color 0.2s ease, transform 0.2s ease;
  }

  &:hover:not(:disabled) {
    border-color: ${Pista8Theme.primary};
    color: ${Pista8Theme.primary};
    box-shadow: 0 8px 20px rgba(254, 65, 10, 0.08);
    
    svg {
      color: ${Pista8Theme.primary};
      transform: scale(1.1);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(248, 249, 250, 0.5);
  }
`;

export const DraftsPanelText = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  text-align: left;
`;

export const DraftsPanelCount = styled.span`
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 0.02em;
  color: white;
  background: linear-gradient(135deg, #FF6B3D 0%, #FE410A 100%);
  padding: 3px 9px;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(254, 65, 10, 0.25);
  flex-shrink: 0;
  transition: transform 0.2s ease;
  
  ${DraftsPanelButton}:hover & {
    transform: scale(1.08);
  }
`;

export const DraftsEmpty = styled.div`
  padding: 28px 16px;
  text-align: center;
  border-radius: 18px;
  background: #f8f9fa;

  p {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 700;
    color: #1a1f22;
  }

  span {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
  }
`;

export const DraftCard = styled.article`
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 18px;
  padding: 16px 18px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const DraftCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const DraftCardTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 800;
  color: #1a1f22;
  word-break: break-word;
`;

export const DraftCardMeta = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
`;

export const DraftCardExcerpt = styled.p`
  margin: 0;
  font-size: 13px;
  color: #485054;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const DraftCardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const DraftChip = styled.span<{ $muted?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${p => (p.$muted ? 'rgba(72,80,84,0.08)' : 'rgba(254,65,10,0.08)')};
  color: ${p => (p.$muted ? '#6b7280' : Pista8Theme.primary)};
`;

export const DraftCardActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`;

export const DraftActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s ease;

  ${p => p.$primary && css`
    background: ${Pista8Theme.primary};
    color: white;
  `}

  ${p => p.$danger && css`
    background: rgba(220,38,38,0.08);
    color: #dc2626;
  `}

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const ConsentList = styled.div<{ $invalid?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  ${p => p.$invalid && css`
    padding: 12px;
    border-radius: 18px;
    border: 1.5px solid #ff8a8a;
    background: #fff7f7;
  `}
`;

export const ConsentItem = styled.label<{ checked: boolean }>`
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1.5px solid ${p => (p.checked ? Pista8Theme.primary : 'rgba(72,80,84,0.12)')};
  background: ${p => (p.checked ? `${Pista8Theme.primary}08` : 'rgba(248,249,250,0.9)')};
  cursor: pointer;
  transition: all 0.2s ease;
`;

export const ConsentCheckbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: ${Pista8Theme.primary};
`;

export const ConsentTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 2px;
`;

export const ConsentDescription = styled.p`
  font-size: 13px;
  color: rgba(72,80,84,0.7);
  margin: 0;
`;

export const TagInputWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1.5px dashed rgba(72,80,84,0.2);
  background: rgba(248,249,250,0.8);
`;

export const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: ${Pista8Theme.secondary}10;
  color: ${Pista8Theme.secondary};
  font-size: 12px;
  font-weight: 600;
`;

export const RemoveTag = styled.button`
  border: none;
  background: transparent;
  color: rgba(72,80,84,0.6);
  cursor: pointer;
`;

export const TagField = styled.input`
  flex: 1;
  min-width: 180px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  &:focus { outline: none; }
`;

export const AddTagButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:not(:disabled):hover { transform: translateY(-1px); }
`;

export const FeedbackBanner = styled.div<{ $tone: string }>`
  border-radius: 18px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  ${({ $tone }) => css`
    border: 1px solid ${FEEDBACK_PALETTE[$tone as any].border};
    background: ${FEEDBACK_PALETTE[$tone as any].background};
    color: ${FEEDBACK_PALETTE[$tone as any].color};
  `}
`;

export const BannerGlyph = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
`;

export const BannerTitle = styled.p`
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
`;
