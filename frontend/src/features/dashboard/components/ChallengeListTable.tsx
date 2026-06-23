import { useState, useMemo } from 'react';
import type { ChallengePerformance } from '@/types/models';
import { AdminChallengeFilter, type AdminChallengeFilterState } from './AdminChallengeFilter';
import { ChallengeAuditModal } from './ChallengeAuditModal';
import * as S from './ChallengeListTable.styles';
import { StatusBadge } from '../../../components/common/StatusBadge';

interface Props {
  challenges: ChallengePerformance[];
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Activo':
    case 'PUBLISHED': return 'Activo';
    case 'Borrador':
    case 'DRAFT': return 'Borrador';
    case 'Agendado':
    case 'SCHEDULED': return 'Agendado';
    case 'En Evaluación':
    case 'EVALUATING': return 'En Evaluación';
    case 'Finalizado':
    case 'CLOSED': return 'Finalizado';
    default: return status;
  }
};

const FireSvg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FE410A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const StarSvg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export function ChallengeListTable({ challenges }: Props) {
  const [filter, setFilter] = useState<AdminChallengeFilterState>({
    sortOrder: 'newest',
    status: 'ALL',
  });
  const [auditChallenge, setAuditChallenge] = useState<ChallengePerformance | null>(null);
  const filteredAndSortedChallenges = useMemo(() => {
    let result = [...challenges];

    if (filter.status !== 'ALL') {
      result = result.filter(c => getStatusLabel(c.status) === filter.status);
    }

    if (filter.sortOrder === 'oldest') {
      result.reverse();
    } else if (filter.sortOrder === 'interactions') {
      result.sort((a, b) => b.totalInteractions - a.totalInteractions);
    } else if (filter.sortOrder === 'score') {
      result.sort((a, b) => {
        const scoreA = a.averageScore ?? -1;
        const scoreB = b.averageScore ?? -1;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [challenges, filter]);

  if (!challenges || challenges.length === 0) {
    return (
      <S.TableContainer>
        <S.EmptyState>No hay retos disponibles en la plataforma.</S.EmptyState>
      </S.TableContainer>
    );
  }

  return (
    <>
    <S.TableContainer>
      <S.TableToolbar>
        <S.TableTitle>Listado de Retos</S.TableTitle>
        <AdminChallengeFilter value={filter} onChange={setFilter} />
      </S.TableToolbar>

      {filteredAndSortedChallenges.length === 0 ? (
        <S.EmptyState>No hay retos que coincidan con los filtros seleccionados.</S.EmptyState>
      ) : (
        <>
          <S.TableHeader>
            <S.Cell>Reto / Organización</S.Cell>
            <S.Cell>Estado</S.Cell>
            <S.Cell>Interacciones</S.Cell>
            <S.Cell>Calificación</S.Cell>
            <S.Cell>Auditoría</S.Cell>
          </S.TableHeader>
          
          {filteredAndSortedChallenges.map((challenge) => (
            <S.TableRow key={challenge.id}>
              <S.Cell>
                <S.ChallengeInfo>
                  <S.ChallengeTitle>{challenge.title}</S.ChallengeTitle>
                  <S.CompanyName>{challenge.companyName}</S.CompanyName>
                </S.ChallengeInfo>
              </S.Cell>
              <S.Cell>
                <StatusBadge status={challenge.status} />
              </S.Cell>
              <S.Cell>
                <S.Metric>
                  <FireSvg /> {challenge.totalInteractions}
                </S.Metric>
              </S.Cell>
              <S.Cell>
                <S.Metric>
                  <StarSvg /> {challenge.averageScore !== null ? challenge.averageScore : '-'}
                </S.Metric>
              </S.Cell>
              <S.Cell>
                <S.AuditBtn
                  type="button"
                  onClick={() => setAuditChallenge(challenge)}
                >
                  Auditar rúbricas
                </S.AuditBtn>
              </S.Cell>
            </S.TableRow>
          ))}
        </>
      )}
    </S.TableContainer>

    {auditChallenge && (
      <ChallengeAuditModal
        challengeId={auditChallenge.id}
        challengeTitle={auditChallenge.title}
        onClose={() => setAuditChallenge(null)}
      />
    )}
    </>
  );
}
