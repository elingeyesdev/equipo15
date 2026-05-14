import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';

const expandIn = keyframes`
  from { width: 44px; opacity: 0.8; }
  to   { width: 100%; opacity: 1; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(254, 65, 10, 0); }
  50%      { box-shadow: 0 0 0 6px rgba(254, 65, 10, 0.07); }
`;

const Wrapper = styled.div<{ $expanded: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: ${p => (p.$expanded ? '320px' : '44px')};
  height: 44px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 640px) {
    width: ${p => (p.$expanded ? '220px' : '44px')};
  }
`;

const Pill = styled.div<{ $expanded: boolean; $hasValue: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: ${p => (p.$expanded ? '#ffffff' : 'white')};
  border: 1.5px solid ${p =>
    p.$expanded
      ? p.$hasValue
        ? Pista8Theme.primary
        : '#d1d5db'
      : 'rgba(72,80,84,0.1)'};
  box-shadow: ${p =>
    p.$expanded
      ? '0 4px 24px rgba(72, 80, 84, 0.10), 0 1px 4px rgba(0,0,0,0.04)'
      : 'none'};
  transition: border-color 0.25s, box-shadow 0.3s, background 0.25s;

  ${p =>
    p.$expanded &&
    css`
      animation: ${expandIn} 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    `}

  ${p =>
    p.$expanded &&
    p.$hasValue &&
    css`
      animation: ${pulseGlow} 2s ease-in-out infinite;
    `}
`;

const IconBtn = styled.button<{ $expanded: boolean }>`
  position: relative;
  z-index: 2;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${p => (p.$expanded ? Pista8Theme.primary : Pista8Theme.secondary)};
  transition: color 0.2s, transform 0.15s;

  &:hover {
    color: ${Pista8Theme.primary};
    transform: scale(1.08);
  }
  &:active {
    transform: scale(0.94);
  }
`;

const Input = styled.input<{ $visible: boolean }>`
  position: relative;
  z-index: 2;
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 13.5px;
  font-weight: 500;
  color: #1a1f22;
  outline: none;
  padding-right: 36px;
  opacity: ${p => (p.$visible ? 1 : 0)};
  pointer-events: ${p => (p.$visible ? 'auto' : 'none')};
  transition: opacity 0.2s 0.1s;

  &::placeholder {
    color: #a8b0b8;
    font-weight: 400;
  }
`;

const ClearBtn = styled.button<{ $visible: boolean }>`
  position: absolute;
  right: 10px;
  z-index: 3;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: ${Pista8Theme.primary}12;
  color: ${Pista8Theme.primary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${p => (p.$visible ? 1 : 0)};
  transform: ${p => (p.$visible ? 'scale(1)' : 'scale(0.5)')};
  pointer-events: ${p => (p.$visible ? 'auto' : 'none')};
  transition: opacity 0.15s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.15s;

  &:hover {
    background: ${Pista8Theme.primary}22;
  }
`;

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

interface OmniSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const OmniSearchBar: React.FC<OmniSearchBarProps> = ({ value, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (!expanded) {
      setExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 180);
    } else if (!value) {
      setExpanded(false);
    }
  }, [expanded, value]);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        !value
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) {
        if (value) {
          onChange('');
        } else {
          setExpanded(false);
          inputRef.current?.blur();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expanded, value, onChange]);

  return (
    <Wrapper ref={wrapperRef} $expanded={expanded}>
      <Pill $expanded={expanded} $hasValue={!!value} />

      <IconBtn $expanded={expanded} onClick={handleToggle} aria-label="Buscar">
        <SearchIcon />
      </IconBtn>

      <Input
        ref={inputRef}
        $visible={expanded}
        type="text"
        placeholder="Buscar ideas o retos..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />

      <ClearBtn $visible={expanded && !!value} onClick={handleClear} aria-label="Limpiar búsqueda">
        ×
      </ClearBtn>
    </Wrapper>
  );
};

export default OmniSearchBar;
