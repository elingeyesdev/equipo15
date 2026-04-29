import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Comment } from '@prisma/client';
import { EventsGateway } from '../gateways/events.gateway';
import { ChallengeRepository } from '../repositories/challenge.repository';
import {
  CommentListItem,
  CommentRepository,
} from '../repositories/comment.repository';
import { IdeaRepository } from '../repositories/idea.repository';
import { UserRepository } from '../repositories/user.repository';
import { GetCommentsQueryDto } from '../dtos/get-comments-query.dto';
import {
  buildComparableCommentFingerprint,
  normalizeCommentContent,
} from '../utils/comment-validation.util';
import { ModerationService } from './moderation.service';

export interface CreateCommentInput {
  content: string;
  ideaId: string;
  firebaseUid: string;
  parentCommentId?: string;
}

export interface ReplyCommentInput {
  content: string;
  firebaseUid: string;
  parentCommentId: string;
}

export interface WithdrawCommentInput {
  commentId: string;
  firebaseUid: string;
}

export interface UpdateCommentInput {
  commentId: string;
  content: string;
  firebaseUid: string;
}

@Injectable()
export class CommentService {
  private readonly duplicateWindowMs = 30_000;

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly ideaRepository: IdeaRepository,
    private readonly userRepository: UserRepository,
    private readonly eventsGateway: EventsGateway,
    private readonly moderationService: ModerationService,
  ) {}

  private async ensureUserCanWrite(firebaseUid: string): Promise<string> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Tu cuenta está en modo solo lectura durante la sanción.',
      );
    }

    return user.id;
  }

  private ensureUserCanComment(isActive?: boolean) {
    if (isActive === false) {
      throw new BadRequestException(
        'Tu cuenta está inactiva y no puede publicar comentarios.',
      );
    }
  }

  private ensureIdeaAllowsComments(status: string) {
    if (status !== 'public' && status !== 'top5') {
      throw new BadRequestException(
        'Solo se puede comentar en ideas publicadas.',
      );
    }
  }

  private collectSubtreeCommentIds(input: {
    targetId: string;
    ideaId: string;
    nodes: Array<{
      id: string;
      parentCommentId: string | null;
      status: string;
    }>;
  }): string[] {
    const allIds = new Set<string>();
    const queue = [input.targetId];

    while (queue.length > 0) {
      const current = queue.shift() as string;
      if (allIds.has(current)) continue;
      allIds.add(current);

      input.nodes.forEach((node) => {
        if (node.parentCommentId === current && node.status === 'visible') {
          queue.push(node.id);
        }
      });
    }

    return Array.from(allIds);
  }

  private async ensureNoRecentDuplicateComment(input: {
    ideaId: string;
    authorId: string;
    parentCommentId?: string | null;
    normalizedContent: string;
  }): Promise<void> {
    const lastComment =
      await this.commentRepository.findLatestVisibleByAuthorInThread({
        ideaId: input.ideaId,
        authorId: input.authorId,
        parentCommentId: input.parentCommentId ?? null,
      });

    if (!lastComment) return;

    const isSameContent =
      buildComparableCommentFingerprint(lastComment.content) ===
      buildComparableCommentFingerprint(input.normalizedContent);

    const isInsideWindow =
      Date.now() - new Date(lastComment.createdAt).getTime() <=
      this.duplicateWindowMs;

    if (isSameContent && isInsideWindow) {
      throw new BadRequestException(
        'Detectamos un comentario duplicado reciente. Espera un momento antes de reenviar.',
      );
    }
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const authorId = await this.ensureUserCanWrite(input.firebaseUid);

    const idea = await this.ideaRepository.findById(input.ideaId);
    if (!idea) {
      throw new NotFoundException(
        'La idea a la que intentas comentar no existe.',
      );
    }
    this.ensureIdeaAllowsComments(idea.status);

    if (input.parentCommentId) {
      const parentComment = await this.commentRepository.findById(
        input.parentCommentId,
      );
      if (!parentComment) {
        throw new NotFoundException('El comentario padre no existe.');
      }
      if (parentComment.ideaId !== input.ideaId) {
        throw new BadRequestException(
          'El comentario padre no pertenece a la misma idea.',
        );
      }
      if (parentComment.deletedAt) {
        throw new BadRequestException(
          'No puedes responder a un comentario eliminado.',
        );
      }
      if (parentComment.status !== 'visible') {
        throw new BadRequestException(
          'No puedes responder a un comentario oculto.',
        );
      }
    }

    const content = normalizeCommentContent(input.content, 'El comentario');

    await this.ensureNoRecentDuplicateComment({
      ideaId: input.ideaId,
      authorId,
      parentCommentId: input.parentCommentId ?? null,
      normalizedContent: content,
    });

    const createdComment =
      await this.commentRepository.createAndIncrementIdeaCount({
        content,
        ideaId: input.ideaId,
        authorId,
        parentCommentId: input.parentCommentId ?? null,
      });

    this.eventsGateway.server.emit('idea_commented', {
      challengeId: idea.challengeId,
      ideaId: idea.id,
    });

    return createdComment;
  }

  async replyToComment(input: ReplyCommentInput): Promise<Comment> {
    const authorId = await this.ensureUserCanWrite(input.firebaseUid);

    const parentComment = await this.commentRepository.findById(
      input.parentCommentId,
    );
    if (!parentComment) {
      throw new NotFoundException(
        'El comentario al que intentas responder no existe.',
      );
    }

    if (parentComment.deletedAt) {
      throw new BadRequestException(
        'No puedes responder a un comentario eliminado.',
      );
    }
    if (parentComment.status !== 'visible') {
      throw new BadRequestException(
        'No puedes responder a un comentario oculto.',
      );
    }

    const idea = await this.ideaRepository.findById(parentComment.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea asociada al comentario no existe.');
    }
    this.ensureIdeaAllowsComments(idea.status);

    const content = normalizeCommentContent(input.content, 'La respuesta');

    await this.ensureNoRecentDuplicateComment({
      ideaId: parentComment.ideaId,
      authorId,
      parentCommentId: parentComment.id,
      normalizedContent: content,
    });

    const createdComment =
      await this.commentRepository.createAndIncrementIdeaCount({
        content,
        ideaId: parentComment.ideaId,
        authorId,
        parentCommentId: parentComment.id,
      });

    this.eventsGateway.server.emit('idea_commented', {
      challengeId: idea.challengeId,
      ideaId: idea.id,
    });

    return createdComment;
  }

  async withdrawComment(
    input: WithdrawCommentInput,
  ): Promise<{ success: boolean; removedCount: number }> {
    const requester = await this.userRepository.findByUid(input.firebaseUid);
    if (!requester) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }

    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('El comentario no existe.');
    }

    if (comment.status !== 'visible') {
      throw new BadRequestException('El comentario ya no está visible.');
    }

    const idea = await this.ideaRepository.findById(comment.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea asociada al comentario no existe.');
    }

    const challenge = await this.challengeRepository.findById(idea.challengeId);
    if (!challenge) {
      throw new NotFoundException('El reto asociado a la idea no existe.');
    }

    const requesterRole =
      (requester as unknown as { role?: { name: string } })?.role?.name ??
      'student';
    const isAuthor = requester.id === comment.authorId;
    const isAdmin = requesterRole === 'admin';
    const isCompanyOwnerOfChallenge =
      requesterRole === 'company' && requester.id === challenge.authorId;

    if (!isAuthor && !isAdmin && !isCompanyOwnerOfChallenge) {
      throw new ForbiddenException(
        'No tienes permiso para retirar este comentario.',
      );
    }

    const thread = await this.commentRepository.findThreadByIdeaId(
      comment.ideaId,
    );
    const visibleNodes = thread
      .filter((node) => node.status === 'visible')
      .map((node) => ({
        id: node.id,
        parentCommentId: node.parentCommentId ?? null,
        status: node.status,
      }));

    const idsToRemove = this.collectSubtreeCommentIds({
      targetId: comment.id,
      ideaId: comment.ideaId,
      nodes: visibleNodes,
    });

    await this.commentRepository.softDeleteManyAndDecrementIdeaComments({
      ideaId: comment.ideaId,
      commentIds: idsToRemove,
    });

    this.eventsGateway.server.emit('idea_commented', {
      challengeId: idea.challengeId,
      ideaId: idea.id,
    });

    // If the requester removed their own comment, track for moderation penalties
    if (isAuthor) {
      this.moderationService.trackCommentAction(requester.id).catch((err) => {
        // don't block the response if moderation tracking fails
      });
    }

    return {
      success: true,
      removedCount: idsToRemove.length,
    };
  }

  async updateComment(input: UpdateCommentInput): Promise<Comment> {
    const requester = await this.userRepository.findByUid(input.firebaseUid);
    if (!requester) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }

    if (requester.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Tu cuenta está en modo solo lectura durante la sanción.',
      );
    }

    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('El comentario no existe.');
    }

    if (comment.status !== 'visible') {
      throw new BadRequestException(
        'Solo se pueden editar comentarios visibles.',
      );
    }

    if (comment.authorId !== requester.id) {
      throw new ForbiddenException(
        'No tienes permiso para editar este comentario.',
      );
    }

    const idea = await this.ideaRepository.findById(comment.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea asociada al comentario no existe.');
    }
    this.ensureIdeaAllowsComments(idea.status);

    const content = normalizeCommentContent(input.content, 'El comentario');

    const updatedComment = await this.commentRepository.updateCommentContent(
      input.commentId,
      content,
    );

    this.eventsGateway.server.emit('idea_commented', {
      challengeId: idea.challengeId,
      ideaId: idea.id,
    });

    // Track edits for moderation penalties (only authors can edit)
    this.moderationService.trackCommentAction(requester.id).catch(() => {});

    return updatedComment;
  }

  async findComments(
    query: GetCommentsQueryDto,
    requesterFirebaseUid?: string,
  ): Promise<{
    data: Array<CommentListItem & { canWithdraw: boolean; canEdit: boolean }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const idea = await this.ideaRepository.findById(query.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea solicitada no existe.');
    }
    this.ensureIdeaAllowsComments(idea.status);

    if (query.parentCommentId) {
      const parentComment = await this.commentRepository.findById(
        query.parentCommentId,
      );
      if (!parentComment) {
        throw new NotFoundException('El comentario padre no existe.');
      }
      if (parentComment.ideaId !== query.ideaId) {
        throw new BadRequestException(
          'El comentario padre no pertenece a la misma idea.',
        );
      }
    }

    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const { data, total } = await this.commentRepository.findByIdeaId({
      ideaId: query.ideaId,
      parentCommentId: query.parentCommentId,
      includeReplies: query.includeReplies,
      skip,
      take: limit,
      sort:
        query.sort === 'newest' || query.sort === 'oldest'
          ? query.sort
          : 'newest',
    });

    let requesterId: string | undefined;
    let requesterRole = 'student';

    const challenge = await this.challengeRepository.findById(idea.challengeId);
    if (!challenge) {
      throw new NotFoundException('El reto asociado a la idea no existe.');
    }

    if (requesterFirebaseUid) {
      const requester =
        await this.userRepository.findByUid(requesterFirebaseUid);
      if (requester) {
        requesterId = requester.id;
        requesterRole =
          (requester as unknown as { role?: { name: string } })?.role?.name ??
          'student';
      }
    }

    const canCompanyWithdraw =
      requesterRole === 'company' && requesterId === challenge.authorId;
    const canAdminWithdraw = requesterRole === 'admin';

    const dataWithPermissions = data.map((comment) => ({
      ...comment,
      canWithdraw:
        !!requesterId &&
        (comment.authorId === requesterId ||
          canAdminWithdraw ||
          canCompanyWithdraw),
      canEdit: !!requesterId && comment.authorId === requesterId,
    }));

    return {
      data: dataWithPermissions,
      total,
      page,
      limit,
    };
  }
}
