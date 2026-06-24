import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { ChallengeRepository } from '../challenge/challenge.repository';
import { IdeaRepository } from '../idea/idea.repository';
import { UserRepository } from '../user/user.repository';
import { EventsGateway } from '../../infrastructure/events/events.gateway';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { ModerationService } from '../moderation/moderation.service';
import { NotificationService } from '../notification/notification.service';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const mockSocketServer = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: CommentRepository, useValue: {} },
        { provide: ChallengeRepository, useValue: {} },
        { provide: IdeaRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
        { provide: EventsGateway, useValue: { server: mockSocketServer } },
        EventBus,
        {
          provide: RedisService,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        {
          provide: ModerationService,
          useValue: { trackUnlike: jest.fn(), trackCommentAction: jest.fn() },
        },
        {
          provide: NotificationService,
          useValue: { notifyCommentReply: jest.fn(), notifyNewComment: jest.fn() },
        },
      ] as any[],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be an instance of CommentService', () => {
    expect(service).toBeInstanceOf(CommentService);
  });
});
