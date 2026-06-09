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
}
