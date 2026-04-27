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
    search?: string,
  ): Promise<{ data: any[]; total: number }> {
    const where: Prisma.ChallengeWhereInput = {};
    if (status) {
      where.status = status;
    }

    if (search && search.trim().length > 0) {
      const keyword = search.trim();
      where.AND = [
        ...(where.AND
          ? Array.isArray(where.AND)
            ? where.AND
            : [where.AND]
          : []),
        {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' as const } },
            {
              problemDescription: {
                contains: keyword,
                mode: 'insensitive' as const,
              },
            },
            {
              companyContext: {
                contains: keyword,
                mode: 'insensitive' as const,
              },
            },
          ],
        },
      ];
    }

    if (userRole === 'student') {
      where.OR = [
        {
          isPrivate: false,
          OR: [{ facultyId: null }, ...(facultyId ? [{ facultyId }] : [])],
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
            select: { likesCount: true, commentsCount: true },
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

  async linkPrivateChallenge(
    challengeId: string,
    userId: string,
  ): Promise<void> {
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
          author: { select: { facultyId: true } },
        },
      }),
      this.prisma.user.findMany({
        where: {
          ideas: { some: { challengeId, status: 'public' } },
        },
        select: {
          id: true,
          displayName: true,
          nickname: true,
          role: { select: { name: true } },
          email: true,
        },
      }),
      this.prisma.idea.findMany({
        where: { challengeId, status: 'public' },
        orderBy: [{ likesCount: 'desc' }, { commentsCount: 'desc' }],
        take: 5,
        select: {
          id: true,
          title: true,
          likesCount: true,
          commentsCount: true,
        },
      }),
    ]);

    const uniqueFaculties = new Set(
      ideas.map((i) => i.author?.facultyId).filter((f) => f != null),
    );

    return {
      totalIdeas: agg._count || 0,
      totalLikes: agg._sum.likesCount || 0,
      totalComments: agg._sum.commentsCount || 0,
      totalParticipants: allAuthors.length,
      communityPulse: allAuthors.map((a) => {
        const resolvedName =
          a.nickname || a.displayName || a.email.split('@')[0] || 'Anónimo';
        return {
          id: a.id,
          name: resolvedName,
          role: a.role?.name || 'student',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedName)}&background=random`,
        };
      }),
      topIdeas: topIdeas.map((i) => ({
        id: i.id,
        title: i.title,
        likesCount: i.likesCount || 0,
        commentsCount: i.commentsCount || 0,
        impact: (i.likesCount || 0) + (i.commentsCount || 0),
      })),
    };
  }

  // ─── Innovation Stats for Company Dashboard (E1.4) ───────────────────────────
  async getInnovationStats(authorId: string) {
    const FACULTY_NAMES: Record<number, string> = {
      1: 'Ingeniería',
      2: 'Medicina',
      3: 'Ciencias Exactas',
      4: 'Humanidades',
      5: 'Derecho',
      6: 'Economía',
      7: 'Arquitectura',
      8: 'Educación',
    };

    // All challenge IDs owned by this company
    const companyChallenges = await this.prisma.challenge.findMany({
      where: { authorId },
      select: { id: true },
    });
    const challengeIds = companyChallenges.map((c) => c.id);

    if (challengeIds.length === 0) {
      return {
        ideasByFaculty: [],
        interactionsByDay: [],
        kpis: {
          totalIdeas: 0,
          totalVotes: 0,
          mostActiveUser: null,
          leadingFaculty: null,
        },
      };
    }

    // 1. Ideas and votes per faculty (Prisma groupBy) ─────────────────────────
    const groupedIdeasByAuthor = await this.prisma.idea.groupBy({
      by: ['authorId'],
      where: { challengeId: { in: challengeIds }, status: 'public' },
      _count: { _all: true },
      _sum: { votesCount: true },
    });

    const groupedAuthorIds = groupedIdeasByAuthor.map((item) => item.authorId);
    const groupedAuthors = groupedAuthorIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: groupedAuthorIds } },
          select: {
            id: true,
            facultyId: true,
            displayName: true,
            nickname: true,
            email: true,
          },
        })
      : [];

    const authorFacultyMap = new Map<string, number>();
    groupedAuthors.forEach((author) => {
      if (author.facultyId != null) {
        authorFacultyMap.set(author.id, author.facultyId);
      }
    });

    const facultyMap = new Map<number, { ideasCount: number; votesCount: number }>();
    groupedIdeasByAuthor.forEach((group) => {
      const facultyId = authorFacultyMap.get(group.authorId);
      if (facultyId == null) return;

      const current = facultyMap.get(facultyId) ?? { ideasCount: 0, votesCount: 0 };
      current.ideasCount += group._count._all;
      current.votesCount += group._sum.votesCount ?? 0;
      facultyMap.set(facultyId, current);
    });

    const ideasByFaculty = Array.from(facultyMap.entries())
      .map(([facultyId, aggregate]) => ({
        facultyId,
        facultyName: FACULTY_NAMES[facultyId] ?? `Facultad ${facultyId}`,
        ideasCount: aggregate.ideasCount,
        votesCount: aggregate.votesCount,
      }))
      .sort((a, b) => b.ideasCount - a.ideasCount);

    // 2. Interactions by day (last 30 days) ────────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIdeas = await this.prisma.idea.findMany({
      where: {
        challengeId: { in: challengeIds },
        status: 'public',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        likesCount: true,
        commentsCount: true,
        createdAt: true,
      },
    });

    const dayMap = new Map<
      string,
      { date: string; likes: number; comments: number }
    >();
    // Pre-fill last 30 days so chart shows continuous line even on empty days
    for (let d = 0; d < 30; d++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - (29 - d));
      const key = dt.toISOString().split('T')[0];
      dayMap.set(key, { date: key, likes: 0, comments: 0 });
    }

    recentIdeas.forEach((idea) => {
      const key = new Date(idea.createdAt).toISOString().split('T')[0];
      const entry = dayMap.get(key);
      if (entry) {
        entry.likes += idea.likesCount ?? 0;
        entry.comments += idea.commentsCount ?? 0;
      }
    });

    const interactionsByDay = Array.from(dayMap.values());

    // 3. KPIs ──────────────────────────────────────────────────────────────────
    const totalIdeas = groupedIdeasByAuthor.reduce(
      (acc, item) => acc + item._count._all,
      0,
    );
    const totalVotes = groupedIdeasByAuthor.reduce(
      (acc, item) => acc + (item._sum.votesCount ?? 0),
      0,
    );

    // Most active user (most ideas submitted in company challenges)
    const userIdeaCount = new Map<string, { name: string; count: number }>();
    groupedIdeasByAuthor.forEach((item) => {
      const author = groupedAuthors.find(
        (candidate) => candidate.id === item.authorId,
      );
      if (!author) return;
      const resolvedName =
        author.nickname ||
        author.displayName ||
        author.email.split('@')[0] ||
        'Anónimo';
      userIdeaCount.set(author.id, {
        name: resolvedName,
        count: item._count._all,
      });
    });

    let mostActiveUser: { name: string; ideaCount: number } | null = null;
    userIdeaCount.forEach((val) => {
      if (!mostActiveUser || val.count > mostActiveUser.ideaCount) {
        mostActiveUser = { name: val.name, ideaCount: val.count };
      }
    });

    // Leading faculty (most ideas)
    let leadingFaculty: {
      facultyId: number;
      facultyName: string;
      ideasCount: number;
    } | null = null;
    if (ideasByFaculty.length > 0) leadingFaculty = ideasByFaculty[0];

    return {
      ideasByFaculty,
      interactionsByDay,
      kpis: { totalIdeas, totalVotes, mostActiveUser, leadingFaculty },
    };
  }
}
