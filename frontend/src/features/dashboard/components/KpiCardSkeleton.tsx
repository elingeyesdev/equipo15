import * as S from './KpiCard.styles';
import * as SS from './KpiCardSkeleton.styles';

export function KpiCardSkeleton() {
  return (
    <S.Card>
      <S.Header>
        <SS.CirclePulse />
        <SS.BarPulse $width="90px" />
      </S.Header>
      <SS.BarPulse $width="70px" $height="32px" />
      <SS.BarPulse $width="140px" $height="14px" />
    </S.Card>
  );
}
