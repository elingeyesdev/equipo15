import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '@/config/theme';
import { interactiveHover, premiumTooltip } from '../styles/CommonStyles';

export type ChallengeSortMode = 'newest' | 'oldest' | 'interactions' | 'score';
export type ChallengeStatusFilter = 'ALL' | 'Activo' | 'Borrador' | 'En Evaluación' | 'Finalizado';

export interface AdminChallengeFilterState {
  sortOrder: ChallengeSortMode;
  status: ChallengeStatusFilter;
}

interface AdminChallengeFilterProps {
  value: AdminChallengeFilterState;
  onChange: (next: AdminChallengeFilterState) => void;
  disabled?: boolean;
}

/* ─── Animations ─── */
const fadeDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Trigger button ─── */
const TriggerBtn = styled.button<{ $active: boolean; $tooltipText?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 999px;
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
  box-shadow: 0 4px 12px rgba(254, 65, 10, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(254, 65, 10, 0.3);
  }

  ${premiumTooltip}
`;

const ActiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: white;
  display: inline-block;
  margin-left: 2px;
`;

/* ─── Dropdown panel ─── */
const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 200;
  background: white;
  border-radius: 20px;
  border: 1.5px solid rgba(72,80,84,0.1);
  box-shadow: 0 16px 48px rgba(0,0,0,0.14);
  padding: 16px;
  width: max-content;
  max-width: 300px;
  animation: ${fadeDown} 0.2s ease both;
`;

const Section = styled.div`
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const SectionLabel = styled.p`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #a8b0b8;
  margin: 0 0 8px;
  text-align: center;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid ${p => p.$active ? Pista8Theme.primary : 'rgba(72,80,84,0.15)'};
  background: ${p => p.$active ? Pista8Theme.primary : 'white'};
  color: ${p => p.$active ? 'white' : '#485054'};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  ${interactiveHover}
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(72,80,84,0.08);
  margin: 14px 0;
`;

const ResetBtn = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: rgba(72,80,84,0.06);
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.15s;

  &:hover { background: rgba(72,80,84,0.1); }
`;

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SORT_OPTIONS: { label: string; value: ChallengeSortMode }[] = [
  { label: 'Más recientes',  value: 'newest'   },
  { label: 'Más antiguos',   value: 'oldest'   },
  { label: 'Más interacciones', value: 'interactions' },
  { label: 'Mejores calificados', value: 'score' },
];

const STATUS_OPTIONS: { label: string; value: ChallengeStatusFilter }[] = [
  { label: 'Todos',          value: 'ALL' },
  { label: 'Activos',        value: 'Activo' },
  { label: 'Borradores',     value: 'Borrador' },
  { label: 'En Evaluación',  value: 'En Evaluación' },
  { label: 'Finalizados',    value: 'Finalizado' },
];

export const AdminChallengeFilter: React.FC<AdminChallengeFilterProps> = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = value.sortOrder !== 'newest' || value.status !== 'ALL';

  const update = (patch: Partial<AdminChallengeFilterState>) => onChange({ ...value, ...patch });

  const reset = () => onChange({ sortOrder: 'newest', status: 'ALL' });

  const summaryParts: string[] = [];
  if (value.sortOrder && value.sortOrder !== 'newest') {
    const found = SORT_OPTIONS.find(o => o.value === value.sortOrder);
    if (found) summaryParts.push(found.label);
  }
  if (value.status !== 'ALL') {
    const found = STATUS_OPTIONS.find(o => o.value === value.status);
    if (found) summaryParts.push(found.label);
  }

  return (
    <Wrapper ref={ref}>
      <TriggerBtn
        $active={isActive}
        $tooltipText="Filtros y Orden"
        onClick={() => !disabled && setOpen(o => !o)}
        type="button"
        disabled={disabled}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        {summaryParts.length > 0 ? summaryParts.join(' · ') : 'Filtrar'}
        {isActive && <ActiveDot />}
      </TriggerBtn>

      {open && (
        <Dropdown>
          <Section>
            <SectionLabel>Métrica de ordenamiento</SectionLabel>
            <ChipRow>
              {SORT_OPTIONS.map(o => (
                <Chip
                  key={o.value}
                  $active={value.sortOrder === o.value}
                  onClick={() => update({ sortOrder: o.value })}
                  type="button"
                >
                  {o.label}
                </Chip>
              ))}
            </ChipRow>
          </Section>

          <Divider />

          <Section>
            <SectionLabel>Filtrar por Estado</SectionLabel>
            <ChipRow>
              {STATUS_OPTIONS.map(o => (
                <Chip
                  key={o.value}
                  $active={value.status === o.value}
                  onClick={() => update({ status: o.value })}
                  type="button"
                >
                  {o.label}
                </Chip>
              ))}
            </ChipRow>
          </Section>

          {isActive && (
             <ResetBtn type="button" onClick={reset}>Limpiar filtros</ResetBtn>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};
