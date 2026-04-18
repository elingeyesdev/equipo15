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
    userId?: string,
    userRole?: string,
    facultyId?: number | null,
  ): Promise<{ data: any[]; total: number }> {
    const where: Prisma.ChallengeWhereInput = {};
    if (status) {
      where.status = status;
    }

    if (userRole === 'student') {
      where.OR = [
        {
          isPrivate: false,
          OR: [
            { facultyId: null },
            ...(facultyId ? [{ facultyId }] : []),
          ],
        },
        {
          isPrivate: true,
          accessedByUsers: {
            some: { id: userId },
          },
        },
      ];
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
          ideas: {
            select: { likesCount: true },
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

  async linkPrivateChallenge(challengeId: string, userId: string): Promise<void> {
    await this.prisma.challenge.update({
      where: { id: challengeId },
      data: {
        accessedByUsers: {
          connect: { id: userId },
        },
      },
    });
  }

  async getFacultyStats(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getChallengeImpactStats(challengeId: string) {
    const [agg, ideas, allAuthors, topIdeas] = await Promise.all([
      this.prisma.idea.aggregate({
        where: { challengeId, status: 'public' },
        _count: true,
        _sum: { likesCount: true, commentsCount: true },
      }),
      this.prisma.idea.findMany({
         where: { challengeId, status: 'public' },
         select: {
            author: { select: { facultyId: true } }
         }
      }),
      this.prisma.user.findMany({
         where: {
            ideas: { some: { challengeId, status: 'public' } }
         },
         select: { id: true, displayName: true, role: { select: { name: true } }, email: true }
      }),
      this.prisma.idea.findMany({
         where: { challengeId, status: 'public' },
         orderBy: [ { likesCount: 'desc' }, { commentsCount: 'desc' } ],
         take: 5,
         select: { id: true, title: true, likesCount: true, commentsCount: true }
      })
    ]);

    const uniqueFaculties = new Set(ideas.map(i => i.author?.facultyId).filter(f => f != null));

    return {
       totalIdeas: agg._count || 0,
       impactoTotal: (agg._sum.likesCount || 0) + (agg._sum.commentsCount || 0),
       facultadesUnidas: uniqueFaculties.size,
       communityPulse: allAuthors.map(a => ({
          id: a.id,
          name: a.displayName || a.email.split('@')[0],
          role: a.role?.name || 'student',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.displayName || a.email.split('@')[0])}&background=random`
       })),
       topIdeas: topIdeas.map(i => ({
          id: i.id,
          title: i.title,
          impact: (i.likesCount || 0) + (i.commentsCount || 0)
       }))
    };
  }
}
