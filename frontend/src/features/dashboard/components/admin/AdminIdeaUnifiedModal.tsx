import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import {
  X,
  Lightbulb,
  Scale,
  MessageSquare,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Comment } from '@/types/models';
import { Pista8Theme } from '@/config/theme';
import { ideaService } from '@/services/idea.service';
import { evaluationService, type IdeaEvaluationBreakdown } from '@/services/evaluation.service';
import { ModalContentSkeleton } from '@/components/SkeletonLoaders';
import { commentService } from '@/services/comment.service';
import { CommentModerationModal } from './CommentModerationModal';
import { premiumTooltip, fadeUp } from '../../styles/CommonStyles';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { wallEvents } from '../../../../hooks/useWallEvents';

import {
  AdminModalOverlay,
  AdminModalCard,
  AdminAuditBanner,
  AdminModalHeader,
  AdminHeaderContent,
  AdminModalTitle,
  AdminModalSubtitle,
  AdminCloseBtn,
  AdminModalBody,
  AdminSummaryGrid,
  AdminSummaryCard,
  AdminSummaryValue,
  AdminSummaryLabel,
  AdminSectionTitle,
  AdminCriteriaGrid,
  AdminCriteriaCard,
  AdminCriteriaValue,
  AdminCriteriaName,
  AdminCriteriaWeight,
  AdminDetailSection,
  AdminDetailLabel,
  AdminDetailText,
  AdminTagsRow,
  AdminTag,
} from './AdminModalStyles';



const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
  gap: 16px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 10px 4px;
  font-size: 13px;
  font-weight: 800;
  color: ${({ $active }) => ($active ? Pista8Theme.primary : '#64748b')};
  border-bottom: 2px solid ${({ $active }) => ($active ? Pista8Theme.primary : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    color: ${Pista8Theme.primary};
  }
`;

const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: ${fadeUp} 0.3s ease-out;
`;



const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  font-weight: 600;
`;

// Pestaña 2: Evaluaciones - Accordion Styles
const CriteriaSection = styled.div`
  margin-bottom: 24px;
`;

const AccordionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AccordionItem = styled.div<{ $open: boolean }>`
  border: 1px solid ${({ $open }) => ($open ? `${Pista8Theme.primary}33` : '#e2e8f0')};
  border-radius: 16px;
  overflow: hidden;
  background: ${({ $open }) => ($open ? '#fff7f5' : 'white')};
  transition: border-color 0.2s ease, background 0.2s ease;
`;

const AccordionHeader = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  text-align: left;
`;

const JudgeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const JudgeAvatar = styled.div<{ $url?: string | null }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : '#f1f5f9')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: #94a3b8;
  flex-shrink: 0;
`;

const JudgeMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const JudgeName = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
`;

const JudgeEmail = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JudgeScore = styled.span`
  font-size: 15px;
  font-weight: 900;
  color: ${Pista8Theme.primary};
  flex-shrink: 0;
`;

const ChevronWrap = styled.span<{ $open: boolean }>`
  display: flex;
  color: #64748b;
  transition: transform 0.2s ease;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
`;

const AccordionBody = styled.div`
  padding: 0 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
`;

const ScoreCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ScoreCardName = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
`;

const ScoreCardValue = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
`;

const ScoreCardWeight = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 2px;
`;

const FeedbackBox = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
`;

const FeedbackLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
`;

const FeedbackText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  font-weight: 500;
`;

// Pestaña 3: Comentarios - List Styles
const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CommentTreeNodeContainer = styled.div<{ $depth: number }>`
  margin-left: ${({ $depth }) => $depth * 20}px;
  border-left: ${({ $depth }) => ($depth > 0 ? '2px solid #e2e8f0' : 'none')};
  padding-left: ${({ $depth }) => ($depth > 0 ? '12px' : '0')};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CommentRow = styled.div`
  display: flex;
  gap: 12px;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e1;
    background: #f1f5f9;
  }
`;

const CommentAvatar = styled.div<{ $url?: string | null }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : '#e2e8f0')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #475569;
  flex-shrink: 0;
`;

const CommentContentCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const CommentAuthorName = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
`;

const CommentFaculty = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-left: 6px;
`;

const CommentDate = styled.span`
  font-size: 11px;
  color: #94a3b8;
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  word-break: break-word;
`;

