import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Providers/database.service';
import { Idea } from '@prisma/client';

@Injectable()
export class IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    skip?: number,
    take?: number,
    challengeId?: string,
  ): Promise<{ data: Idea[]; total: number }> {
    const where: any = {};
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
  ): Promise<{ data: Idea[]; total: number }> {
    const where: any = { status: 'public' };
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

  async findById(id: string): Promise<Idea | null> {
    return this.prisma.idea.findUnique({
      where: { id },
      include: {
        author: true,
        challenge: true,
      },
    });
  }

  async create(data: any): Promise<Idea> {
    return this.prisma.idea.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data,
    });
  }

  async checkLike(ideaId: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.ideaLike.findUnique({
      where: { ideaId_userId: { ideaId, userId } },
    });
    return existing !== null;
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
