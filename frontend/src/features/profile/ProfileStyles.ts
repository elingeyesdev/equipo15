import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '@/config/theme';

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const Wrapper = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  padding: 4rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

export const BackBtnWrap = styled.div`
  position: absolute;
  top: 2.25rem;
  left: 2.25rem;
  @media (max-width: 768px) {
    position: static;
    margin-bottom: 1.75rem;
    align-self: flex-start;
  }
`;

export const Card = styled.div`
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(72, 80, 84, 0.07);
  box-shadow:
    0 1px 2px rgba(72, 80, 84, 0.04),
    0 8px 32px rgba(72, 80, 84, 0.08),
    0 24px 64px rgba(72, 80, 84, 0.06);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  animation: ${fadeUp} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

export const ProfileBanner = styled.div`
  background: linear-gradient(150deg, #1e2529 0%, #161b1e 100%);
  padding: 48px 40px 36px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const BannerNoise = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.02) 0%, transparent 40%);
  pointer-events: none;
`;

export const BannerGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
`;

export const AvatarWrap = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
`;

export const AvatarRing = styled.div`
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${Pista8Theme.primary}70 0%, transparent 60%);
`;

export const Avatar = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 3px solid #161b1e;
`;

export const BannerMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
`;

export const DisplayName = styled.h1`
  font-size: 24px;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.4px;
`;

export const Email = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.32);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

export const BannerPills = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const FacultyPill = styled.span`
  font-size: 12px;
  color: ${Pista8Theme.primary};
  font-weight: 700;
  background: ${Pista8Theme.primary}18;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid ${Pista8Theme.primary}30;
`;

export const RolePill = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.08);
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
`;

export const CardBody = styled.div`
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SectionLabel = styled.p`
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #bbc4cc;
  margin: 0;
`;

export const SectionLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgba(72, 80, 84, 0.08);
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(72, 80, 84, 0.07);
  margin: 0 -40px;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldFull = styled.div`
  grid-column: 1 / -1;
`;

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FormLabel = styled.label`
  font-size: 11px;
  font-weight: 700;
  color: #a8b2ba;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  background: ${Pista8Theme.background};
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;

  &::placeholder { color: #c8d0d8; }
  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}12;
    background: #ffffff;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  background: ${Pista8Theme.background};
  font-family: inherit;
  resize: vertical;
  outline: none;
  line-height: 1.65;
  box-sizing: border-box;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;

  &::placeholder { color: #c8d0d8; }
  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}12;
    background: #ffffff;
  }
`;

export const PhoneInputWrap = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;

  input {
    border-radius: 0 12px 12px 0;
    border-left: none;
    &:focus { border-left: none; }
  }
`;

export const PhonePrefix = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 13px;
  background: rgba(72, 80, 84, 0.04);
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-right: none;
  border-radius: 12px 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #6e7880;
  white-space: nowrap;
`;

export const SaveBtn = styled.button`
  align-self: flex-end;
  padding: 12px 24px;
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: transform 0.1s, box-shadow 0.18s, opacity 0.18s;
  box-shadow: 0 4px 16px ${Pista8Theme.primary}38;

  &:hover { transform: translateY(-1px); box-shadow: 0 6px 22px ${Pista8Theme.primary}48; }
  &:active { transform: scale(0.97); }
  &:disabled {
    background: rgba(72,80,84,0.08);
    color: #b8c0c8;
    box-shadow: none;
    cursor: default;
    transform: none;
  }
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: ${Pista8Theme.background};
  border-radius: 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.06);
  transition: border-color 0.18s;

  &:hover { border-color: rgba(72, 80, 84, 0.12); }
`;

export const InfoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${Pista8Theme.primary}12;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const InfoKey = styled.p`
  font-size: 10.5px;
  font-weight: 700;
  color: #b8c0c8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

export const InfoVal = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

export const SecurityActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const GoogleLinkedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34A853;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  background: rgba(52, 168, 83, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(52, 168, 83, 0.14);
  width: fit-content;
  animation: ${slideDown} 0.25s ease both;
`;

export const GoogleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  width: fit-content;

  &:hover {
    background: #f5f7f9;
    border-color: rgba(66, 133, 244, 0.4);
    box-shadow: 0 2px 10px rgba(66, 133, 244, 0.1);
  }
`;

export const PassButton = styled.button`
  background: none;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  font-size: 13.5px;
  color: ${Pista8Theme.secondary};
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  width: fit-content;
  transition: all 0.18s;

  &:hover {
    border-color: ${Pista8Theme.primary}50;
    color: ${Pista8Theme.primary};
    background: ${Pista8Theme.primary}06;
  }
`;

export const PassForm = styled.div`
  background: ${Pista8Theme.background};
  padding: 20px;
  border-radius: 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.07);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const EyeBtn = styled.button`
  position: absolute;
  right: 11px;
  background: none;
  border: none;
  color: #c4cdd5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.18s;

  &:hover { color: ${Pista8Theme.primary}; }
  svg { width: 16px; height: 16px; }
`;

export const LogoutWrap = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 4px;
`;
