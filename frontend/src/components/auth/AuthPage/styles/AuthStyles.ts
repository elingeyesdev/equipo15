import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Pista8Theme } from '../../../../config/theme';

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const slideDown = keyframes`
  from { opacity: 0; max-height: 0; transform: translateY(-10px); }
  to   { opacity: 1; max-height: 90px; transform: translateY(0); }
`;

export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${Pista8Theme.background};
  padding: 2rem 1rem;
`;

export const Card = styled.div`
  background: ${Pista8Theme.white};
  border-radius: 32px;
  padding: 48px 44px 40px;
  width: 100%;
  max-width: 460px;
  border: 1px solid rgba(72, 80, 84, 0.1);
  animation: ${fadeUp} 0.45s cubic-bezier(.22, .68, 0, 1.2) both;
`;

export const LogoWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

export const LogoSvg = styled.svg`
  width: 220px;
  height: auto;
`;

export const SepLine = styled.div`
  height: 1px;
  background: rgba(72, 80, 84, 0.09);
  margin-bottom: 30px;
`;

export const ErrorBanner = styled.div`
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 24px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${slideDown} 0.3s ease both;
  
  svg {
    flex-shrink: 0;
  }
`;

export const Tabs = styled.div`
  display: flex;
  background: ${Pista8Theme.background};
  border-radius: 16px;
  padding: 5px;
  margin-bottom: 30px;
  gap: 4px;
`;

export const Tab = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.active ? Pista8Theme.secondary : '#9aa0a6'};
  border-radius: 12px;
  cursor: pointer;
  border: ${p => p.active ? '0.5px solid rgba(72, 80, 84, 0.13)' : 'none'};
  background: ${p => p.active ? Pista8Theme.white : 'transparent'};
  transition: all 0.22s ease;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FieldWrap = styled.div<{ isName?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  ${p => p.isName && slideDown} 0.3s cubic-bezier(.22, .68, 0, 1.1) both;
  ${p => p.isName && 'overflow: hidden;'}
`;

export const FieldHint = styled.span`
  font-size: 12px;
  color: #e53e3e;
  padding: 0 4px;
  margin-top: -2px;
  animation: ${slideDown} 0.25s ease both;
`;

export const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  letter-spacing: 0.01em;
`;

export const FieldInput = styled.input`
  width: 100%;
  background: ${Pista8Theme.background};
  border: 1.5px solid transparent;
  border-radius: 14px;
  padding: 15px 18px;
  padding-right: 48px;
  font-size: 15px;
  color: ${Pista8Theme.secondary};
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, background 0.2s;

  &::placeholder {
    color: #c0c6cb;
  }

  &:focus {
    border-color: ${Pista8Theme.primary};
    background: ${Pista8Theme.white};
  }
`;

export const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const EyeBtn = styled.button`
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #c0c6cb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${Pista8Theme.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ForgotRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -4px;
`;

export const ForgotLink = styled.a`
  font-size: 13px;
  color: ${Pista8Theme.primary};
  text-decoration: none;
  opacity: 0.82;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;

export const BtnMain = styled.button`
  width: 100%;
  background: ${Pista8Theme.primary};
  color: ${Pista8Theme.white};
  border: none;
  border-radius: 14px;
  padding: 17px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  transition: opacity 0.15s, transform 0.12s;

  &:hover:not(:disabled) { opacity: 0.88; }
  &:active:not(:disabled) { transform: scale(0.975); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const Spinner = styled.span`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.65s linear infinite;
  display: inline-block;
`;

export const OrRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0 16px;
`;

export const OrLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgba(72, 80, 84, 0.09);
`;

export const OrText = styled.span`
  font-size: 13px;
  color: #c0c6cb;
  white-space: nowrap;
`;

export const BtnGoogle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: ${Pista8Theme.white};
  color: ${Pista8Theme.secondary};
  padding: 15px;
  border-radius: 14px;
  border: 1px solid rgba(72, 80, 84, 0.16);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;

  &:hover:not(:disabled) {
    background: ${Pista8Theme.background};
    border-color: #4285F4;
  }
  &:active:not(:disabled) { transform: scale(0.975); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
`;

export const SwitchText = styled.span`
  font-size: 14px;
  color: #9aa0a6;
`;

export const SwitchBtn = styled.button`
  background: none;
  border: none;
  color: ${Pista8Theme.primary};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
  &:hover { opacity: 0.75; }
`;

export const ValidationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: -6px;
  margin-bottom: 8px;
  padding: 0 4px;
  animation: ${slideDown} 0.3s cubic-bezier(.22, .68, 0, 1.1) both;
  overflow: hidden;
`;

export const ValidationItem = styled.div<{ isValid: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${p => p.isValid ? '#34A853' : '#9aa0a6'};
  transition: color 0.3s ease;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: ${p => p.isValid ? '#34A853' : '#EA4335'};
    transition: color 0.3s ease;
  }
`;

export const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(44, 52, 56, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
`;

export const ModalCard = styled(motion.div)`
  background: ${Pista8Theme.white};
  border-radius: 28px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ModalTitle = styled.h3`
  font-size: 22px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin-bottom: 12px;
`;

export const ModalText = styled.p`
  font-size: 15px;
  color: #5f6368;
  line-height: 1.6;
  margin-bottom: 28px;
`;

export const ModalBtnRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const ToastContainer = styled(motion.div)`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: 100%;
  max-width: 440px;
  padding: 0 16px;
  box-sizing: border-box;
  pointer-events: none;
`;

const toastBase = `
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
`;

export const SuccessToast = styled.div`
  ${toastBase}
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;

  > svg:first-child {
    flex-shrink: 0;
    color: #22c55e;
  }
`;

export const ErrorToast = styled.div`
  ${toastBase}
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;

  > svg:first-child {
    flex-shrink: 0;
  }
`;

export const ToastText = styled.span`
  flex: 1;
  line-height: 1.4;
`;

export const ToastClose = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;


