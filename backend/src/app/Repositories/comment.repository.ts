import { Injectable } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from '../Providers/database.service';

export interface CreateCommentData {
  content: string;
  ideaId: string;
  authorId: string;
  parentCommentId?: string | null;
}

const commentInclude = {
  author: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      facultyId: true,
    },
  },
} as const;

const commentListSelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  content: true,
  ideaId: true,
  authorId: true,
  parentCommentId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  editedAt: true,
  deletedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      facultyId: true,
    },
  },
});

export type CommentListItem = Prisma.CommentGetPayload<{
  select: typeof commentListSelect;
}>;

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAndIncrementIdeaCount(data: CreateCommentData) {
    const [createdComment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          content: data.content,
          ideaId: data.ideaId,
          authorId: data.authorId,
          parentCommentId: data.parentCommentId ?? null,
        },
        include: commentInclude,
      }),
      this.prisma.idea.update({
        where: { id: data.ideaId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return createdComment;
  }

  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
    });
  }

  async findByIdeaId(params: {
    ideaId: string;
    parentCommentId?: string | null;
    skip?: number;
    take?: number;
    sort?: 'newest' | 'oldest';
  }): Promise<{ data: CommentListItem[]; total: number }> {
    const orderDirection = params.sort === 'oldest' ? 'asc' : 'desc';
    const where: Prisma.CommentWhereInput = {
      ideaId: params.ideaId,
      status: 'visible',
      parentCommentId:
        params.parentCommentId === undefined ? null : params.parentCommentId,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ createdAt: orderDirection }, { id: orderDirection }],
        select: commentListSelect,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return { data, total };
  }
}