import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Challenge, Prisma, UserRole, IdeaStatus, WinnerCategory } from '@prisma/client';

@Injectable()
export class ChallengeRepository {
  private readonly logger = new Logger(ChallengeRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  private normalizeStatus(status: string): string {
    const map: Record<string, string> = {
      'activo': 'PUBLISHED',
      'active': 'PUBLISHED',
      'finalizado': 'CLOSED',
      'cerrado': 'CLOSED',
      'closed': 'CLOSED',
      'en evaluación': 'EVALUATING',
      'evaluating': 'EVALUATING',
      'evaluation': 'EVALUATING',
      'borrador': 'DRAFT',
      'draft': 'DRAFT',
      'publicado': 'PUBLISHED',
      'published': 'PUBLISHED',
    };
    const validValues = ['DRAFT', 'PUBLISHED', 'EVALUATING', 'CLOSED'];
    if (validValues.includes(status)) return status;
    return map[status?.toLowerCase()?.trim()] || status;
  }

  async findAll(
    skip?: number,
    take?: number,
    status?: string,
    userId?: string,
    userRole?: string,
    facultyId?: string | null,
    search?: string,
  ): Promise<{ data: any[]; total: number }> {
    const where: Prisma.ChallengeWhereInput = {};
    if (status) {
      where.status = this.normalizeStatus(status) as any;
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

    if (userRole === 'student' || userRole === UserRole.USER) {
      const facultyCondition: Prisma.ChallengeWhereInput[] = [
        { facultyId: null },
        ...(facultyId ? [{ facultyId }] : []),
      ];

      where.OR = [
        {
          isPrivate: false,
          OR: facultyCondition,
        },
        {
          isPrivate: true,
          AND: [
            { privateAccesses: { some: { userId } } },
            { OR: facultyCondition },
          ],
        },
      ];
    } else if (userRole === 'company' || userRole === UserRole.COMPANY) {
      where.authorId = userId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.challenge.findMany({
        where,
        skip,
        take,
        include: {
          faculty: true,
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
        faculty: true,
        ideas: true,
      },
    });
  }

  async getPodiumStatus(challengeId: string) {
    const [finalistCount, winnerCount, evaluationCount, assignedJudgesCount, ideasWithEvaluations] =
      await Promise.all([
        this.prisma.idea.count({
          where: { challengeId, status: 'FINALIST', deletedAt: null },
        }),
        this.prisma.idea.count({
          where: { challengeId, status: 'WINNER', deletedAt: null },
        }),
        this.prisma.evaluation.count({
          where: { idea: { challengeId, deletedAt: null } },
        }),
        this.prisma.challengeJudge.count({
          where: { challengeId },
        }),
        this.prisma.idea.count({
          where: {
            challengeId,
            deletedAt: null,
            evaluations: { some: {} },
          },
        }),
      ]);

    return {
      finalistCount,
      winnerCount,
      evaluationCount,
      assignedJudgesCount,
      ideasWithEvaluations,
    };
  }

  async getIdeasByChallenge(challengeId: string) {
    return this.prisma.idea.findMany({
      where: { challengeId, deletedAt: null },
      select: {
        id: true,
        title: true,
        status: true,
        finalScore: true,
        likesCount: true,
        commentsCount: true,
        createdAt: true,
      },
    });
  }

  async getRankedIdeasByFinalScore(
    challengeId: string,
    statuses: IdeaStatus[] = [IdeaStatus.FINALIST],
  ) {
    return this.prisma.idea.findMany({
      where: {
        challengeId,
        deletedAt: null,
        status: { in: statuses },
      },
      select: {
        id: true,
        title: true,
        status: true,
        finalScore: true,
        likesCount: true,
        commentsCount: true,
        createdAt: true,
      },
      orderBy: [{ finalScore: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getPodiumIdeas(challengeId: string) {
    const [ideas, winners] = await Promise.all([
      this.prisma.idea.findMany({
        where: {
          challengeId,
          deletedAt: null,
          status: { in: ['PUBLISHED', 'FINALIST', 'WINNER'] },
        },
        select: {
          id: true,
          title: true,
          status: true,
          finalScore: true,
          likesCount: true,
          commentsCount: true,
          createdAt: true,
          author: {
            select: {
              displayName: true,
              nickname: true,
            },
          },
        },
        orderBy: [{ finalScore: 'desc' }, { createdAt: 'asc' }],
      }),
      this.prisma.challengeWinner.findMany({
        where: { challengeId, category: WinnerCategory.GENERAL },
        select: { ideaId: true, position: true },
        orderBy: { position: 'asc' },
      }),
    ]);

    const positionByIdeaId = new Map(
      winners.map((winner) => [winner.ideaId, winner.position]),
    );

    return ideas.map((idea) => ({
      ...idea,
      podiumPosition: positionByIdeaId.get(idea.id) ?? null,
    }));
  }

  async findByAccessToken(accessToken: string): Promise<Challenge | null> {
    return this.prisma.challenge.findUnique({
      where: { accessToken },
    });
  }

  private prepareData(data: Record<string, any>): Record<string, any> {
    const prepared = { ...data };
    Object.keys(prepared).forEach((key) => {
      if (prepared[key] === undefined) {
        delete prepared[key];
      }
    });

    if ('startDate' in prepared && prepared.startDate !== undefined) {
      prepared.submissionsOpenAt = prepared.startDate;
      delete prepared.startDate;
    }
    if ('endDate' in prepared && prepared.endDate !== undefined) {
      prepared.submissionsCloseAt = prepared.endDate;
      delete prepared.endDate;
    }
    if ('publicationDate' in prepared && prepared.publicationDate !== undefined) {
      prepared.publishedAt = prepared.publicationDate;
      delete prepared.publicationDate;
    }

    if (prepared.status) {
      prepared.status = this.normalizeStatus(prepared.status);
    }

    const dateFields = ['publishedAt', 'submissionsOpenAt', 'submissionsCloseAt'];
    for (const field of dateFields) {
      if (prepared[field]) {
        prepared[field] = new Date(prepared[field] as string | number | Date);
      }
    }

    return prepared;
  }

  async create(
    data: { authorId: string } & Partial<Challenge>,
  ): Promise<Challenge> {
    const prepared = this.prepareData(data);
    const { authorId, facultyId, ...challengeData } = prepared;

    this.logger.log(`Prisma Create Challenge by Author: ${authorId}`);
    this.logger.log(`Faculty ID to connect: ${facultyId}`);

    const created = await this.prisma.challenge.create({
      data: {
        ...(challengeData as Prisma.ChallengeCreateInput),
        author: {
          connect: { id: authorId },
        },
        ...(facultyId ? { faculty: { connect: { id: facultyId } } } : {}),
      },
    });

    // Sync criteria to official table on create
    await this.syncCriteriaToTable(created.id, created.evaluationCriteria);
    return created;
  }

  async update(id: string, data: Partial<Challenge>): Promise<Challenge> {
    const prepared = this.prepareData(data);
    const { facultyId, ...challengeData } = prepared;

    this.logger.log(`Prisma Update Challenge ID: ${id}`);
    this.logger.log(`Faculty ID to connect: ${facultyId}`);

    const updated = await this.prisma.challenge.update({
      where: { id },
      data: {
        ...(challengeData as Prisma.ChallengeUpdateInput),
        ...(facultyId !== undefined
          ? facultyId
            ? { faculty: { connect: { id: facultyId } } }
            : { faculty: { disconnect: true } }
          : {}),
      },
    });

    // Sync criteria to official table on update
    await this.syncCriteriaToTable(updated.id, updated.evaluationCriteria);
    return updated;
  }

  /**
   * Sync evaluationCriteria JSON → official `criteria` table.
   * This guarantees FK integrity for EvaluationScore at write time,
   * not at read time (GET /criteria).
   */
  private async syncCriteriaToTable(challengeId: string, evaluationCriteria: any) {
    if (!evaluationCriteria) return;
    const criteriaList = Array.isArray(evaluationCriteria) ? evaluationCriteria : [];
    const active = criteriaList.filter((c: any) => c.enabled !== false && c.weight > 0 && c.id);

    if (active.length === 0) return;

    await Promise.all(
      active.map(async (c: any) => {
        try {
          await this.prisma.criteria.upsert({
            where: { id: c.id },
            create: {
              id: c.id,
              challengeId,
              name: c.name,
              description: c.description || null,
              weight: c.weight,
              isActive: true,
            },
            update: {
              name: c.name,
              description: c.description || null,
              weight: c.weight,
              isActive: true,
            },
          });
        } catch (err) {
          this.logger.warn(`syncCriteriaToTable: failed upsert for ${c.id}: ${err}`);
        }
      }),
    );
    this.logger.log(`Synced ${active.length} criteria to table for challenge ${challengeId}`);
  }

  async delete(id: string): Promise<Challenge> {
    return this.prisma.challenge.delete({
      where: { id },
    });
  }

  async countChallengesByStatus(status: string): Promise<number> {
    return this.prisma.challenge.count({
      where: { status: this.normalizeStatus(status) as any },
    });
  }

  async countTotalIdeas(): Promise<number> {
    return this.prisma.idea.count();
  }

  async countStudentUsers(): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: UserRole.USER,
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
    grantedVia: string = 'TOKEN',
  ): Promise<void> {
    await this.prisma.privateChallengeAccess.upsert({
      where: {
        uq_access_per_user: { challengeId, userId },
      },
      create: { challengeId, userId, grantedVia: grantedVia as any },
      update: {},
    });
  }

  async getFacultyStats(): Promise<any[]> {
    const faculties = await this.prisma.faculty.findMany({
      include: {
        studentProfiles: {
          include: {
            user: {
              include: {
                ideas: {
                  where: { status: 'PUBLISHED' },
                  select: { finalScore: true, likesCount: true },
                },
              },
            },
          },
        },
      },
    });

    const stats = faculties.map((faculty) => {
      let totalLikes = 0;
      faculty.studentProfiles.forEach((sp) => {
        sp.user.ideas.forEach((idea) => {
          totalLikes += idea.finalScore || idea.likesCount || 0;
        });
      });
      return { name: faculty.name, likes: totalLikes };
    });

    return stats.sort((a, b) => b.likes - a.likes).slice(0, 3);
  }

  async getTopLeaders(): Promise<any[]> {
    const users = await this.prisma.user.findMany({
      where: { role: UserRole.USER, status: 'ACTIVE' },
      include: {
        ideas: {
          where: { status: 'PUBLISHED' },
          select: { finalScore: true, likesCount: true },
        },
      },
    });

    const stats = users.map((user) => {
      let totalLikes = 0;
      user.ideas.forEach((idea) => {
        totalLikes += idea.finalScore || idea.likesCount || 0;
      });
      return {
        name: user.nickname || user.displayName || user.email.split('@')[0],
        ideas: user.ideas.length,
        likes: totalLikes,
      };
    });

    return stats.sort((a, b) => b.likes - a.likes).slice(0, 3);
  }

  async getChallengeImpactStats(challengeId: string) {
    const activeStatuses: IdeaStatus[] = [IdeaStatus.PUBLISHED, IdeaStatus.FINALIST, IdeaStatus.WINNER];
    const [agg, ideas, allAuthors, topIdeas] = await Promise.all([
      this.prisma.idea.aggregate({
        where: { challengeId, status: { in: activeStatuses }, deletedAt: null },
        _count: true,
        _sum: { likesCount: true, commentsCount: true },
      }),
      this.prisma.idea.findMany({
        where: { challengeId, status: { in: activeStatuses }, deletedAt: null },
        select: {
          author: { select: { studentProfile: { select: { facultyId: true } } } },
        },
      }),
      this.prisma.user.findMany({
        where: {
          ideas: { some: { challengeId, status: { in: activeStatuses }, deletedAt: null } },
        },
        select: {
          id: true,
          displayName: true,
          nickname: true,
          role: true,
          email: true,
        },
      }),
      this.prisma.idea.findMany({
        where: { challengeId, status: { in: activeStatuses }, deletedAt: null },
        orderBy: [{ likesCount: 'desc' }, { commentsCount: 'desc' }],
        take: 5,
        select: {
          id: true,
          title: true,
          likesCount: true,
          commentsCount: true,
          isAnonymous: true,
          author: {
            select: {
              nickname: true,
              displayName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    const uniqueFaculties = new Set(
      ideas.map((i) => i.author?.studentProfile?.facultyId).filter((f) => f != null),
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
          role: a.role || UserRole.USER,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedName)}&background=random`,
        };
      }),
      topIdeas: topIdeas.map((i) => {
        const isAnon = i.isAnonymous;
        const authorName = isAnon
          ? 'Participante'
          : (i.author?.nickname ||
             i.author?.displayName ||
             i.author?.email?.split('@')[0] ||
             'Participante');
        return {
          id: i.id,
          title: i.title,
          likesCount: i.likesCount || 0,
          commentsCount: i.commentsCount || 0,
          impact: (i.likesCount || 0) + (i.commentsCount || 0),
          authorName,
          author: {
            name: authorName,
            nickname: isAnon ? undefined : (i.author?.nickname || undefined),
            avatar: isAnon ? undefined : (i.author?.avatarUrl || undefined),
          },
        };
      }),
    };
  }

  async getInnovationStatsByChallenge(challengeId: string, authorId: string) {
    const challenge = await this.prisma.challenge.findFirst({
      where: {
        id: challengeId,
        authorId,
        status: { in: ['PUBLISHED', 'EVALUATING', 'CLOSED'] as any },
      },
      select: { id: true },
    });

    if (!challenge) {
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

    return this.getInnovationStatsScoped(authorId, [challengeId]);
  }

  async getCompanyChallenges(authorId: string) {
    return this.prisma.challenge.findMany({
      where: {
        authorId,
        status: { in: ['PUBLISHED', 'EVALUATING', 'CLOSED'] as any },
      },
      select: {
        id: true,
        title: true,
        status: true,
        submissionsCloseAt: true,
        publishedAt: true,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private async getInnovationStatsScoped(
    authorId: string,
    challengeIds: string[],
  ) {
    const allFaculties = await this.prisma.faculty.findMany({
      select: { id: true, name: true },
    });
    const FACULTY_NAMES = new Map<string, string>();
    allFaculties.forEach((f) => FACULTY_NAMES.set(f.id, f.name));

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

    const groupedIdeasByAuthor = await this.prisma.idea.groupBy({
      by: ['authorId'],
      where: { challengeId: { in: challengeIds }, status: 'PUBLISHED' },
      _count: { _all: true },
      _sum: { finalScore: true },
    });

    const groupedAuthorIds = groupedIdeasByAuthor.map((item) => item.authorId);
    const groupedAuthors = groupedAuthorIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: groupedAuthorIds } },
          select: {
            id: true,
            studentProfile: { select: { facultyId: true } },
            displayName: true,
            nickname: true,
            email: true,
          },
        })
      : [];

    const authorFacultyMap = new Map<string, string>();
    groupedAuthors.forEach((author) => {
      if (author.studentProfile?.facultyId != null) {
        authorFacultyMap.set(author.id, author.studentProfile.facultyId);
      }
    });

    const facultyMap = new Map<
      string,
      { ideasCount: number; votesCount: number }
    >();
    groupedIdeasByAuthor.forEach((group) => {
      const facultyId = authorFacultyMap.get(group.authorId);
      if (facultyId == null) return;

      const current = facultyMap.get(facultyId) ?? {
        ideasCount: 0,
        votesCount: 0,
      };
      current.ideasCount += (group._count as any)?._all ?? 0;
      current.votesCount += group._sum?.finalScore ?? 0;
      facultyMap.set(facultyId, current);
    });

    const ideasByFaculty = Array.from(facultyMap.entries())
      .map(([facultyId, aggregate]) => ({
        facultyId,
        facultyName: FACULTY_NAMES.get(facultyId) ?? 'Desconocida',
        ideasCount: aggregate.ideasCount,
        votesCount: aggregate.votesCount,
      }))
      .sort((a, b) => b.ideasCount - a.ideasCount);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIdeas = await this.prisma.idea.findMany({
      where: {
        challengeId: { in: challengeIds },
        status: 'PUBLISHED',
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

    const totalIdeas = ideasByFaculty.reduce(
      (sum, item) => sum + item.ideasCount,
      0,
    );
    const totalVotes = ideasByFaculty.reduce(
      (sum, item) => sum + item.votesCount,
      0,
    );
    const leadingFaculty = ideasByFaculty[0]
      ? {
          facultyId: ideasByFaculty[0].facultyId,
          facultyName: ideasByFaculty[0].facultyName,
          ideasCount: ideasByFaculty[0].ideasCount,
        }
      : null;

    let mostActiveUser: { name: string; ideaCount: number } | null = null;
    if (groupedAuthors.length > 0) {
      const authorStats = groupedAuthors
        .map((author) => ({
          author,
          ideaCount:
            (
              groupedIdeasByAuthor.find((item) => item.authorId === author.id)
                ?._count as any
            )?._all ?? 0,
        }))
        .sort((a, b) => b.ideaCount - a.ideaCount);

      if (authorStats[0]) {
        const topAuthor = authorStats[0].author;
        mostActiveUser = {
          name:
            topAuthor.displayName ||
            topAuthor.nickname ||
            topAuthor.email ||
            'Usuario',
          ideaCount: authorStats[0].ideaCount,
        };
      }
    }

    return {
      ideasByFaculty,
      interactionsByDay,
      kpis: {
        totalIdeas,
        totalVotes,
        mostActiveUser,
        leadingFaculty,
      },
    };
  }

  async getInnovationStats(authorId: string) {
    const faculties = await this.prisma.faculty.findMany({
      select: { id: true, name: true },
    });
    const facultyNameMap = new Map<string, string>();
    faculties.forEach((faculty) => {
      facultyNameMap.set(faculty.id, faculty.name);
    });

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

    const groupedIdeasByAuthor = await this.prisma.idea.groupBy({
      by: ['authorId'],
      where: { challengeId: { in: challengeIds }, status: 'PUBLISHED' },
      _count: { _all: true },
      _sum: { finalScore: true },
    });

    const groupedAuthorIds = groupedIdeasByAuthor.map((item) => item.authorId);
    const groupedAuthors = groupedAuthorIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: groupedAuthorIds } },
          select: {
            id: true,
            studentProfile: { select: { facultyId: true } },
            displayName: true,
            nickname: true,
            email: true,
          },
        })
      : [];

    const authorFacultyMap = new Map<string, string>();
    groupedAuthors.forEach((author) => {
      if (author.studentProfile?.facultyId != null) {
        authorFacultyMap.set(author.id, author.studentProfile.facultyId);
      }
    });

    const facultyMap = new Map<
      string,
      { ideasCount: number; votesCount: number }
    >();
    groupedIdeasByAuthor.forEach((group) => {
      const facultyId = authorFacultyMap.get(group.authorId);
      if (facultyId == null) return;

      const current = facultyMap.get(facultyId) ?? {
        ideasCount: 0,
        votesCount: 0,
      };
      current.ideasCount += (group._count as any)?._all ?? 0;
      current.votesCount += group._sum?.finalScore ?? 0;
      facultyMap.set(facultyId, current);
    });

    const ideasByFaculty = Array.from(facultyMap.entries())
      .map(([facultyId, aggregate]) => ({
        facultyId,
        facultyName: facultyNameMap.get(facultyId) ?? `Facultad ${facultyId}`,
        ideasCount: aggregate.ideasCount,
        votesCount: aggregate.votesCount,
      }))
      .sort((a, b) => b.ideasCount - a.ideasCount);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIdeas = await this.prisma.idea.findMany({
      where: {
        challengeId: { in: challengeIds },
        status: 'PUBLISHED',
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

    const totalIdeas = groupedIdeasByAuthor.reduce(
      (acc, item) => acc + ((item._count as any)?._all ?? 0),
      0,
    );
    const totalVotes = groupedIdeasByAuthor.reduce(
      (acc, item) => acc + (item._sum?.finalScore ?? 0),
      0,
    );

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
        count: (item._count as any)?._all ?? 0,
      });
    });

    let mostActiveUser: { name: string; ideaCount: number } | null = null;
    userIdeaCount.forEach((val) => {
      if (!mostActiveUser || val.count > mostActiveUser.ideaCount) {
        mostActiveUser = { name: val.name, ideaCount: val.count };
      }
    });

    let leadingFaculty: {
      facultyId: string;
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

  async searchJudges(query: string) {
    const where: any = {
      role: UserRole.JUDGE,
      status: 'ACTIVE',
    };

    if (query && query.length > 0) {
      where.OR = [
        { displayName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
      },
      take: 50,
      orderBy: { displayName: 'asc' },
    });
  }

  async getAssignedJudges(challengeId: string) {
    const judgeRecords = await this.prisma.challengeJudge.findMany({
      where: { challengeId },
      include: {
        judge: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
    return judgeRecords.map((r) => r.judge);
  }

  async assignJudges(challengeId: string, judgeIds: string[], assignedById: string) {
    await this.prisma.$transaction([
      this.prisma.challengeJudge.deleteMany({ where: { challengeId } }),
      this.prisma.challengeJudge.createMany({
        data: judgeIds.map((judgeId) => ({
          challengeId,
          judgeId,
          assignedById,
        })),
      }),
    ]);

    return this.getAssignedJudges(challengeId);
  }

  // ─── Judge Inbox: Assigned Challenges (E3.2) ───────────────────────────────

  async getAssignedChallengesForJudge(judgeUserId: string) {
    const assignments = await this.prisma.challengeJudge.findMany({
      where: { judgeId: judgeUserId },
      select: {
        challenge: {
          select: {
            id: true,
            title: true,
            problemDescription: true,
            status: true,
            submissionsCloseAt: true,
          },
        },
      },
    });

    return assignments.map((a) => a.challenge);
  }

  // ─── Judge Inbox: Finalist Ideas (E3.1) ────────────────────────────────────

  async getFinalistIdeasForJudge(judgeUserId: string) {
    // 1. Get all challengeIds where this user is a judge
    const assignments = await this.prisma.challengeJudge.findMany({
      where: { judgeId: judgeUserId },
      select: { challengeId: true },
    });

    const challengeIds = assignments.map((a) => a.challengeId);
    if (challengeIds.length === 0) return [];

    // 2. Get all FINALIST ideas from those challenges, with evaluation info
    const ideas = await this.prisma.idea.findMany({
      where: {
        challengeId: { in: challengeIds },
        status: 'FINALIST',
        deletedAt: null,
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            status: true,
            companyContext: true,
            submissionsCloseAt: true,
          },
        },
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: { select: { name: true } },
          },
        },
        evaluations: {
          where: { judgeId: judgeUserId },
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Map to a flat response with evaluated flag
    return ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      problem: idea.problem,
      solution: idea.solution,
      isAnonymous: idea.isAnonymous,
      author: idea.isAnonymous ? null : idea.author,
      challengeId: idea.challengeId,
      challengeTitle: idea.challenge.title,
      challengeStatus: idea.challenge.status,
      challengeContext: idea.challenge.companyContext,
      impactArea: (idea as any).impactArea || null,
      improvementType: (idea as any).improvementType || null,
      effortLevel: (idea as any).effortLevel || null,
      tags: idea.tags?.map(t => t.tag.name) || [],
      likesCount: idea.likesCount,
      commentsCount: idea.commentsCount,
      createdAt: idea.createdAt,
      evaluated: idea.evaluations.length > 0,
      evaluationId: idea.evaluations[0]?.id ?? null,
      evaluatedAt: idea.evaluations[0]?.createdAt ?? null,
    }));
  }

  // ─── Judge Eval Form: Get active criteria for a challenge (E3.1) ───────────

  async getCriteriaForChallenge(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { evaluationCriteria: true },
    });

    if (!challenge || !challenge.evaluationCriteria) {
      return [];
    }

    // evaluationCriteria is stored as JSON array of objects
    const criteriaList = challenge.evaluationCriteria as any[];
    
    if (!Array.isArray(criteriaList)) {
      return [];
    }

    // Filter only enabled criteria and map to required format
    const activeCriteria = criteriaList
      .filter((c: any) => c.enabled !== false && c.weight > 0)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        weight: c.weight || 0,
      }));

    // Sync to Criteria table to ensure foreign key integrity for EvaluationScore
    if (activeCriteria.length > 0) {
      await Promise.all(
        activeCriteria.map(async (c: any) => {
          if (!c.id) return;
          try {
            await this.prisma.criteria.upsert({
              where: { id: c.id },
              create: {
                id: c.id,
                challengeId: challengeId,
                name: c.name,
                description: c.description,
                weight: c.weight,
                isActive: true,
              },
              update: {
                name: c.name,
                description: c.description,
                weight: c.weight,
                isActive: true,
              },
            });
          } catch (e) {
            this.logger.error(`Error syncing criterion ${c.id}:`, e);
          }
        })
      );
    }

    return activeCriteria.sort((a, b) => a.name.localeCompare(b.name));
  }
}
