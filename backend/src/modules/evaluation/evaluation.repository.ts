import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class EvaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    const { scores, ...evaluationData } = data;
    return this.prisma.evaluation.create({
      data: {
        ...evaluationData,
        scores: {
          create: scores.map(
            (s: { criterionId: string; score: number }) => ({
              criterionId: s.criterionId,
              score: s.score,
            }),
          ),
        },
      },
      include: { scores: { include: { criterion: true } } },
    });
  }

  async checkJudgeAssignment(ideaId: string, judgeId: string): Promise<boolean> {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      select: { challengeId: true },
    });
    if (!idea) return false;

    const count = await this.prisma.challengeJudge.count({
      where: {
        challengeId: idea.challengeId,
        judgeId,
      },
    });
    return count > 0;
  }

  async findIdeaContext(ideaId: string) {
    return this.prisma.idea.findUnique({
      where: { id: ideaId, deletedAt: null },
      select: {
        id: true,
        title: true,
        finalScore: true,
        challenge: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
      },
    });
  }

  async findByIdeaId(ideaId: string): Promise<any[]> {
    return this.prisma.evaluation.findMany({
      where: { ideaId },
      include: {
        judge: {
          select: {
            id: true,
            displayName: true,
            nickname: true,
            email: true,
            avatarUrl: true,
          },
        },
        scores: {
          include: {
            criterion: {
              select: {
                id: true,
                name: true,
                description: true,
                weight: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByJudgeId(judgeId: string): Promise<any[]> {
    return this.prisma.evaluation.findMany({
      where: { judgeId },
      include: {
        idea: true,
        scores: { include: { criterion: true } },
      },
    });
  }

  async findByJudgeIdWithDetails(judgeId: string): Promise<any[]> {
    return this.prisma.evaluation.findMany({
      where: { judgeId },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            problem: true,
            solution: true,
            isAnonymous: true,
            finalScore: true,
            status: true,
            impactArea: true,
            improvementType: true,
            effortLevel: true,
            tags: true,
            likesCount: true,
            commentsCount: true,
            createdAt: true,
            multimediaLinks: true,
            author: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            challenge: {
              select: {
                id: true,
                title: true,
                companyContext: true,
              },
            },
          },
        },
        scores: {
          include: {
            criterion: {
              select: {
                id: true,
                name: true,
                description: true,
                weight: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
