import styled, { css } from 'styled-components';
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
