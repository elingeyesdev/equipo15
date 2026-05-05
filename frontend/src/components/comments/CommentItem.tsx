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
  disabled?: boolean;
  actionDisabled?: boolean;
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
  position: relative;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(72, 80, 84, 0.2);
  background: transparent;
  color: #fe410a;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #fe410a08;
    border-color: #fe410a;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
  }

  &::after {
    content: 'Responder';
    position: absolute;
    bottom: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1f22;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #1a1f22;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
  }
`;

const EditButton = styled.button`
  position: relative;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(72, 80, 84, 0.2);
  background: transparent;
  color: #1976d2;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #1976d208;
    border-color: #1976d2;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
  }

  &::after {
    content: 'Editar';
    position: absolute;
    bottom: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1f22;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #1a1f22;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
  }
`;

const WithdrawButton = styled.button`
  position: relative;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(72, 80, 84, 0.2);
  background: transparent;
  color: #c62828;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #c6282808;
    border-color: #c62828;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  &::after {
    content: 'Borrar';
    position: absolute;
    bottom: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1f22;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #1a1f22;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
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

export const CommentItem = memo(({ comment, onReply, onEdit, onWithdraw, depth = 0, disabled = false, actionDisabled = false }: CommentItemProps) => {
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

        {!isDeleted && !isEditing && !disabled && (
          <HeaderActions>
            <ReplyButton type="button" onClick={() => setIsReplying((current) => !current)} disabled={actionDisabled || isSubmittingReply} title="Responder">
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 10l-5 5m0 0l5 5m-5-5h11a4 4 0 000-8h-1" />
              </svg>
            </ReplyButton>
            {comment.canEdit && (
              <EditButton type="button" onClick={() => setIsEditing((current) => !current)} disabled={actionDisabled || isSubmittingEdit} title="Editar">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </EditButton>
            )}
            {comment.canWithdraw && (
              <WithdrawButton type="button" onClick={handleWithdraw} disabled={actionDisabled || isWithdrawing} title="Borrar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6h-3.5l-1-1h-9l-1 1H5v2h14V6zM7 19a2 2 0 002 2h6a2 2 0 002-2V9H7v10zm2-8h2v6H9v-6zm4 0h2v6h-2v-6z" />
                </svg>
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
          isSubmitting={actionDisabled || isSubmittingEdit}
          disabled={disabled || actionDisabled}
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
          isSubmitting={actionDisabled || isSubmittingReply}
          disabled={disabled || actionDisabled}
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
              disabled={disabled}
              actionDisabled={actionDisabled}
            />
          ))}
        </Replies>
      )}
    </Item>
  );
});

export default CommentItem;