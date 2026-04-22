import { useState } from 'react';
import styled from 'styled-components';
import type { Comment } from '../../types/models';
import CommentForm from './CommentForm';
import { resolveDisplayName } from '../../utils/user.utils';

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void> | void;
  depth?: number;
}

const Item = styled.article<{ $depth: number }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  background: ${({ $depth }) => ($depth > 0 ? 'rgba(72, 80, 84, 0.03)' : 'white')};
  border: 1px solid rgba(72, 80, 84, 0.08);
  margin-left: ${({ $depth }) => $depth * 18}px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const AuthorBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AuthorName = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #1a1f22;
`;

const Meta = styled.span`
  font-size: 11px;
  color: #8a92a5;
  font-weight: 600;
`;

const Content = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #485054;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ReplyButton = styled.button`
  border: 0;
  background: transparent;
  color: #fe410a;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Replies = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DeletedContent = styled.em`
  color: #8a92a5;
  font-size: 14px;
`;

export const CommentItem = ({ comment, onReply, depth = 0 }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleReply = async (content: string) => {
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, content);
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const isDeleted = comment.status === 'deleted';
  const authorName = resolveDisplayName(comment.author);
  const createdAt = new Date(comment.createdAt);

  return (
    <Item $depth={depth}>
      <Header>
        <AuthorBlock>
          <AuthorName>{authorName}</AuthorName>
          <Meta>{createdAt.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}</Meta>
        </AuthorBlock>

        {!isDeleted && (
          <ReplyButton type="button" onClick={() => setIsReplying((current) => !current)}>
            Responder
          </ReplyButton>
        )}
      </Header>

      {isDeleted ? <DeletedContent>Este comentario fue eliminado.</DeletedContent> : <Content>{comment.content}</Content>}

      {isReplying && !isDeleted && (
        <CommentForm
          submitLabel="Responder"
          placeholder="Escribe tu respuesta..."
          isSubmitting={isSubmittingReply}
          onSubmit={handleReply}
          onCancel={() => setIsReplying(false)}
        />
      )}

      {!!comment.replies?.length && (
        <Replies>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </Replies>
      )}
    </Item>
  );
};

export default CommentItem;