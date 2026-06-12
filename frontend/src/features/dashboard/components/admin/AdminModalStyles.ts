import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '@/config/theme';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const AdminModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  animation: ${fadeIn} 0.2s ease;
  padding: 24px;
`;

export const AdminModalCard = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
`;

export const AdminAuditBanner = styled.div`
  background: ${Pista8Theme.primary};
  color: white;
  text-align: center;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const AdminModalHeader = styled.div`
  padding: 24px 28px 18px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const AdminHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const AdminModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.3;
`;

export const AdminModalSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
`;

export const AdminCloseBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  flex-shrink: 0;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

export const AdminModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(15, 23, 42, 0.15);
    border-radius: 99px;
  }
`;

export const AdminSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const AdminSummaryCard = styled.div<{ $accent: string }>`
  background: ${({ $accent }) => `${$accent}0d`};
  border: 1px solid ${({ $accent }) => `${$accent}22`};
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
`;

export const AdminSummaryValue = styled.span<{ $accent: string }>`
  font-size: 24px;
  font-weight: 900;
  color: ${({ $accent }) => $accent};
  line-height: 1;
`;

export const AdminSummaryLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const AdminSectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
`;

export const AdminCriteriaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const AdminCriteriaCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
`;

export const AdminCriteriaValue = styled.span`
  font-size: 22px;
  font-weight: 900;
  color: ${Pista8Theme.primary};
  line-height: 1;
`;

export const AdminCriteriaName = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const AdminCriteriaWeight = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
`;

export const AdminDetailSection = styled.div`
  margin-bottom: 18px;
  text-align: center;
`;

export const AdminDetailLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: ${Pista8Theme.primary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

export const AdminDetailText = styled.div`
  font-size: 14px;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
`;

export const AdminTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
`;

export const AdminTag = styled.span`
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(254, 65, 10, 0.08);
  color: ${Pista8Theme.primary};
  font-size: 11px;
  font-weight: 700;
`;
