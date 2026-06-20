import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';
import { premiumTooltip } from '../../styles/CommonStyles';

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const slideDown = keyframes`
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 2000px; }
`;

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 28px;
  animation: ${fadeIn} 0.3s ease both;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

export const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
`;

export const BackBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 14px;
  border: 2px solid rgba(72,80,84,0.08);
  background: white; color: ${Pista8Theme.secondary};
  font-size: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: rgba(254,65,10,0.3); color: ${Pista8Theme.primary}; transform: translateX(-4px); }
`;

export const FormTitle = styled.h2`
  font-size: 24px; font-weight: 900;
  color: ${Pista8Theme.secondary}; margin: 0; letter-spacing: -0.5px;
`;

export const FormCard = styled.div`
  background: white; border-radius: 24px; padding: 40px;
  box-shadow: 0 8px 32px rgba(72,80,84,0.07);
  border: 1px solid rgba(72,80,84,0.07);
`;

export const PreviewCard = styled.div`
  background: white; border-radius: 24px; padding: 32px;
  box-shadow: 0 8px 32px rgba(72,80,84,0.07);
  border: 1px solid rgba(72,80,84,0.07);
  position: sticky; top: 24px; align-self: start;
`;

export const PreviewLabel = styled.p`
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em; color: ${Pista8Theme.primary};
  margin: 0 0 20px; display: flex; align-items: center; gap: 6px;
  &::before { content: ''; display: inline-block; width: 6px; height: 6px;
    border-radius: 50%; background: ${Pista8Theme.primary}; animation: pulse 1.5s infinite; }
`;

export const PreviewTitle = styled.h3`
  font-size: 18px; font-weight: 900;
  color: ${Pista8Theme.secondary}; margin: 0 0 10px;
  min-height: 28px; text-align: center;
  word-break: break-word;
`;

export const PreviewSection = styled.div`
  margin-bottom: 14px;
`;

export const PreviewSectionLabel = styled.p`
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.08em; color: #9ca3af; margin: 0 0 4px;
`;

export const PreviewText = styled.p`
  font-size: 13px; color: #485054; line-height: 1.6; margin: 0;
  min-height: 20px; white-space: pre-wrap;
  word-break: break-word;
`;

export const PreviewLogoWrap = styled.div`
  width: 100%; max-width: 140px; margin: 0 auto 16px;
  border-radius: 16px; overflow: hidden;
  border: 2px solid rgba(72,80,84,0.08);
  background: #f9fafb; display: flex; align-items: center; justify-content: center;
  img { width: 100%; height: auto; max-height: 140px; object-fit: contain; }
`;

export const PreviewDateRow = styled.div`
  display: flex; gap: 8px; align-items: center; justify-content: center;
  font-size: 12px; color: #9ca3af; margin-bottom: 14px;
`;

export const PreviewCriteriaList = styled.div`
  display: flex; flex-direction: column; gap: 6px; margin-top: 6px;
`;

export const PreviewCriteriaChip = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  background: #f9fafb; border-radius: 10px; padding: 8px 14px;
  font-size: 12px; font-weight: 600; color: ${Pista8Theme.secondary};
  word-break: break-word; gap: 8px;
`;

export const PreviewWeightBadge = styled.span`
  font-size: 11px; font-weight: 800;
  color: ${Pista8Theme.primary};
  background: rgba(254,65,10,0.08);
  padding: 2px 8px; border-radius: 20px;
`;

export const PreviewTypeBadge = styled.span<{ $isPrivate: boolean }>`
  display: inline-flex; align-items: center; gap: 5px;
  background: ${p => p.$isPrivate ? '#fef3c7' : '#dcfce7'}; 
  color: ${p => p.$isPrivate ? '#92400e' : '#166534'}; 
  font-size: 11px;
  font-weight: 700; padding: 4px 10px; border-radius: 20px;
`;

export const Divider = styled.hr`
  border: none; border-top: 1.5px solid rgba(72,80,84,0.06); margin: 20px 0;
`;

export const SectionTitle = styled.div`
  font-size: 13px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em; color: ${Pista8Theme.secondary};
  margin-bottom: 20px;
`;

export const FormGrid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 28px 32px;
  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }
`;

export const FullSpan = styled.div`
  grid-column: 1 / -1;
`;

export const FieldGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

export const Label = styled.label<{ $locked?: boolean }>`
  font-size: 12px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.$locked ? '#9ca3af' : Pista8Theme.secondary};
  display: flex; align-items: center; gap: 6px;
`;

export const LockedBadge = styled.span<{ $tooltipText?: string; $tooltipPosition?: 'top' | 'bottom'; $tooltipAlign?: 'center' | 'right' }>`
  color: ${Pista8Theme.primary};
  display: inline-flex; align-items: center; justify-content: center;
  cursor: help;
  padding: 0 4px;
  ${premiumTooltip}
`;

export const InputWrapper = styled.div<{ $tooltipText?: string; $tooltipPosition?: 'top' | 'bottom'; $tooltipAlign?: 'center' | 'right' }>`
  position: relative;
  width: 100%;
  display: flex;
  ${premiumTooltip}
`;

