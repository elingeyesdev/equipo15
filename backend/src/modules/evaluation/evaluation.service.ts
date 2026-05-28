import { Injectable, Logger } from '@nestjs/common';
import { EvaluationRepository } from './evaluation.repository';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(private readonly evaluationRepository: EvaluationRepository) {}

  async evaluateIdea(evaluationData: any): Promise<any> {
    const evaluation = await this.evaluationRepository.create(evaluationData);
    this.logger.log(
      `Idea evaluada: ID ${evaluation.ideaId} por Juez ${evaluation.judgeId} con ${evaluation.scores?.length || 0} criterios evaluados`,
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
