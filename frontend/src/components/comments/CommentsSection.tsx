import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { commentService } from '../../services/comment.service';
import type { Comment } from '../../types/models';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentsSectionProps {
  ideaId: string;
  title?: string;
  onCountChange?: (count: number) => void;
  disabled?: boolean;
}

interface CommentTreeNode extends Comment {
  replies?: CommentTreeNode[];
}

interface FlatCommentNode extends Comment {
  replies: CommentTreeNode[];
}

const createTemporaryComment = (params: {
  ideaId: string;
  content: string;
  parentCommentId?: string | null;
}): CommentTreeNode => ({
  id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  ideaId: params.ideaId,
  authorId: 'current-user',
  parentCommentId: params.parentCommentId ?? null,
  content: params.content,
  status: 'visible',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: {
    id: 'current-user',
    displayName: 'Tu',
  },
  canWithdraw: true,
  replies: [],
});

const Wrapper = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Eyebrow = styled.span`
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #fe410a;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #1a1f22;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8a92a5;
  line-height: 1.5;
`;

const Meta = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #8a92a5;
  background: #f1f3f5;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
`;

const LoadingState = styled.div`
  padding: 18px;
  border-radius: 18px;
  background: rgba(72, 80, 84, 0.04);
  color: #8a92a5;
  font-size: 14px;
  font-weight: 600;
`;

const ErrorState = styled.div`
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 51, 51, 0.08);
  color: #c62828;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
`;

const SuccessState = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(46, 125, 50, 0.12);
  color: #2e7d32;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
`;

const FormCard = styled.div`
  padding: 18px;
  border-radius: 22px;
  background: white;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 12px 28px rgba(20, 25, 28, 0.05);
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  padding: 18px;
  border-radius: 18px;
  background: rgba(72, 80, 84, 0.04);
  color: #8a92a5;
  font-size: 14px;
  line-height: 1.6;
`;

const sortByCreatedAtAsc = (a: Comment, b: Comment) => {
  const aMs = new Date(a.createdAt).getTime();
  const bMs = new Date(b.createdAt).getTime();
  if (aMs === bMs) return a.id.localeCompare(b.id);
  return aMs - bMs;
};

const buildCommentTreeFromFlatList = (comments: Comment[]): CommentTreeNode[] => {
  const byId = new Map<string, FlatCommentNode>();
  const roots: CommentTreeNode[] = [];

  comments.forEach((comment) => {
    byId.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  const ordered = [...comments].sort(sortByCreatedAtAsc);

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

const appendReplyToTree = (
  nodes: CommentTreeNode[],
  parentId: string,
  reply: CommentTreeNode,
): CommentTreeNode[] => {
  let updated = false;

  const next = nodes.map((node) => {
    if (node.id === parentId) {
      updated = true;
      const replies = [...(node.replies ?? []), reply].sort(sortByCreatedAtAsc);
      return { ...node, replies };
    }

    if (node.replies?.length) {
      const nested = appendReplyToTree(node.replies, parentId, reply);
      if (nested !== node.replies) {
        updated = true;
        return { ...node, replies: nested };
      }
    }

    return node;
  });

  return updated ? next : nodes;
};

const replaceCommentInTree = (
  nodes: CommentTreeNode[],
  targetId: string,
  replacement: CommentTreeNode,
): CommentTreeNode[] =>
  nodes.map((node) => {
    if (node.id === targetId) {
      return { ...replacement, replies: replacement.replies ?? node.replies ?? [] };
    }

    if (node.replies?.length) {
      return { ...node, replies: replaceCommentInTree(node.replies, targetId, replacement) };
    }

    return node;
  });

const updateCommentInTree = (
  nodes: CommentTreeNode[],
  targetId: string,
  updates: Partial<CommentTreeNode>,
): CommentTreeNode[] =>
  nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, ...updates };
    }

    if (node.replies?.length) {
      return { ...node, replies: updateCommentInTree(node.replies, targetId, updates) };
    }

    return node;
  });