export const InputField = styled.input<{ $error?: boolean; $locked?: boolean }>`
  width: 100%; box-sizing: border-box;
  padding: 14px 18px; border-radius: 14px;
  border: 2px solid ${p => p.$error ? Pista8Theme.error : p.$locked ? '#f1f3f5' : '#eef0f2'};
  font-size: 14px; font-weight: 500; color: ${p => p.$locked ? '#9ca3af' : '#1a1f22'};
  background: ${p => p.$locked ? '#f9fafb' : 'white'};
  outline: none; transition: all 0.2s;
  cursor: ${p => p.$locked ? 'not-allowed' : 'text'};
  &:focus {
    border-color: ${p => p.$locked ? '#f1f3f5' : p.$error ? Pista8Theme.error : Pista8Theme.primary};
    box-shadow: ${p => p.$locked ? 'none' : '0 4px 16px rgba(254,65,10,0.08)'};
  }
  &::placeholder { color: #c0c8d0; font-weight: 400; }
`;

export const TextAreaField = styled.textarea<{ $error?: boolean; $locked?: boolean }>`
  width: 100%; box-sizing: border-box;
  padding: 14px 18px; border-radius: 14px;
  border: 2px solid ${p => p.$error ? Pista8Theme.error : p.$locked ? '#f1f3f5' : '#eef0f2'};
  font-size: 14px; font-weight: 500; color: ${p => p.$locked ? '#9ca3af' : '#1a1f22'};
  background: ${p => p.$locked ? '#f9fafb' : 'white'};
  outline: none; resize: none !important; overflow-y: auto; height: 150px !important;
  font-family: inherit; line-height: 1.6; transition: all 0.2s;
  cursor: ${p => p.$locked ? 'not-allowed' : 'text'};
  &:focus {
    border-color: ${p => p.$locked ? '#f1f3f5' : p.$error ? Pista8Theme.error : Pista8Theme.primary};
    box-shadow: ${p => p.$locked ? 'none' : '0 4px 16px rgba(254,65,10,0.08)'};
  }
  &::placeholder { color: #c0c8d0; font-weight: 400; }
`;

export const FlexibleTextAreaField = styled(TextAreaField)`
  height: auto !important;
  flex: 1;
  min-height: 150px;
`;

export const CharCount = styled.span<{ $over: boolean }>`
  font-size: 11px; font-weight: 600; text-align: right;
  color: ${p => p.$over ? Pista8Theme.error : '#c0c8d0'};
`;

export const ErrorText = styled.p`
  font-size: 11px; font-weight: 700; color: ${Pista8Theme.error}; margin: 0;
`;

export const CheckboxRow = styled.label<{ $locked?: boolean }>`
  display: flex; align-items: center; gap: 12px;
  font-size: 13px; font-weight: 700;
  color: ${p => p.$locked ? '#9ca3af' : Pista8Theme.secondary};
  cursor: ${p => p.$locked ? 'not-allowed' : 'pointer'};
  padding: 14px 18px; border-radius: 14px;
  background: ${p => p.$locked ? '#f9fafb' : 'white'};
  border: 2px solid ${p => p.$locked ? '#f1f3f5' : '#eef0f2'};
  transition: all 0.2s;
  &:hover { border-color: ${p => p.$locked ? '#f1f3f5' : 'rgba(254,65,10,0.2)'}; }
`;

export const LogoUploadArea = styled.div<{ $hasImage: boolean }>`
  display: flex; align-items: center; gap: 16px;
  padding: 16px 18px; border-radius: 14px;
  border: 2px dashed ${p => p.$hasImage ? Pista8Theme.primary : '#eef0f2'};
  background: ${p => p.$hasImage ? 'rgba(254,65,10,0.03)' : '#fafbfc'};
  cursor: pointer; transition: all 0.2s;
  &:hover { border-color: ${Pista8Theme.primary}; background: rgba(254,65,10,0.03); }
`;

export const LogoThumb = styled.img`
  width: 52px; height: 52px; border-radius: 12px;
  object-fit: cover; border: 2px solid rgba(254,65,10,0.15);
`;

export const LogoPlaceholder = styled.div`
  width: 52px; height: 52px; border-radius: 12px;
  background: #f1f3f5; display: flex; align-items: center; justify-content: center;
`;

export const UploadText = styled.div`
  flex: 1;
  p { margin: 0; font-size: 13px; font-weight: 700; color: ${Pista8Theme.secondary}; }
  span { font-size: 11px; color: #9ca3af; }
`;

