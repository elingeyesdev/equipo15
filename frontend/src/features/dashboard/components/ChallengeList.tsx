import React from 'react';
import * as S from '../styles/ChallengeStyles';
import ChallengeCard from './ChallengeCard';
import ChallengeCardSkeleton from './ChallengeCardSkeleton';
import { Search } from 'lucide-react';
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
  const filters = ['Activos', 'En Evaluación', 'Finalizados', 'Mis Retos'];
  
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
              width: '56px', height: '56px',
              borderRadius: '18px',
              background: 'rgba(254, 65, 10, 0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={28} color="#FE410A" />
            </div>
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
