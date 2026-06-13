import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Comment, UserRole } from '@prisma/client';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { ChallengeRepository } from '../challenge/challenge.repository';
import { CommentListItem, CommentRepository } from './comment.repository';
import { IdeaRepository } from '../idea/idea.repository';
import { UserRepository } from '../user/user.repository';
import { GetCommentsQueryDto } from './dtos/get-comments-query.dto';
import {
  buildComparableCommentFingerprint,
  normalizeCommentContent,
  COMMENT_CONTENT_RULES,
} from './utils/comment-validation.util';
import { ModerationService } from '../moderation/moderation.service';
import { NotificationService } from '../notification/notification.service';

export interface CreateCommentInput {
  content: string;
  ideaId: string;
  firebaseUid: string;
  parentCommentId?: string;
  clientIp?: string;
}

export interface ReplyCommentInput {
  content: string;
  firebaseUid: string;
  parentCommentId: string;
  clientIp?: string;
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
  private readonly logger = new Logger(CommentService.name);
  private readonly duplicateWindowMs = COMMENT_CONTENT_RULES.duplicateWindowMs;
  private readonly maxCommentsPerMinute =
    COMMENT_CONTENT_RULES.maxCommentsPerMinute;
  private readonly cooldownMs = COMMENT_CONTENT_RULES.cooldownMs;

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly ideaRepository: IdeaRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly redisService: RedisService,
    private readonly moderationService: ModerationService,
    private readonly notificationService: NotificationService,
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

  private ensureUserCanComment(status?: string) {
    if (status !== 'ACTIVE') {
      throw new BadRequestException(
        'Tu cuenta está inactiva y no puede publicar comentarios.',
      );
    }
  }

  private ensureIdeaAllowsComments(status: string) {
    const normalized = (status || '').toUpperCase();
    if (
      normalized !== 'PUBLISHED' &&
      normalized !== 'FINALIST' &&
      normalized !== 'PROPOSAL' &&
      status !== 'public' &&
      status !== 'top5'
    ) {
      throw new BadRequestException(
        'Solo se puede comentar en ideas publicadas o en propuesta.',
      );
    }
  }

  private async ensureChallengeNotClosed(challengeId: string): Promise<void> {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (challenge?.status === 'CLOSED') {
      throw new ForbiddenException(
        'Operación denegada. El reto ya ha finalizado y se encuentra en la biblioteca histórica',
      );
    }
  }

  private buildRateLimitKeys(userId: string, clientIp?: string): string[] {
    const keys = [`user:${userId}`];

    if (clientIp) {
      keys.push(`ip:${clientIp}`);
    }

    return keys;
  }

  private async assertRateLimitNotBlocked(keys: string[]): Promise<void> {
    const now = Date.now();

    for (const key of keys) {
      const blockedUntil = await this.redisService.get(
        `rate_limit_block:${key}`,
      );
      if (blockedUntil && blockedUntil > now) {
        const remainingSeconds = Math.ceil((blockedUntil - now) / 1000);
        throw new BadRequestException(
          `Estás comentando demasiado rápido. Espera ${remainingSeconds} segundos antes de volver a intentar.`,
        );
      }
    }
  }

