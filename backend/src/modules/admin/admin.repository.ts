import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ChallengeStatus } from '../../common/enums/challenge-status.enum';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanies() {
    const companies = await this.prisma.user.findMany({
      where: { role: 'ORGANIZATION' },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        displayName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        authoredChallenges: {
          select: { status: true, submissionsCloseAt: true },
        },
      },
      orderBy: { displayName: 'asc' },
    });

    return companies.map((company: any) => {
      let activeChallenges = 0;
      let closedChallenges = 0;

      for (const ch of company.authoredChallenges) {
        if (ch.status === 'PUBLISHED' || ch.status === 'EVALUATING') {
          activeChallenges++;
        } else if (ch.status === 'CLOSED') {
          closedChallenges++;
        }
      }

      const { authoredChallenges: _, ...rest } = company;
      return { ...rest, activeChallenges, closedChallenges };
    });
  }

  async findCompanyById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, role: 'ORGANIZATION' },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        displayName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getGlobalAnalytics() {
    const [
      totalCompanies,
      totalChallenges,
      activeChallenges,
      totalIdeas,
      rawChallenges,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'ORGANIZATION' } }),
      this.prisma.challenge.count(),
      this.prisma.challenge.count({
        where: { status: 'PUBLISHED' },
      }),
      this.prisma.idea.count(),
      this.prisma.challenge.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          submissionsCloseAt: true,
          author: {
            select: {
              displayName: true,
            },
          },
          ideas: {
            select: {
              likesCount: true,
              commentsCount: true,
              finalScore: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const challengesPerformance = rawChallenges.map((challenge) => {
      const companyName = challenge.author.displayName || 'Compañía';

      let totalInteractions = 0;
      let evaluatedIdeasCount = 0;
      let sumScores = 0;

      for (const idea of challenge.ideas) {
        totalInteractions += idea.likesCount + idea.commentsCount;
        if (idea.finalScore > 0) {
          sumScores += idea.finalScore;
          evaluatedIdeasCount++;
        }
      }

      const averageScore =
        evaluatedIdeasCount > 0
          ? Number((sumScores / evaluatedIdeasCount).toFixed(1))
          : null;

      let displayStatus = challenge.status;
      if (
        challenge.submissionsCloseAt &&
        new Date(challenge.submissionsCloseAt) < new Date()
      ) {
        displayStatus = ChallengeStatus.CLOSED;
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

  async createFaculty(name: string) {
    return this.prisma.faculty.create({
      data: { name },
    });
  }

  async updateFaculty(id: string, name: string) {
    return this.prisma.faculty.update({
      where: { id },
      data: { name },
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

  async searchUsers(query?: string, roleFilter?: string, page = 1, limit = 20) {
    const where: any = {};

    if (query && query.trim().length > 0) {
      where.OR = [
        { email: { contains: query.trim(), mode: 'insensitive' } },
        { displayName: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    if (
      roleFilter &&
      ['ADMIN', 'COMPANY', 'JUDGE', 'USER'].includes(roleFilter.toUpperCase())
    ) {
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
          role: true,
          status: true,
          studentProfile: {
            select: { faculty: { select: { id: true, name: true } } },
          },
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

  async updateUserRole(
    userId: string,
    newRole: 'ADMIN' | 'COMPANY' | 'JUDGE' | 'USER',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firebaseUid: true,
          role: true,
          displayName: true,
          email: true,
        },
      });

      if (!existingUser) {
        return null;
      }

      const previousRole = existingUser.role;

      if (previousRole === newRole) {
        return {
          user: existingUser,
          previousRole,
          newRole,
          changed: false,
        };
      }

      let removedChallenges: Array<{ challengeTitle: string; companyUserId: string }> = [];

      if (previousRole === 'JUDGE' && newRole !== 'JUDGE') {
        const assignments = await tx.challengeJudge.findMany({
          where: { judgeId: userId },
          include: { challenge: { select: { id: true, title: true, authorId: true } } },
        });

        for (const assignment of assignments) {
          const hasEvaluations = await tx.evaluation.findFirst({
            where: { judgeId: userId, idea: { challengeId: assignment.challengeId } },
          });

          if (!hasEvaluations) {
            await tx.challengeJudge.delete({
              where: {
                challengeId_judgeId: {
                  challengeId: assignment.challengeId,
                  judgeId: userId,
                },
              },
            });
            removedChallenges.push({
              challengeTitle: assignment.challenge.title,
              companyUserId: assignment.challenge.authorId,
            });
          }
        }
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: newRole as import('@prisma/client').UserRole },
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          studentProfile: {
            select: { faculty: { select: { id: true, name: true } } },
          },
          updatedAt: true,
        },
      });

      return {
        user: updatedUser,
        previousRole,
        newRole,
        changed: true,
        removedChallenges,
      };
    });
  }

  async getAllowedDomains() {
    return this.prisma.allowedDomain.findMany({
      orderBy: { domain: 'asc' },
    });
  }

  async createAllowedDomain(domain: string) {
    return this.prisma.allowedDomain.create({
      data: { domain, isActive: true },
    });
  }

  async deleteAllowedDomain(id: string) {
    return this.prisma.allowedDomain.delete({
      where: { id },
    });
  }

  async updateAllowedDomainStatus(id: string, isActive: boolean) {
    return this.prisma.allowedDomain.update({
      where: { id },
      data: { isActive },
    });
  }

  async getUserReputation(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        totalPoints: true,
        createdAt: true,
        studentProfile: {
          select: {
            faculty: { select: { id: true, name: true } },
          },
        },
        ideas: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            problem: true,
            solution: true,
            status: true,
            likesCount: true,
            commentsCount: true,
            fireScore: true,
            finalScore: true,
            isAnonymous: true,
            createdAt: true,

            challenge: {
              select: { id: true, title: true, logoUrl: true, status: true },
            },
          },
        },
        penalties: {
          where: { revokedAt: null },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            reason: true,
            isAutomatic: true,
            expiresAt: true,
            revokedAt: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getChallengeAuditIdeas(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, title: true, status: true },
    });

    if (!challenge) return null;

    const ideas = await this.prisma.idea.findMany({
      where: {
        challengeId,
        deletedAt: null,
        status: { in: ['FINALIST', 'WINNER'] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        finalScore: true,
        createdAt: true,
        problem: true,
        solution: true,
        author: {
          select: {
            displayName: true,
            nickname: true,
          },
        },
        _count: {
          select: { evaluations: true },
        },
      },
      orderBy: [{ finalScore: 'desc' }, { createdAt: 'asc' }],
    });

    return {
      challenge,
      ideas: ideas.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        status: idea.status,
        finalScore: idea.finalScore,
        createdAt: idea.createdAt,
        problem: idea.problem,
        solution: idea.solution,
        authorName:
          idea.author?.nickname || idea.author?.displayName || 'Participante',
        evaluationsCount: idea._count.evaluations,
      })),
    };
  }

  async moderateComment(commentId: string, adminId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        select: { id: true, deletedAt: true, ideaId: true },
      });

      if (!comment || comment.deletedAt) {
        return null;
      }

      const updatedComment = await tx.comment.update({
        where: { id: commentId },
        data: {
          deletedAt: new Date(),
          deletedById: adminId,
          deleteReason: reason,
        },
      });

      await tx.idea.update({
        where: { id: comment.ideaId },
        data: { commentsCount: { decrement: 1 } },
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'DELETE_COMMENT',
          targetType: 'COMMENT',
          targetId: commentId,
          reason,
        },
      });

      return updatedComment;
    });
  }
}
