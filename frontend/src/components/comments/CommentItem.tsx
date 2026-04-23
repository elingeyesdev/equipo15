import { memo, useState } from 'react';
import styled from 'styled-components';
import type { Comment } from '../../types/models';
import CommentForm from './CommentForm';
import { resolveDisplayName } from '../../utils/user.utils';

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void> | void;
  onEdit: (commentId: string, content: string) => Promise<void> | void;
  onWithdraw: (commentId: string) => Promise<void> | void;
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

const EditButton = styled.button`
  border: 0;
  background: transparent;
  color: #1976d2;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const WithdrawButton = styled.button`
  border: 0;
  background: transparent;
  color: #c62828;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

export const CommentItem = memo(({ comment, onReply, onEdit, onWithdraw, depth = 0 }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleReply = async (content: string) => {
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, content);
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEdit = async (content: string) => {
    setIsSubmittingEdit(true);
    try {
      await onEdit(comment.id, content);
      setIsEditing(false);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const isDeleted = comment.status === 'deleted';
  const authorName = resolveDisplayName(comment.author);
  const createdAt = new Date(comment.createdAt);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await onWithdraw(comment.id);
    } finally {
      setIsWithdrawing(false);
      setIsReplying(false);
    }
  };

  return (
    <Item $depth={depth}>
      <Header>
        <AuthorBlock>
          <AuthorName>{authorName}</AuthorName>
          <Meta>{createdAt.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}</Meta>
        </AuthorBlock>

        {!isDeleted && !isEditing && (
          <HeaderActions>
            <ReplyButton type="button" onClick={() => setIsReplying((current) => !current)}>
              Responder
            </ReplyButton>
            {comment.canEdit && (
              <EditButton type="button" onClick={() => setIsEditing((current) => !current)}>
                Editar
              </EditButton>
            )}
            {comment.canWithdraw && (
              <WithdrawButton type="button" onClick={handleWithdraw} disabled={isWithdrawing}>
                {isWithdrawing ? 'Retirando...' : 'Retirar'}
              </WithdrawButton>
            )}
          </HeaderActions>
        )}
      </Header>

      {isDeleted ? (
        <DeletedContent>Este comentario fue eliminado.</DeletedContent>
      ) : isEditing ? (
        <CommentForm
          submitLabel="Guardar cambios"
          cancelLabel="Cancelar"
          initialContent={comment.content}
          isSubmitting={isSubmittingEdit}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <Content>
          {comment.content}
          {comment.editedAt && <span style={{ color: '#8a92a5', fontSize: '11px', marginLeft: '6px' }}>(editado)</span>}
        </Content>
      )}

      {isReplying && !isDeleted && !isEditing && (
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
              onEdit={onEdit}
              onWithdraw={onWithdraw}
              depth={depth + 1}
            />
          ))}
        </Replies>
      )}
    </Item>
  );
});

export default CommentItem;