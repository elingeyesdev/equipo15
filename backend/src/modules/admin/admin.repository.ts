import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ChallengeStatus } from '../../common/enums/challenge-status.enum';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