  private async registerCommentAttempt(keys: string[]): Promise<void> {
    const now = Date.now();
    const windowStart = now - 60_000;

    for (const key of keys) {
      const history: number[] =
        (await this.redisService.get(`rate_limit_hist:${key}`)) || [];
      const recentHistory = history.filter(
        (timestamp) => timestamp > windowStart,
      );
      recentHistory.push(now);

      await this.redisService.set(
        `rate_limit_hist:${key}`,
        recentHistory,
        60_000,
      );

      const lastAttempt = recentHistory[recentHistory.length - 2];
      if (lastAttempt && now - lastAttempt < this.cooldownMs) {
        throw new BadRequestException(
          'Espera unos segundos antes de enviar otro comentario.',
        );
      }

      if (recentHistory.length > this.maxCommentsPerMinute) {
        await this.redisService.set(
          `rate_limit_block:${key}`,
          now + 60_000,
          60_000,
        );
        throw new BadRequestException(
          'Has enviado demasiados comentarios. Intenta de nuevo en un minuto.',
        );
      }
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
        if (node.parentCommentId === current && node.status === 'VISIBLE') {
          queue.push(node.id);
        }
      });
    }

    return Array.from(allIds);
  }

  private async ensureNoRecentDuplicateComment(input: {
    ideaId: string;
    authorId: string;
    normalizedContent: string;
  }): Promise<void> {
    const lastComment =
      await this.commentRepository.findLatestVisibleByAuthorOnIdea({
        ideaId: input.ideaId,
        authorId: input.authorId,
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
    const rateLimitKeys = this.buildRateLimitKeys(authorId, input.clientIp);
    await this.assertRateLimitNotBlocked(rateLimitKeys);

    const idea = await this.ideaRepository.findById(input.ideaId);
    if (!idea) {
      throw new NotFoundException(
        'La idea a la que intentas comentar no existe.',
      );
    }
    this.ensureIdeaAllowsComments(idea.status);
    await this.ensureChallengeNotClosed(idea.challengeId);

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
      if (parentComment.status !== 'VISIBLE') {
        throw new BadRequestException(
          'No puedes responder a un comentario oculto.',
        );
      }
    }

    const content = normalizeCommentContent(input.content, 'El comentario');
    await this.registerCommentAttempt(rateLimitKeys);

    await this.ensureNoRecentDuplicateComment({
      ideaId: input.ideaId,
      authorId,
      normalizedContent: content,
    });

    const createdComment =
      await this.commentRepository.createAndIncrementIdeaCount({
        content,
        ideaId: input.ideaId,
        authorId,
        parentCommentId: input.parentCommentId ?? null,
      });

    this.eventBus.emitToRoom(
      `challenge:${idea.challengeId}`,
      'idea_commented',
      {
        challengeId: idea.challengeId,
        ideaId: idea.id,
        commentsCount: idea.commentsCount + 1,
        delta: 1,
        authorId,
      },
    );

    try {
      if (input.parentCommentId) {
        const parentComment = await this.commentRepository.findById(input.parentCommentId);
        if (parentComment && parentComment.authorId !== authorId) {
          const replier = await this.userRepository.findById(authorId);
          const replierName = replier?.displayName || 'Un participante';
          await this.notificationService.notifyCommentReply(
            parentComment.authorId,
            replierName,
            idea.id,
          );
        }
      } else {
        if (idea.authorId !== authorId) {
          const challenge = await this.challengeRepository.findById(idea.challengeId);
          const challengeTitle = challenge?.title || 'un reto';
          await this.notificationService.notifyNewComment(
            idea.authorId,
            idea.id,
            challengeTitle,
          );
        }
      }
    } catch (err) {
      this.logger.error('Error sending comment notifications:', err);
    }

    return createdComment;
  }

  async replyToComment(input: ReplyCommentInput): Promise<Comment> {
    const authorId = await this.ensureUserCanWrite(input.firebaseUid);
    const rateLimitKeys = this.buildRateLimitKeys(authorId, input.clientIp);
    await this.assertRateLimitNotBlocked(rateLimitKeys);

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
    if (parentComment.status !== 'VISIBLE') {
      throw new BadRequestException(
        'No puedes responder a un comentario oculto.',
      );
    }

    const idea = await this.ideaRepository.findById(parentComment.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea asociada al comentario no existe.');
    }
    this.ensureIdeaAllowsComments(idea.status);
    await this.ensureChallengeNotClosed(idea.challengeId);

    const content = normalizeCommentContent(input.content, 'La respuesta');
    await this.registerCommentAttempt(rateLimitKeys);

    await this.ensureNoRecentDuplicateComment({
      ideaId: parentComment.ideaId,
      authorId,
      normalizedContent: content,
    });

    const createdComment =
      await this.commentRepository.createAndIncrementIdeaCount({
        content,
        ideaId: parentComment.ideaId,
        authorId,
        parentCommentId: parentComment.id,
      });

    this.eventBus.emitToRoom(
      `challenge:${idea.challengeId}`,
      'idea_commented',
      {
        challengeId: idea.challengeId,
        ideaId: idea.id,
        commentsCount: idea.commentsCount + 1,
        delta: 1,
        authorId,
      },
    );

    try {
      if (parentComment.authorId !== authorId) {
        const replier = await this.userRepository.findById(authorId);
        const replierName = replier?.displayName || 'Un participante';
        await this.notificationService.notifyCommentReply(
          parentComment.authorId,
          replierName,
          idea.id,
        );
      }
    } catch (err) {
      this.logger.error('Error sending reply notification:', err);
    }

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

    if (comment.status !== 'VISIBLE') {
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
    if (challenge.status === 'CLOSED') {
      throw new ForbiddenException(
        'Operación denegada. El reto ya ha finalizado y se encuentra en la biblioteca histórica',
      );
    }

    const requesterRole = requester.role ?? UserRole.USER;
    const isAuthor = requester.id === comment.authorId;
    const isAdmin = requesterRole === UserRole.ADMIN;
    const isCompanyOwnerOfChallenge =
      requesterRole === UserRole.COMPANY && requester.id === challenge.authorId;

    if (!isAuthor && !isAdmin && !isCompanyOwnerOfChallenge) {
      throw new ForbiddenException(
        'No tienes permiso para retirar este comentario.',
      );
    }

    const thread = await this.commentRepository.findThreadByIdeaId(
      comment.ideaId,
    );
    const visibleNodes = thread
      .filter((node) => node.status === 'VISIBLE')
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

    this.eventBus.emitToRoom(
      `challenge:${idea.challengeId}`,
      'idea_commented',
      {
        challengeId: idea.challengeId,
        ideaId: idea.id,
        commentsCount: Math.max(0, idea.commentsCount - idsToRemove.length),
        delta: -idsToRemove.length,
        authorId: requester.id,
      },
    );

    if (isAuthor) {
      this.moderationService
        .trackCommentAction(requester.id)
        .catch((err) => {});
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

    if (comment.status !== 'VISIBLE') {
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
    await this.ensureChallengeNotClosed(idea.challengeId);

    const content = normalizeCommentContent(input.content, 'El comentario');

    const updatedComment = await this.commentRepository.updateCommentContent(
      input.commentId,
      content,
    );

    this.eventBus.emitToRoom(
      `challenge:${idea.challengeId}`,
      'idea_commented',
      {
        challengeId: idea.challengeId,
        ideaId: idea.id,
        commentsCount: idea.commentsCount,
        delta: 0,
      },
    );

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
        requesterRole = requester.role ?? 'student';
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
