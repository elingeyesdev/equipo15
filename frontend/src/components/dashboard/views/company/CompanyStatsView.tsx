import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Pista8Theme } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import type {
  InnovationInteractionByDayItem,
  InnovationStatsResponse,
} from '../../../../types/models';

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const colors = {
  bg: '#f7f8fa',
  card: '#ffffff',
  border: 'rgba(72, 80, 84, 0.12)',
  textMain: '#1a1f22',
  textMuted: '#6b7280',
  axis: '#7f8791',
  likes: '#2DBE6C',
  comments: '#485054',
  bars: ['#FE410A', '#FF6A3D', '#FF8F6E', '#485054', '#7A838A', '#A8AEB2', '#C4C9CC', '#D9DEE1'],
};

const MOCK_INNOVATION_STATS: InnovationStatsResponse = {
  ideasByFaculty: [
    { facultyId: 1, facultyName: 'Ingenieria', ideasCount: 24, votesCount: 117 },
    { facultyId: 2, facultyName: 'Medicina', ideasCount: 18, votesCount: 95 },
    { facultyId: 3, facultyName: 'Ciencias Exactas', ideasCount: 15, votesCount: 71 },
    { facultyId: 4, facultyName: 'Humanidades', ideasCount: 11, votesCount: 46 },
  ],
  interactionsByDay: [
    { date: '2026-03-28', likes: 12, comments: 4 },
    { date: '2026-03-29', likes: 14, comments: 5 },
    { date: '2026-03-30', likes: 11, comments: 3 },
    { date: '2026-03-31', likes: 17, comments: 7 },
    { date: '2026-04-01', likes: 20, comments: 8 },
    { date: '2026-04-02', likes: 16, comments: 6 },
    { date: '2026-04-03', likes: 18, comments: 7 },
    { date: '2026-04-04', likes: 22, comments: 9 },
    { date: '2026-04-05', likes: 19, comments: 8 },
    { date: '2026-04-06', likes: 15, comments: 4 },
    { date: '2026-04-07', likes: 24, comments: 10 },
    { date: '2026-04-08', likes: 26, comments: 11 },
    { date: '2026-04-09', likes: 21, comments: 8 },
    { date: '2026-04-10', likes: 18, comments: 6 },
  ],
  kpis: {
    totalIdeas: 68,
    totalVotes: 329,
    mostActiveUser: { name: 'Ana Perez', ideaCount: 9 },
    leadingFaculty: { facultyId: 1, facultyName: 'Ingenieria', ideasCount: 24 },
  },
};

const Container = styled.section`
  animation: ${riseIn} 0.35s ease both;
  background: radial-gradient(circle at 100% 0%, #fff4ee 0%, ${colors.bg} 56%);
  border: 1px solid ${colors.border};
  border-radius: 20px;
  padding: 24px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
`;

const Heading = styled.h2`
  margin: 0;
  color: ${Pista8Theme.secondary};
  font-size: 23px;
  font-weight: 900;
`;

const Subheading = styled.p`
  margin: 6px 0 0;
  color: ${colors.textMuted};
  font-size: 13px;
`;

const StatusPill = styled.span<{ $mock: boolean }>`
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: ${({ $mock }) => ($mock ? '#fff4e6' : '#ecfdf3')};
  color: ${({ $mock }) => ($mock ? '#b45309' : '#147f3f')};
  border: 1px solid ${({ $mock }) => ($mock ? '#facc8d' : '#9de5b4')};
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled.article`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(72, 80, 84, 0.06);
`;

const KpiLabel = styled.p`
  margin: 0 0 8px;
  color: ${colors.textMuted};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const KpiValue = styled.h3`
  margin: 0;
  color: ${colors.textMain};
  font-size: 28px;
  line-height: 1;
`;

const KpiHint = styled.p`
  margin: 8px 0 0;
  color: ${colors.textMuted};
  font-size: 12px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.article`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 14px 12px 8px;
  min-height: 340px;
`;

const ChartTitle = styled.h4`
  margin: 0 0 12px;
  padding: 0 6px;
  color: ${Pista8Theme.secondary};
  font-size: 15px;
  font-weight: 800;
`;

const LoadingState = styled.div`
  display: grid;
  place-items: center;
  min-height: 280px;
  color: ${colors.textMuted};
  font-size: 14px;
  font-weight: 600;
`;

const ErrorState = styled.div`
  border-radius: 12px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #991b1b;
  padding: 16px;
  margin-top: 8px;
`;

const RetryButton = styled.button`
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  padding: 9px 14px;
  background: ${Pista8Theme.primary};
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
`;

const RefreshButton = styled(RetryButton)`
  margin-top: 0;
`;

const EmptyState = styled.div`
  border: 1px dashed rgba(72, 80, 84, 0.28);
  background: #ffffff;
  border-radius: 14px;
  padding: 22px;
  text-align: center;
  color: ${colors.textMuted};
