import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Providers/database.service';
import { Challenge, Prisma } from '@prisma/client';

@Injectable()
export class ChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    skip?: number,
    take?: number,
    status?: string,
  ): Promise<{ data: any[]; total: number }> {
    const where: Prisma.ChallengeWhereInput = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.challenge.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { ideas: true },
          },
        },
      }),
      this.prisma.challenge.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Challenge | null> {
    return this.prisma.challenge.findUnique({
      where: { id },
      include: {
        ideas: true,
      },
    });
  }

  async findByAccessToken(accessToken: string): Promise<Challenge | null> {
    return this.prisma.challenge.findUnique({
      where: { accessToken },
    });
  }

  private prepareData(data: Record<string, any>): Record<string, any> {
    const prepared = { ...data };
    if (prepared.startDate)
      prepared.startDate = new Date(
        prepared.startDate as string | number | Date,
      );
    if (prepared.endDate)
      prepared.endDate = new Date(prepared.endDate as string | number | Date);
    if (prepared.publicationDate)
      prepared.publicationDate = new Date(
        prepared.publicationDate as string | number | Date,
      );
    return prepared;
  }

  async create(
    data: { authorId: string } & Partial<Challenge>,
  ): Promise<Challenge> {
    const { authorId, ...challengeData } = this.prepareData(data);
    return this.prisma.challenge.create({
      data: {
        ...(challengeData as Prisma.ChallengeCreateInput),
        author: {
          connect: { id: authorId },
        },
      },
    });
  }

  async update(id: string, data: Partial<Challenge>): Promise<Challenge> {
    return this.prisma.challenge.update({
      where: { id },
      data: this.prepareData(data) as Prisma.ChallengeUpdateInput,
    });
  }

  async delete(id: string): Promise<Challenge> {
    return this.prisma.challenge.delete({
      where: { id },
    });
  }

  async countChallengesByStatus(status: string): Promise<number> {
    return this.prisma.challenge.count({
      where: { status },
    });
  }

  async countTotalIdeas(): Promise<number> {
    return this.prisma.idea.count();
  }

  async countStudentUsers(): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: {
          name: 'student',
        },
      },
    });
  }

  async countIdeasByChallenge(challengeId: string): Promise<number> {
    return this.prisma.idea.count({
      where: { challengeId },
    });
  }

  async getFacultyStats(): Promise<any[]> {
    return Promise.resolve([]);
  }
}
