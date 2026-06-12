import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ReferenceType } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyWinners(winners: { userId: string; ideaId: string }[], challengeId: string, challengeTitle: string) {
    if (winners.length === 0) return;

    try {
      const winnerIds = winners.map((w) => w.userId);

      // 1. Save to Internal Inbox
      await this.prisma.notification.createMany({
        data: winners.map((w) => ({
          userId: w.userId,
          type: 'WINNER_ANNOUNCED' as any,
          title: '¡Felicidades! 🎉',
          body: `Tu idea ha sido seleccionada como ganadora en el reto: ${challengeTitle}`,
          referenceType: ReferenceType.IDEA,
          referenceId: w.ideaId,
        })),
      });

      // 2. Get active tokens for winners
      const devices = await this.prisma.userDevice.findMany({
        where: {
          userId: { in: winnerIds },
          fcmToken: { not: '' },
        },
        select: { fcmToken: true },
      });

      const tokens = devices.map((d) => d.fcmToken);

      // 3. Send Push Notifications via FCM
      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: '¡Felicidades! 🎉',
            body: `Tu idea es ganadora en el reto: ${challengeTitle}`,
          },
          data: {
            type: 'WINNER_ANNOUNCED',
            challengeId,
          },
        };

        const response = await admin.messaging().sendEachForMulticast({
          tokens,
          ...payload,
        });

        this.logger.log(
          `Notificaciones FCM enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas.`,
        );
      }
    } catch (error) {
      this.logger.error('Error notificando a los ganadores:', error);
    }
  }

  async notifyJudgeRemoved(companyUserId: string, judgeName: string, challengeTitle: string) {
    try {
      // 1. Save to Internal Inbox
      await this.prisma.notification.create({
        data: {
          userId: companyUserId,
          type: 'JUDGE_REMOVED' as any,
          title: 'Juez removido del sistema',
          body: `El juez ${judgeName} ha sido removido del sistema y ya no evaluará tu reto '${challengeTitle}'. Por favor, asigna un reemplazo si es necesario.`,
        },
      });

      // 2. Get active tokens
      const devices = await this.prisma.userDevice.findMany({
        where: {
          userId: companyUserId,
          fcmToken: { not: '' },
        },
        select: { fcmToken: true },
      });

      const tokens = devices.map((d) => d.fcmToken);

      // 3. Send Push Notifications via FCM
      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: 'Juez removido del sistema',
            body: `El juez ${judgeName} ha sido removido del sistema y ya no evaluará tu reto '${challengeTitle}'.`,
          },
          data: {
            type: 'JUDGE_REMOVED',
          },
        };

        await admin.messaging().sendEachForMulticast({
          tokens,
          ...payload,
        });
      }
    } catch (error) {
      this.logger.error('Error notificando a la empresa sobre juez removido:', error);
    }
  }

  async notifyRoleChanged(userId: string, newRole: string) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'ROLE_UPDATE' as any,
          title: 'Rol Actualizado',
          body: `Tu rol en la plataforma ha sido actualizado a ${newRole}.`,
        },
      });

      const devices = await this.prisma.userDevice.findMany({
        where: { userId, fcmToken: { not: '' } },
        select: { fcmToken: true },
      });
      const tokens = devices.map((d) => d.fcmToken);

      if (tokens.length > 0) {
        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: 'Rol Actualizado',
            body: `Tu rol en la plataforma ha sido actualizado a ${newRole}.`,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error notificando cambio de rol:', error);
    }
  }

  async notifyEvaluationReceived(authorId: string, judgeName: string, challengeTitle: string) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: authorId,
          type: 'IDEA_EVALUATED' as any,
          title: 'Idea Evaluada',
          body: `El juez ${judgeName} ha evaluado tu idea en el reto '${challengeTitle}'.`,
        },
      });

      const devices = await this.prisma.userDevice.findMany({
        where: { userId: authorId, fcmToken: { not: '' } },
        select: { fcmToken: true },
      });
      const tokens = devices.map((d) => d.fcmToken);

      if (tokens.length > 0) {
        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: 'Idea Evaluada',
            body: `El juez ${judgeName} ha evaluado tu idea en el reto '${challengeTitle}'.`,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error notificando evaluación recibida:', error);
    }
  }

  async getMyInbox(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async registerDevice(userId: string, token: string) {
    // Upsert user device using token or something
    const existing = await this.prisma.userDevice.findFirst({
      where: { fcmToken: token },
    });
    if (existing) {
      if (existing.userId !== userId) {
        await this.prisma.userDevice.update({
          where: { id: existing.id },
          data: { userId },
        });
      }
    } else {
      await this.prisma.userDevice.create({
        data: {
          userId,
          fcmToken: token,
          platform: 'WEB' as any,
        },
      });
    }
  }
}