`;

const normalizeDateLabel = (rawDate: string) => {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

const mapInteractionSeries = (items: InnovationInteractionByDayItem[]) =>
  items.map((item) => ({
    ...item,
    label: normalizeDateLabel(item.date),
  }));

export const CompanyStatsView = () => {
  const [stats, setStats] = useState<InnovationStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const useMockByFlag = String(import.meta.env.VITE_USE_INNOVATION_STATS_MOCK || '').toLowerCase() === 'true';
      if (useMockByFlag) {
        setStats(MOCK_INNOVATION_STATS);
        setUsingMock(true);
        return;
      }

      const response = await challengeService.getInnovationStats();
      setStats(response);
      setUsingMock(false);
    } catch (err) {
      console.error('Error cargando innovation stats:', err);
      setStats(MOCK_INNOVATION_STATS);
      setUsingMock(true);
      setError('No se pudieron cargar estadísticas en vivo. Se muestran datos mock.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const interactionSeries = useMemo(
    () => mapInteractionSeries(stats?.interactionsByDay ?? []),
    [stats?.interactionsByDay],
  );

  const facultySeries = useMemo(
    () => (stats?.ideasByFaculty ?? []).map((item, index) => ({ ...item, fill: colors.bars[index % colors.bars.length] })),
    [stats?.ideasByFaculty],
  );

  if (loading) {
    return (
      <Container>
        <LoadingState>Cargando graficas de innovacion...</LoadingState>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container>
        <ErrorState>
          No hay datos para mostrar.
          <div>
            <RetryButton onClick={fetchStats}>Reintentar</RetryButton>
          </div>
        </ErrorState>
      </Container>
    );
  }

  const hasFacultyData = facultySeries.length > 0;
  const hasInteractionsData = interactionSeries.length > 0;

  return (
    <Container>
      <Header>
        <div>
          <Heading>Resultados de Innovacion</Heading>
          <Subheading>
            Vista consolidada de ideas por facultad, interacciones por dia y KPIs principales.
          </Subheading>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshButton onClick={fetchStats} disabled={loading}>
            {loading ? 'Actualizando...' : 'Refrescar'}
          </RefreshButton>
          <StatusPill $mock={usingMock}>{usingMock ? 'Modo mock' : 'Datos en vivo'}</StatusPill>
        </div>
      </Header>

      {error && (
        <ErrorState>
          {error}
          <div>
            <RetryButton onClick={fetchStats}>Intentar de nuevo</RetryButton>
          </div>
        </ErrorState>
      )}

      <KpiGrid>
        <KpiCard>
          <KpiLabel>Total de ideas</KpiLabel>
          <KpiValue>{stats.kpis.totalIdeas}</KpiValue>
          <KpiHint>Ideas publicas recibidas en tus retos.</KpiHint>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Total de votos</KpiLabel>
          <KpiValue>{stats.kpis.totalVotes}</KpiValue>
          <KpiHint>Votos acumulados sobre ideas publicas.</KpiHint>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Usuario mas activo</KpiLabel>
          <KpiValue>{stats.kpis.mostActiveUser?.name ?? 'Sin datos'}</KpiValue>
          <KpiHint>
            {stats.kpis.mostActiveUser
              ? `${stats.kpis.mostActiveUser.ideaCount} idea${stats.kpis.mostActiveUser.ideaCount === 1 ? '' : 's'} enviadas`
              : 'Aun no hay actividad suficiente.'}
          </KpiHint>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Facultad lider</KpiLabel>
          <KpiValue>{stats.kpis.leadingFaculty?.facultyName ?? 'Sin datos'}</KpiValue>
          <KpiHint>
            {stats.kpis.leadingFaculty ? `${stats.kpis.leadingFaculty.ideasCount} idea${stats.kpis.leadingFaculty.ideasCount === 1 ? '' : 's'} publicadas` : 'Aun no hay facultad destacada.'}
          </KpiHint>
        </KpiCard>
      </KpiGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Grafica 1: Ideas por Facultad</ChartTitle>
          {hasFacultyData ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={facultySeries} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis
                  dataKey="facultyName"
                  tick={{ fill: colors.axis, fontSize: 11 }}
                  angle={-16}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fill: colors.axis, fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#fff4ee' }}
                  formatter={(value: unknown) => [`${Number(value) || 0} ideas`, 'Conteo']}
                  labelFormatter={(label: unknown) => `Facultad: ${String(label)}`}
                />
                <Bar dataKey="ideasCount" radius={[6, 6, 0, 0]}>
                  {facultySeries.map((entry) => (
                    <Cell key={entry.facultyId} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState>No hay ideas publicas para graficar por facultad.</EmptyState>
          )}
        </ChartCard>

        <ChartCard>
          <ChartTitle>Grafica 2: Nivel de interaccion (Likes vs Comentarios por dia)</ChartTitle>
          {hasInteractionsData ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={interactionSeries} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#eceff1" />
                <XAxis dataKey="label" tick={{ fill: colors.axis, fontSize: 11 }} />
                <YAxis tick={{ fill: colors.axis, fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [Number(value) || 0, name === 'likes' ? 'Likes' : 'Comentarios']}
                  labelFormatter={(label: unknown) => `Dia: ${String(label)}`}
                />
                <Legend formatter={(value: string) => (value === 'likes' ? 'Likes' : 'Comentarios')} />
                <Line type="monotone" dataKey="likes" stroke={colors.likes} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="comments" stroke={colors.comments} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState>No hay interacciones en los ultimos 30 dias.</EmptyState>
          )}
        </ChartCard>
      </ChartsGrid>
    </Container>
  );
};
