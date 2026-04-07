import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Providers/database.service';
import { Idea } from '@prisma/client';

@Injectable()
export class IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip?: number, take?: number): Promise<{ data: Idea[]; total: number }> {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.idea.findMany({
        skip,
        take,
        include: {
          author: { select: { displayName: true, role: true } },
          challenge: true,
        },
      }),
      this.prisma.idea.count(),
    ]);
    return { data, total };
  }

  async findPublic(skip?: number, take?: number): Promise<{ data: Idea[]; total: number }> {
    const where = { status: 'public' };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.idea.findMany({
        where,
        skip,
        take,
        include: {
          author: { select: { displayName: true, role: true } },
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

  async incrementLikes(id: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
  }

  async incrementComments(id: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    });
  }
}
