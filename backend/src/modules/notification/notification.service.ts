import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ReferenceType, NotifType } from '@prisma/client';
import { EventsGateway } from '../../infrastructure/events/events.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getUserByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true, email: true },
    });
  }

  private async sendRealTimeNotification(userId: string, notificationData: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firebaseUid: true, email: true },
      });

      this.logger.log(
        `[WS_NOTIF_PREPARE] Preparando envío WS. userId (DB): ${userId}, firebaseUid: ${user?.firebaseUid}, email: ${user?.email}`,
      );

      if (user?.firebaseUid) {
        const roomName = `user:${user.firebaseUid}`;
        this.eventsGateway.server
          .to(roomName)
          .emit('notification:received', {
            ...notificationData,
            createdAt: new Date().toISOString(),
          });
        this.logger.log(
          `[WS_NOTIF_SENT] Emitido evento "notification:received" a sala "${roomName}". Contenido: ${JSON.stringify(notificationData)}`,
        );
      } else {
        this.logger.warn(
          `[WS_NOTIF_CANCELLED] No se pudo enviar notificación en tiempo real. Usuario no encontrado o sin firebaseUid para userId: ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error enviando notificación en tiempo real via WebSocket:', error);
    }
  }

  async createNotification(
    userId: string,
    type: NotifType,
    title: string,
    body: string,
    referenceId?: string,
    referenceType?: ReferenceType,
  ) {
    try {
      this.logger.log(
        `[NOTIF_CREATE_START] Solicitud de creación de notificación. userId: ${userId}, tipo: ${type}, título: "${title}"`,
      );

      const notif = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          body,
          referenceId,
          referenceType,
        },
      });

      this.logger.log(
        `[NOTIF_CREATE_SUCCESS] Notificación guardada en BD. notifId: ${notif.id}`,
      );

      // Clean up old notifications if there are more than 50
      const MAX_NOTIFICATIONS = 50;
      const totalNotifs = await this.prisma.notification.count({
        where: { userId },
      });

      if (totalNotifs > MAX_NOTIFICATIONS) {
        const oldNotifs = await this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: MAX_NOTIFICATIONS,
          select: { id: true },
        });

        if (oldNotifs.length > 0) {
          await this.prisma.notification.deleteMany({
            where: {
              id: { in: oldNotifs.map((n) => n.id) },
            },
          });
          this.logger.log(`[NOTIF_CLEANUP] Eliminadas ${oldNotifs.length} notificaciones antiguas para userId: ${userId}`);
        }
      }

      await this.sendRealTimeNotification(userId, {
        id: notif.id,
        type,
        title,
        body,
        referenceId,
        referenceType,
      });

      // Find FCM devices
      const devices = await this.prisma.userDevice.findMany({
        where: { userId, fcmToken: { not: '' } },
        select: { fcmToken: true },
      });
      const tokens = devices.map((d) => d.fcmToken);

      this.logger.log(
        `[NOTIF_FCM_CHECK] Dispositivos móviles/tokens FCM encontrados para userId ${userId}: ${tokens.length}`,
      );

      if (tokens.length > 0) {
        const response = await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title,
            body,
          },
          data: {
            type,
            referenceId: referenceId || '',
            referenceType: referenceType || '',
          },
        });
        this.logger.log(
          `[NOTIF_FCM_SENT] Intentos de multicast FCM terminados. Éxitos: ${response.successCount}, Fallidos: ${response.failureCount}`,
        );
      }

      return notif;
    } catch (error) {
      this.logger.error(`Error creando notificación de tipo ${type} para el usuario ${userId}:`, error);
    }
  }

  async notifyWinners(winners: { userId: string; ideaId: string }[], challengeId: string, challengeTitle: string) {
    for (const w of winners) {
      await this.createNotification(
        w.userId,
        NotifType.WINNER_ANNOUNCED,
        '¡Felicidades! 🎉',
        '¡Felicidades! Tu propuesta ha sido seleccionada como ganadora en el podio.',
        w.ideaId,
        ReferenceType.IDEA,
      );
    }
  }

  async notifyJudgeRemoved(companyUserId: string, judgeName: string, challengeTitle: string) {
    await this.createNotification(
      companyUserId,
      NotifType.JUDGE_REMOVED,
      'Alerta de Sistema',
      `Alerta de Sistema: El juez ${judgeName} ha perdido sus credenciales y fue desvinculado de la evaluación de tu reto.`,
      undefined,
      undefined,
    );
  }

  async notifyJudgeAssigned(judgeUserId: string, challengeId: string, challengeTitle: string) {
    await this.createNotification(
      judgeUserId,
      NotifType.JUDGE_ASSIGNED,
      'Nuevo Reto Asignado',
      `Te han asignado como jurado para evaluar las propuestas finalistas del reto '${challengeTitle}'.`,
      challengeId,
      ReferenceType.CHALLENGE,
    );
  }

  async notifyRoleChanged(userId: string, newRole: string) {
    const roleNames: Record<string, string> = {
      ADMIN: 'Administrador',
      COMPANY: 'Empresa',
      JUDGE: 'Juez',
      USER: 'Participante',
    };
    const roleNameSp = roleNames[newRole] || newRole;

    await this.createNotification(
      userId,
      NotifType.ROLE_UPDATED,
      'Rol Actualizado',
      `Tu cuenta ha sido actualizada. Ahora tienes permisos de ${roleNameSp}.`,
      undefined,
      undefined,
    );
  }

  async notifyEvaluationReceived(authorId: string, judgeName: string, challengeTitle: string) {
    await this.createNotification(
      authorId,
      NotifType.EVALUATION_COMPLETE,
      'Idea Evaluada',
      `El juez ${judgeName} ha evaluado tu idea en el reto '${challengeTitle}'.`,
      undefined,
      undefined,
    );
  }

  async notifyEvaluationSubmitted(companyUserId: string, judgeName: string, ideaId: string) {
    // Notify challenge owner
    await this.createNotification(
      companyUserId,
      NotifType.EVALUATION_SUBMITTED,
      'Nueva Evaluación Registrada',
      `El juez ${judgeName} ha completado la evaluación de una idea.`,
      ideaId,
      ReferenceType.IDEA,
    );

    // Notify all admins
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      for (const adminUser of admins) {
        await this.createNotification(
          adminUser.id,
          NotifType.EVALUATION_SUBMITTED,
          'Nueva Evaluación Registrada',
          `El juez ${judgeName} ha completado la evaluación de una idea.`,
          ideaId,
          ReferenceType.IDEA,
        );
      }
    } catch (error) {
      this.logger.error('Error sending evaluation submitted notification to admins:', error);
    }
  }

  async notifyNewChallenge(userIds: string[], challengeId: string, challengeTitle: string, companyName: string) {
    for (const userId of userIds) {
      await this.createNotification(
        userId,
        NotifType.NEW_CHALLENGE_PUBLISHED,
        'Nuevo desafío disponible',
        `Nuevo desafío disponible: ${companyName} está buscando tu talento.`,
        challengeId,
        ReferenceType.CHALLENGE,
      );
    }
  }

  async notifyIdeaReaction(authorId: string, ideaId: string, challengeTitle: string) {
    await this.createNotification(
      authorId,
      NotifType.IDEA_REACTION,
      '¡Tu idea está ganando tracción! 🔥',
      `¡Tu idea está ganando tracción! Alguien ha reaccionado a tu propuesta en ${challengeTitle}.`,
      ideaId,
      ReferenceType.IDEA,
    );
  }

  async notifyNewComment(authorId: string, ideaId: string, challengeTitle: string) {
    await this.createNotification(
      authorId,
      NotifType.NEW_COMMENT,
      'Comentario recibido 💬',
      'Alguien ha dejado un comentario en tu idea. ¡Entra a revisar el feedback!',
      ideaId,
      ReferenceType.IDEA,
    );
  }

  async notifyCommentReply(commentAuthorId: string, replierName: string, ideaId: string) {
    await this.createNotification(
      commentAuthorId,
      NotifType.COMMENT_REPLY,
      'Respuesta a tu comentario ↩️',
      `${replierName} ha respondido a tu comentario.`,
      ideaId,
      ReferenceType.IDEA,
    );
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
