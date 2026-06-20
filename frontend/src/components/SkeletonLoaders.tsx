import React from 'react';
import styled, { keyframes } from 'styled-components';

/* ─── Shimmer animation ─── */
const shimmer = keyframes`
  0%   { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

/* ─── Base skeleton block ─── */
const Bone = styled.div<{ $w?: string; $h?: string; $radius?: string; $mb?: string }>`
  display: block;
  width: ${p => p.$w ?? '100%'};
  height: ${p => p.$h ?? '16px'};
  border-radius: ${p => p.$radius ?? '8px'};
  margin-bottom: ${p => p.$mb ?? '0'};
  background: #f0f1f3;
  background-image: linear-gradient(
    to right,
    #f0f1f3 0%,
    #e4e6e9 20%,
    #f0f1f3 40%,
    #f0f1f3 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 104px;
  animation: ${shimmer} 1.25s linear infinite forwards;
`;

/* ─── Skeleton containers ─── */
const SkeletonCard = styled.div`
  background: white;
  border-radius: 18px;
  border: 1.5px solid rgba(72, 80, 84, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeIn} 0.3s ease both;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

/* ────────────────────────────────────────────────
   Skeleton variants for different parts of the app
   ──────────────────────────────────────────────── */

/**
 * Generic idea card skeleton — used in Favoritos, Mis Ideas, Ideas lists
 */
export const IdeaCardSkeletonBlock: React.FC = () => (
  <SkeletonCard>
    <Bone $w="55px" $h="20px" $radius="6px" />
    <Bone $w="90%" $h="18px" />
    <Bone $w="60%" $h="14px" />
    <SkeletonRow>
      <Bone $w="60px" $h="28px" $radius="99px" />
      <Bone $w="60px" $h="28px" $radius="99px" />
      <Bone $w="60px" $h="28px" $radius="99px" />
    </SkeletonRow>
  </SkeletonCard>
);

/**
 * Comment skeleton — used in CommentsSection
 */
export const CommentSkeleton: React.FC = () => (
  <SkeletonCard style={{ padding: '16px' }}>
    <SkeletonRow>
      <Bone $w="32px" $h="32px" $radius="50%" />
      <div style={{ flex: 1 }}>
        <Bone $w="120px" $h="14px" $mb="6px" />
        <Bone $w="80px" $h="11px" />
      </div>
    </SkeletonRow>
    <Bone $w="100%" $h="14px" />
    <Bone $w="75%" $h="14px" />
  </SkeletonCard>
);

/**
 * Table row skeleton — used in Admin tables (empresas, whitelist, faculties)
 */
export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '14px 12px' }}>
        <Bone $w={i === 0 ? '140px' : i === cols - 1 ? '36px' : '80px'} $h="16px" />
      </td>
    ))}
  </tr>
);

/**
 * Stats card skeleton — used in CompanyStatsView and AdminStatsView
 */
export const StatsCardSkeleton: React.FC = () => (
  <SkeletonCard style={{ height: '280px' }}>
    <Bone $w="40%" $h="20px" $mb="8px" />
    <Bone $w="100%" $h="180px" $radius="12px" />
  </SkeletonCard>
);

/**
 * Modal content skeleton — used in AdminIdeaUnifiedModal, EvaluationScoresModal, etc.
 */
export const ModalContentSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
    <Bone $w="50%" $h="22px" $mb="4px" />
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i}>
        <Bone $w="30%" $h="16px" />
        <Bone $w="70%" $h="16px" />
      </SkeletonRow>
    ))}
  </div>
);

/**
 * Audit log skeleton — used in ChallengeAuditModal
 */
export const AuditLogSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    {[1, 2, 3, 4].map(i => (
      <SkeletonRow key={i}>
        <Bone $w="12px" $h="12px" $radius="50%" />
        <div style={{ flex: 1 }}>
          <Bone $w="80%" $h="14px" $mb="6px" />
          <Bone $w="45%" $h="12px" />
        </div>
      </SkeletonRow>
    ))}
  </div>
);

/**
 * Podium skeleton — used in CompanyPodiumView
 */
