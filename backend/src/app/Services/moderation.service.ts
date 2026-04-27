import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from '../Gateways/events.gateway';
import { UserRepository } from '../Repositories/user.repository';
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
  private readonly unlikeHistory = new Map<string, ActionLog[]>();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async trackUnlike(userId: string): Promise<void> {
    const now = Date.now();
    let history = this.unlikeHistory.get(userId) || [];

    history.push({ timestamp: now });

    const sixtyMinsAgo = now - 60 * 60 * 1000;
    history = history.filter((log) => log.timestamp > sixtyMinsAgo);
    this.unlikeHistory.set(userId, history);

    const thirtyMinsAgo = now - 30 * 60 * 1000;
    const unlikesLast30Min = history.filter(
      (log) => log.timestamp > thirtyMinsAgo,
    ).length;
    const unlikesLast60Min = history.length;

    const rules = MODERATION_RULES[CURRENT_SCALE];

    if (unlikesLast60Min >= rules.likesThresholdPhase2) {
      await this.applyPenalty(userId, 'SUSPENDED', rules.penaltyHoursPhase2);
      return;
    }

    if (unlikesLast30Min >= rules.likesThresholdPhase1) {
      await this.applyPenalty(userId, 'SOFT_BLOCK', rules.penaltyHoursPhase1);
      return;
    }
  }

  private async applyPenalty(
    userId: string,
    status: 'SOFT_BLOCK' | 'SUSPENDED',
    hours: number,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status === 'SUSPENDED') return;
    if (status === 'SOFT_BLOCK' && user.status === 'SOFT_BLOCK') return;

    const expiresAt = new Date();
    expiresAt.setUTCHours(expiresAt.getUTCHours() + hours);

    await this.userRepository.updateStatus(userId, status, expiresAt);

    this.logger.warn(
      `Moderation: User ${userId} (${user.email}) changed to ${status} for ${hours} hours.`,
    );

    if (status === 'SOFT_BLOCK') {
      this.eventsGateway.server.emit(`user:soft_block:${userId}`, {
        message:
          'Hemos detectado una actividad inusual en tus interacciones. Para proteger la integridad del Mural de Ideas, esta función se pausará temporalmente.',
        hours,
      });
    } else if (status === 'SUSPENDED') {
      this.eventsGateway.server.emit(`user:suspended:${userId}`, {
        message:
          'Debido a la persistencia en la modificación masiva de datos, tu cuenta ha sido desactivada para proteger la competencia.',
        expiresAt: expiresAt.toISOString(),
      });
      this.unlikeHistory.delete(userId);
    }
  }
}
