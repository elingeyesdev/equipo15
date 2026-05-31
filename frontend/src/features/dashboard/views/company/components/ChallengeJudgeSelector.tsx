import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../../config/theme';
import axiosInstance from '../../../../../api/axiosConfig';
import { toast } from 'sonner';

interface Judge {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

interface Props {
  challengeId: string;
  readOnlyMode?: boolean;
}

const MAX_JUDGES = 5;
const MIN_JUDGES = 1;

export const ChallengeJudgeSelector: React.FC<Props> = ({ challengeId, readOnlyMode = false }) => {
  const [allJudges, setAllJudges] = useState<Judge[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [loadingJudges, setLoadingJudges] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [judgesRes, assignedRes] = await Promise.all([
          axiosInstance.get('/challenges/judges/search?q='),
          axiosInstance.get(`/challenges/${challengeId}/judges`),
        ]);

        const judgesPayload = judgesRes.data?.data || judgesRes.data;
        const assignedPayload = assignedRes.data?.data || assignedRes.data;

        setAllJudges(Array.isArray(judgesPayload) ? judgesPayload : []);

        const assignedData = Array.isArray(assignedPayload) ? assignedPayload : [];
        const assignedIds = new Set<string>(assignedData.map(j => j.id));
        setSelectedIds(assignedIds);
        setInitialIds(new Set(assignedIds));
      } catch {
        toast.error('Error al cargar la lista de jueces');
      } finally {
        setLoadingJudges(false);
      }
    };
    fetchData();
  }, [challengeId]);

  const toggleJudge = (judgeId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(judgeId)) {
        next.delete(judgeId);
      } else {
        if (next.size >= MAX_JUDGES) {
          toast.error(`El límite máximo es de ${MAX_JUDGES} jueces por reto.`);
          return prev;
        }
        next.add(judgeId);
      }
      return next;
    });
  };

  const hasChanges = (() => {
    if (selectedIds.size !== initialIds.size) return true;
    for (const id of selectedIds) {
      if (!initialIds.has(id)) return true;
    }
    return false;
  })();

  const handleSave = async () => {
    if (selectedIds.size < MIN_JUDGES) {
      toast.error(`Debes seleccionar al menos ${MIN_JUDGES} juez.`);
      return;
    }
    if (selectedIds.size > MAX_JUDGES) {
      toast.error(`No se pueden asignar más de ${MAX_JUDGES} jueces.`);
      return;
    }

    try {
      setLoadingSave(true);
      await axiosInstance.put(`/challenges/${challengeId}/judges`, {
        judgeIds: Array.from(selectedIds),
      });
      setInitialIds(new Set(selectedIds));
      toast.success('Jueces vinculados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar la vinculación');
    } finally {
      setLoadingSave(false);
    }
  };

  const isMaxReached = selectedIds.size >= MAX_JUDGES;

  return (
    <Container>
      <Header>
        <TitleRow>
          <Title>Vinculación de Jueces Evaluadores</Title>
          <Counter $maxReached={isMaxReached} $valid={selectedIds.size >= MIN_JUDGES}>
            {selectedIds.size} / {MAX_JUDGES} jueces seleccionados
          </Counter>
        </TitleRow>
        <Subtitle>Selecciona los jueces que evaluarán las ideas de este reto (mínimo {MIN_JUDGES}, máximo {MAX_JUDGES}).</Subtitle>
      </Header>

      {loadingJudges ? (
        <LoadingList>
          {[0,1,2].map(i => <SkeletonRow key={i} />)}
        </LoadingList>
      ) : allJudges.length === 0 ? (
        <EmptyState>No hay jueces registrados en la plataforma. Un administrador debe asignar el rol de Juez a los usuarios primero.</EmptyState>
      ) : (
        <JudgeList>
          {allJudges.map(judge => {
            const isSelected = selectedIds.has(judge.id);
            const isDisabled = !isSelected && isMaxReached;

            return (
              <JudgeRow
                key={judge.id}
                $selected={isSelected}
                $disabled={isDisabled || readOnlyMode}
                onClick={() => !readOnlyMode && !isDisabled && toggleJudge(judge.id)}
              >
                <JudgeInfo>
                  <AvatarImg src={judge.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(judge.displayName || 'Usuario')}&background=random&size=40`} />
                  <JudgeText>
                    <JudgeName>{judge.displayName || 'Sin Nombre'}</JudgeName>
                    <JudgeEmail>{judge.email}</JudgeEmail>
                  </JudgeText>
                </JudgeInfo>
                <Checkbox $checked={isSelected} $disabled={isDisabled || readOnlyMode}>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </Checkbox>
              </JudgeRow>
            );
          })}
        </JudgeList>
      )}

      {!readOnlyMode && allJudges.length > 0 && (
        <Footer>
          <SaveButton
            onClick={handleSave}
            disabled={!hasChanges || loadingSave || selectedIds.size < MIN_JUDGES}
          >
            {loadingSave ? 'Guardando...' : 'Guardar Vinculación'}
          </SaveButton>
        </Footer>
      )}
    </Container>
  );
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #1a1f22;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
`;

const Counter = styled.span<{ $maxReached: boolean; $valid: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${p => p.$maxReached ? 'rgba(239, 68, 68, 0.1)' : p.$valid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(72, 80, 84, 0.05)'};
  color: ${p => p.$maxReached ? '#ef4444' : p.$valid ? '#16a34a' : '#6b7280'};
  transition: all 0.3s;
`;

const JudgeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(72,80,84,0.15); border-radius: 3px; }
`;

const JudgeRow = styled.div<{ $selected: boolean; $disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid ${p => p.$selected ? Pista8Theme.primary : 'rgba(72,80,84,0.08)'};
  background: ${p => p.$selected ? `${Pista8Theme.primary}06` : 'white'};
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.$disabled ? 0.5 : 1};
  transition: all 0.18s;
  animation: ${fadeIn} 0.25s ease both;

  &:hover {
    ${p => !p.$disabled && `
      border-color: ${Pista8Theme.primary};
      background: ${Pista8Theme.primary}08;
    `}
  }
`;

const JudgeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
`;

const JudgeText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const JudgeName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #1a1f22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JudgeEmail = styled.span`
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Checkbox = styled.div<{ $checked: boolean; $disabled: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 2px solid ${p => p.$checked ? Pista8Theme.primary : 'rgba(72,80,84,0.2)'};
  background: ${p => p.$checked ? Pista8Theme.primary : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.18s;
  margin-left: 12px;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 13.5px;
  background: rgba(72, 80, 84, 0.02);
  border: 1px dashed rgba(72, 80, 84, 0.15);
  border-radius: 12px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid rgba(72, 80, 84, 0.06);
`;

const SaveButton = styled.button`
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #e63a09;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254, 65, 10, 0.2);
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const LoadingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SkeletonRow = styled.div`
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f1f3f5 25%, #e5e7eb 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;
