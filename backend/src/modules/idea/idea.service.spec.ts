import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { IdeaService } from './idea.service';
import { IdeaRepository } from './idea.repository';
import { ChallengeRepository } from '../challenge/challenge.repository';
import { UserRepository } from '../user/user.repository';
import { EventsGateway } from '../../infrastructure/events/events.gateway';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { ModerationService } from '../moderation/moderation.service';

describe('IdeaService', () => {
  let service: IdeaService;

  beforeEach(async () => {
    const mockSocketServer = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdeaService,
        { provide: IdeaRepository, useValue: {} },
        { provide: ChallengeRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
        { provide: getModelToken('ProjectDetails'), useValue: {} },
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
      ] as any[],
    }).compile();

    service = module.get<IdeaService>(IdeaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be an instance of IdeaService', () => {
    expect(service).toBeInstanceOf(IdeaService);
  });
});
