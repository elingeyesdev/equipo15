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

  async findByIdeaId(ideaId: string): Promise<any[]> {
    return this.prisma.evaluation.findMany({
      where: { ideaId },
      include: {
        judge: { select: { displayName: true } },
        scores: { include: { criterion: true } },
      },
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
