import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';

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

export const Root = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  position: relative;
  overflow-x: hidden;
`;

export const Overlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(72, 80, 84, 0.4);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: ${p => p.open ? 1 : 0};
  pointer-events: ${p => p.open ? 'all' : 'none'};
  transition: opacity 0.3s ease;
`;

export const Sidebar = styled.aside<{ open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  background: ${Pista8Theme.secondary};
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 36px 28px 40px;
  animation: ${p => p.open ? css`${slideIn} 0.32s cubic-bezier(.22,.68,0,1.1) both` : css`${slideOut} 0.28s ease both`};
  ${p => !p.open && 'pointer-events: none;'}
`;

export const SidebarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 52px;
`;

export const SidebarBrand = styled.div``;

export const SidebarClose = styled.button`
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.6);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255,255,255,0.14); color: white; }
`;

export const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const SidebarNavItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  text-align: left;
  padding: 18px 20px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  background: ${p => p.active ? 'rgba(254,65,10,0.18)' : 'transparent'};
  color: ${p => p.active ? '#FE410A' : 'rgba(255,255,255,0.55)'};
  letter-spacing: 0.01em;
  svg { width: 20px; height: 20px; flex-shrink: 0; }
  &:hover { background: rgba(255,255,255,0.07); color: white; }
`;

export const SidebarFooter = styled.div`
  padding-top: 28px;
  padding-bottom: 8px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: center;
`;

export const Page = styled.div`
  padding: 2.5rem 4%;
  max-width: 1400px;
  margin: 0 auto;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.4s ease both;
`;

export const WelcomeZone = styled.div``;

export const Greeting = styled.h1`
  font-size: 36px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;
  span { color: ${Pista8Theme.primary}; }
`;

export const Sub = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  margin: 6px 0 0;
  font-weight: 500;
`;

export const HamburgerBtn = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s, transform 0.12s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; transform: scale(1.04); }
  &:active { transform: scale(0.96); }
`;

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
  position: relative;
`;

export const HangarSub = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.18);
  margin: 0;
  position: relative;
`;

export const HangarGlow = styled.div`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  background: radial-gradient(ellipse, rgba(254,65,10,0.2) 0%, transparent 70%);
  pointer-events: none;
`;

export const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  animation: ${fadeUp} 0.4s 0.1s ease both;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftPanel = styled.div`
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255,255,255,0.9);
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const PanelTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

export const FilterWrap = styled.div`
  position: relative;
`;

export const FilterBtn = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.15)'};
  background: ${p => p.active ? `${Pista8Theme.primary}12` : 'transparent'};
  color: ${p => p.active ? Pista8Theme.primary : Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
`;

export const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 16px;
  padding: 6px;
  z-index: 10;
  min-width: 160px;
  box-shadow: 0 12px 32px rgba(72,80,84,0.14);
  animation: ${fadeUp} 0.18s ease both;
`;

export const FilterOption = styled.button<{ active: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: ${p => p.active ? '700' : '500'};
  color: ${p => p.active ? Pista8Theme.primary : Pista8Theme.secondary};
  background: ${p => p.active ? `${Pista8Theme.primary}10` : 'transparent'};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(72,80,84,0.05); }
`;

export const ChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ChallengeCard = styled.div<{ active: boolean }>`
  position: relative;
  padding: 20px 22px;
  border-radius: 18px;
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.07)'};
  background: ${p => p.active ? `${Pista8Theme.primary}07` : 'rgba(248,249,250,0.8)'};
  cursor: pointer;
  transition: all 0.22s ease;
  overflow: hidden;
  &:hover {
    border-color: ${Pista8Theme.primary};
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(254,65,10,0.08);
  }
`;

export const ActiveBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: ${Pista8Theme.primary};
  border-radius: 0 4px 4px 0;
`;

export const TopRight = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

export const BadgeCorner = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 3px 8px;
  border-radius: 6px;
`;

export const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${Pista8Theme.primary};
  background: ${Pista8Theme.primary}15;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

export const LikesChip = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a8b0b8;
  font-weight: 600;
  svg { color: #e8a0a0; }
`;

export const CardTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 8px;
  line-height: 1.45;
`;

export const CardMeta = styled.p`
  font-size: 12px;
  color: #b8c0c8;
  margin: 0;
  font-weight: 500;
`;

export const CardActionRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

export const RespondButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(254,65,10,0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  span { font-size: 14px; }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 32px rgba(254,65,10,0.35);
  }
`;

export const RightPanel = styled.div<{ hasChallenge: boolean }>`
  background: ${Pista8Theme.secondary};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(72,80,84,0.1);
  opacity: ${p => p.hasChallenge ? 1 : 0.35};
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const StatsHeader = styled.div``;

export const StatsTitle = styled.h3`
  font-size: 19px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px;
`;

export const StatsSub = styled.p`
  font-size: 13px;
  color: rgba(255,255,255,0.38);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

export const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

export const SummaryCard = styled.div`
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px 12px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.07);
  transition: background 0.18s;
  &:hover { background: rgba(255,255,255,0.1); }
`;

