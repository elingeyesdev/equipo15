import React from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../../config/theme';

interface ChallengePreviewProps {
  title?: string;
  category?: string;
}

const ChallengeCard = styled.div`
  position: relative;
  padding: 20px 22px;
  border-radius: 18px;
  border: 1.5px solid rgba(72,80,84,0.07);
  background: rgba(248,249,250,0.8);
  overflow: hidden;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
`;

const TopRight = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const BadgeCorner = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 3px 8px;
  border-radius: 6px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
`;

const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${Pista8Theme.primary};
  background: ${Pista8Theme.primary}15;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

const CardTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 8px;
  line-height: 1.45;
`;

const CardMeta = styled.p`
  font-size: 12px;
  color: #b8c0c8;
  margin: 0;
  font-weight: 500;
`;

export const ChallengePreview: React.FC<ChallengePreviewProps> = ({
  title,
  category = 'Categoría'
}) => {
  return (
    <ChallengeCard>
      <TopRight>
        <BadgeCorner>NUEVO</BadgeCorner>
      </TopRight>
      <CardTop>
        <CategoryTag>{category}</CategoryTag>
      </CardTop>
      <CardTitle>{title || 'Título del Reto'}</CardTitle>
      <CardMeta>0 ideas enviadas</CardMeta>
    </ChallengeCard>
  );
};