const CommentActionBtn = styled.button<{ $tooltipText?: string; $tooltipPosition?: 'top' | 'bottom'; $tooltipAlign?: 'center' | 'right' }>`
  ${premiumTooltip}
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid rgba(72, 80, 84, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  gap: 2px;
  opacity: 0.9;

  .svgIcon {
    width: 10px;
    transition-duration: 0.3s;
  }

  .svgIcon path {
    fill: ${Pista8Theme.primary};
  }

  &:hover {
    transition-duration: 0.3s;
    background-color: rgb(255, 69, 69);
    border-color: rgb(255, 69, 69);
    box-shadow: 0 4px 12px rgba(255, 69, 69, 0.2);
    align-items: center;
    gap: 0;
    opacity: 1;

    .svgIcon path {
      fill: white;
    }
  }

  .bin-top {
    transform-origin: bottom right;
  }
  &:hover .bin-top {
    transition-duration: 0.5s;
    transform: rotate(160deg);
  }
`;

const BaseAnimatedButton = styled.button`
  cursor: pointer;
  width: 50px;
  height: 50px;
  border: none;
  position: relative;
  border-radius: 10px;
  background: white;
  box-shadow: 1px 1px 5px 0.2px rgba(0, 0, 0, 0.2);
  transition: width 0.2s linear;
  transition-delay: 0.2s;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  overflow: hidden;

  &:hover {
    width: 150px;
    transition-delay: 0.2s;
  }

  &:hover > .paragraph {
    visibility: visible;
    opacity: 1;
    transition-delay: 0.4s;
  }

  &:hover > .icon-wrapper .icon {
    transform: scale(1.1);
  }

  .paragraph {
    color: #1a1f22;
    visibility: hidden;
    opacity: 0;
    font-size: 14px;
    margin: 0;
    width: calc(100% - 50px);
    text-align: center;
    padding-left: 10px;
    transition: opacity 0.2s linear, visibility 0.2s linear;
    font-weight: bold;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    transform: scale(0.9);
    transition: transform 0.2s linear;
  }
`;

const DeleteIdeaButton = styled(BaseAnimatedButton)`
  &:hover > .icon-wrapper .icon path {
    stroke: #e11d48;
  }
  .icon path {
    stroke: #e11d48;
  }
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 18, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10005;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ConfirmCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ConfirmIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(198, 40, 40, 0.08);
  border: 1.5px solid rgba(198, 40, 40, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  color: #1a1f22;
  text-align: center;
`;

const ConfirmBody = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.65;
  text-align: center;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmBtn = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid ${p => p.$danger ? '#c62828' : 'rgba(72,80,84,0.18)'};
  background: ${p => p.$danger ? '#c62828' : 'white'};
  color: ${p => p.$danger ? 'white' : '#485054'};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  &:hover {
    background: ${p => p.$danger ? '#b71c1c' : '#f8f9fa'};
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  FINALIST: 'Finalista',
  WINNER: 'Ganadora',
};


const formatDate = (value?: string | Date) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};


interface CommentTreeNode extends Comment {
  replies?: CommentTreeNode[];
}

interface FlatCommentNode extends Comment {
  replies: CommentTreeNode[];
}

