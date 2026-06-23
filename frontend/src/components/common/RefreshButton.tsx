import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { premiumTooltip } from '../../features/dashboard/styles/CommonStyles';

// ─── Animación de spin ────────────────────────────────────────────────────────
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Botón base ───────────────────────────────────────────────────────────────
const Btn = styled.button<{
  $size: number;
  $spinning: boolean;
  $tooltipText?: string;
  $tooltipPosition?: 'top' | 'bottom';
  $tooltipAlign?: 'center' | 'right';
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 8px;
  border: 1.5px solid rgba(72, 80, 84, 0.12);
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;

  svg {
    animation: ${p => p.$spinning ? css`${spin} 0.7s linear infinite` : 'none'};
    transition: color 0.18s;
  }

  &:hover {
    border-color: rgba(72, 80, 84, 0.25);
    background: #f8fafc;
    color: #374151;
  }

  &:active {
    transform: scale(0.93);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }

  ${premiumTooltip}
`;

// ─── SVG icono de refresh ─────────────────────────────────────────────────────
const RefreshIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface RefreshButtonProps {
  onClick: () => void | Promise<void>;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltipPosition?: 'top' | 'bottom';
  tooltipAlign?: 'center' | 'right';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const SIZE_MAP = { sm: 30, md: 36, lg: 42 };
const ICON_MAP = { sm: 13, md: 15, lg: 18 };

// ─── Componente ───────────────────────────────────────────────────────────────
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  tooltip = 'Recargar',
  size = 'md',
  tooltipPosition = 'bottom',
  tooltipAlign = 'center',
  disabled = false,
  className,
  style,
  'aria-label': ariaLabel,
}) => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    if (spinning || disabled) return;
    setSpinning(true);
    try {
      await onClick();
    } finally {
      // Girar al menos 600ms para que se vea la animación
      setTimeout(() => setSpinning(false), 600);
    }
  };

  return (
    <Btn
      type="button"
      onClick={handleClick}
      disabled={disabled || spinning}
      $size={SIZE_MAP[size]}
      $spinning={spinning}
      $tooltipPosition={tooltipPosition}
      $tooltipAlign={tooltipAlign}
      $tooltipText={tooltip}
      aria-label={ariaLabel ?? tooltip}
      className={className}
      style={style}
    >
      <RefreshIcon size={ICON_MAP[size]} />
    </Btn>
  );
};

export default RefreshButton;
