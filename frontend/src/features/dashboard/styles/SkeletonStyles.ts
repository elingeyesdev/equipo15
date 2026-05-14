import styled, { keyframes } from 'styled-components';

export const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

export const BaseSkeleton = styled.div`
  display: inline-block;
  height: 100%;
  width: 100%;
  background: #f6f7f8;
  background-image: linear-gradient(
    to right,
    #f6f7f8 0%,
    #edeef1 20%,
    #f6f7f8 40%,
    #f6f7f8 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 104px;
  animation: ${shimmer} 1.25s linear infinite forwards;
  border-radius: 8px;
`;

export const CardSkeleton = styled.div`
  position: relative;
  padding: 20px 22px;
  border-radius: 18px;
  border: 1.5px solid rgba(72,80,84,0.05);
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 160px;
`;

export const SkeletonTag = styled(BaseSkeleton)`
  width: 80px;
  height: 18px;
  border-radius: 6px;
`;

export const SkeletonTitle = styled(BaseSkeleton)`
  width: 100%;
  height: 22px;
`;

export const SkeletonMeta = styled(BaseSkeleton)`
  width: 60%;
  height: 16px;
`;

export const SkeletonButton = styled(BaseSkeleton)`
  align-self: flex-end;
  width: 120px;
  height: 36px;
  border-radius: 999px;
  margin-top: 10px;
`;
