import { Injectable, Logger } from '@nestjs/common';
import { EvaluationRepository } from '../repositories/evaluation.repository';
import { Evaluation } from '@prisma/client';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(private readonly evaluationRepository: EvaluationRepository) {}

  async evaluateIdea(evaluationData: any): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.create(evaluationData);
    this.logger.log(
      `Idea evaluada: ID ${evaluation.ideaId} por Juez ${evaluation.judgeId} con puntaje ${evaluation.score}`,
    );
    return evaluation;
  }

  async findByIdea(ideaId: string) {
    return this.evaluationRepository.findByIdeaId(ideaId);
  }

  async findByJudge(judgeId: string) {
    return this.evaluationRepository.findByJudgeId(judgeId);
  }
}
