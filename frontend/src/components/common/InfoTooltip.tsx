import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../config/theme';

interface InfoTooltipProps {
  text: string;
  size?: number;
  width?: number;
}

const tooltipReveal = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const IconButton = styled.button<{ $size: number }>`
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: transform ${Pista8Theme.transition.normal} ease,
              background ${Pista8Theme.transition.normal} ease;

  &:hover {
    transform: scale(1.12);
    background: ${Pista8Theme.primary}10;
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    transition: transform 0.4s ease-in-out;
  }

  &:hover svg {
    transform: rotate(360deg) scale(1.1);
  }
`;

const TooltipBubble = styled.div<{ $visible: boolean; $width?: number }>`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(${p => p.$visible ? '0' : '6px'});
  width: ${p => p.$width ?? 220}px;
  background: ${Pista8Theme.secondary};
  color: ${Pista8Theme.white};
  text-align: center;
  border-radius: ${Pista8Theme.radius.lg}px;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0;
  opacity: ${p => p.$visible ? 1 : 0};
  visibility: ${p => p.$visible ? 'visible' : 'hidden'};
  animation: ${p => p.$visible ? tooltipReveal : 'none'} 0.25s ease both;
  box-shadow: ${Pista8Theme.shadowLayers.lg};
  z-index: ${Pista8Theme.zIndex.tooltip};
  pointer-events: none;

  text-transform: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: ${Pista8Theme.secondary} transparent transparent transparent;
  }
`;

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, size = 24, width }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Wrapper
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <IconButton $size={size + 8} aria-label="Informacion">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          stroke={Pista8Theme.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </IconButton>
      <TooltipBubble $visible={visible} $width={width}>
        {text}
      </TooltipBubble>
    </Wrapper>
  );
};

export default InfoTooltip;
