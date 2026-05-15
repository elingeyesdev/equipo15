import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { UserRepository } from '../user/user.repository';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';

describe('ModerationService', () => {
  let service: ModerationService;
  let redisService: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;
  let eventBus: Record<string, jest.Mock>;

  beforeEach(async () => {
    redisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    userRepo = {
      findById: jest.fn().mockResolvedValue(null),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };

    eventBus = {
      emit: jest.fn(),
      emitToRoom: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: UserRepository, useValue: userRepo },
        { provide: EventBus, useValue: eventBus },
        { provide: RedisService, useValue: redisService },
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
      await service.trackUnlike('user-1');
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should filter actions older than 60 minutes', async () => {
      const oldTimestamp = Date.now() - 61 * 60 * 1000;
      redisService.get.mockResolvedValue([{ timestamp: oldTimestamp }]);
      await service.trackUnlike('user-1');
      const setCall = redisService.set.mock.calls[0];
      const savedHistory = setCall[1] as { timestamp: number }[];
      expect(savedHistory.length).toBe(1);
      expect(savedHistory[0].timestamp).toBeGreaterThan(oldTimestamp);
    });
  });

  describe('applyPenalty', () => {
    it('should skip if user not found', async () => {
      userRepo.findById.mockResolvedValue(null);
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 1);
      expect(userRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should skip if user is already SUSPENDED', async () => {
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'SUSPENDED',
      });
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 1);
      expect(userRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should skip SOFT_BLOCK if already SOFT_BLOCKED', async () => {
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'SOFT_BLOCK',
      });
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 1);
      expect(userRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should apply SOFT_BLOCK to ACTIVE user', async () => {
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'ACTIVE',
      });
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 2);
      expect(userRepo.updateStatus).toHaveBeenCalledWith(
        'user-1',
        'SOFT_BLOCK',
        expect.any(Date),
      );
      expect(eventBus.emitToRoom).toHaveBeenCalledWith(
        'user:fb-1',
        'user:soft_block:user-1',
        expect.objectContaining({ hours: 2 }),
      );
    });

    it('should apply SUSPENDED and clean redis', async () => {
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'ACTIVE',
      });
      await (service as any).applyPenalty('user-1', 'SUSPENDED', 24);
      expect(userRepo.updateStatus).toHaveBeenCalledWith(
        'user-1',
        'SUSPENDED',
        expect.any(Date),
      );
      expect(redisService.del).toHaveBeenCalledWith('mod:unlike:user-1');
      expect(eventBus.emitToRoom).toHaveBeenCalledWith(
        'user:fb-1',
        'user:suspended:user-1',
        expect.objectContaining({ expiresAt: expect.any(String) }),
      );
    });

    it('should set expiration correctly', async () => {
      userRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@ucb.edu.bo',
        firebaseUid: 'fb-1',
        status: 'ACTIVE',
      });
      const before = new Date();
      await (service as any).applyPenalty('user-1', 'SOFT_BLOCK', 3);
      const passedDate = userRepo.updateStatus.mock.calls[0][2] as Date;
      const diffHours =
        (passedDate.getTime() - before.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThanOrEqual(2.9);
      expect(diffHours).toBeLessThanOrEqual(3.1);
    });
  });
});
