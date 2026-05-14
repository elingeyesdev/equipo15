import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const Root = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${Pista8Theme.background};
`;

export const Sidebar = styled.aside`
  width: 280px;
  flex-shrink: 0;
  background: ${Pista8Theme.secondary};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 24px 32px;
  position: sticky;
  top: 0;
  height: 100vh;
`;

export const SidebarBrand = styled.div`
  margin-bottom: 48px;
  display: flex;
  justify-content: center;
`;

export const UserProfileBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  text-align: center;
`;

export const RoleTag = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 4px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
`;

export const UserName = styled.p`
  font-size: 16px;
  color: white;
  margin: 0;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const SidebarDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
  width: 100%;
`;

export const NavBtn = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 14px 18px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  background: ${p => p.active ? 'rgba(254,65,10,0.18)' : 'transparent'};
  color: ${p => p.active ? '#FE410A' : 'rgba(255,255,255,0.45)'};
  
  svg { 
    width: 20px; 
    height: 20px; 
    opacity: 0.7;
    transition: transform 0.2s;
  }

  &:hover { 
    background: rgba(255, 255, 255, 0.07); 
    color: white; 
    svg { transform: translateX(2px); opacity: 1; }
  }

  &.active {
    background: rgba(254, 65, 10, 0.18);
    color: #FE410A;
    svg { opacity: 1; color: #FE410A; }
  }
`;

export const SidebarFooter = styled.div`
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 24px;
  display: flex;
  justify-content: center;
`;

export const Main = styled.main`
  flex: 1;
  padding: 2.5rem 3%;
  max-width: 960px;
  margin: 0 auto;
`;

export const PageHeader = styled.header`
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.4s ease both;
`;

export const PageTitle = styled.h1`
  font-size: 38px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;
`;

export const Canvas = styled.section`
  animation: ${fadeUp} 0.4s 0.06s ease both;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  background: white;
  border-radius: 24px;
  border: 1.5px dashed rgba(72,80,84,0.15);
  gap: 20px;
`;

export const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: ${Pista8Theme.primary}10;
  border: 1.5px solid ${Pista8Theme.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyLabel = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  font-weight: 500;
  margin: 0;
  text-align: center;
`;

export const PrimaryBtn = styled.button`
  padding: 0 24px;
  height: 48px;
  background: ${Pista8Theme.primary};
  color: white;
  border: 1.5px solid ${Pista8Theme.primary};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: transparent; color: ${Pista8Theme.primary}; box-shadow: 0 4px 12px ${Pista8Theme.primary}20; }
  &:disabled { background: rgba(72,80,84,0.1); border-color: transparent; color: #b8c0c8; cursor: default; }
`;

export const Builder = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(72,80,84,0.08);
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(72,80,84,0.07);
`;

export const BuilderNav = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(72,80,84,0.08);
  padding: 0 24px;
`;

export const TabBtn = styled.button<{ active?: boolean }>`
  padding: 18px 0;
  margin-right: 32px;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  color: ${p => p.active ? Pista8Theme.primary : '#a8b0b8'};
  border-bottom: 2px solid ${p => p.active ? Pista8Theme.primary : 'transparent'};
  transition: all 0.18s;
  &:hover { color: ${Pista8Theme.secondary}; }
`;

export const BuilderBody = styled.div`
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  width: 100%;
  max-width: 750px;
`;

export const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${Pista8Theme.secondary};
  opacity: 0.8;
  margin-bottom: 4px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(72,80,84,0.12);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  transition: all 0.2s;
  height: 48px;
  box-sizing: border-box;
  &:focus { border-color: ${Pista8Theme.primary}; box-shadow: 0 0 0 3px ${Pista8Theme.primary}15; }
  &[readonly] { background: rgba(72,80,84,0.04); color: #a8b0b8; cursor: default; }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(72,80,84,0.12);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  transition: all 0.2s;
  height: 48px;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232c3438' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  &:focus { border-color: ${Pista8Theme.primary}; box-shadow: 0 0 0 3px ${Pista8Theme.primary}15; }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(72,80,84,0.12);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  resize: vertical;
  line-height: 1.6;
  transition: all 0.2s;
  box-sizing: border-box;
  &:focus { border-color: ${Pista8Theme.primary}; box-shadow: 0 0 0 3px ${Pista8Theme.primary}15; }
`;

export const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 750px;
  align-items: flex-start;
`;

export const TwoColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 8px;
  width: 100%;
  max-width: 750px;
`;

export const PrivacyToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 14px;
  border: 1.5px solid rgba(72,80,84,0.12);
  margin-bottom: 24px;
  width: 100%;
  max-width: 750px;
  transition: all 0.2s;
  &:hover { border-color: ${Pista8Theme.primary}40; background: ${Pista8Theme.primary}05; }
`;

export const ShareLinkSection = styled.div`
  background: rgba(248,249,250,1);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(72,80,84,0.1);
  margin-bottom: 24px;
  width: 100%;
  max-width: 750px;
  animation: ${fadeUp} 0.3s ease both;
`;

export const CopyBtn = styled.button`
  padding: 0 16px;
  height: 48px;
  border-radius: 12px;
  background: white;
  border: 1.5px solid rgba(72,80,84,0.15);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; background: ${Pista8Theme.primary}05; }
`;

export const FormActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid rgba(72,80,84,0.07);
  width: 100%;
  max-width: 750px;
`;

export const GhostBtn = styled.button`
  padding: 0 24px;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid rgba(72,80,84,0.2);
  background: transparent;
  color: #a8b0b8;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { border-color: rgba(72,80,84,0.4); color: ${Pista8Theme.secondary}; background: rgba(72,80,84,0.04); }
`;

export const DraftBtn = styled.button`
  padding: 0 24px;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid ${Pista8Theme.secondary};
  background: transparent;
  color: ${Pista8Theme.secondary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: ${Pista8Theme.secondary}; color: white; }
  &:disabled { opacity: 0.35; cursor: default; }
`;

export const PreviewCard = styled.div`
  border-radius: 20px;
  overflow: hidden;
  border: 1.5px solid rgba(72,80,84,0.1);
  animation: ${fadeUp} 0.3s ease both;
  width: 100%;
  max-width: 750px;
`;

export const PreviewHead = styled.div`
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  padding: 48px 32px;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

export const PreviewGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

export const PreviewRoleTag = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 10px;
  position: relative;
`;

export const PreviewTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
  position: relative;
`;

export const PreviewBody = styled.div`
  padding: 28px 32px;
  background: rgba(248,249,250,0.6);
`;

export const PreviewDescription = styled.p`
  font-size: 14px;
  color: ${Pista8Theme.secondary};
  line-height: 1.7;
  margin: 0 0 20px;
  font-weight: 500;
`;

export const PreviewFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(72,80,84,0.08);
`;

export const PreviewBadge = styled.span<{ type: 'privacy' | 'date' }>`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${p => p.type === 'privacy' ? Pista8Theme.secondary + '10' : Pista8Theme.primary + '10'};
  color: ${p => p.type === 'privacy' ? Pista8Theme.secondary : Pista8Theme.primary};
`;

export const ErrorText = styled.span`
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
`;
