import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px;
  margin: 0 0 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff7ed 0%, #fff1e6 100%);
  border: 1px solid rgba(254, 65, 10, 0.12);
  animation: ${slideDown} 0.3s ease both;
`;

const Text = styled.span`
  font-size: 12.5px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  line-height: 1.4;

  strong {
    color: ${Pista8Theme.primary};
    font-weight: 700;
  }
`;

const ClearAllBtn = styled.button`
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 8px;
  border: 1.5px solid ${Pista8Theme.primary}30;
  background: white;
  color: ${Pista8Theme.primary};
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;

  &:hover {
    background: ${Pista8Theme.primary}08;
    border-color: ${Pista8Theme.primary};
  }
  &:active {
    transform: scale(0.96);
  }
`;

interface SearchContextBannerProps {
  searchQuery: string;
  challengeId?: string;
  challengeTitle?: string;
  onClearSearch: () => void;
  onClearChallenge: () => void;
}

const SearchContextBanner: React.FC<SearchContextBannerProps> = ({
  searchQuery,
  challengeId,
  challengeTitle,
  onClearSearch,
  onClearChallenge,
}) => {
  const hasSearch = !!(searchQuery && searchQuery.trim());
  const hasChallenge = !!challengeId && !!challengeTitle;

  if (!hasSearch && !hasChallenge) return null;

  return (
    <Banner>
      <Text>
        {hasSearch && (
          <>
            Resultados para <strong>"{searchQuery}"</strong>
            {hasChallenge && ' dentro de '}
          </>
        )}
        {hasChallenge && (
          <>
            Reto: <strong>{challengeTitle}</strong>
          </>
        )}
      </Text>
      <div style={{ display: 'flex', gap: '8px' }}>
        {hasSearch && <ClearAllBtn onClick={onClearSearch}>Limpiar búsqueda</ClearAllBtn>}
        {hasChallenge && <ClearAllBtn onClick={onClearChallenge}>Ver todos los retos</ClearAllBtn>}
      </div>
    </Banner>
  );
};

export default SearchContextBanner;
