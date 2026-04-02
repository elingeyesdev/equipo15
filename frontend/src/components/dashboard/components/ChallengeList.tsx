import React from 'react';
import * as S from '../styles/ChallengeStyles';
import ChallengeCard from './ChallengeCard';
import { FACULTIES } from '../../../config/faculties';

interface ChallengeListProps {
  challenges: any[];
  activeFilter: string;
  onFilterChange: (f: string) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  selectedChallengeId: number;
  onSelectChallenge: (c: any) => void;
  onRespond: (c: any) => void;
}

const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges, activeFilter, onFilterChange, filterOpen, setFilterOpen,
  selectedChallengeId, onSelectChallenge, onRespond
}) => {
  const filters = ['Todos', ...FACULTIES.map(f => f.slug)];

  return (
    <S.LeftPanel>
      <S.PanelHeader>
        <S.PanelTitle>Retos activos</S.PanelTitle>
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
        {challenges
          .filter(c => activeFilter === 'Todos' || c.category === activeFilter)
          .map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              active={selectedChallengeId === c.id}
              onSelect={() => onSelectChallenge(c)}
              onRespond={(e) => { e.stopPropagation(); onRespond(c); }}
            />
          ))}
      </S.ChallengeList>
    </S.LeftPanel>
  );
};

export default ChallengeList;
