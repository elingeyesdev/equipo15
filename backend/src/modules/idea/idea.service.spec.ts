import { Test, TestingModule } from '@nestjs/testing';
import { IdeaService } from './idea.service';
import { IdeaRepository } from './idea.repository';
import { ChallengeRepository } from '../challenge/challenge.repository';
import { UserRepository } from '../user/user.repository';
import { EventsGateway } from '../../infrastructure/events/events.gateway';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { ModerationService } from '../moderation/moderation.service';
import { NotificationService } from '../notification/notification.service';
import { BadRequestException } from '@nestjs/common';
import { CreateIdeaDto } from './dtos/create-idea.dto';

describe('IdeaService', () => {
  let service: IdeaService;
  let challengeRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    const mockSocketServer = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };

    challengeRepository = {
      findById: jest.fn(),
    };

    userRepository = {
      findByUid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdeaService,
        { provide: IdeaRepository, useValue: {} },
        { provide: ChallengeRepository, useValue: challengeRepository },
        { provide: UserRepository, useValue: userRepository },
        { provide: EventsGateway, useValue: { server: mockSocketServer } },
        EventBus,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            delByPrefix: jest.fn(),
          },
        },
        { provide: ModerationService, useValue: { trackUnlike: jest.fn() } },
        { provide: NotificationService, useValue: {} },
      ] as any[],
    }).compile();

    service = module.get<IdeaService>(IdeaService);
  });

  describe('Bloqueo de Caducidad de Retos (Prueba de Ruta Crítica)', () => {
    it('Debe lanzar BadRequestException si el reto ya ha expirado', async () => {
      // 1. Arrange: Preparamos los datos simulando un reto que cerró ayer
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Ayer
      
      userRepository.findByUid.mockResolvedValue({ id: 'user-1', status: 'ACTIVE' });
      challengeRepository.findById.mockResolvedValue({
        id: 'challenge-1',
        title: 'Reto de Prueba',
        status: 'PUBLISHED',
        submissionsCloseAt: pastDate, // Ya expiró
      });

      const createIdeaDto: CreateIdeaDto = {
        title: 'Idea de innovación sostenible para el campus',
        problem: 'El problema es que hay mucho desperdicio de agua en el campus principal todos los días.',
        solution: 'Implementar un sistema de captación de lluvia y reciclaje de agua gris para riego en jardines.',
        challengeId: 'challenge-1',
        status: 'public',
      };

      // 2. Act & 3. Assert: Intentamos crear la idea y verificamos la excepción esperada
      await expect(service.create(createIdeaDto, 'firebase-uid-123')).rejects.toThrow(
        new BadRequestException('El reto ha expirado y ya no acepta más propuestas.')
      );
    });
  });

  describe('Restricciones de 24h y Estado de Reto en Edicion/Eliminacion', () => {
    let mockIdeaRepository: any;

    beforeEach(() => {
      mockIdeaRepository = {
        findById: jest.fn(),
        update: jest.fn(),
        softDeleteIdea: jest.fn(),
      };
      (service as any).ideaRepository = mockIdeaRepository;
      (service as any).notificationService = { createNotification: jest.fn() };
    });

    it('Debe lanzar ForbiddenException si se edita la idea despues de 24 horas', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      userRepository.findByUid.mockResolvedValue({ id: 'user-1', role: 'USER', status: 'ACTIVE' });
      mockIdeaRepository.findById.mockResolvedValue({
        id: 'idea-1',
        authorId: 'user-1',
        createdAt: pastDate,
        challenge: { status: 'PUBLISHED' },
      });

      await expect(
        service.updateIdea('idea-1', { title: 'Nuevo Titulo' }, 'uid-1'),
      ).rejects.toThrow(
        'No puedes editar una propuesta después de 24 horas de haber sido publicada.',
      );
    });

    it('Debe lanzar ForbiddenException si se edita la idea cuando el reto esta cerrado', async () => {
      const now = new Date();

      userRepository.findByUid.mockResolvedValue({ id: 'user-1', role: 'USER', status: 'ACTIVE' });
      mockIdeaRepository.findById.mockResolvedValue({
        id: 'idea-1',
        authorId: 'user-1',
        createdAt: now,
        challenge: { status: 'CLOSED' },
      });

      await expect(
        service.updateIdea('idea-1', { title: 'Nuevo Titulo' }, 'uid-1'),
      ).rejects.toThrow(
        'No puedes editar una propuesta si el reto está en evaluación o cerrado.',
      );
    });

    it('Debe lanzar ForbiddenException si se elimina la idea despues de 24 horas', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      userRepository.findByUid.mockResolvedValue({ id: 'user-1', role: 'USER', status: 'ACTIVE' });
      mockIdeaRepository.findById.mockResolvedValue({
        id: 'idea-1',
        authorId: 'user-1',
        createdAt: pastDate,
        challenge: { status: 'PUBLISHED' },
      });

      await expect(
        service.deleteIdea('idea-1', 'uid-1'),
      ).rejects.toThrow(
        'No puedes eliminar una propuesta después de 24 horas de haber sido publicada.',
      );
    });
  });
});