const removeCommentFromTree = (
  nodes: CommentTreeNode[],
  targetId: string,
): CommentTreeNode[] =>
  nodes
    .filter((node) => node.id !== targetId)
    .map((node) => {
      if (!node.replies?.length) return node;
      return { ...node, replies: removeCommentFromTree(node.replies, targetId) };
    });

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    if (Array.isArray(responseData?.message) && responseData.message.length > 0) {
      return responseData.message[0];
    }

    if (typeof responseData?.message === 'string' && responseData.message.trim().length > 0) {
      return responseData.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const countAllComments = (nodes: CommentTreeNode[]): number =>
  nodes.reduce((acc, node) => acc + 1 + countAllComments(node.replies ?? []), 0);

export const CommentsSection = ({
  ideaId,
  title = 'Comentarios',
  onCountChange,
  disabled = false,
}: CommentsSectionProps) => {
  const [comments, setComments] = useState<CommentTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  const loadComments = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const response = await commentService.getComments({
        ideaId,
        includeReplies: true,
        page: 1,
        limit: 500,
        sort: 'oldest',
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const tree = buildCommentTreeFromFlatList(response.data.data);
      setComments(tree);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const message = getErrorMessage(loadError, 'No se pudieron cargar los comentarios.');
      setError(message);
      setComments([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [ideaId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (!shouldScrollToEnd) return;

    requestAnimationFrame(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setShouldScrollToEnd(false);
    });
  }, [comments, shouldScrollToEnd]);

  const handleCreateComment = useCallback(async (content: string) => {
    setIsCreating(true);
    setSubmitSuccess(null);

    const optimisticComment = createTemporaryComment({
      ideaId,
      content,
    });

    setComments((prev) => [...prev, optimisticComment].sort(sortByCreatedAtAsc));
    setShouldScrollToEnd(true);

    try {
      const created = await commentService.createComment({ ideaId, content });
      const newComment: CommentTreeNode = {
        ...created.data,
        replies: [],
      };

      setComments((prev) => replaceCommentInTree(prev, optimisticComment.id, newComment));
      setSubmitSuccess('Comentario publicado correctamente.');
    } catch (submitError) {
      setComments((prev) => removeCommentFromTree(prev, optimisticComment.id));
      throw new Error(getErrorMessage(submitError, 'No se pudo publicar el comentario.'));
    } finally {
      setIsCreating(false);
    }
  }, [ideaId]);

  const handleReply = useCallback(async (commentId: string, content: string) => {
    setSubmitSuccess(null);

    const optimisticReply = createTemporaryComment({
      ideaId,
      content,
      parentCommentId: commentId,
    });

    setComments((prev) => appendReplyToTree(prev, commentId, optimisticReply));
    setShouldScrollToEnd(true);

    try {
      const created = await commentService.replyToComment(commentId, content, ideaId);
      const newReply: CommentTreeNode = {
        ...created.data,
        replies: [],
      };

      setComments((prev) => replaceCommentInTree(prev, optimisticReply.id, newReply));
      setSubmitSuccess('Respuesta publicada correctamente.');
    } catch (submitError) {
      setComments((prev) => removeCommentFromTree(prev, optimisticReply.id));
      throw new Error(getErrorMessage(submitError, 'No se pudo publicar la respuesta.'));
    }
  }, [ideaId]);

  const handleWithdraw = useCallback(async (commentId: string) => {
    setSubmitSuccess(null);

    const previous = comments;
    setComments((prev) => removeCommentFromTree(prev, commentId));

    try {
      await commentService.withdrawComment(commentId, ideaId);
      setSubmitSuccess('Comentario retirado correctamente.');
    } catch (withdrawError) {
      setComments(previous);
      throw new Error(getErrorMessage(withdrawError, 'No se pudo retirar el comentario.'));
    }
  }, [comments, ideaId]);

  const handleEditComment = useCallback(async (commentId: string, content: string) => {
    setSubmitSuccess(null);
    const originalComments = comments;

    setComments((prev) =>
      updateCommentInTree(prev, commentId, {
        content,
        editedAt: new Date().toISOString(),
      })
    );

    try {
      const updated = await commentService.updateComment(commentId, content, ideaId);

      setComments((prev) =>
        updateCommentInTree(prev, commentId, {
          content: updated.data.content,
          editedAt: updated.data.editedAt,
          updatedAt: updated.data.updatedAt,
        })
      );
      setSubmitSuccess('Comentario editado correctamente.');
    } catch (submitError) {
      setComments(originalComments);
      throw new Error(getErrorMessage(submitError, 'No se pudo editar el comentario.'));
    }
  }, [comments, ideaId]);

  const totalVisibleComments = useMemo(() => countAllComments(comments), [comments]);

  useEffect(() => {
    if (isLoading || error) {
      return;
    }

    onCountChange?.(totalVisibleComments);
  }, [totalVisibleComments, onCountChange, isLoading, error]);

  return (
    <Wrapper>
      <Header>
        <TitleBlock>
          <Eyebrow>Debate y feedback</Eyebrow>
          <Title>{title}</Title>
          <Subtitle>Comparte ideas, responde a otros usuarios y mantén la conversación ordenada.</Subtitle>
        </TitleBlock>

        <Meta>{totalVisibleComments} comentarios</Meta>
      </Header>

      {!disabled && (
        <FormCard>
          <CommentForm
            submitLabel="Publicar comentario"
            placeholder="Escribe un comentario sobre esta idea..."
            isSubmitting={isCreating}
            onSubmit={handleCreateComment}
          />
        </FormCard>
      )}

      {submitSuccess && <SuccessState>{submitSuccess}</SuccessState>}

      {isLoading && <LoadingState>Cargando comentarios...</LoadingState>}

      {!isLoading && error && <ErrorState>{error}</ErrorState>}

      {!isLoading && !error && comments.length === 0 && (
        <EmptyState>Aún no hay comentarios. Sé la primera persona en abrir la conversación.</EmptyState>
      )}

      {!isLoading && !error && comments.length > 0 && (
        <List>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEditComment}
              onWithdraw={handleWithdraw}
              disabled={disabled}
            />
          ))}
          <div ref={listEndRef} />
        </List>
      )}
    </Wrapper>
  );
};

export default CommentsSection;