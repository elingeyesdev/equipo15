import styled from 'styled-components';
import { Pista8Theme, breakpoints } from '../../../config/theme';

export const Overlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(72, 80, 84, 0.4);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: ${p => p.open ? 1 : 0};
  pointer-events: ${p => p.open ? 'all' : 'none'};
  transition: opacity 0.3s ease;

  @media (min-width: 1025px) {
    display: none;
  }
`;

export const Sidebar = styled.aside<{ open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  background: ${Pista8Theme.secondary};
  z-index: 10000;
  display: flex;
  flex-direction: column;
  padding: 36px 28px 40px;
  transform: ${p => p.open ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.32s cubic-bezier(.22,.68,0,1.1), visibility 0.32s;
  visibility: ${p => p.open ? 'visible' : 'hidden'};
  pointer-events: ${p => p.open ? 'auto' : 'none'};
  box-shadow: -20px 0 50px rgba(0,0,0,0.2);

  @media (min-width: 1025px) {
    transform: translateX(0);
    visibility: visible;
    pointer-events: auto;
  }

  @media (max-width: ${breakpoints.small}) {
    width: 100%;
    padding: 24px 20px;
  }
`;

export const SidebarTop = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 12px;
  margin-bottom: 52px;
`;

export const SidebarBrand = styled.div`
  display: flex;
  justify-content: center;
`;

export const SidebarClose = styled.button`
  position: absolute;
  top: -4px;
  right: 0;
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

  @media (min-width: 1025px) {
    display: none;
  }
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
  margin: 12px 0;
`;

export const SidebarNavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  text-align: left;
  padding: 18px 20px;
  border-radius: 16px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;

  svg { 
    width: 20px; 
    height: 20px; 
    flex-shrink: 0;
    opacity: 0.7;
    transition: transform 0.2s;
  }

  &:hover { 
    background: rgba(255, 255, 255, 0.07); 
    color: white; 
    svg { transform: translateX(2px); opacity: 1; }
  }

  &.active {
    background: rgba(254, 65, 10, 0.12);
    color: #FE410A;
    svg { opacity: 1; color: #FE410A; }
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 25%;
      height: 50%;
      width: 3px;
      background: #FE410A;
      border-radius: 0 4px 4px 0;
    }
  }
`;

export const ComingSoonBadge = styled.span`
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.3);
  padding: 3px 8px;
  border-radius: 100px;
  margin-left: auto;
  letter-spacing: 0.05em;
  border: 0.5px solid rgba(255, 255, 255, 0.05);
`;

export const SidebarFooter = styled.div`
  padding-top: 28px;
  padding-bottom: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: center;
`;
