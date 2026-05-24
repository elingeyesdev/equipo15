import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
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

export const ChallengeJudgeSelector: React.FC<Props> = ({ challengeId, readOnlyMode = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Judge[]>([]);
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cargar jueces asignados al montar
  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const { data } = await axiosInstance.get(`/challenges/${challengeId}/judges`);
        setSelectedJudges(data);
        setHasChanges(false);
      } catch (error) {
        toast.error('Error al cargar jueces asignados');
      }
    };
    fetchAssigned();
  }, [challengeId]);

  // Click outside para cerrar el dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const { data } = await axiosInstance.get(`/challenges/judges/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        toast.error('Error al buscar jueces');
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (judge: Judge) => {
    if (selectedJudges.find(j => j.id === judge.id)) {
      toast.error('Este juez ya está seleccionado');
      return;
    }
    if (selectedJudges.length >= MAX_JUDGES) {
      toast.error(`El límite máximo es de ${MAX_JUDGES} jueces por reto.`);
      return;
    }
    setSelectedJudges(prev => [...prev, judge]);
    setQuery('');
    setShowDropdown(false);
    setHasChanges(true);
  };

  const handleRemove = (id: string) => {
    setSelectedJudges(prev => prev.filter(j => j.id !== id));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoadingSave(true);
      await axiosInstance.put(`/challenges/${challengeId}/judges`, {
        judgeIds: selectedJudges.map(j => j.id),
      });
      toast.success('Jueces vinculados exitosamente');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar la vinculación');
    } finally {
      setLoadingSave(false);
    }
  };

  const isMaxReached = selectedJudges.length >= MAX_JUDGES;

  return (
    <Container ref={wrapperRef}>
      <Header>
        <Title>Vinculación de Jueces Evaluadores</Title>
        <Counter $maxReached={isMaxReached}>
          {selectedJudges.length} / {MAX_JUDGES} jueces permitidos
        </Counter>
      </Header>

      {!readOnlyMode && (
        <SearchContainer>
          <SearchInputWrapper>
            <SearchIcon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </SearchIcon>
            <Input
              type="text"
              placeholder={isMaxReached ? "Límite máximo alcanzado" : "Buscar jueces por nombre o correo..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isMaxReached || loadingSave}
              onFocus={() => {
                if (query.length >= 2 && results.length > 0) setShowDropdown(true);
              }}
            />
            {loadingSearch && <Spinner />}
          </SearchInputWrapper>

          {showDropdown && results.length > 0 && (
            <DropdownMenu>
              {results.map((judge) => (
                <DropdownItem key={judge.id} onClick={() => handleSelect(judge)}>
                  <Avatar src={judge.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(judge.displayName)}&background=random`} />
                  <JudgeInfo>
                    <JudgeName>{judge.displayName}</JudgeName>
                    <JudgeEmail>{judge.email}</JudgeEmail>
                  </JudgeInfo>
                  {selectedJudges.some(j => j.id === judge.id) && (
                    <SelectedIcon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </SelectedIcon>
                  )}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </SearchContainer>
      )}

      {selectedJudges.length > 0 ? (
        <SelectedList>
          {selectedJudges.map(judge => (
            <Tag key={judge.id}>
              <AvatarSmall src={judge.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(judge.displayName)}&background=random`} />
              <TagName>{judge.displayName}</TagName>
              {!readOnlyMode && (
                <RemoveBtn onClick={() => handleRemove(judge.id)} title="Eliminar juez">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </RemoveBtn>
              )}
            </Tag>
          ))}
        </SelectedList>
      ) : (
        <EmptyState>No hay jueces asignados a este reto todavía.</EmptyState>
      )}

      {!readOnlyMode && (
        <Footer>
          <SaveButton
            onClick={handleSave}
            disabled={!hasChanges || loadingSave}
          >
            {loadingSave ? 'Guardando...' : 'Guardar Vinculación'}
          </SaveButton>
        </Footer>
      )}
    </Container>
  );
};

/* ─── Estilos ─── */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const Header = styled.div`
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

const Counter = styled.span<{ $maxReached: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${p => p.$maxReached ? 'rgba(239, 68, 68, 0.1)' : 'rgba(72, 80, 84, 0.05)'};
  color: ${p => p.$maxReached ? '#ef4444' : '#6b7280'};
  transition: all 0.3s;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  color: #9ca3af;
  display: flex;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px 12px 40px;
  border-radius: 12px;
  border: 1.5px solid rgba(72, 80, 84, 0.15);
  font-size: 14px;
  font-family: inherit;
  color: #1a1f22;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px rgba(254, 65, 10, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: rgba(72, 80, 84, 0.04);
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const JudgeInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
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
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SelectedIcon = styled.div`
  color: ${Pista8Theme.primary};
`;

const SelectedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 40px;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 4px 10px 4px 6px;
  border-radius: 20px;
  animation: scaleIn 0.2s ease-out;

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const AvatarSmall = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const TagName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  margin-left: 2px;
  color: #9ca3af;
  border-radius: 50%;
  display: flex;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

const EmptyState = styled.div`
  padding: 20px;
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
  padding: 10px 20px;
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

const Spinner = styled.div`
  position: absolute;
  right: 14px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(72,80,84,0.1);
  border-top-color: ${Pista8Theme.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
