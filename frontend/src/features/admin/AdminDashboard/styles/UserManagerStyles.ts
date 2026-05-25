import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';

/* ─── Animations ─────────────────────────────────────────────────────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(254, 65, 10, 0); }
  50%      { box-shadow: 0 0 0 4px rgba(254, 65, 10, 0.12); }
`;

/* ─── Layout ─────────────────────────────────────────────────────────────── */

export const Container = styled.div`
  animation: ${fadeIn} 0.4s ease both;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
`;

export const Title = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.3px;
`;

export const TotalBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: rgba(72, 80, 84, 0.55);
  margin-left: 10px;
`;

/* ─── Search & Filters ───────────────────────────────────────────────────── */

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

export const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 260px;
`;

export const SearchIcon = styled.div<{ $focused?: boolean }>`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: ${p => p.$focused ? Pista8Theme.primary : 'rgba(72, 80, 84, 0.35)'};
  transition: color 0.2s, transform 0.2s;

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    ${p => p.$focused && 'transform: scale(1.15) rotate(-8deg);'}
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px 0 48px;
  border: 1.5px solid rgba(72, 80, 84, 0.12);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  &::placeholder {
    color: rgba(72, 80, 84, 0.35);
    font-weight: 500;
  }

  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}15, 0 4px 16px rgba(254, 65, 10, 0.06);
    animation: ${pulseGlow} 1.5s ease infinite;
  }
`;

export const FilterSelect = styled.select`
  height: 48px;
  padding: 0 40px 0 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.12);
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  cursor: pointer;
  appearance: none;
  min-width: 160px;
  transition: all 0.2s;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232c3438' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;

  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}15;
  }
`;

/* ─── Table ───────────────────────────────────────────────────────────────── */

export const TableCard = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(72, 80, 84, 0.06);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Thead = styled.thead`
  background: rgba(248, 249, 250, 0.8);
  border-bottom: 1.5px solid rgba(72, 80, 84, 0.06);
`;

export const Th = styled.th`
  padding: 14px 20px;
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(72, 80, 84, 0.5);
`;

export const Tbody = styled.tbody``;

export const Tr = styled.tr`
  border-bottom: 1px solid rgba(72, 80, 84, 0.05);
  transition: all 0.18s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(254, 65, 10, 0.02);
  }
`;

export const Td = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${Pista8Theme.secondary};
  vertical-align: middle;
  text-align: center;
`;

export const UserCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
`;

export const Avatar = styled.div<{ $url?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
  background: ${p => p.$url
    ? `url(${p.$url}) center/cover no-repeat`
    : `linear-gradient(135deg, ${Pista8Theme.primary}30, ${Pista8Theme.secondary}20)`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: ${Pista8Theme.primary};
  border: 1.5px solid rgba(72, 80, 84, 0.06);
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const UserName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
`;

export const UserEmail = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgba(72, 80, 84, 0.5);
`;

/* ─── Role Badge ──────────────────────────────────────────────────────────── */

const roleColors: Record<string, { bg: string; fg: string }> = {
  ADMIN:   { bg: '#FE410A18', fg: '#FE410A' },
  COMPANY: { bg: '#6366f118', fg: '#6366f1' },
  JUDGE:   { bg: '#f59e0b18', fg: '#d97706' },
  USER:    { bg: '#10b98118', fg: '#059669' },
};

export const RoleBadge = styled.span<{ $role: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: ${p => roleColors[p.$role]?.bg || '#e5e7eb20'};
  color: ${p => roleColors[p.$role]?.fg || '#6b7280'};
  transition: all 0.2s;
`;

/* ─── Action Button ───────────────────────────────────────────────────────── */

export const RoleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.12);
  border-radius: 10px;
  background: white;
  color: ${Pista8Theme.secondary};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.5;
    transition: all 0.2s;
  }

  &:hover {
    border-color: ${Pista8Theme.primary};
    color: ${Pista8Theme.primary};
    background: ${Pista8Theme.primary}05;
    box-shadow: 0 2px 12px rgba(254, 65, 10, 0.08);
    svg { opacity: 1; color: ${Pista8Theme.primary}; }
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* ─── Pagination ──────────────────────────────────────────────────────────── */

export const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid rgba(72, 80, 84, 0.06);
  background: rgba(248, 249, 250, 0.5);
`;

export const PageInfo = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(72, 80, 84, 0.5);
`;

export const PageButtons = styled.div`
  display: flex;
  gap: 6px;
`;

export const PageBtn = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid ${p => p.$active ? Pista8Theme.primary : 'rgba(72, 80, 84, 0.1)'};
  background: ${p => p.$active ? Pista8Theme.primary : 'white'};
  color: ${p => p.$active ? 'white' : 'rgba(72, 80, 84, 0.55)'};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;

  &:hover:not(:disabled) {
    border-color: ${Pista8Theme.primary};
    color: ${p => p.$active ? 'white' : Pista8Theme.primary};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

/* ─── Modal ───────────────────────────────────────────────────────────────── */

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Pista8Theme.zIndex.modal};
  animation: ${fadeIn} 0.15s ease both;
`;

export const ModalCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 36px 32px 28px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.2s ease both;
`;

export const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0 0 8px;
`;

export const ModalText = styled.p`
  font-size: 14px;
  color: rgba(72, 80, 84, 0.65);
  line-height: 1.6;
  margin: 0 0 24px;
  font-weight: 500;
`;

export const ModalUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(248, 249, 250, 1);
  border-radius: 14px;
  margin-bottom: 20px;
`;

export const ModalRoleSelect = styled.select`
  width: 100%;
  height: 48px;
  padding: 0 40px 0 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.12);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  cursor: pointer;
  appearance: none;
  margin-bottom: 24px;
  transition: all 0.2s;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232c3438' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;

  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}15;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const ModalCancelBtn = styled.button`
  padding: 0 22px;
  height: 44px;
  border-radius: 12px;
  border: 1.5px solid rgba(72, 80, 84, 0.15);
  background: transparent;
  color: rgba(72, 80, 84, 0.6);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(72, 80, 84, 0.3);
    color: ${Pista8Theme.secondary};
    background: rgba(72, 80, 84, 0.04);
  }
`;

export const ModalConfirmBtn = styled.button`
  padding: 0 22px;
  height: 44px;
  border-radius: 12px;
  border: 1.5px solid ${Pista8Theme.primary};
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: transparent;
    color: ${Pista8Theme.primary};
    box-shadow: 0 4px 16px ${Pista8Theme.primary}25;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ─── Skeleton Loader ─────────────────────────────────────────────────────── */

export const SkeletonRow = styled.tr``;

export const SkeletonCell = styled.td`
  padding: 16px 20px;
`;

export const SkeletonBar = styled.div<{ $width?: string }>`
  height: 14px;
  width: ${p => p.$width || '80%'};
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(72, 80, 84, 0.06) 25%,
    rgba(72, 80, 84, 0.12) 50%,
    rgba(72, 80, 84, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

export const SkeletonCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(72, 80, 84, 0.06) 25%,
    rgba(72, 80, 84, 0.12) 50%,
    rgba(72, 80, 84, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

/* ─── Empty State ─────────────────────────────────────────────────────────── */

export const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  gap: 16px;
`;

export const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: ${Pista8Theme.primary}08;
  border: 1.5px solid ${Pista8Theme.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.primary};

  svg {
    width: 28px;
    height: 28px;
    opacity: 0.5;
  }
`;

export const EmptyText = styled.p`
  font-size: 14px;
  color: rgba(72, 80, 84, 0.45);
  font-weight: 600;
  margin: 0;
  text-align: center;
`;
