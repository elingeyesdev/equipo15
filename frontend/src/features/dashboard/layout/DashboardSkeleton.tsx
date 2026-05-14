import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
`;

const SkeletonHeader = styled.div`
  height: 60px;
  width: 100%;
  border-radius: 8px;
  background-color: #e2e8f0;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const SkeletonCard = styled.div`
  height: 150px;
  border-radius: 8px;
  background-color: #e2e8f0;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const SkeletonRow = styled.div`
  height: 40px;
  width: 100%;
  border-radius: 8px;
  background-color: #e2e8f0;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

export const DashboardSkeleton: React.FC = () => {
  return (
    <SkeletonContainer>
      <SkeletonHeader />
      <SkeletonGrid>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </SkeletonGrid>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </SkeletonContainer>
  );
};
