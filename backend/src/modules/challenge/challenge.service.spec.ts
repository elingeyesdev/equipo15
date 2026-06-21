import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeService } from './challenge.service';
import { ChallengeRepository } from './challenge.repository';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { NotificationService } from '../notification/notification.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FinalizePodiumDto } from './dtos/finalize-podium.dto';

describe('ChallengeService', () => {
  let service: ChallengeService;
  let challengeRepository: any;
  let userService: any;

  beforeEach(async () => {
    challengeRepository = {
      findById: jest.fn(),
      getPodiumIdeas: jest.fn(),
      finalizePodium: jest.fn(),
      assignJudges: jest.fn(),
    };

    userService = {
      findByUid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengeService,
        { provide: ChallengeRepository, useValue: challengeRepository },
        { provide: UserService, useValue: userService },
        { provide: PrismaService, useValue: {} },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delByPrefix: jest.fn(),
          },
        },
        { provide: NotificationService, useValue: {} },
      ],
    }).compile();

    service = module.get<ChallengeService>(ChallengeService);
  });

  describe('Algoritmo de Generación de Podio (Prueba de Ruta Crítica)', () => {
    it('Debe impedir que un usuario genere el podio si no es el creador del reto', async () => {
      // 1. Arrange: Simulamos que un juez o alumno intenta finalizar el reto
      userService.findByUid.mockResolvedValue({ id: 'user-hacker', status: 'ACTIVE' });
      challengeRepository.findById.mockResolvedValue({
        id: 'challenge-1',
        authorId: 'user-real-company', // El autor real es otro
      });

      const dto: FinalizePodiumDto = { podiumSize: 5 };

      // 2. Act & 3. Assert: Esperamos un error de acceso denegado
      await expect(service.finalizePodium('challenge-1', dto, 'firebase-uid')).rejects.toThrow(
        new ForbiddenException('No tienes permisos para finalizar este reto.')
      );
    });
  });

  describe('Asignación de Jerarquía Evaluadora (Prueba de Ruta Crítica)', () => {
    it('Debe rechazar la asignación si la empresa no es la dueña del reto', async () => {
      // 1. Arrange
      userService.findByUid.mockResolvedValue({ id: 'user-other-company', status: 'ACTIVE' });
      challengeRepository.findById.mockResolvedValue({
        id: 'challenge-2',
        authorId: 'user-real-company',
        status: 'PUBLISHED',
      });

      // 2. Act & 3. Assert
      await expect(service.assignJudges('challenge-2', { judgeIds: ['judge-1'] }, 'firebase-uid')).rejects.toThrow(
        new ForbiddenException('No tienes permisos para asignar jueces a este reto.')
      );
    });
  });
});
