import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { EventsGateway } from '../Gateways/events.gateway';
import { CommentListItem, CommentRepository } from '../Repositories/comment.repository';
import { IdeaRepository } from '../Repositories/idea.repository';
import { UserRepository } from '../Repositories/user.repository';
import { GetCommentsQueryDto } from '../DTOs/get-comments-query.dto';
import {
  buildComparableCommentFingerprint,
  normalizeCommentContent,
} from '../Utils/comment-validation.util';

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

@Injectable()
export class CommentService {
  private readonly duplicateWindowMs = 30_000;

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly ideaRepository: IdeaRepository,
    private readonly userRepository: UserRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private ensureUserCanComment(isActive?: boolean) {
    if (isActive === false) {
      throw new BadRequestException('Tu cuenta está inactiva y no puede publicar comentarios.');
    }
  }

  private ensureIdeaAllowsComments(status: string) {
    if (status !== 'public' && status !== 'top5') {
      throw new BadRequestException('Solo se puede comentar en ideas publicadas.');
    }
  }

  private async ensureNoRecentDuplicateComment(input: {
    ideaId: string;
    authorId: string;
    parentCommentId?: string | null;
    normalizedContent: string;
  }): Promise<void> {
    const lastComment = await this.commentRepository.findLatestVisibleByAuthorInThread({
      ideaId: input.ideaId,
      authorId: input.authorId,
      parentCommentId: input.parentCommentId ?? null,
    });

    if (!lastComment) return;

    const isSameContent =
      buildComparableCommentFingerprint(lastComment.content) ===
      buildComparableCommentFingerprint(input.normalizedContent);

    const isInsideWindow =
      Date.now() - new Date(lastComment.createdAt).getTime() <= this.duplicateWindowMs;

    if (isSameContent && isInsideWindow) {
      throw new BadRequestException(
        'Detectamos un comentario duplicado reciente. Espera un momento antes de reenviar.',
      );
    }
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const user = await this.userRepository.findByUid(input.firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }
    this.ensureUserCanComment(user.isActive);

    const idea = await this.ideaRepository.findById(input.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea a la que intentas comentar no existe.');
    }
    this.ensureIdeaAllowsComments(idea.status);

    if (input.parentCommentId) {
      const parentComment = await this.commentRepository.findById(input.parentCommentId);
      if (!parentComment) {
        throw new NotFoundException('El comentario padre no existe.');
      }
      if (parentComment.ideaId !== input.ideaId) {
        throw new BadRequestException('El comentario padre no pertenece a la misma idea.');
      }
      if (parentComment.deletedAt) {
        throw new BadRequestException('No puedes responder a un comentario eliminado.');
      }
      if (parentComment.status !== 'visible') {
        throw new BadRequestException('No puedes responder a un comentario oculto.');
      }
    }

    const content = normalizeCommentContent(input.content, 'El comentario');

    await this.ensureNoRecentDuplicateComment({
      ideaId: input.ideaId,
      authorId: user.id,
      parentCommentId: input.parentCommentId ?? null,
      normalizedContent: content,
    });

    const createdComment = await this.commentRepository.createAndIncrementIdeaCount({
      content,
      ideaId: input.ideaId,
      authorId: user.id,
      parentCommentId: input.parentCommentId ?? null,
    });

    this.eventsGateway.server.emit('idea_commented', {
      challengeId: idea.challengeId,
      ideaId: idea.id,
    });

    return createdComment;
  }

  async replyToComment(input: ReplyCommentInput): Promise<Comment> {
    const user = await this.userRepository.findByUid(input.firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }
    this.ensureUserCanComment(user.isActive);

    const parentComment = await this.commentRepository.findById(input.parentCommentId);
    if (!parentComment) {
      throw new NotFoundException('El comentario al que intentas responder no existe.');
    }

    if (parentComment.deletedAt) {
      throw new BadRequestException('No puedes responder a un comentario eliminado.');
    }
    if (parentComment.status !== 'visible') {
      throw new BadRequestException('No puedes responder a un comentario oculto.');
    }

    const idea = await this.ideaRepository.findById(parentComment.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea asociada al comentario no existe.');
    }
    this.ensureIdeaAllowsComments(idea.status);

    const content = normalizeCommentContent(input.content, 'La respuesta');

    await this.ensureNoRecentDuplicateComment({
      ideaId: parentComment.ideaId,
      authorId: user.id,
      parentCommentId: parentComment.id,
      normalizedContent: content,
    });

    const createdComment = await this.commentRepository.createAndIncrementIdeaCount({
      content,
      ideaId: parentComment.ideaId,
      authorId: user.id,
      parentCommentId: parentComment.id,
    });

    this.eventsGateway.server.emit('idea_commented', {
      challengeId: idea.challengeId,
      ideaId: idea.id,
    });

    return createdComment;
  }

  async findComments(query: GetCommentsQueryDto): Promise<{ data: CommentListItem[]; total: number; page: number; limit: number }> {
    const idea = await this.ideaRepository.findById(query.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea solicitada no existe.');
    }
    this.ensureIdeaAllowsComments(idea.status);

    if (query.parentCommentId) {
      const parentComment = await this.commentRepository.findById(query.parentCommentId);
      if (!parentComment) {
        throw new NotFoundException('El comentario padre no existe.');
      }
      if (parentComment.ideaId !== query.ideaId) {
        throw new BadRequestException('El comentario padre no pertenece a la misma idea.');
      }
    }

    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const { data, total } = await this.commentRepository.findByIdeaId({
      ideaId: query.ideaId,
      parentCommentId: query.parentCommentId,
      skip,
      take: limit,
      sort: (query.sort === 'newest' || query.sort === 'oldest') ? query.sort : 'newest',
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}