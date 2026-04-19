import React from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../../../config/theme';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0;
  background: #f1f3f5;
  border-radius: 10px;
  padding: 3px;
`;

const Option = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  background: ${p => (p.$active ? '#fff' : 'transparent')};
  color: ${p => (p.$active ? Pista8Theme.primary : '#6b7280')};
  box-shadow: ${p =>
    p.$active ? '0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' : 'none'};

  &:hover {
    color: ${p => (p.$active ? Pista8Theme.primary : '#374151')};
  }
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  margin-right: 8px;
  white-space: nowrap;
`;

interface SortToggleProps {
  value: 'newest' | 'oldest' | null;
  onChange: (value: 'newest' | 'oldest') => void;
}

const SortToggle: React.FC<SortToggleProps> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Label>Ordenar:</Label>
      <Wrapper>
        <Option $active={value === 'newest'} onClick={() => onChange('newest')}>
          Más recientes
        </Option>
        <Option $active={value === 'oldest'} onClick={() => onChange('oldest')}>
          Más antiguas
        </Option>
      </Wrapper>
    </div>
  );
};

export default SortToggle;