export const SummaryVal = styled.p`
  font-size: 30px;
  font-weight: 900;
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
`;

export const SummaryLabel = styled.p`
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const StatsColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0 20px;
  flex: 1;
`;

export const StatsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

export const ColLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 4px;
`;

export const StatsDivider = styled.div`
  width: 1px;
  background: rgba(255,255,255,0.08);
  align-self: stretch;
`;

export const RankRow = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr 40px 28px;
  align-items: center;
  gap: 8px;
`;

export const RankNum = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.25);
`;

export const RankName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RankBar = styled.div`
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
`;

export const RankFill = styled.div<{ pct: number; delay: number }>`
  height: 100%;
  width: ${p => p.pct}%;
  background: ${Pista8Theme.primary};
  border-radius: 2px;
  animation: ${fillBar} 0.55s ${p => p.delay}ms ease both;
`;

export const RankVal = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-align: right;
`;

export const EmptyStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 14px;
  color: rgba(255,255,255,0.25);
  text-align: center;
  font-size: 13px;
  font-weight: 500;
`;

export const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 22, 26, 0.65);
  backdrop-filter: blur(3px);
  z-index: 80;
`;

export const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  z-index: 90;
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
  @media (max-width: 640px) {
    padding: 32px 22px;
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
  &:hover {
    transform: scale(1.05);
    background: white;
  }
`;

export const FormGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 28px;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const MetaColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  ${p => p.$invalid && css`
    box-shadow: 0 0 0 2px rgba(255,138,138,0.3);
  `}
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
  line-height: 1.4;
`;

export const MetaFoot = styled.p`
  font-size: 13px;
  color: rgba(72,80,84,0.65);
  margin: 6px 0 0;
`;

export const MetaError = styled(FieldError)`
  margin-top: 8px;
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
  transition: background 0.2s ease, border 0.2s ease;
`;

export const ChecklistLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
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
  text-transform: none;
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

export const FeedbackBanner = styled.div<{ $tone: string }>`
  border-radius: 18px;
  padding: 14px 18px;
  margin-bottom: 12px;
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
  p {
    margin: 0;
  }
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
  line-height: 1;
`;

export const BannerTitle = styled.p`
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
`;

export const TextInput = styled.input<{ $invalid?: boolean }>`
  border: 1.5px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.15)')};
  border-radius: 16px;
  padding: 16px 18px;
  font-size: 15px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  transition: border 0.2s ease, box-shadow 0.2s ease;
  ${p => p.$invalid && css`
    box-shadow: 0 0 0 2px rgba(255,138,138,0.2);
  `}
  &:focus {
    outline: none;
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}25;
  }
`;

export const TextArea = styled.textarea<{ $invalid?: boolean }>`
  border: 1.5px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.15)')};
  border-radius: 18px;
  padding: 18px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  resize: vertical;
  color: ${Pista8Theme.secondary};
  transition: border 0.2s ease, box-shadow 0.2s ease;
  ${p => p.$invalid && css`
    box-shadow: 0 0 0 2px rgba(255,138,138,0.2);
  `}
  &:focus {
    outline: none;
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}25;
  }
`;

export const TagCounter = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(72,80,84,0.5);
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
  font-size: 14px;
  line-height: 1;
  padding: 0;
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
  &:disabled { color: rgba(72,80,84,0.4); }
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
  transition: opacity 0.2s ease, transform 0.2s ease;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    transform: translateY(-1px);
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
  transition: border 0.2s ease, background 0.2s ease;
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
  transition: border 0.2s ease, color 0.2s ease;
  &:hover {
    border-color: ${Pista8Theme.primary};
    color: ${Pista8Theme.primary};
  }
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
  transition: transform 0.2s ease, opacity 0.2s ease;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
`;

export const ButtonHint = styled.p`
  text-align: right;
  font-size: 12px;
  color: rgba(72,80,84,0.55);
  margin: -8px 0 0;
`;

export const ToastViewport = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 140;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 640px) {
    left: 16px;
    right: 16px;
  }
`;

export const ToastCard = styled.div<{ $tone: string }>`
  min-width: min(340px, calc(100vw - 32px));
  padding: 16px 18px;
  border-radius: 18px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  ${({ $tone }) => css`
    border: 1px solid ${FEEDBACK_PALETTE[$tone as any].border};
    background: ${FEEDBACK_PALETTE[$tone as any].background};
    color: ${FEEDBACK_PALETTE[$tone as any].color};
  `}
`;

export const ToastGlyph = styled(BannerGlyph)`
  width: 28px;
  height: 28px;
`;

export const ToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }
`;

export const ToastTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
`;

export const ToastDismiss = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 10px;
  transition: background 0.15s ease;
  &:hover {
    background: rgba(255,255,255,0.16);
  }
`;

export const ConfirmBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(7,10,13,0.65);
  backdrop-filter: blur(3px);
  z-index: 120;
`;

export const ConfirmDialog = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 130;
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

export const ConfirmGhost = styled(GhostButton)`
  flex: 1;
  width: 100%;
`;

export const ConfirmCTA = styled(CTAButton)`
  flex: 1;
  width: 100%;
  text-align: center;
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
