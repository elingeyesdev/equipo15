import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { commentService } from '../../services/comment.service';
import type { Comment } from '../../types/models';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentsSectionProps {
  ideaId: string;
  title?: string;
}

interface CommentTreeNode extends Comment {
  replies?: CommentTreeNode[];
}

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

const buildCommentTree = async (
  ideaId: string,
  parentCommentId?: string,
): Promise<CommentTreeNode[]> => {
  const response = await commentService.getComments({
    ideaId,
    parentCommentId,
    page: 1,
    limit: 100,
    sort: 'oldest',
  });

  const nodes: CommentTreeNode[] = response.data.data;

  return Promise.all(
    nodes.map(async (comment) => ({
      ...comment,
      replies: await buildCommentTree(ideaId, comment.id),
    })),
  );
};

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

export const CommentsSection = ({ ideaId, title = 'Comentarios' }: CommentsSectionProps) => {
  const [comments, setComments] = useState<CommentTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    const loadComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const tree = await buildCommentTree(ideaId);
        if (active) {
          setComments(tree);
          if (shouldScrollToEnd) {
            requestAnimationFrame(() => {
              listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
              setShouldScrollToEnd(false);
            });
          }
        }
      } catch (loadError) {
        if (!active) return;

        const message = getErrorMessage(loadError, 'No se pudieron cargar los comentarios.');

        setError(message);
        setComments([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadComments();

    return () => {
      active = false;
    };
  }, [ideaId, reloadToken]);

  const handleCreateComment = async (content: string) => {
    setIsCreating(true);
    setSubmitSuccess(null);

    try {
      await commentService.createComment({ ideaId, content });
      setSubmitSuccess('Comentario publicado correctamente.');
      setShouldScrollToEnd(true);
      setReloadToken((current) => current + 1);
    } catch (submitError) {
      throw new Error(getErrorMessage(submitError, 'No se pudo publicar el comentario.'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    setSubmitSuccess(null);
    try {
      await commentService.replyToComment(commentId, content);
      setSubmitSuccess('Respuesta publicada correctamente.');
      setShouldScrollToEnd(true);
      setReloadToken((current) => current + 1);
    } catch (submitError) {
      throw new Error(getErrorMessage(submitError, 'No se pudo publicar la respuesta.'));
    }
  };

  const totalVisibleComments = useMemo(() => countAllComments(comments), [comments]);

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

      <FormCard>
        <CommentForm
          submitLabel="Publicar comentario"
          placeholder="Escribe un comentario sobre esta idea..."
          isSubmitting={isCreating}
          onSubmit={handleCreateComment}
        />
      </FormCard>

      {submitSuccess && <SuccessState>{submitSuccess}</SuccessState>}

      {isLoading && <LoadingState>Cargando comentarios...</LoadingState>}

      {!isLoading && error && <ErrorState>{error}</ErrorState>}

      {!isLoading && !error && comments.length === 0 && (
        <EmptyState>Aún no hay comentarios. Sé la primera persona en abrir la conversación.</EmptyState>
      )}

      {!isLoading && !error && comments.length > 0 && (
        <List>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
          ))}
          <div ref={listEndRef} />
        </List>
      )}
    </Wrapper>
  );
};

export default CommentsSection;