import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { EventsGateway } from '../../infrastructure/events/events.gateway';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByUid: jest.fn(),
      findByEmail: jest.fn(),
      findActivePenalties: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepository },
        { provide: EventsGateway, useValue: {} },
        { provide: RedisService, useValue: { delByPrefix: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('Verificación de Integridad del Perfil (Prueba de Ruta Crítica)', () => {
    it('Debe rechazar el registro de un nuevo usuario si no proporciona número de teléfono', async () => {
      // 1. Arrange: Simulamos que el usuario NO existe en base de datos
      userRepository.findByUid.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);

      const invalidUserDto = {
        firebaseUid: 'new-uid-123',
        email: 'alumno@est.upb.edu',
        displayName: 'Juan Perez',
        phone: '', // Teléfono vacío/inexistente
      };

      // 2. Act & 3. Assert: Esperamos que lance BadRequestException
      await expect(service.findOrCreate(invalidUserDto)).rejects.toThrow(
        new BadRequestException('El número de teléfono es obligatorio para el registro.')
      );
    });
  });
});
