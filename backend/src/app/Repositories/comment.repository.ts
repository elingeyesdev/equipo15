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
      nickname: true,
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
      nickname: true,
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

  async findThreadByIdeaId(ideaId: string): Promise<Array<Pick<Comment, 'id' | 'parentCommentId' | 'status'>>> {
    return this.prisma.comment.findMany({
      where: { ideaId },
      select: {
        id: true,
        parentCommentId: true,
        status: true,
      },
    });
  }

  async softDeleteManyAndDecrementIdeaComments(input: {
    ideaId: string;
    commentIds: string[];
  }): Promise<void> {
    const visibleCount = await this.prisma.comment.count({
      where: {
        id: { in: input.commentIds },
        status: 'visible',
      },
    });

    if (visibleCount === 0) return;

    await this.prisma.$transaction([
      this.prisma.comment.updateMany({
        where: {
          id: { in: input.commentIds },
        },
        data: {
          status: 'deleted',
          deletedAt: new Date(),
        },
      }),
      this.prisma.idea.update({
        where: { id: input.ideaId },
        data: {
          commentsCount: { decrement: visibleCount },
        },
      }),
    ]);
  }

  async findLatestVisibleByAuthorInThread(params: {
    ideaId: string;
    authorId: string;
    parentCommentId?: string | null;
  }): Promise<Pick<Comment, 'content' | 'createdAt'> | null> {
    return this.prisma.comment.findFirst({
      where: {
        ideaId: params.ideaId,
        authorId: params.authorId,
        parentCommentId:
          params.parentCommentId === undefined ? null : params.parentCommentId,
        status: 'visible',
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        content: true,
        createdAt: true,
      },
    });
  }

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

  async updateCommentContent(id: string, content: string): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: {
        content,
        editedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
    });
  }

  async findByIdeaId(params: {
    ideaId: string;
    parentCommentId?: string | null;
    includeReplies?: boolean;
    skip?: number;
    take?: number;
    sort?: 'newest' | 'oldest';
  }): Promise<{ data: CommentListItem[]; total: number }> {
    const orderDirection = params.sort === 'oldest' ? 'asc' : 'desc';
    const where: Prisma.CommentWhereInput = {
      ideaId: params.ideaId,
      status: 'visible',
    };

    if (!params.includeReplies || params.parentCommentId !== undefined) {
      where.parentCommentId =
        params.parentCommentId === undefined ? null : params.parentCommentId;
    }

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