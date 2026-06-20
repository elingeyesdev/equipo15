import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { NAVIGATION_CONFIG } from '../layout/navigation.config';
import { Pista8Theme } from '../../../config/theme';
import { User, LogOut } from 'lucide-react';
import { auth } from '../../../config/firebase';

const BAR_HEIGHT = 56;
const CIRCLE_SIZE = 56;
const DIP_HALF_WIDTH = 58;
const DIP_DEPTH = 36;
const CORNER_RADIUS = 24;
const TOP_PADDING = 28;
const SVG_HEIGHT = BAR_HEIGHT + TOP_PADDING;
const TRANSITION = 'left 0.32s cubic-bezier(0.22, 1, 0.36, 1)';

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${SVG_HEIGHT}px;
  z-index: 9000;

  @media (min-width: 1025px) {
    display: none;
  }
`;

const NavShape = styled.svg`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const ShapePath = styled.path`
  fill: white;
  transition: d 0.32s cubic-bezier(0.22, 1, 0.36, 1);
`;

const NavItems = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${BAR_HEIGHT}px;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const NavCell = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  height: ${BAR_HEIGHT}px;
  position: relative;

  svg {
    width: 22px;
    height: 22px;
    color: #9ca3af;
    opacity: ${p => (p.$isActive ? 0 : 1)};
    transition: opacity 0.25s ease;
  }

  span {
    font-size: 10px;
    font-weight: 700;
    color: ${p => (p.$isActive ? Pista8Theme.primary : '#9ca3af')};
    opacity: ${p => (p.$isActive ? 0 : 1)};
    transition: color 0.25s ease, opacity 0.25s ease;
  }
`;

const FloatingCircle = styled.div<{ $left: number }>`
  position: absolute;
  top: 0px;
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
  left: ${p => p.$left}px;
  border-radius: 50%;
  background: ${Pista8Theme.primary};
  box-shadow: 0 8px 16px rgba(254, 65, 10, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${TRANSITION};
  pointer-events: none;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

function bumpPathD(width: number, centerX: number) {
  const topY = TOP_PADDING;
  const x0 = centerX - DIP_HALF_WIDTH;
  const x1 = centerX + DIP_HALF_WIDTH;

  return `
    M0,${topY + CORNER_RADIUS}
    Q0,${topY} ${CORNER_RADIUS},${topY}
    L${x0},${topY}
    C${x0 + DIP_HALF_WIDTH * 0.55},${topY} ${centerX - DIP_HALF_WIDTH * 0.55},${topY + DIP_DEPTH} ${centerX},${topY + DIP_DEPTH}
    C${centerX + DIP_HALF_WIDTH * 0.55},${topY + DIP_DEPTH} ${x1 - DIP_HALF_WIDTH * 0.55},${topY} ${x1},${topY}
    L${width - CORNER_RADIUS},${topY}
    Q${width},${topY} ${width},${topY + CORNER_RADIUS}
    L${width},${SVG_HEIGHT}
    L0,${SVG_HEIGHT}
    Z
  `;
}

export const BottomNavbar: React.FC = () => {
  const { userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const wrapperRef = useRef<HTMLElement>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [barWidth, setBarWidth] = useState(0);
  const [activeCenter, setActiveCenter] = useState(0);

  if (!userProfile) return null;

  const userRole = (userProfile.roleInfo?.name || userProfile.role || '').toUpperCase();

  const navItems = NAVIGATION_CONFIG.filter((item) =>
    item.roles.includes(userRole)
  );

  const allItems = [
    ...navItems.map((item) => ({
      key: item.path,
      Icon: item.icon,
      label: item.shortName || item.name,
      isActive:
        location.pathname === item.path ||
        (item.path !== '/dashboard' && location.pathname.startsWith(item.path)),
      onClick: () => navigate(item.path),
    })),
    {
      key: '/dashboard/perfil',
      Icon: User,
      label: 'Perfil',
      isActive: location.pathname === '/dashboard/perfil',
      onClick: () => navigate('/dashboard/perfil'),
    },
    {
      key: 'logout',
      Icon: LogOut,
      label: 'Salir',
      isActive: false,
      onClick: () => void auth.signOut(),
    },
  ];

  const activeIndex = allItems.findIndex((item) => item.isActive);
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  const measure = () => {
    const wrapper = wrapperRef.current;
    const activeCell = cellRefs.current[safeActiveIndex];
    if (!wrapper || !activeCell) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const cellRect = activeCell.getBoundingClientRect();

    setBarWidth(wrapperRect.width);
    setActiveCenter(cellRect.left - wrapperRect.left + cellRect.width / 2);
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeActiveIndex, allItems.length]);

  useEffect(() => {
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeActiveIndex]);

  const ActiveIcon = allItems[safeActiveIndex]?.Icon ?? User;

  return (
    <NavWrapper ref={wrapperRef}>
      <NavShape viewBox={`0 0 ${barWidth} ${SVG_HEIGHT}`} preserveAspectRatio="none">
        <ShapePath d={barWidth ? bumpPathD(barWidth, activeCenter) : ''} />
      </NavShape>

      <NavItems>
        {allItems.map((item, i) => {
          const { Icon } = item;
          return (
            <NavCell
              key={item.key}
              ref={(el) => { cellRefs.current[i] = el; }}
              $isActive={item.isActive}
              onClick={item.onClick}
            >
              <Icon />
              <span>{item.label}</span>
            </NavCell>
          );
        })}
      </NavItems>

      <FloatingCircle $left={activeCenter - CIRCLE_SIZE / 2}>
        <ActiveIcon />
      </FloatingCircle>
    </NavWrapper>
  );
};

export default BottomNavbar;