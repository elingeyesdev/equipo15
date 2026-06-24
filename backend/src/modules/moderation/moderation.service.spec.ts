import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { UserRepository } from '../user/user.repository';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('ModerationService', () => {
  let service: ModerationService;
  let redisService: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;
  let eventBus: Record<string, jest.Mock>;
  let prismaUserFindUnique: jest.Mock;
  let prismaUserUpdate: jest.Mock;
  let prismaPenaltyCreate: jest.Mock;

  beforeEach(async () => {
    redisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    userRepo = {
      findById: jest.fn().mockResolvedValue(null),
    };

    eventBus = {
      emit: jest.fn(),
      emitToRoom: jest.fn(),
    };

    prismaUserFindUnique = jest.fn().mockResolvedValue({ id: 'user-1', status: 'ACTIVE' });
    prismaUserUpdate = jest.fn().mockResolvedValue({});
    prismaPenaltyCreate = jest.fn().mockResolvedValue({});

    const prismaMock = {
      $transaction: jest.fn().mockImplementation((cb) => {
        const tx = {
          user: {
            findUnique: prismaUserFindUnique,
            update: prismaUserUpdate,
          },
          penalty: {
            create: prismaPenaltyCreate,
          },
        };
        return cb(tx);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: UserRepository, useValue: userRepo },
        { provide: EventBus, useValue: eventBus },
        { provide: RedisService, useValue: redisService },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackUnlike', () => {
    it('should store action in redis', async () => {
      redisService.get.mockResolvedValue([]);
      await service.trackUnlike('user-1', 'idea-1');
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should filter actions older than 60 minutes', async () => {
      const oldTimestamp = Date.now() - 61 * 60 * 1000;
      redisService.get.mockResolvedValue([{ timestamp: oldTimestamp }]);
      await service.trackUnlike('user-1', 'idea-1');
      const setCall = redisService.set.mock.calls[0];
      const savedHistory = setCall[1] as { timestamp: number }[];
      expect(savedHistory.length).toBe(1);
      expect(savedHistory[0].timestamp).toBeGreaterThan(oldTimestamp);
    });

    it('should ignore duplicate actions on same idea within 10 seconds', async () => {
      const now = Date.now();
      redisService.get.mockResolvedValue([{ timestamp: now - 2000, ideaId: 'idea-1' }]);
      await service.trackUnlike('user-1', 'idea-1');
      expect(redisService.set).not.toHaveBeenCalled();
    });

    it('should allow actions on same idea after 10 seconds', async () => {
      const now = Date.now();
      redisService.get.mockResolvedValue([{ timestamp: now - 12000, ideaId: 'idea-1' }]);
      await service.trackUnlike('user-1', 'idea-1');
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe('applyPenalty', () => {
    it('should skip if user not found', async () => {
      prismaUserFindUnique.mockResolvedValue(null);
      userRepo.findById.mockResolvedValue(null);
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 1, 'EXCESSIVE_LIKE_REMOVAL');
      expect(prismaUserUpdate).not.toHaveBeenCalled();
    });

    it('should skip if user is already SUSPENDED', async () => {
      prismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        status: 'SUSPENDED',
      });
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 1, 'EXCESSIVE_LIKE_REMOVAL');
      expect(prismaUserUpdate).not.toHaveBeenCalled();
    });

    it('should skip SOFT_BLOCK if already SOFT_BLOCKED', async () => {
      prismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        status: 'SOFT_BLOCK',
      });
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 1, 'EXCESSIVE_LIKE_REMOVAL');
      expect(prismaUserUpdate).not.toHaveBeenCalled();
    });

    it('should apply SOFT_BLOCK to ACTIVE user', async () => {
      prismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        status: 'ACTIVE',
      });
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'ACTIVE',
      });
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 2, 'EXCESSIVE_LIKE_REMOVAL');
      expect(prismaUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { status: 'SOFT_BLOCK' },
        }),
      );
      expect(eventBus.emitToRoom).toHaveBeenCalledWith(
        'user:fb-1',
        'user:soft_block:user-1',
        expect.objectContaining({ hours: 2 }),
      );
    });

    it('should apply SUSPENDED and clean redis', async () => {
      prismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        status: 'ACTIVE',
      });
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'ACTIVE',
      });
      await (service as any).applyPenalty('user-1', 'SUSPENDED', 24, 'EXCESSIVE_LIKE_REMOVAL');
      expect(prismaUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { status: 'SUSPENDED' },
        }),
      );
      expect(redisService.del).toHaveBeenCalledWith('mod:unlike:user-1');
      expect(eventBus.emitToRoom).toHaveBeenCalledWith(
        'user:fb-1',
        'user:suspended:user-1',
        expect.objectContaining({ expiresAt: expect.any(String) }),
      );
    });

    it('should set expiration correctly', async () => {
      prismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        status: 'ACTIVE',
      });
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'ACTIVE',
      });
      const before = new Date();
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 3, 'EXCESSIVE_LIKE_REMOVAL');
      const passedDate = prismaPenaltyCreate.mock.calls[0][0].data.expiresAt as Date;
      const diffHours =
        (passedDate.getTime() - before.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThanOrEqual(2.9);
      expect(diffHours).toBeLessThanOrEqual(3.1);
    });
  });
});
