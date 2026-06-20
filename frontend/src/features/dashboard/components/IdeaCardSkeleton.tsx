import React from 'react';
import styled from 'styled-components';
import { BaseSkeleton } from '../styles/SkeletonStyles';

const SkeletonWrapper = styled.div`
  padding: 22px 20px 22px 18px;
  border-radius: 18px;
  background: #fafafa;
  border: 1.5px solid rgba(72, 80, 84, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  width: 100%;
  height: 140px;
  box-sizing: border-box;
`;

const TitleSkeleton = styled(BaseSkeleton)`
  width: 80%;
  height: 18px;
  border-radius: 4px;
`;

const AuthorSkeleton = styled(BaseSkeleton)`
  width: 50%;
  height: 14px;
  border-radius: 4px;
`;

const StatsSkeleton = styled(BaseSkeleton)`
  width: 40%;
  height: 16px;
  border-radius: 4px;
  margin-top: 8px;
`;

const IdeaCardSkeleton: React.FC = () => {
  return (
    <SkeletonWrapper>
      <TitleSkeleton />
      <AuthorSkeleton />
      <StatsSkeleton />
    </SkeletonWrapper>
  );
};

export default IdeaCardSkeleton;
