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
  userFacultyId?: number | string | null;
  forceColumn?: boolean;
  visibleChallengesLimit?: number;
  podiumCount?: number;
}

const ChallengeList: React.FC<ChallengeListProps> = ({
  loading, challenges, activeFilter, onFilterChange, filterOpen, setFilterOpen,
  selectedChallengeId, onSelectChallenge, onRespond, onClearSelection, searchQuery = '', userFacultyId,
  forceColumn = false,
  visibleChallengesLimit,
  podiumCount = 0,
}) => {
  const userSlug = getFacultySlug(userFacultyId || null);
  const filters = ['Activos', 'En Evaluación', 'Finalizados'];

  // Si no hay filtro válido seleccionado, o es 'Todos', por defecto 'Activos'
  const currentFilter = filters.includes(activeFilter) ? activeFilter : 'Activos';

  const filtered = challenges
    .filter(c => {
      if (currentFilter === 'Activos') {
        return (c.status === 'Activo' || c.status === 'PUBLISHED') && (!c.submissionsCloseAt || new Date(c.submissionsCloseAt) >= new Date()) && (!c.endDate || new Date(c.endDate) >= new Date());
      }
      if (currentFilter === 'En Evaluación') {
        return c.status === 'En Evaluación' || c.status === 'EVALUATING';
      }
      if (currentFilter === 'Finalizados') {
        return c.status === 'Finalizado' || c.status === 'CLOSED' || (c.endDate && new Date(c.endDate) < new Date());
      }
      if (currentFilter === 'Mis Retos') {
        // Asumiendo que Mis Retos significa los de mi facultad si soy estudiante
        return c.category === userSlug;
      }
      return true;
    })
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        (c as any).problemDescription?.toLowerCase().includes(q) ||
        (c as any).companyContext?.toLowerCase().includes(q)
      );
    });

  let title = 'Explorar Retos';
  if (currentFilter === 'Finalizados') title = 'Retos Finalizados';
  else if (currentFilter === 'En Evaluación') title = 'Retos en Evaluación';
  else if (currentFilter === 'Mis Retos') title = 'Mis Retos';

  return (
    <S.LeftPanel $visibleLimit={visibleChallengesLimit}>
      <S.PanelHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <S.PanelTitle>{title}</S.PanelTitle>
          {selectedChallengeId && onClearSelection && (
            <S.ClearBtn
              onClick={(e) => { e.stopPropagation(); onClearSelection(); }}
            >
              LIMPIAR
            </S.ClearBtn>
          )}
        </div>
        <S.FilterWrap>
          <S.FilterBtn 
            $active={filterOpen} 
            onClick={() => setFilterOpen(!filterOpen)}
            $tooltipText="Filtrar reto"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <line x1="0" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="6" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </S.FilterBtn>
          {filterOpen && (
            <S.FilterDropdown>
              {filters.map(f => (
                <S.FilterOption
                  key={f}
                  $active={activeFilter === f}
                  onClick={() => { onFilterChange(f); setFilterOpen(false); }}
                >
                  {f}
                </S.FilterOption>
              ))}
            </S.FilterDropdown>
          )}
        </S.FilterWrap>
      </S.PanelHeader>

      <S.ChallengeList
        $isFullWidth={!selectedChallengeId}
        $forceColumn={forceColumn}
        $flexCards={(forceColumn || !!selectedChallengeId) && filtered.length > 0 && filtered.length <= (visibleChallengesLimit || 3) && visibleChallengesLimit !== 4}
        $cardCount={filtered.length}
        $visibleLimit={visibleChallengesLimit}
        $podiumCount={podiumCount}
      >
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '400px',
            flex: 1,
          }}>
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: 'rgba(254, 65, 10, 0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FE410A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#1a1f22' }}>
              {searchQuery.trim() ? `Sin resultados para "${searchQuery}"` : '¡La pista se está preparando!'}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.6, maxWidth: '280px' }}>
              {searchQuery.trim()
                ? 'Intenta con otras palabras clave.'
                : 'Por el momento no hay retos abiertos, pero las empresas ya están diseñando nuevos desafíos para vos. ¡Volvé pronto para demostrar tu talento!'}
            </p>
          </div>
        )}
      </S.ChallengeList>
    </S.LeftPanel>
  );
};

export default ChallengeList;