export const PodiumSkeleton: React.FC = () => (
  <SkeletonCard style={{ height: '240px', alignItems: 'center', justifyContent: 'center' }}>
    <SkeletonRow style={{ justifyContent: 'center', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Bone $w="48px" $h="48px" $radius="50%" />
        <Bone $w="80px" $h="14px" />
        <Bone $w="50px" $h="60px" $radius="8px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Bone $w="56px" $h="56px" $radius="50%" />
        <Bone $w="90px" $h="14px" />
        <Bone $w="50px" $h="80px" $radius="8px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Bone $w="48px" $h="48px" $radius="50%" />
        <Bone $w="80px" $h="14px" />
        <Bone $w="50px" $h="50px" $radius="8px" />
      </div>
    </SkeletonRow>
  </SkeletonCard>
);

/**
 * Sky wall / mural ideas skeleton — replaces IdeasLoader progress bar
 */
const MuralWrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
  animation: ${fadeIn} 0.4s ease both;
`;

const PlaneSkeleton = styled.div`
  width: 120px;
  height: 80px;
  border-radius: 14px;
  background: rgba(248, 249, 250, 0.85);
  border: 1.5px solid rgba(72, 80, 84, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
`;

export const MuralSkeleton: React.FC = () => (
  <MuralWrap>
    {Array.from({ length: 8 }).map((_, i) => (
      <PlaneSkeleton key={i}>
        <Bone $w="36px" $h="36px" $radius="50%" />
        <Bone $w="80px" $h="10px" />
      </PlaneSkeleton>
    ))}
  </MuralWrap>
);

/**
 * Grid skeleton for Favoritos/Mis Ideas — shows card placeholders
 */
const GridWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
  width: 100%;
  animation: ${fadeIn} 0.3s ease both;
`;

export const IdeasGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <GridWrap>
    {Array.from({ length: count }).map((_, i) => (
      <IdeaCardSkeletonBlock key={i} />
    ))}
  </GridWrap>
);

/**
 * Challenge list skeleton — used in ChallengeList when loading
 */
export const ChallengeListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} style={{ height: '120px' }}>
        <SkeletonRow>
          <Bone $w="48px" $h="48px" $radius="12px" />
          <div style={{ flex: 1 }}>
            <Bone $w="70%" $h="16px" $mb="8px" />
            <Bone $w="40%" $h="13px" />
          </div>
        </SkeletonRow>
        <SkeletonRow>
          <Bone $w="80px" $h="24px" $radius="99px" />
          <Bone $w="100px" $h="24px" $radius="99px" />
        </SkeletonRow>
      </SkeletonCard>
    ))}
  </div>
);

/**
 * Profile skeleton
 */
export const ProfileSkeleton: React.FC = () => (
  <SkeletonCard style={{ maxWidth: 600, margin: '0 auto', padding: '32px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
      <Bone $w="72px" $h="72px" $radius="50%" />
      <div>
        <Bone $w="160px" $h="20px" $mb="8px" />
        <Bone $w="200px" $h="14px" />
      </div>
    </div>
    {[1, 2, 3, 4].map(i => (
      <Bone key={i} $w="100%" $h="40px" $mb="12px" $radius="10px" />
    ))}
  </SkeletonCard>
);

/**
 * Judge form skeleton
 */
export const JudgeFormSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: `${fadeIn} 0.3s ease both` }}>
    <Bone $w="60%" $h="24px" $mb="8px" />
    <Bone $w="100%" $h="120px" $radius="12px" />
    {[1, 2, 3].map(i => (
      <SkeletonRow key={i}>
        <Bone $w="35%" $h="16px" />
        <Bone $w="60px" $h="36px" $radius="8px" />
      </SkeletonRow>
    ))}
    <Bone $w="140px" $h="40px" $radius="99px" />
  </div>
);

/**
 * Draft modal skeleton
 */
export const DraftListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} style={{ padding: '14px' }}>
        <Bone $w="70%" $h="16px" $mb="6px" />
        <Bone $w="45%" $h="12px" />
      </SkeletonCard>
    ))}
  </div>
);

/**
 * Whitelist / Faculties manager skeleton
 */
export const ListManagerSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <SkeletonRow key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <Bone $w="40%" $h="16px" />
        <div style={{ marginLeft: 'auto' }}>
          <Bone $w="70px" $h="28px" $radius="8px" />
        </div>
      </SkeletonRow>
    ))}
  </div>
);

/**
 * Notification List Skeleton — used in NotificationBell
 */
export const NotificationListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <Bone $w="70%" $h="14px" $mb="8px" />
        <Bone $w="100%" $h="12px" $mb="8px" />
        <Bone $w="80%" $h="12px" $mb="8px" />
        <Bone $w="40%" $h="10px" />
      </div>
    ))}
  </div>
);

/* Re-export Bone for custom one-off skeletons */
export { Bone, SkeletonCard, SkeletonRow };
