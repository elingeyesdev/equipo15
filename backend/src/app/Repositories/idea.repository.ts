import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Providers/database.service';
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
    
    const [data, total] = await this.prisma.$transaction([
      this.prisma.idea.findMany({
        where,
        skip,
        take,
        include: {
          author: { select: { displayName: true, role: true, facultyId: true } },
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
    
    const [data, total] = await this.prisma.$transaction([
      this.prisma.idea.findMany({
        where,
        skip,
        take,
        include: {
          author: { select: { displayName: true, role: true, facultyId: true } },
          challenge: true,
          ideaLikes: userId
            ? { where: { userId }, select: { id: true } }
            : false,
        },
      }),
      this.prisma.idea.count({ where }),
    ]);

    const enriched: IdeaWithVoteStatus[] = data.map((idea) => {
      const { ideaLikes, ...rest } = idea as Idea & { ideaLikes?: { id: string }[] };
      return {
        ...rest,
        hasVoted: Array.isArray(ideaLikes) && ideaLikes.length > 0,
      };
    });

    return { data: enriched, total };
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

  async create(data: Prisma.IdeaCreateInput | Prisma.IdeaUncheckedCreateInput): Promise<Idea> {
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

  async registerLikeAndIncrement(ideaId: string, userId: string): Promise<Idea> {
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

  async incrementComments(id: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    });
  }
}
