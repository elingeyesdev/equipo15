import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ChallengeStatus } from '../../common/enums/challenge-status.enum';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanies() {
    const companies = await this.prisma.user.findMany({
      where: { role: 'COMPANY' },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        displayName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        challenges: {
          select: { status: true, endDate: true },
        },
      },
      orderBy: { displayName: 'asc' },
    });

    return companies.map((company) => {
      let activeChallenges = 0;
      let closedChallenges = 0;

      for (const ch of company.challenges) {
        if (ch.status === 'Activo' || ch.status === 'En Evaluación') {
          activeChallenges++;
        } else if (ch.status === 'Finalizado') {
          closedChallenges++;
        }
      }

      const { challenges: _, ...rest } = company;
      return { ...rest, activeChallenges, closedChallenges };
    });
  }

  async findCompanyById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, role: 'COMPANY' },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        displayName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        faculty: {
          select: { name: true },
        },
      },
    });
  }

  async getGlobalAnalytics() {
    const [totalCompanies, totalChallenges, activeChallenges, totalIdeas, rawChallenges] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'COMPANY' } }),
        this.prisma.challenge.count(),
        this.prisma.challenge.count({
          where: { status: ChallengeStatus.ACTIVE },
        }),
        this.prisma.idea.count(),
        this.prisma.challenge.findMany({
          select: {
            id: true,
            title: true,
            status: true,
            endDate: true,
            author: {
              select: {
                displayName: true,
                faculty: { select: { name: true } },
              }
            },
            ideas: {
              select: {
                fireScore: true,
                commentsCount: true,
                finalScore: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

    const challengesPerformance = rawChallenges.map(challenge => {
      const companyName = challenge.author.displayName || challenge.author.faculty?.name || 'Compañía';
      
      let totalInteractions = 0;
      let evaluatedIdeasCount = 0;
      let sumScores = 0;

      for (const idea of challenge.ideas) {
        totalInteractions += (idea.fireScore + idea.commentsCount);
        if (idea.finalScore > 0) {
          sumScores += idea.finalScore;
          evaluatedIdeasCount++;
        }
      }

      const averageScore = evaluatedIdeasCount > 0 
        ? Number((sumScores / evaluatedIdeasCount).toFixed(1)) 
        : null;

      let displayStatus = challenge.status;
      if (challenge.endDate && new Date(challenge.endDate) < new Date()) {
        displayStatus = ChallengeStatus.FINALIZED;
      } else {
        const statusMap: Record<string, string> = {
          DRAFT: ChallengeStatus.DRAFT,
          ACTIVE: ChallengeStatus.ACTIVE,
          EVALUATION: ChallengeStatus.EVALUATING,
        };
        displayStatus = statusMap[challenge.status] || challenge.status;
      }

      return {
        id: challenge.id,
        title: challenge.title,
        companyName,
        status: displayStatus,
        totalInteractions,
        averageScore,
      };
    });

    return {
      totalCompanies,
      totalChallenges: {
        all: totalChallenges,
        active: activeChallenges,
      },
      totalIdeas,
      challengesPerformance,
    };
  }

  // Allowed domains (whitelist)
  async getAllowedDomains() {
    return this.prisma.allowedDomain.findMany({ orderBy: { domain: 'asc' } });
  }

  async createAllowedDomain(domain: string) {
    return this.prisma.allowedDomain.create({ data: { domain, isActive: true } });
  }

  async deleteAllowedDomain(id: string) {
    return this.prisma.allowedDomain.delete({ where: { id } });
  }

  async updateAllowedDomainStatus(id: string, isActive: boolean) {
    return this.prisma.allowedDomain.update({
      where: { id },
      data: { isActive },
    });
  }

  // ─── Faculty Management ────────────────────────────────────────────────────

  async createFaculty(data: { name: string }) {
    return this.prisma.faculty.create({ data });
  }

  async updateFaculty(id: string, data: { name: string }) {
    return this.prisma.faculty.update({
      where: { id },
      data,
    });
  }

  async updateFacultyStatus(id: string, isActive: boolean) {
    return this.prisma.faculty.update({
      where: { id },
      data: { isActive },
    });
  }

  async removeFaculty(id: string) {
    return this.prisma.faculty.delete({
      where: { id },
    });
  }

  // ─── User Search & Role Management (E2.3) ──────────────────────────────────

  async searchUsers(
    query?: string,
    roleFilter?: string,
    page = 1,
    limit = 20,
  ) {
    const where: any = {};

    // ILIKE search on email and displayName
    if (query && query.trim().length > 0) {
      where.OR = [
        { email: { contains: query.trim(), mode: 'insensitive' } },
        { displayName: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    // Optional role filter
    if (roleFilter && ['ADMIN', 'COMPANY', 'JUDGE', 'USER'].includes(roleFilter.toUpperCase())) {
      where.role = roleFilter.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          status: true,
          faculty: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { displayName: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async updateUserRole(userId: string, newRole: 'ADMIN' | 'COMPANY' | 'JUDGE' | 'USER') {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify user exists and capture current role
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, displayName: true, email: true },
      });

      if (!existingUser) {
        return null; // Service layer will throw NotFoundException
      }

      const previousRole = existingUser.role;

      // 2. Skip if role is the same
      if (previousRole === newRole) {
        return {
          user: existingUser,
          previousRole,
          newRole,
          changed: false,
        };
      }

      // 3. Atomic role update within the same transaction
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          avatarUrl: true,
          faculty: { select: { id: true, name: true } },
          updatedAt: true,
        },
      });

      return {
        user: updatedUser,
        previousRole,
        newRole,
        changed: true,
      };
    });
  }
}
