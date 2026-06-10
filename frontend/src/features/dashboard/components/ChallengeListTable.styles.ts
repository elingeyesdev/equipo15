import styled from 'styled-components';
import { Pista8Theme } from '@/config/theme';

export const TableContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  background: ${Pista8Theme.white};
  border-radius: ${Pista8Theme.radius.xl}px;
  box-shadow: ${Pista8Theme.shadowLayers.md};
  overflow: visible;
`;

export const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: ${Pista8Theme.spacing.lg}px ${Pista8Theme.spacing.xl}px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
`;

export const TableTitle = styled.h3`
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 1.2fr;
  background: #f8fafc;
  padding: ${Pista8Theme.spacing.md}px ${Pista8Theme.spacing.xl}px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  div {
    justify-content: center;
    text-align: center;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    display: none;
  }
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 1.2fr;
  padding: ${Pista8Theme.spacing.md}px ${Pista8Theme.spacing.xl}px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${Pista8Theme.spacing.sm}px;
    padding: ${Pista8Theme.spacing.lg}px;
  }

  & > div:not(:first-child) {
    justify-content: center;
    text-align: center;
  }
`;

export const Cell = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const ChallengeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const ChallengeTitle = styled.span`
  font-weight: 700;
  color: #0f172a;
  font-size: ${Pista8Theme.fontSize.md}px;
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const CompanyName = styled.span`
  font-weight: 500;
  color: #64748b;
  font-size: ${Pista8Theme.fontSize.sm}px;
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;

  ${({ $status }) => {
    switch ($status) {
      case 'Activo':
        return `background: #dcfce7; color: #166534;`;
      case 'Borrador':
        return `background: #f1f5f9; color: #475569;`;
      case 'En Evaluación':
        return `background: #fef9c3; color: #854d0e;`;
      case 'Finalizado':
        return `background: #fee2e2; color: #991b1b;`;
      default:
        return `background: #f1f5f9; color: #475569;`;
    }
  }}
`;

export const Metric = styled.span`
  font-weight: 700;
  color: #1e293b;
  font-size: ${Pista8Theme.fontSize.md}px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-weight: 500;
`;

export const AuditBtn = styled.button`
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(254, 65, 10, 0.2);

  &:hover:not(:disabled) {
    background: #e63a09;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254, 65, 10, 0.3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
