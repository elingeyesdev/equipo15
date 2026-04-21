import React from 'react';
import * as S from '../styles/ChallengeStyles';
import ChallengeCard from './ChallengeCard';
import ChallengeCardSkeleton from './ChallengeCardSkeleton';
import { FACULTIES, getFacultySlug } from '../../../config/faculties';
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
}

const ChallengeList: React.FC<ChallengeListProps> = ({
  loading, challenges, activeFilter, onFilterChange, filterOpen, setFilterOpen,
  selectedChallengeId, onSelectChallenge, onRespond, onClearSelection, searchQuery = '', userFacultyId
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
        (c as any).problemDescription?.toLowerCase().includes(q)
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

      <S.ChallengeList>
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
            color: '#718096', 
            fontSize: '14px',
            background: 'white',
            borderRadius: '16px',
            border: '1px dashed #cbd5e0'
          }}>
            {searchQuery.trim()
              ? `No se encontraron retos para: "${searchQuery}"`
              : 'No hay retos activos disponibles para tu facultad por ahora.'}
          </div>
        )}
      </S.ChallengeList>
    </S.LeftPanel>
  );
};

export default ChallengeList;
