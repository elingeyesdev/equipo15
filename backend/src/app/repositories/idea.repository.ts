import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/database.service';
import { Idea, Prisma } from '@prisma/client';

interface IdeaWhereInput {
  challengeId?: string;
  status?: string;
}

export interface IdeaWithVoteStatus extends Idea {
  hasVoted: boolean;
}

@Injectable()
export class IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    skip?: number,
    take?: number,
    challengeId?: string,
  ): Promise<{ data: Idea[]; total: number }> {
    const where: IdeaWhereInput = {};
    if (challengeId) where.challengeId = challengeId;

    const [data, total] = await Promise.all([
      this.prisma.idea.findMany({
        where,
        skip,
        take,
        include: {
          author: {
            select: {
              displayName: true,
              nickname: true,
              role: true,
              facultyId: true,
            },
          },
          challenge: true,
        },
      }),
      this.prisma.idea.count({ where }),
    ]);
    return { data, total };
  }

  async findPublic(
    skip?: number,
    take?: number,
    challengeId?: string,
    userId?: string,
    search?: string,
    sort?: 'newest' | 'oldest' | 'likes' | 'comments',
  ): Promise<{ data: IdeaWithVoteStatus[]; total: number }> {
    const where: any = { status: 'public' };
    if (challengeId) where.challengeId = challengeId;

    if (search && search.trim().length > 0) {
      const keyword = search.trim();
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { problem: { contains: keyword, mode: 'insensitive' } },
        { solution: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'>;
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'likes':
        orderBy = { likesCount: 'desc' };
        break;
      case 'comments':
        orderBy = { commentsCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const data = await this.prisma.idea.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        title: true,
        problem: true,
        solution: true,
        status: true,
        likesCount: true,
        commentsCount: true,
        isAnonymous: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        challengeId: true,
        votesCount: true,
        author: {
          select: {
            displayName: true,
            nickname: true,
            email: true,
            facultyId: true,
            phone: true,
            studentCode: true,
            role: { select: { name: true } },
          },
        },
        challenge: { select: { status: true } },
        ...(userId
          ? { ideaLikes: { where: { userId }, select: { id: true } } }
          : {}),
      },
    });

    const enriched: IdeaWithVoteStatus[] = data.map((idea) => {
      const { ideaLikes, ...rest } = idea as any;
      return {
        ...rest,
        hasVoted: Array.isArray(ideaLikes) && ideaLikes.length > 0,
      } as IdeaWithVoteStatus;
    });

    return { data: enriched, total: enriched.length };
  }

  async findById(id: string): Promise<Idea | null> {
    return this.prisma.idea.findUnique({
      where: { id },
      include: {
        author: true,
        challenge: true,
      },
    });
  }

  async create(
    data: Prisma.IdeaCreateInput | Prisma.IdeaUncheckedCreateInput,
  ): Promise<Idea> {
    return this.prisma.idea.create({
      data: data as Prisma.IdeaUncheckedCreateInput,
    });
  }

  async update(id: string, data: Prisma.IdeaUpdateInput): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data,
    });
  }

  async checkUserLike(ideaId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.ideaLike.count({
      where: { ideaId, userId },
    });
    return count > 0;
  }

  async registerLikeAndIncrement(
    ideaId: string,
    userId: string,
  ): Promise<Idea> {
    const [, updated] = await this.prisma.$transaction([
      this.prisma.ideaLike.create({
        data: { ideaId, userId },
      }),
      this.prisma.idea.update({
        where: { id: ideaId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
    return updated;
  }

  async removeLikeAndDecrement(ideaId: string, userId: string): Promise<Idea> {
    const [, updated] = await this.prisma.$transaction([
      this.prisma.ideaLike.delete({
        where: { ideaId_userId: { ideaId, userId } },
      }),
      this.prisma.idea.update({
        where: { id: ideaId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return updated;
  }

  async incrementComments(id: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    });
  }
}
