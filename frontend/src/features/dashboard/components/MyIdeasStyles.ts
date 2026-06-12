import styled, { keyframes } from 'styled-components';
import { Pista8Theme, breakpoints } from '../../../config/theme';
import { fadeUp } from '../styles/CommonStyles';

export const Wrapper = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
`;

export const MainContent = styled.main`
  padding: 40px 4%;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;

  @media (min-width: 1025px) {
    padding: 40px calc(2% + 300px) 40px 4%;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 24px 3%;
  }
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  animation: ${fadeUp} 0.4s ease both;
  gap: 16px;

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;

    & > button {
      align-self: flex-end;
    }
  }
`;

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h1`
  font-size: clamp(22px, 3.2vw, 36px);
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;

  span {
    color: ${Pista8Theme.primary};
  }
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  margin: 0;
  font-weight: 500;

  @media (max-width: ${breakpoints.small}) {
    font-size: 12px;
  }
`;

export const HamburgerBtn = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid rgba(72, 80, 84, 0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s, transform 0.12s;
  flex-shrink: 0;

  &:hover {
    border-color: ${Pista8Theme.primary};
    color: ${Pista8Theme.primary};
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.96);
  }

  @media (min-width: 1025px) {
    display: none;
  }
`;

export const IdeasGrid = styled.div<{ $count?: number }>`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  animation: ${fadeUp} 0.4s 0.1s ease both;

  & > div {
    flex: 1 1 300px;
    max-width: 100%;

    @media (min-width: ${breakpoints.tablet}) {
      max-width: ${({ $count }) => 
        $count === 1 ? '100%' : 
        $count === 2 ? 'calc(50% - 10px)' : 
        'calc(50% - 10px)'};
    }

    @media (min-width: ${breakpoints.desktop}) {
      max-width: ${({ $count }) => 
        $count === 1 ? '100%' : 
        $count === 2 ? 'calc(50% - 10px)' : 
        'calc(33.333% - 13.33px)'};
    }
  }
`;

export const Card = styled.div`
  background: ${Pista8Theme.white};
  border-radius: 20px;
  padding: 24px 22px 22px;
  border: 1.5px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.22s ease, border-color 0.22s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${Pista8Theme.primary}, #ff6b3d, ${Pista8Theme.primary});
    background-size: 200% 100%;
    border-radius: 20px 20px 0 0;
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    border-color: rgba(254, 65, 10, 0.2);
    
    &::before {
      opacity: 1;
      animation: gradientShift 3s linear infinite;
    }
  }
`;

export const CardBadge = styled.span`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
  background: ${Pista8Theme.primary}0d;
  border: 1px solid ${Pista8Theme.primary}20;
  padding: 6px 14px;
  border-radius: 20px;
  display: block;
  max-width: 100%;
  word-break: break-word;
  line-height: 1.4;
`;

export const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 16px 0;
  line-height: 1.4;
  letter-spacing: -0.2px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const ActionButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: ${Pista8Theme.white};
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 6px 18px ${Pista8Theme.primary}28;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px ${Pista8Theme.primary}35;
  }

  &:active {
    transform: scale(0.97);
  }

  svg {
    width: 13px;
    height: 13px;
    stroke-width: 2.5;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  background: transparent;
  border-radius: 28px;
  border: none;
  max-width: 600px;
  margin: 40px auto 0;
  animation: ${fadeUp} 0.4s ease both;
`;

export const EmptyIconWrap = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${Pista8Theme.primary}08;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.primary};
  margin-bottom: 24px;
`;

export const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0 0 12px;
`;

export const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 24px;
  max-width: 400px;
`;

export const EmptyButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 13.5px;
  font-weight: 800;
  padding: 12px 28px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e63a09;
    box-shadow: 0 8px 24px ${Pista8Theme.primary}33;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
`;

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(28px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 25, 28, 0.55);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: ${overlayIn} 0.22s ease-out;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 12px;
  }
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 760px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border: 1px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 40px 80px rgba(20, 25, 28, 0.22);
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: ${breakpoints.mobile}) {
    border-radius: 20px;
    max-height: calc(100vh - 24px);
  }
`;

export const ModalBanner = styled.div`
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  border-radius: 31px 31px 0 0;
  padding: 28px 36px 22px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px 20px 16px;
  }
`;

export const BannerDots = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
`;

export const ModalCloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.13); color: white; }
`;

export const ModalTag = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 5px 12px;
  border-radius: 20px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
`;

export const ModalTitle = styled.h2`
  margin: 0 0 16px;
  color: white;
  font-size: 21px;
  font-weight: 900;
  line-height: 1.35;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 1;
  max-width: 440px;
`;

export const ModalDateChip = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.28);
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 2px 9px;
  border-radius: 20px;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 1;
`;

export const ModalBody = styled.div`
  padding: 28px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px 16px 24px;
  }
`;

export const SectionBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0;
  text-align: center;
`;

export const SectionLabel = styled.p`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
  margin: 0;
`;

export const ProposalText = styled.p`
  margin: 0;
  width: 100%;
  font-size: 16px;
  line-height: 1.8;
  color: #5a6470;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const ReadMoreButton = styled.button`
  border: 0;
  background: transparent;
  color: ${Pista8Theme.primary};
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export const ActionsRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;

  &:hover .custom-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

export const TooltipText = styled.span`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: rgba(26, 31, 34, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(26, 31, 34, 0.95) transparent transparent transparent;
  }
`;

export const ReactionPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(248, 249, 250, 0.9);
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 99px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.03em;
`;

export const ReactionCount = styled.span`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #a8b0b8;
`;

export const CommentToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(p) => (p.$active ? `${Pista8Theme.primary}12` : 'rgba(248,249,250,0.9)')};
  color: ${(p) => (p.$active ? Pista8Theme.primary : '#94a3b8')};
  border: 1.5px solid ${(p) => (p.$active ? `${Pista8Theme.primary}50` : 'rgba(72,80,84,0.1)')};
  border-radius: 99px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: ${(p) => (p.$active ? `0 0 0 3px ${Pista8Theme.primary}18` : 'none')};

  &:hover {
    background: ${(p) => (p.$active ? `${Pista8Theme.primary}16` : `${Pista8Theme.primary}08`)};
    border-color: ${(p) => (p.$active ? `${Pista8Theme.primary}66` : `${Pista8Theme.primary}40`)};
    color: ${Pista8Theme.primary};
  }
`;

export const Counter = styled.span`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
`;
