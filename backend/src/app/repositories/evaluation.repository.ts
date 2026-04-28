import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/database.service';
import { Evaluation } from '@prisma/client';

@Injectable()
export class EvaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Evaluation> {
    return this.prisma.evaluation.create({
      data,
    });
  }

  async findByIdeaId(ideaId: string): Promise<Evaluation[]> {
    return this.prisma.evaluation.findMany({
      where: { ideaId },
      include: { judge: { select: { displayName: true } } },
    });
  }

  async findByJudgeId(judgeId: string): Promise<Evaluation[]> {
    return this.prisma.evaluation.findMany({
      where: { judgeId },
      include: { idea: true },
    });
  }
}
