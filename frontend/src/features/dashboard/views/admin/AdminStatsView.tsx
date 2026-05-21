import { useGlobalAnalytics } from '../../hooks/useGlobalAnalytics';
import { KpiCard } from '../../components/KpiCard';
import { KpiCardSkeleton } from '../../components/KpiCardSkeleton';
import { BuildingIcon } from '../../components/shared/icons/BuildingIcon';
import { RocketIcon } from '../../components/shared/icons/RocketIcon';
import { LightbulbIcon } from '../../components/shared/icons/LightbulbIcon';
import { ChallengeListTable } from '../../components/ChallengeListTable';
import * as S from './AdminStatsView.styles';

export function AdminStatsView() {
  const { data, loading, error, refetch } = useGlobalAnalytics();

  if (error) {
    return (
      <S.ErrorBanner role="alert">
        <span>No se pudieron cargar las analiticas. Intenta recargar la pagina.</span>
        <S.RetryButton onClick={refetch}>Reintentar</S.RetryButton>
      </S.ErrorBanner>
    );
  }

  const closedChallenges = (data?.totalChallenges.all ?? 0) - (data?.totalChallenges.active ?? 0);

  return (
    <S.Wrapper>
      <S.Title>Resumen Global</S.Title>

      <S.Grid>
        {loading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              icon={<BuildingIcon color="#485054" size={22} />}
              label="Total de Empresas"
              value={data?.totalCompanies ?? 0}
              subtitle="Compañias registradas en la plataforma"
              accentColor="#485054"
            />
            <KpiCard
              icon={<RocketIcon color="#FE410A" size={22} />}
              label="Retos Lanzados"
              value={data?.totalChallenges.all ?? 0}
              subtitle={`${data?.totalChallenges.active ?? 0} activos / ${closedChallenges} cerrados`}
              accentColor="#FE410A"
            />
            <KpiCard
              icon={<LightbulbIcon color="#F59E0B" size={22} />}
              label="Ideas Generadas"
              value={(data?.totalIdeas ?? 0).toLocaleString('es-BO')}
              subtitle="Propuestas historicas en el sistema"
              accentColor="#F59E0B"
            />
          </>
        )}
      </S.Grid>

      {!loading && data?.challengesPerformance && (
        <ChallengeListTable challenges={data.challengesPerformance} />
      )}
    </S.Wrapper>
  );
}
