import type { ReactNode } from 'react';
import * as S from './KpiCard.styles';

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  subtitle: string;
  accentColor?: string;
}

export function KpiCard({ icon, label, value, subtitle, accentColor }: KpiCardProps) {
  return (
    <S.Card>
      <S.Header>
        <S.IconWrapper $accent={accentColor}>
          {icon}
        </S.IconWrapper>
        <S.Label>{label}</S.Label>
      </S.Header>
      <S.Value>{value}</S.Value>
      <S.Subtitle>{subtitle}</S.Subtitle>
    </S.Card>
  );
}
