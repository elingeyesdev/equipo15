import React from 'react';
import * as S from '../styles/ChallengeStyles';
import ChallengeCard from './ChallengeCard';
import ChallengeCardSkeleton from './ChallengeCardSkeleton';
import { getFacultySlug } from '../../../config/faculties';
import type { Challenge } from '../../../types/models';

interface ChallengeListProps {
  loading?: boolean;
  challenges: Challenge[];
  activeFilter: string;
  onFilterChange: (f: string) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  selectedChallengeId: string | number;
  onSelectChallenge: (c: Challenge) => void;
  onRespond: (c: Challenge) => void;
  onClearSelection?: () => void;
  searchQuery?: string;
  userFacultyId?: number | null;
  forceColumn?: boolean;
}

const ChallengeList: React.FC<ChallengeListProps> = ({
  loading, challenges, activeFilter, onFilterChange, filterOpen, setFilterOpen,
  selectedChallengeId, onSelectChallenge, onRespond, onClearSelection, searchQuery = '', userFacultyId,
  forceColumn = false,
}) => {
  const userSlug = getFacultySlug(userFacultyId || null);
  const filters = ['Todos'];
  if (userFacultyId && userSlug && userSlug !== 'Todas' && userSlug !== 'General') {
    filters.push(userSlug);
  }

  const filtered = challenges
    .filter(c => c.status === 'Activo' && (!c.endDate || new Date(c.endDate) >= new Date()))
    .filter(c => activeFilter === 'Todos' || c.category === activeFilter)
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        (c as any).problemDescription?.toLowerCase().includes(q) ||
        (c as any).companyContext?.toLowerCase().includes(q)
      );
    });

  return (
    <S.LeftPanel>
      <S.PanelHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <S.PanelTitle>Retos activos</S.PanelTitle>
          {selectedChallengeId && onClearSelection && (
            <button
              onClick={(e) => { e.stopPropagation(); onClearSelection(); }}
              style={{
                background: '#f1f3f5',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#495057',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e9ecef'; e.currentTarget.style.color = '#FE410A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f3f5'; e.currentTarget.style.color = '#495057'; }}
            >
              LIMPIAR
            </button>
          )}
        </div>
        <S.FilterWrap>
          <S.FilterBtn onClick={() => setFilterOpen(!filterOpen)} active={filterOpen}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" />
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" />
              <line x1="11" y1="18" x2="13" y2="18" stroke="currentColor" />
            </svg>
          </S.FilterBtn>
          {filterOpen && (
            <S.FilterDropdown>
              {filters.map(f => (
                <S.FilterOption
                  key={f}
                  active={activeFilter === f}
                  onClick={() => { onFilterChange(f); setFilterOpen(false); }}
                >
                  {f}
                </S.FilterOption>
              ))}
            </S.FilterDropdown>
          )}
        </S.FilterWrap>
      </S.PanelHeader>

      <S.ChallengeList $isFullWidth={!selectedChallengeId} $forceColumn={forceColumn}>
        {loading ? (
          <>
            <ChallengeCardSkeleton />
            <ChallengeCardSkeleton />
            <ChallengeCardSkeleton />
          </>
        ) : filtered.length > 0 ? (
          filtered.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                active={selectedChallengeId === c.id}
                onSelect={() => onSelectChallenge(c)}
                onRespond={(e) => { e.stopPropagation(); onRespond(c); }}
              />
            ))
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '16px',
            border: '1px dashed #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '56px', height: '56px',
              borderRadius: '18px',
              background: 'rgba(254, 65, 10, 0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px'
            }}>🏁</div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#1a1f22' }}>
              {searchQuery.trim() ? `Sin resultados para "${searchQuery}"` : '¡La pista se está preparando!'}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.6, maxWidth: '260px' }}>
              {searchQuery.trim()
                ? 'Intenta con otras palabras clave.'
                : 'Actualmente no hay retos abiertos, pero las empresas están diseñando nuevos desafíos para ti. ¡Vuelve pronto para demostrar tu talento!'}
            </p>
          </div>
        )}
      </S.ChallengeList>
    </S.LeftPanel>
  );
};

export default ChallengeList;
