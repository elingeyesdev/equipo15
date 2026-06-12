import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UserRepository } from '../user/user.repository';
import { PenaltyReason, UserStatus } from '@prisma/client';
import {
  CURRENT_SCALE,
  MODERATION_RULES,
} from '../../config/moderation.config';

interface ActionLog {
  timestamp: number;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly redisService: RedisService,
  ) {}

  async trackUnlike(userId: string): Promise<void> {
    const now = Date.now();
    const key = `mod:unlike:${userId}`;
    let history: ActionLog[] = (await this.redisService.get(key)) || [];

    history.push({ timestamp: now });

    const sixtyMinsAgo = now - 60 * 60 * 1000;
    history = history.filter((log) => log.timestamp > sixtyMinsAgo);
    await this.redisService.set(key, history, 60 * 60 * 1000);

    const thirtyMinsAgo = now - 30 * 60 * 1000;
    const unlikesLast30Min = history.filter(
      (log) => log.timestamp > thirtyMinsAgo,
    ).length;
    const unlikesLast60Min = history.length;

    const rules = MODERATION_RULES[CURRENT_SCALE];

    if (unlikesLast60Min >= rules.likesThresholdPhase2) {
      await this.applyPenalty(
        userId,
        'SUSPENDED',
        rules.penaltyHoursPhase2,
        PenaltyReason.EXCESSIVE_LIKE_REMOVAL,
      );
      return;
    }

    if (unlikesLast30Min >= rules.likesThresholdPhase1) {
      await this.applyPenalty(
        userId,
        'SOFT_BLOCK',
        rules.penaltyHoursPhase1,
        PenaltyReason.EXCESSIVE_LIKE_REMOVAL,
      );
      return;
    }
  }

  async trackCommentAction(userId: string): Promise<void> {
    const now = Date.now();
    const key = `mod:comment:${userId}`;
    let history: ActionLog[] = (await this.redisService.get(key)) || [];

    history.push({ timestamp: now });

    const sixtyMinsAgo = now - 60 * 60 * 1000;
    history = history.filter((log) => log.timestamp > sixtyMinsAgo);
    await this.redisService.set(key, history, 60 * 60 * 1000);

    const thirtyMinsAgo = now - 30 * 60 * 1000;
    const commentsLast30Min = history.filter(
      (log) => log.timestamp > thirtyMinsAgo,
    ).length;
    const commentsLast60Min = history.length;

    const rules = MODERATION_RULES[CURRENT_SCALE];

    if (commentsLast60Min >= (rules as any).commentsThresholdPhase2) {
      await this.applyPenalty(
        userId,
        'SUSPENDED',
        (rules as any).commentPenaltyHoursPhase2,
        PenaltyReason.COMMENT_ABUSE,
      );
      return;
    }

    if (commentsLast30Min >= (rules as any).commentsThresholdPhase1) {
      await this.applyPenalty(
        userId,
        'SOFT_BLOCK',
        (rules as any).commentPenaltyHoursPhase1,
        PenaltyReason.COMMENT_ABUSE,
      );
      return;
    }
  }

  private async applyPenalty(
    userId: string,
    status: 'SOFT_BLOCK' | 'SUSPENDED',
    hours: number,
    reason: PenaltyReason,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setUTCHours(expiresAt.getUTCHours() + hours);

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.status === UserStatus.SUSPENDED) return;
      if (status === 'SOFT_BLOCK' && user.status === UserStatus.SOFT_BLOCK) return;

      const prismaStatus = status === 'SOFT_BLOCK' ? UserStatus.SOFT_BLOCK : UserStatus.SUSPENDED;

      await tx.user.update({
        where: { id: userId },
        data: { status: prismaStatus },
      });

      await tx.penalty.create({
        data: {
          userId,
          reason,
          isAutomatic: true,
          expiresAt,
        },
      });
    });

    // Fetched again or used previous user object to get email and firebaseUid, but we need it.
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    this.logger.warn(
      `Moderation: User ${userId} (${user.email}) changed to ${status} for ${hours} hours.`,
    );

    if (status === 'SOFT_BLOCK') {
      this.eventBus.emitToRoom(
        `user:${user.firebaseUid}`,
        `user:soft_block:${userId}`,
        {
          message:
            'Hemos detectado una actividad inusual en tus interacciones. Para proteger la integridad del Mural de Ideas, esta función se pausará temporalmente.',
          hours,
        },
      );
    } else if (status === 'SUSPENDED') {
      this.eventBus.emitToRoom(
        `user:${user.firebaseUid}`,
        `user:suspended:${userId}`,
        {
          message:
            'Debido a la persistencia en la modificación masiva de datos, tu cuenta ha sido desactivada para proteger la competencia.',
          expiresAt: expiresAt.toISOString(),
        },
      );
      await this.redisService.del(`mod:unlike:${userId}`);
    }
  }
}
