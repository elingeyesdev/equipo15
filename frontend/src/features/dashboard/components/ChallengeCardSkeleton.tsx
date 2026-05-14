import React from 'react';
import * as S from '../styles/SkeletonStyles';

const ChallengeCardSkeleton: React.FC = () => {
  return (
    <S.CardSkeleton>
      <S.SkeletonTag />
      <S.SkeletonTitle />
      <S.SkeletonMeta />
      <S.SkeletonButton />
    </S.CardSkeleton>
  );
};

export default ChallengeCardSkeleton;