export const CriteriaToggleBtn = styled.button<{ $open: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 16px 20px; border-radius: 14px;
  border: 2px solid ${p => p.$open ? Pista8Theme.primary : '#eef0f2'};
  background: ${p => p.$open ? 'rgba(254,65,10,0.04)' : 'white'};
  color: ${p => p.$open ? Pista8Theme.primary : Pista8Theme.secondary};
  font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s;
  svg { transform: ${p => p.$open ? 'rotate(180deg)' : 'rotate(0)'}; transition: transform 0.3s; }
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
`;

export const OptionalToggleBtn = styled.button<{ $open: boolean }>`
  display: flex; align-items: center; gap: 6px; background: none; border: none;
  cursor: pointer; font-size: 10px; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: #a8b0b8; padding: 0; margin-bottom: 6px;
  
  .icon-circle {
    display: flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%;
    background: ${Pista8Theme.primary}; color: white;
    font-size: 18px; font-weight: 500; line-height: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${p => p.$open ? 'rotate(180deg)' : 'rotate(0deg)'};
    padding-bottom: 2px; /* Alineación óptica para + y - */
  }

  &:hover .icon-circle {
    transform: ${p => p.$open ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1.1)'};
    box-shadow: 0 4px 12px rgba(254, 65, 10, 0.3);
  }

  &:active .icon-circle {
    transform: ${p => p.$open ? 'rotate(180deg) scale(0.95)' : 'rotate(0deg) scale(0.95)'};
  }
`;

export const CriteriaPanel = styled.div`
  padding: 24px; border-radius: 14px;
  border: 2px solid rgba(254,65,10,0.1);
  background: rgba(254,65,10,0.02);
  display: flex; flex-direction: column; gap: 14px;
  animation: ${fadeIn} 0.3s ease;
`;

export const CriterionRow = styled.div`
  display: flex; align-items: center; gap: 12px;
`;

export const CriterionCheckbox = styled.input`
  width: 18px; height: 18px;
  accent-color: ${Pista8Theme.primary};
  cursor: pointer; flex-shrink: 0;
`;

export const CriterionName = styled.span<{ $enabled: boolean; $locked?: boolean }>`
  flex: 1; font-size: 14px; font-weight: 600;
  color: ${p => p.$enabled ? Pista8Theme.secondary : '#9ca3af'};
  cursor: ${p => p.$locked ? 'not-allowed' : 'pointer'};
`;

export const WeightInput = styled.input`
  width: 72px; padding: 8px 12px; border-radius: 10px;
  border: 2px solid #eef0f2; font-size: 13px; font-weight: 700;
  color: ${Pista8Theme.primary}; text-align: center;
  outline: none; background: white; transition: all 0.2s;
  &:focus { border-color: ${Pista8Theme.primary}; box-shadow: 0 4px 12px rgba(254,65,10,0.1); }
  &:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; }
`;

export const WeightUnit = styled.span`
  font-size: 12px; font-weight: 700; color: #9ca3af;
`;

export const AddCriterionBtn = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px 24px; border-radius: 14px; border: none;
  background: ${Pista8Theme.primary}; color: white;
  font-size: 13px; font-weight: 800; cursor: pointer;
  transition: all 0.15s ease-out;
  box-shadow: 0 4px 14px rgba(254, 65, 10, 0.25);

  &:hover { 
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(254, 65, 10, 0.4);
    background: #e53a09;
  }

  &:active {
    transform: scale(0.97);
  }
`;

export const CustomCriterionInput = styled.input`
  flex: 1; padding: 10px 14px; border-radius: 10px;
  border: 2px solid ${Pista8Theme.primary}; font-size: 13px;
  font-weight: 600; color: ${Pista8Theme.secondary};
  outline: none; background: white;
  &::placeholder { color: #c0c8d0; font-weight: 400; }
`;

export const RemoveBtn = styled.button`
  width: 28px; height: 28px; border-radius: 8px; border: none;
  background: #fee2e2; color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: all 0.2s;
  &:hover { background: #ef4444; color: white; }
`;

export const TotalWeightBar = styled.div<{ $total: number }>`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  background: ${p => p.$total > 100 ? '#fee2e2' : p.$total === 100 ? '#dcfce7' : '#f9fafb'};
  border: 1.5px solid ${p => p.$total > 100 ? '#ef4444' : p.$total === 100 ? '#22c55e' : '#eef0f2'};
`;

export const BtnRow = styled.div`
  display: flex; gap: 12px; justify-content: flex-end;
  padding-top: 24px; border-top: 2px solid rgba(72,80,84,0.04);
`;

export const Btn = styled.button<{ $primary?: boolean; $outline?: boolean }>`
  padding: 13px 32px; border-radius: 14px;
  border: ${p => p.$outline ? `2px solid rgba(72,80,84,0.15)` : 'none'};
  font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.2s;
  background: ${p => p.$primary ? Pista8Theme.primary : p.$outline ? 'white' : '#f1f3f5'};
  color: ${p => p.$primary ? 'white' : '#6b7280'};
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.$primary ? '0 8px 24px rgba(254,65,10,0.3)' : '0 4px 12px rgba(0,0,0,0.06)'};
    background: ${p => p.$primary ? '#ff4f19' : p.$outline ? '#f9fafb' : '#e5e7eb'};
  }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
`;

export const ConfirmBanner = styled.div`
  background: #fef3c7; border: 2px solid #f59e0b;
  border-radius: 14px; padding: 16px 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  margin-bottom: 20px; animation: ${fadeIn} 0.2s ease;
  grid-column: 1 / -1;
`;
