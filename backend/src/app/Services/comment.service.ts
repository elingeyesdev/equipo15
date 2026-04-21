import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { EventsGateway } from '../Gateways/events.gateway';
import { CommentListItem, CommentRepository } from '../Repositories/comment.repository';
import { IdeaRepository } from '../Repositories/idea.repository';
import { UserRepository } from '../Repositories/user.repository';
import { GetCommentsQueryDto } from '../DTOs/get-comments-query.dto';
import { normalizeCommentContent } from '../Utils/comment-validation.util';

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
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly ideaRepository: IdeaRepository,
    private readonly userRepository: UserRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const user = await this.userRepository.findByUid(input.firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }

    const idea = await this.ideaRepository.findById(input.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea a la que intentas comentar no existe.');
    }

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
    }

    const content = normalizeCommentContent(input.content, 'El comentario');

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

    const parentComment = await this.commentRepository.findById(input.parentCommentId);
    if (!parentComment) {
      throw new NotFoundException('El comentario al que intentas responder no existe.');
    }

    if (parentComment.deletedAt) {
      throw new BadRequestException('No puedes responder a un comentario eliminado.');
    }

    const idea = await this.ideaRepository.findById(parentComment.ideaId);
    if (!idea) {
      throw new NotFoundException('La idea asociada al comentario no existe.');
    }

    const content = normalizeCommentContent(input.content, 'La respuesta');

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