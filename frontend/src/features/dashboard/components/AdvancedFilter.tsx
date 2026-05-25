import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { interactiveHover, premiumTooltip } from '../styles/CommonStyles';
import { FACULTIES } from '../../../config/faculties';
import { useActiveFaculties } from '../../../hooks/useActiveFaculties';
import type { SortMode } from '../../../features/sky-wall/types';

export type TopLimit = 5 | 10 | 20 | null;

export interface AdvancedFilterState {
  sortOrder: SortMode | null;
  topLimit: TopLimit;
  facultyId: string | number | null;
  onlyFavorites: boolean;
  onlyMyIdeas: boolean;
}

interface AdvancedFilterProps {
  value: AdvancedFilterState;
  onChange: (next: AdvancedFilterState) => void;
  disabled?: boolean;
  onlySort?: boolean;
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
  border: 1.5px solid ${p => p.$active ? Pista8Theme.primary : 'rgba(72,80,84,0.18)'};
  background: ${p => p.$active ? `${Pista8Theme.primary}10` : 'white'};
  color: ${p => p.$active ? Pista8Theme.primary : '#485054'};
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;

  ${interactiveHover}
  ${premiumTooltip}
`;

const ActiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${Pista8Theme.primary};
  display: inline-block;
  margin-left: 2px;
`;

/* ─── Dropdown panel ─── */
const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
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

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: 'Más recientes',  value: 'newest'   },
  { label: 'Más antiguas',   value: 'oldest'   },
  { label: 'Más likes',      value: 'likes'    },
  { label: 'Más comentadas', value: 'comments' },
];

const TOP_OPTIONS: { label: string; value: TopLimit }[] = [
  { label: 'Top 5',   value: 5   },
  { label: 'Top 10',  value: 10  },
  { label: 'Top 20',  value: 20  },
  { label: 'Todos',   value: null },
];

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ value, onChange, disabled, onlySort = false }) => {
  const { faculties: apiFaculties } = useActiveFaculties();
  const facultyOptions = apiFaculties.length > 0
    ? apiFaculties.filter((f) => f.name.toLowerCase() !== 'todas')
    : FACULTIES.map((f) => ({ id: f.id, name: f.slug }));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = onlySort
    ? !!value.sortOrder
    : !!(value.sortOrder || value.topLimit || value.facultyId || value.onlyFavorites || value.onlyMyIdeas);

  const update = (patch: Partial<AdvancedFilterState>) => onChange({ ...value, ...patch });

  const reset = () => {
    if (onlySort) {
      onChange({ ...value, sortOrder: 'newest' });
    } else {
      onChange({ sortOrder: 'newest', topLimit: null, facultyId: null, onlyFavorites: false, onlyMyIdeas: false });
    }
  };

  const summaryParts: string[] = [];
  if (value.sortOrder) {
    const found = SORT_OPTIONS.find(o => o.value === value.sortOrder);
    if (found) summaryParts.push(found.label);
  }
  if (!onlySort) {
    if (value.topLimit) summaryParts.push(`Top ${value.topLimit}`);
    if (value.onlyFavorites) summaryParts.push('Favoritos');
    if (value.onlyMyIdeas) summaryParts.push('Mis Ideas');
    if (value.facultyId) {
      const fac = facultyOptions.find((f) => String(f.id) === String(value.facultyId));
      if (fac) summaryParts.push('name' in fac && typeof fac.name === 'string' ? fac.name : String(fac.id));
    }
  }

  return (
    <Wrapper ref={ref}>
      <TriggerBtn
        $active={isActive}
        $tooltipText="Filtros avanzados"
        onClick={() => !disabled && setOpen(o => !o)}
        type="button"
        disabled={disabled}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        {summaryParts.length > 0 ? summaryParts.join(' · ') : 'Filtros'}
        {isActive && <ActiveDot />}
      </TriggerBtn>

      {open && (
        <Dropdown>
          {/* Sort order */}
          <Section>
            <SectionLabel>Métrica de ordenamiento</SectionLabel>
            <ChipRow>
              {SORT_OPTIONS.map(o => (
                <Chip
                  key={o.value}
                  $active={value.sortOrder === o.value}
                  onClick={() => update({ sortOrder: value.sortOrder === o.value ? null : o.value })}
                  type="button"
                >
                  {o.label}
                </Chip>
              ))}
            </ChipRow>
          </Section>

          {!onlySort && (
            <>
              <Divider />
              {/* Top X */}
              <Section>
                <SectionLabel>Cantidad a mostrar</SectionLabel>
                <ChipRow>
                  {TOP_OPTIONS.map(o => (
                    <Chip
                      key={String(o.value)}
                      $active={value.topLimit === o.value}
                      onClick={() => update({ topLimit: value.topLimit === o.value ? null : o.value })}
                      type="button"
                    >
                      {o.label}
                    </Chip>
                  ))}
                </ChipRow>
              </Section>

              <Divider />
              {/* Faculty */}
              <Section>
                <SectionLabel>Filtrar por Facultad</SectionLabel>
                <ChipRow>
                  <Chip
                    $active={value.facultyId === null}
                    onClick={() => update({ facultyId: null })}
                    type="button"
                  >
                    Todas
                  </Chip>
                  {facultyOptions.map((f) => (
                    <Chip
                      key={f.id}
                      $active={String(value.facultyId) === String(f.id)}
                      onClick={() =>
                        update({
                          facultyId: String(value.facultyId) === String(f.id) ? null : f.id,
                        })
                      }
                      type="button"
                    >
                      {f.name}
                    </Chip>
                  ))}
                </ChipRow>
              </Section>

              <Divider />
              {/* Content */}
              <Section>
                <SectionLabel>Contenido</SectionLabel>
                <ChipRow>
                  <Chip
                    $active={value.onlyFavorites}
                    onClick={() => update({ onlyFavorites: !value.onlyFavorites })}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={value.onlyFavorites ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    Solo Favoritos
                  </Chip>
                  <Chip
                    $active={value.onlyMyIdeas}
                    onClick={() => update({ onlyMyIdeas: !value.onlyMyIdeas })}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    Mis Ideas
                  </Chip>
                  <Chip
                    $active={false}
                    onClick={() => {}}
                    type="button"
                    disabled
                    style={{ opacity: 0.4, cursor: 'not-allowed' }}
                    title="Disponible cuando los evaluadores envíen los puntajes finales"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
                      <path d="M4 22h16" />
                      <path d="M10 22V10" />
                      <path d="M14 22V10" />
                      <path d="M8 6a6 6 0 0 1 8 0" />
                      <path d="M6 10a8 8 0 0 0 12 0" />
                    </svg>
                    Podio
                  </Chip>
                </ChipRow>
              </Section>
            </>
          )}

          <ResetBtn type="button" onClick={reset}>Limpiar filtros</ResetBtn>
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default AdvancedFilter;
