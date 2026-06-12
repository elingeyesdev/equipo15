import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EvaluationRepository } from './evaluation.repository';
import { UserService } from '../user/user.service';

type EvaluationScoreRow = {
  score: number;
  criterion: {
    id: string;
    name: string;
    description?: string | null;
    weight: number;
  };
};

type EvaluationRow = {
  id: string;
  feedback?: string | null;
  createdAt: Date;
  judge: {
    id: string;
    displayName: string | null;
    nickname: string | null;
    email: string;
    avatarUrl: string | null;
  };
  scores: EvaluationScoreRow[];
};

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private readonly evaluationRepository: EvaluationRepository,
    private readonly userService: UserService,
  ) {}

  async evaluateIdea(evaluationData: any, userRole: string): Promise<any> {
    if (userRole !== 'ADMIN') {
      const isAssigned = await this.evaluationRepository.checkJudgeAssignment(
        evaluationData.ideaId,
        evaluationData.judgeId,
      );
      if (!isAssigned) {
        throw new ForbiddenException('No estás asignado a este reto como juez.');
      }
    }

    const evaluation = await this.evaluationRepository.create(evaluationData);
    this.logger.log(
      `Idea evaluada: ID ${evaluation.ideaId} por Juez ${evaluation.judgeId} con ${evaluation.scores?.length || 0} criterios evaluados`,
    );
    return evaluation;
  }

  private computeJudgeScore(scores: EvaluationScoreRow[]): number {
    return scores.reduce((sum, item) => {
      const weight = item.criterion?.weight ?? 0;
      return sum + item.score * (weight / 100);
    }, 0);
  }

  private buildBreakdown(evaluations: EvaluationRow[], idea: {
    id: string;
    title: string;
    finalScore: number;
    challenge: { id: string; title: string };
  }) {
    const enrichedEvaluations = evaluations.map((evaluation) => ({
      id: evaluation.id,
      feedback: evaluation.feedback,
      createdAt: evaluation.createdAt,
      judge: evaluation.judge,
      judgeScore: this.computeJudgeScore(evaluation.scores),
      scores: evaluation.scores.map((item) => ({
        score: item.score,
        criterion: item.criterion,
      })),
    }));

    const judgeScores = enrichedEvaluations.map((item) => item.judgeScore);
    const averageJudgeScore =
      judgeScores.length > 0
        ? judgeScores.reduce((sum, score) => sum + score, 0) / judgeScores.length
        : 0;

    const criteriaMap = new Map<
      string,
      { id: string; name: string; weight: number; total: number; count: number }
    >();

    enrichedEvaluations.forEach((evaluation) => {
      evaluation.scores.forEach((item) => {
        const current = criteriaMap.get(item.criterion.id) ?? {
          id: item.criterion.id,
          name: item.criterion.name,
          weight: item.criterion.weight,
          total: 0,
          count: 0,
        };
        current.total += item.score;
        current.count += 1;
        criteriaMap.set(item.criterion.id, current);
      });
    });

    const criteriaAverages = Array.from(criteriaMap.values()).map((item) => ({
      id: item.id,
      name: item.name,
      weight: item.weight,
      averageScore: item.count > 0 ? item.total / item.count : 0,
    }));

    return {
      ideaId: idea.id,
      ideaTitle: idea.title,
      challengeId: idea.challenge.id,
      challengeTitle: idea.challenge.title,
      finalScore: idea.finalScore,
      summary: {
        judgesCount: enrichedEvaluations.length,
        averageJudgeScore,
        averageFinalScore: averageJudgeScore,
        criteriaAverages,
      },
      evaluations: enrichedEvaluations,
    };
  }

  async findByIdea(ideaId: string, firebaseUid: string) {
    const user = await this.userService.findByUid(firebaseUid);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const idea = await this.evaluationRepository.findIdeaContext(ideaId);
    if (!idea) throw new NotFoundException('Idea no encontrada');

    if (user.role === 'COMPANY' && idea.challenge.authorId !== user.id) {
      throw new ForbiddenException(
        'No tienes permisos para consultar las evaluaciones de esta idea.',
      );
    }

    const evaluations = await this.evaluationRepository.findByIdeaId(ideaId);
    return this.buildBreakdown(evaluations, idea);
  }

  async findByJudge(judgeId: string) {
    return this.evaluationRepository.findByJudgeId(judgeId);
  }

  async findMyEvaluations(judgeId: string) {
    const evaluations =
      await this.evaluationRepository.findByJudgeIdWithDetails(judgeId);

    return evaluations.map((evaluation) => {
      const judgeScore = this.computeJudgeScore(evaluation.scores || []);
      return {
        id: evaluation.id,
        feedback: evaluation.feedback,
        createdAt: evaluation.createdAt,
        judgeScore: Math.round(judgeScore * 100) / 100,
        idea: evaluation.idea,
        scores: (evaluation.scores || []).map(
          (s: { score: number; criterion: any }) => ({
            score: s.score,
            criterion: s.criterion,
          }),
        ),
      };
    });
  }
}
