import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationService } from './evaluation.service';
import { EvaluationRepository } from './evaluation.repository';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { ForbiddenException } from '@nestjs/common';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let evaluationRepository: any;

  beforeEach(async () => {
    evaluationRepository = {
      checkJudgeAssignment: jest.fn(),
      create: jest.fn(),
      findIdeaContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        { provide: EvaluationRepository, useValue: evaluationRepository },
        { provide: UserService, useValue: {} },
        { provide: NotificationService, useValue: {} },
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
  });

  describe('Validación de Veredicto Sustentado (Prueba de Ruta Crítica)', () => {
    it('Debe impedir guardar una calificación si la justificación está vacía o es muy corta', async () => {
      // 1. Arrange: Simulamos un juez asignado correctamente
      evaluationRepository.checkJudgeAssignment.mockResolvedValue(true);

      const evaluationDataWithoutFeedback = {
        ideaId: 'idea-123',
        judgeId: 'judge-456',
        feedback: 'Muy', // Solo 3 letras, requiere mínimo 10 para ser válido
        scores: [{ criterionId: 'c1', score: 5 }],
      };

      // 2. Act & 3. Assert: Esperamos un error de prohibición por falta de justificación
      await expect(service.evaluateIdea(evaluationDataWithoutFeedback, 'JUDGE')).rejects.toThrow(
        new ForbiddenException('La justificación del veredicto es obligatoria para guardar la calificación.')
      );
    });
  });
});