const buildCommentTree = (comments: Comment[]): CommentTreeNode[] => {
  const byId = new Map<string, FlatCommentNode>();
  const roots: CommentTreeNode[] = [];

  comments.forEach((comment) => {
    byId.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  const ordered = [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  ordered.forEach((comment) => {
    const current = byId.get(comment.id);
    if (!current) return;

    if (comment.parentCommentId) {
      const parent = byId.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(current);
        return;
      }
    }

    roots.push(current);
  });

  return roots;
};

interface AdminIdeaUnifiedModalProps {
  ideaId: string;
  ideaTitle?: string;
  initialIdea?: any;
  defaultTab?: 'propuesta' | 'evaluaciones' | 'comentarios';
  onClose: () => void;
}

export function AdminIdeaUnifiedModal({
  ideaId,
  ideaTitle,
  initialIdea,
  defaultTab = 'propuesta',
  onClose,
}: AdminIdeaUnifiedModalProps) {
  const [activeTab, setActiveTab] = useState<'propuesta' | 'evaluaciones' | 'comentarios'>(defaultTab);
  
  // Idea details state
  const [idea, setIdea] = useState<any>(initialIdea || null);
  const [loadingIdea, setLoadingIdea] = useState(!initialIdea);

  // Evaluations state
  const [evalData, setEvalData] = useState<IdeaEvaluationBreakdown | null>(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [openJudgeId, setOpenJudgeId] = useState<string | null>(null);

  // Comments state
  const [flatComments, setFlatComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedCommentIdForMod, setSelectedCommentIdForMod] = useState<string | null>(null);

  // Deletion states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteIdea = async () => {
    setIsDeleting(true);
    try {
      await ideaService.deleteIdea(ideaId);
      toast.success('La propuesta ha sido eliminada.');
      wallEvents.emit('idea_deleted', { ideaId });
      onClose();
    } catch (err) {
      toast.error('No se pudo eliminar la propuesta.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Fetch Idea details if not provided
  useEffect(() => {
    if (initialIdea) {
      setIdea(initialIdea);
      return;
    }
    const fetchIdea = async () => {
      setLoadingIdea(true);
      try {
        const data = await ideaService.getIdeaById(ideaId);
        setIdea(data);
      } catch (err) {
        toast.error('No se pudo cargar el detalle de la propuesta.');
      } finally {
        setLoadingIdea(false);
      }
    };
    void fetchIdea();
  }, [ideaId, initialIdea]);

  // Fetch Evaluations breakdown when tab is active
  useEffect(() => {
    if (activeTab !== 'evaluaciones') return;
    if (evalData) return; // cache locally

    const fetchEval = async () => {
      setLoadingEval(true);
      try {
        const result = await evaluationService.getByIdea(ideaId);
        setEvalData(result);
        if (result.evaluations.length > 0) {
          setOpenJudgeId(result.evaluations[0].id);
        }
      } catch (err) {
        toast.error('No se pudo cargar el desglose de evaluaciones.');
      } finally {
        setLoadingEval(false);
      }
    };
    void fetchEval();
  }, [activeTab, ideaId, evalData]);

  // Fetch Comments when tab is active
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const result = await commentService.getComments({
        ideaId,
        includeReplies: true,
        limit: 100, // fetch all for management
      });
      // result.data.data contains comment items
      setFlatComments(result.data.data);
    } catch (err) {
      toast.error('No se pudo cargar los comentarios.');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'comentarios') return;
    void fetchComments();
  }, [activeTab, ideaId]);

  const toggleJudge = (evaluationId: string) => {
    setOpenJudgeId((current) => (current === evaluationId ? null : evaluationId));
  };

  const handleCommentModerated = (commentId: string) => {
    setSelectedCommentIdForMod(null);
    // Remove the moderated comment and all its children recursively from state
    const removeCommentAndReplies = (id: string, list: Comment[]): Comment[] => {
      let idsToRemove = new Set<string>([id]);
      let sizeBefore: number;
      do {
        sizeBefore = idsToRemove.size;
        list.forEach((item) => {
          if (item.parentCommentId && idsToRemove.has(item.parentCommentId)) {
            idsToRemove.add(item.id);
          }
        });
      } while (idsToRemove.size !== sizeBefore);

      return list.filter((item) => !idsToRemove.has(item.id));
    };

    setFlatComments((prev) => removeCommentAndReplies(commentId, prev));

    // Update locally the idea comments count
    if (idea) {
      setIdea((prev: any) => ({
        ...prev,
        commentsCount: Math.max(0, prev.commentsCount - 1),
      }));
    }
  };

  const commentTree = buildCommentTree(flatComments);

  const renderCommentTreeNode = (node: CommentTreeNode, depth = 0) => {
    const authorName =
      node.author?.nickname ||
      node.author?.displayName ||
      'Participante';
    const facultyName = (node.author as any)?.studentProfile?.faculty?.name;

    return (
      <CommentTreeNodeContainer key={node.id} $depth={depth}>
        <CommentRow>
          <CommentAvatar $url={node.author?.avatarUrl}>
            {!node.author?.avatarUrl && authorName[0]?.toUpperCase()}
          </CommentAvatar>
          <CommentContentCol>
            <CommentMeta>
              <div>
                <CommentAuthorName>{authorName}</CommentAuthorName>
                {facultyName && <CommentFaculty>({facultyName})</CommentFaculty>}
              </div>
              <CommentDate>{formatDate(node.createdAt)}</CommentDate>
            </CommentMeta>
            <CommentText>{node.content}</CommentText>
          </CommentContentCol>
          <CommentActionBtn
            type="button"
            $tooltipText="Moderar"
            $tooltipPosition="top"
            $tooltipAlign="center"
            onClick={() => setSelectedCommentIdForMod(node.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 14" className="svgIcon bin-top">
              <g clipPath="url(#clip0_35_24)">
                <path fill="black" d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z" />
              </g>
              <defs>
                <clipPath id="clip0_35_24">
                  <rect fill="white" height={14} width={69} />
                </clipPath>
              </defs>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 57" className="svgIcon bin-bottom">
              <g clipPath="url(#clip0_35_22)">
                <path fill="black" d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z" />
              </g>
              <defs>
                <clipPath id="clip0_35_22">
                  <rect fill="white" height={57} width={69} />
                </clipPath>
              </defs>
            </svg>
          </CommentActionBtn>
        </CommentRow>
        {node.replies &&
          node.replies.map((reply) => renderCommentTreeNode(reply, depth + 1))}
      </CommentTreeNodeContainer>
    );
  };

  const displayTitle = idea?.title || ideaTitle || 'Detalle de propuesta';
  const displaySubtitle = idea?.challenge?.title || '';

  return createPortal(
    <AdminModalOverlay onClick={onClose}>
      <AdminModalCard onClick={(e) => e.stopPropagation()}>
        <AdminAuditBanner>Gestión y Auditoría</AdminAuditBanner>

        <AdminModalHeader>
          <AdminHeaderContent>
            <AdminModalTitle>{displayTitle}</AdminModalTitle>
            {displaySubtitle && (
              <AdminModalSubtitle>{displaySubtitle}</AdminModalSubtitle>
            )}
          </AdminHeaderContent>
          <AdminCloseBtn type="button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </AdminCloseBtn>
        </AdminModalHeader>

        <AdminModalBody>
          <TabBar>
            <TabButton
              type="button"
              $active={activeTab === 'propuesta'}
              onClick={() => setActiveTab('propuesta')}
            >
              <Lightbulb size={16} />
              Propuesta
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'evaluaciones'}
              onClick={() => setActiveTab('evaluaciones')}
            >
              <Scale size={16} />
              Evaluaciones
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'comentarios'}
              onClick={() => setActiveTab('comentarios')}
            >
              <MessageSquare size={16} />
              Comentarios
            </TabButton>
          </TabBar>

          <TabContent key={activeTab}>
            {/* TABS 1: PROPUESTA */}
            {activeTab === 'propuesta' && (
              <>
                {loadingIdea ? (
                  <ModalContentSkeleton rows={5} />
                ) : !idea ? (
                  <EmptyState>No se encontró información de la propuesta.</EmptyState>
                ) : (
                  <>
                    <AdminSummaryGrid>
                      <AdminSummaryCard $accent={Pista8Theme.primary}>
                        <AdminSummaryValue $accent={Pista8Theme.primary}>
                          {idea.likesCount ?? idea.goodsCount ?? 0}
                        </AdminSummaryValue>
                        <AdminSummaryLabel>Likes</AdminSummaryLabel>
                      </AdminSummaryCard>
                      <AdminSummaryCard $accent={Pista8Theme.primary}>
                        <AdminSummaryValue $accent={Pista8Theme.primary}>
                          {idea.commentsCount ?? 0}
                        </AdminSummaryValue>
                        <AdminSummaryLabel>Comentarios</AdminSummaryLabel>
                      </AdminSummaryCard>
                      <AdminSummaryCard $accent={Pista8Theme.primary}>
                        <AdminSummaryValue $accent={Pista8Theme.primary}>
                          {idea.finalScore > 0 ? idea.finalScore.toFixed(1) : '—'}
                        </AdminSummaryValue>
                        <AdminSummaryLabel>Puntaje</AdminSummaryLabel>
                      </AdminSummaryCard>
                    </AdminSummaryGrid>

                    <AdminDetailSection>
                      <AdminDetailLabel>Estado</AdminDetailLabel>
                      <StatusBadge status={idea.status} label={STATUS_LABELS[idea.status] || idea.status} />
                    </AdminDetailSection>

                    <AdminDetailSection>
                      <AdminDetailLabel>Propuesta</AdminDetailLabel>
                      <AdminDetailText>
                        {(() => {
                          const prob = (idea.problem || '').trim();
                          const sol = (idea.solution || '').trim();
                          const isPlaceholder = prob.toLowerCase().startsWith('pendiente de descripcion');
                          if (isPlaceholder && sol) return sol;
                          if (prob === sol) return prob || sol;
                          if (prob && sol) return `${prob}\n\n${sol}`;
                          return prob || sol || 'Sin propuesta.';
                        })()}
                      </AdminDetailText>
                    </AdminDetailSection>

                    {idea.tags && idea.tags.length > 0 && (
                      <AdminDetailSection>
                        <AdminDetailLabel>Tags</AdminDetailLabel>
                        <AdminTagsRow>
                          {idea.tags.map((tag: string) => (
                            <AdminTag key={tag}>{tag}</AdminTag>
                          ))}
                        </AdminTagsRow>
                      </AdminDetailSection>
                    )}

                    <AdminDetailSection>
                      <AdminDetailLabel>Fecha de publicación</AdminDetailLabel>
                      <AdminDetailText>{formatDate(idea.createdAt)}</AdminDetailText>
                    </AdminDetailSection>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                      <DeleteIdeaButton type="button" onClick={() => setShowDeleteConfirm(true)}>
                        <p className="paragraph"> eliminar </p>
                        <span className="icon-wrapper">
                          <svg className="icon" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </DeleteIdeaButton>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TABS 2: EVALUACIONES */}
            {activeTab === 'evaluaciones' && (
              <>
                {idea && idea.challenge && idea.challenge.status !== 'EVALUATING' && idea.challenge.status !== 'CLOSED' ? (
                  <EmptyState>
                    Este reto todavía no finaliza por lo que no hay evaluaciones aún.
                  </EmptyState>
                ) : loadingEval ? (
                  <ModalContentSkeleton rows={5} />
                ) : !evalData || evalData.evaluations.length === 0 ? (
                  <EmptyState>
                    Esta idea aún no tiene evaluaciones de jueces registradas.
                  </EmptyState>
                ) : (
                  <>
                    <AdminSummaryGrid>
                      <AdminSummaryCard $accent={Pista8Theme.primary}>
                        <AdminSummaryValue $accent={Pista8Theme.primary}>
                          {evalData.summary.averageFinalScore.toFixed(2)}
                        </AdminSummaryValue>
                        <AdminSummaryLabel>Puntaje promedio</AdminSummaryLabel>
                      </AdminSummaryCard>
                      <AdminSummaryCard $accent={Pista8Theme.primary}>
                        <AdminSummaryValue $accent={Pista8Theme.primary}>
                          {evalData.summary.judgesCount}
                        </AdminSummaryValue>
                        <AdminSummaryLabel>Jueces evaluadores</AdminSummaryLabel>
                      </AdminSummaryCard>
                      <AdminSummaryCard $accent={Pista8Theme.primary}>
                        <AdminSummaryValue $accent={Pista8Theme.primary}>
                          {evalData.finalScore > 0
                            ? evalData.finalScore.toFixed(2)
                            : evalData.summary.averageFinalScore.toFixed(2)}
                        </AdminSummaryValue>
                        <AdminSummaryLabel>Nota consolidada</AdminSummaryLabel>
                      </AdminSummaryCard>
                    </AdminSummaryGrid>

                    {evalData.summary.criteriaAverages.length > 0 && (
                      <CriteriaSection>
                        <AdminSectionTitle>Promedio por criterio</AdminSectionTitle>
                        <AdminCriteriaGrid>
                          {evalData.summary.criteriaAverages.map((criterion) => (
                            <AdminCriteriaCard key={criterion.id}>
                              <AdminCriteriaValue>
                                {criterion.averageScore.toFixed(1)}/10
                              </AdminCriteriaValue>
                              <AdminCriteriaName>{criterion.name}</AdminCriteriaName>
                              <AdminCriteriaWeight>
                                Peso: {criterion.weight}%
                              </AdminCriteriaWeight>
                            </AdminCriteriaCard>
                          ))}
                        </AdminCriteriaGrid>
                      </CriteriaSection>
                    )}

                    <AdminSectionTitle style={{ textAlign: 'left', marginBottom: 12 }}>
                      Evaluaciones por juez
                    </AdminSectionTitle>
                    <AccordionList>
                      {evalData.evaluations.map((evaluation) => {
                        const isOpen = openJudgeId === evaluation.id;
                        const judgeName =
                          evaluation.judge.nickname ||
                          evaluation.judge.displayName ||
                          evaluation.judge.email.split('@')[0];

                        return (
                          <AccordionItem key={evaluation.id} $open={isOpen}>
                            <AccordionHeader
                              type="button"
                              onClick={() => toggleJudge(evaluation.id)}
                            >
                              <JudgeInfo>
                                <JudgeAvatar $url={evaluation.judge.avatarUrl}>
                                  {!evaluation.judge.avatarUrl && judgeName[0]?.toUpperCase()}
                                </JudgeAvatar>
                                <JudgeMeta>
                                  <JudgeName>{judgeName}</JudgeName>
                                  <JudgeEmail>{evaluation.judge.email}</JudgeEmail>
                                </JudgeMeta>
                              </JudgeInfo>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <JudgeScore>{evaluation.judgeScore.toFixed(2)}</JudgeScore>
                                <ChevronWrap $open={isOpen}>
                                  <ChevronDown size={18} />
                                </ChevronWrap>
                              </div>
                            </AccordionHeader>

                            {isOpen && (
                              <AccordionBody>
                                <ScoreGrid>
                                  {evaluation.scores.map((item) => (
                                    <ScoreCard key={item.criterion.id}>
                                      <ScoreCardName>{item.criterion.name}</ScoreCardName>
                                      <ScoreCardValue>{item.score}/10</ScoreCardValue>
                                      <ScoreCardWeight>
                                        Peso: {item.criterion.weight}%
                                      </ScoreCardWeight>
                                    </ScoreCard>
                                  ))}
                                </ScoreGrid>

                                <FeedbackBox>
                                  <FeedbackLabel>
                                    <MessageSquare size={13} style={{ marginRight: 4 }} />
                                    Retroalimentación · {formatDate(evaluation.createdAt)}
                                  </FeedbackLabel>
                                  <FeedbackText>
                                    {evaluation.feedback?.trim()
                                      ? evaluation.feedback
                                      : 'El juez no dejó comentarios adicionales.'}
                                  </FeedbackText>
                                </FeedbackBox>
                              </AccordionBody>
                            )}
                          </AccordionItem>
                        );
                      })}
                    </AccordionList>
                  </>
                )}
              </>
            )}

            {/* TABS 3: COMENTARIOS */}
            {activeTab === 'comentarios' && (
              <>
                {loadingComments ? (
                  <ModalContentSkeleton rows={5} />
                ) : commentTree.length === 0 ? (
                  <EmptyState>No hay comentarios publicados en esta propuesta.</EmptyState>
                ) : (
                  <CommentsList>
                    {commentTree.map((node) => renderCommentTreeNode(node, 0))}
                  </CommentsList>
                )}
              </>
            )}
          </TabContent>
        </AdminModalBody>
      </AdminModalCard>

      {showDeleteConfirm && (
        <ConfirmOverlay onClick={() => setShowDeleteConfirm(false)}>
          <ConfirmCard onClick={(e) => e.stopPropagation()}>
            <ConfirmIcon>
              <Trash2 size={24} color="#c62828" />
            </ConfirmIcon>
            <ConfirmTitle>¿Eliminar propuesta?</ConfirmTitle>
            <ConfirmBody>
              ¿Estás seguro de que deseas eliminar esta propuesta de forma permanente? Esta acción es irreversible.
            </ConfirmBody>
            <ConfirmActions>
              <ConfirmBtn type="button" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </ConfirmBtn>
              <ConfirmBtn
                type="button"
                $danger
                disabled={isDeleting}
                onClick={handleDeleteIdea}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </ConfirmBtn>
            </ConfirmActions>
          </ConfirmCard>
        </ConfirmOverlay>
      )}

      {selectedCommentIdForMod && (
        <CommentModerationModal
          commentId={selectedCommentIdForMod}
          onClose={() => setSelectedCommentIdForMod(null)}
          onConfirm={handleCommentModerated}
        />
      )}
    </AdminModalOverlay>,
    document.body,
  );
}
