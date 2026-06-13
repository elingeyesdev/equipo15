import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChallengeRepository } from './challenge.repository';
import { Challenge, IdeaStatus, WinnerCategory, ReferenceType } from '@prisma/client';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { FinalizePodiumDto, RankingCategory } from './dtos/finalize-podium.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserService, UserResponse } from '../user/user.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);

  constructor(
    private readonly challengeRepository: ChallengeRepository,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
  ) {}

  async getUserByUid(uid: string): Promise<UserResponse | null> {
    return this.userService.findByUid(uid);
  }

  async create(
    createChallengeDto: CreateChallengeDto,
    authorId: string,
  ): Promise<Challenge> {
    const { submissionsOpenAt, submissionsCloseAt, publishedAt, startDate, endDate, status, ...rest } =
      createChallengeDto;

    const now = new Date();

    let finalStatus = status ? this.challengeRepository.normalizeStatus(status) : 'PUBLISHED';

    let finalStart: Date | null = null;
    if (startDate) {
      finalStart = new Date(startDate);
    } else if (submissionsOpenAt) {
      finalStart = new Date(submissionsOpenAt);
    }

    let finalEnd: Date | null = null;
    if (endDate) {
      finalEnd = new Date(endDate);
    } else if (submissionsCloseAt) {
      finalEnd = new Date(submissionsCloseAt);
    }

    if (finalStatus !== 'DRAFT') {
      if (!finalStart && !finalEnd) {
        finalStart = new Date(now);
        finalEnd = new Date(now);
        finalEnd.setHours(23, 59, 59, 999);
      }

      if (finalStart) {
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (finalStart < fiveMinutesAgo) {
          throw new BadRequestException('La fecha de inicio no puede ser anterior a la fecha actual.');
        }
      }

      if (finalStart && finalEnd && finalEnd <= finalStart) {
        throw new BadRequestException('La fecha de cierre debe ser posterior a la fecha de inicio.');
      }
    }

    if (finalStatus === 'PUBLISHED') {
      if (finalStart && finalStart > now) {
        finalStatus = 'SCHEDULED';
      }
    }

    const payload: Record<string, any> = {
      ...rest,
      status: finalStatus,
      submissionsOpenAt: finalStart,
      submissionsCloseAt: finalEnd,
      publishedAt: finalStatus === 'PUBLISHED' ? now : undefined,
    };

    payload.facultyId = await this.resolveFacultyId(payload.facultyId);

    const createdChallenge = await this.challengeRepository.create({
      ...payload,
      authorId,
    } as any);
    this.logger.log(
      `Nuevo reto creado: "${createdChallenge.title}" con ID: ${createdChallenge.id} en estado: ${createdChallenge.status}`,
    );

    if (createdChallenge.status === 'PUBLISHED') {
      try {
        const company = await this.prisma.user.findUnique({
          where: { id: authorId },
          select: { displayName: true },
        });
        const companyName = company?.displayName || 'Una empresa';
        const participants = await this.prisma.user.findMany({
          where: { role: 'USER' },
          select: { id: true },
        });
        await this.notificationService.notifyNewChallenge(
          participants.map((p) => p.id),
          createdChallenge.id,
          createdChallenge.title,
          companyName,
        );
      } catch (error) {
        this.logger.error('Error sending new challenge notification on create:', error);
      }
    }

    return createdChallenge;
  }

  async findAll(paginationDto?: PaginationDto, status?: string, uid?: string) {
    const limit = paginationDto?.limit
      ? Number(paginationDto.limit)
      : undefined;
    const skip =
      paginationDto?.page && limit
        ? (Number(paginationDto.page) - 1) * limit
        : undefined;
    const normalizedStatus = status?.trim();

    let userId: string | undefined;
    let userRole: string | undefined;
    let facultyId: string | null | undefined;

    if (uid) {
      const user = await this.userService.findByUid(uid);
      if (user) {
        userId = user.id;
        userRole = user.role;
        facultyId = (user as any).studentProfile?.facultyId ?? null;
      }
    }

    const { data, total } = await this.challengeRepository.findAll(
      skip,
      limit,
      normalizedStatus,
      userId,
      userRole,
      facultyId,
      paginationDto?.search,
    );

    return {
      data,
      meta: {
        total,
        page: paginationDto?.page || 1,
        limit,
      },
    };
  }

  async findOne(id: string, uid?: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new NotFoundException(`El ID proporcionado no es válido.`);
    }

    const challenge = await this.challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException(`El reto con ID ${id} no existe.`);
    }

    if (uid && challenge.isPrivate) {
      const user = await this.userService.findByUid(uid);
      if (user && ((user.role as any) === 'student' || user.role === 'USER')) {
        if (
          challenge.facultyId !== null &&
          challenge.facultyId !== (user as any).studentProfile?.facultyId
        ) {
          throw new NotFoundException(
            `El reto es privado y no pertenece a tu facultad.`,
          );
        }
        await this.challengeRepository.linkPrivateChallenge(id, user.id);
      }
    }

    return challenge;
  }

  async findByToken(token: string) {
    const challenge = await this.challengeRepository.findByAccessToken(token);
    if (!challenge) {
      this.logger.error(`Intento de acceso con token inválido: ${token}`);
      throw new NotFoundException('Token inválido o expirado.');
    }
    return challenge;
  }

  private isCriteriaOnlyPhase(challenge: Challenge & { ideas?: { id: string }[] }): boolean {
    const statusUpper = challenge.status?.toUpperCase() || '';
    if (
      statusUpper === 'EVALUATING' ||
      statusUpper === 'EN_EVALUACION' ||
      statusUpper === 'EN EVALUACIÓN' ||
      statusUpper === 'FINALIZADO'
    ) {
      return true;
    }

    const closeDate = challenge.submissionsCloseAt;
    if (closeDate && new Date(closeDate) < new Date()) {
      return true;
    }

    const ideasCount = challenge.ideas?.length ?? 0;
    if (
      ideasCount > 0 &&
      statusUpper !== 'DRAFT' &&
      statusUpper !== 'SCHEDULED' &&
      statusUpper !== 'BORRADOR' &&
      statusUpper !== 'AGENDADO'
    ) {
      return true;
    }

    return false;
  }

  async update(id: string, updateChallengeDto: UpdateChallengeDto) {
    const existing = await this.challengeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Reto no encontrado.');
    }
    const statusUpper = existing.status?.toUpperCase() || '';
    if (statusUpper === 'CLOSED') {
      throw new ForbiddenException('No se puede modificar un reto cerrado.');
    }

    const criteriaOnlyPhase = this.isCriteriaOnlyPhase(existing);

    if (updateChallengeDto.evaluationCriteria !== undefined) {
      const existingCriteria = JSON.stringify(existing.evaluationCriteria ?? []);
      const newCriteria = JSON.stringify(updateChallengeDto.evaluationCriteria ?? []);
      if (existingCriteria !== newCriteria) {
        await this.challengeRepository.resetEvaluationsForChallenge(id);
      }
    }

    if (criteriaOnlyPhase) {
      if (updateChallengeDto.evaluationCriteria === undefined) {
        throw new BadRequestException('Debes enviar los criterios de evaluación.');
      }
      const updatedChallenge = await this.challengeRepository.update(id, {
        evaluationCriteria: updateChallengeDto.evaluationCriteria as any,
      });
      this.logger.log(
        `Criterios de evaluación actualizados para reto "${updatedChallenge.title}" (ID: ${id})`,
      );
      return updatedChallenge;
    }

    const { submissionsOpenAt, submissionsCloseAt, publishedAt, startDate, endDate, status, ...rest } =
      updateChallengeDto;

    const now = new Date();
    let finalStatus = status ? this.challengeRepository.normalizeStatus(status) : undefined;
    const resolvedStatus = finalStatus || existing.status;

    let finalStart: Date | null | undefined = undefined;
    if (startDate !== undefined) {
      finalStart = startDate ? new Date(startDate) : null;
    } else if (submissionsOpenAt !== undefined) {
      finalStart = submissionsOpenAt ? new Date(submissionsOpenAt) : null;
    }

    let finalEnd: Date | null | undefined = undefined;
    if (endDate !== undefined) {
      finalEnd = endDate ? new Date(endDate) : null;
    } else if (submissionsCloseAt !== undefined) {
      finalEnd = submissionsCloseAt ? new Date(submissionsCloseAt) : null;
    }

    if (resolvedStatus !== 'DRAFT') {
      let checkStart = finalStart !== undefined ? finalStart : existing.submissionsOpenAt;
      let checkEnd = finalEnd !== undefined ? finalEnd : existing.submissionsCloseAt;

      if (!checkStart && !checkEnd) {
        checkStart = new Date(now);
        checkEnd = new Date(now);
        checkEnd.setHours(23, 59, 59, 999);
        finalStart = checkStart;
        finalEnd = checkEnd;
      }

      const existingStart = existing.submissionsOpenAt ? new Date(existing.submissionsOpenAt) : null;
      const finalStartVal = finalStart !== undefined ? finalStart : existingStart;
      const startChanged = !existingStart || (finalStartVal && finalStartVal.getTime() !== existingStart.getTime());

      if (startChanged && finalStartVal) {
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (finalStartVal < fiveMinutesAgo) {
          throw new BadRequestException('La fecha de inicio no puede ser anterior a la fecha actual.');
        }
      }

      if (checkStart && checkEnd && checkEnd <= checkStart) {
        throw new BadRequestException('La fecha de cierre debe ser posterior a la fecha de inicio.');
      }
    }

    if (finalStatus === 'PUBLISHED') {
      const checkStart = finalStart !== undefined ? finalStart : existing.submissionsOpenAt;
      if (checkStart && checkStart > now) {
        finalStatus = 'SCHEDULED';
      }
    }

    const payload: Record<string, any> = {
      ...rest,
      status: finalStatus,
      submissionsOpenAt: finalStart !== undefined ? finalStart : undefined,
      submissionsCloseAt: finalEnd !== undefined ? finalEnd : undefined,
      publishedAt: finalStatus === 'PUBLISHED' && !existing.publishedAt ? now : undefined,
    };

    payload.facultyId = await this.resolveFacultyId(payload.facultyId);

    const updatedChallenge = await this.challengeRepository.update(id, payload);
    this.logger.log(
      `Reto actualizado: "${updatedChallenge.title}" con ID: ${id}`,
    );

    if (payload.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      try {
        const company = await this.prisma.user.findUnique({
          where: { id: existing.authorId },
          select: { displayName: true },
        });
        const companyName = company?.displayName || 'Una empresa';
        const participants = await this.prisma.user.findMany({
          where: { role: 'USER' },
          select: { id: true },
        });
        await this.notificationService.notifyNewChallenge(
          participants.map((p) => p.id),
          updatedChallenge.id,
          updatedChallenge.title,
          companyName,
        );
      } catch (error) {
        this.logger.error('Error sending new challenge notification on update:', error);
      }
    }

    if (payload.status === 'EVALUATING' && existing.status !== 'EVALUATING') {
      await this.notifyEvaluationStarted(id, updatedChallenge.title);
    }

    return updatedChallenge;
  }

  async delete(id: string, uid: string) {
    const user = await this.userService.findByUid(uid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const challenge = await this.challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException('Reto no encontrado.');
    }

    if (challenge.authorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para eliminar este reto.');
    }

    const statusUpper = challenge.status?.toUpperCase() || '';
    if (statusUpper !== 'DRAFT' && statusUpper !== 'SCHEDULED') {
      throw new ForbiddenException(
        'Solo se pueden eliminar retos en estado borrador o agendado.',
      );
    }

    const deletedChallenge = await this.challengeRepository.delete(id);
    this.logger.log(
      `Reto eliminado: "${deletedChallenge.title}" con ID: ${id}`,
    );
    return deletedChallenge;
  }

  async getGlobalStats() {
    const [
      totalChallenges,
      totalIdeas,
      totalParticipants,
      topFacultades,
      topLeaders,
    ] = await Promise.all([
      this.challengeRepository.countChallengesByStatus('PUBLISHED'),
      this.challengeRepository.countTotalIdeas(),
      this.challengeRepository.countStudentUsers(),
      this.challengeRepository.getFacultyStats(),
      this.challengeRepository.getTopLeaders(),
    ]);

    return {
      totalChallenges,
      activeChallenges: totalChallenges,
      totalParticipants,
      totalIdeas,
      topFacultades,
      topLeaders,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredChallenges() {
    this.logger.log('Ejecutando cron para buscar retos expirados...');
    try {
      const now = new Date();
      const expiredChallenges = await this.prisma.challenge.findMany({
        where: {
          status: 'PUBLISHED',
          submissionsCloseAt: { lt: now },
        },
        select: {
          id: true,
          title: true,
        },
      });

      for (const challenge of expiredChallenges) {
        await this.prisma.challenge.update({
          where: { id: challenge.id },
          data: { status: 'EVALUATING' },
        });
        this.logger.log(`Cron: Reto '${challenge.title}' (${challenge.id}) cambiado a estado EVALUATING.`);

        // Notify authors of ideas in this challenge
        await this.notifyEvaluationStarted(challenge.id, challenge.title);
      }
    } catch (error) {
      this.logger.error('Error al actualizar retos expirados en el cron:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiringChallenges() {
    this.logger.log('Ejecutando cron para buscar retos por expirar (24 horas)...');
    try {
      const now = new Date();
      const targetMin = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const targetMax = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const expiringChallenges = await this.prisma.challenge.findMany({
        where: {
          status: 'PUBLISHED',
          submissionsCloseAt: {
            gte: targetMin,
            lte: targetMax,
          },
        },
        select: {
          id: true,
          title: true,
          isPrivate: true,
          facultyId: true,
        },
      });

      for (const challenge of expiringChallenges) {
        let candidateUsers: { id: string }[] = [];
        if (challenge.isPrivate) {
          candidateUsers = await this.prisma.user.findMany({
            where: {
              role: 'USER',
              privateAccesses: { some: { challengeId: challenge.id } },
            },
            select: { id: true },
          });
        } else {
          candidateUsers = await this.prisma.user.findMany({
            where: { role: 'USER' },
            select: { id: true },
          });
        }

        const submittedUsers = await this.prisma.idea.findMany({
          where: {
            challengeId: challenge.id,
            deletedAt: null,
          },
          select: { authorId: true },
        });
        const submittedUserIds = new Set(submittedUsers.map(i => i.authorId));

        const usersToNotify = candidateUsers.filter(u => !submittedUserIds.has(u.id));

        for (const user of usersToNotify) {
          const alreadyNotified = await this.prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'CHALLENGE_EXPIRING',
              referenceId: challenge.id,
            },
          });

          if (!alreadyNotified) {
            await this.notificationService.createNotification(
              user.id,
              'CHALLENGE_EXPIRING' as any,
              '¡Últimas 24 horas!',
              `¡Últimas 24 horas! El reto ${challenge.title} está por cerrar, envía tu propuesta antes de que se agote el tiempo.`,
              challenge.id,
              ReferenceType.CHALLENGE,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error al notificar retos por expirar en el cron:', error);
    }
  }

  async notifyEvaluationStarted(challengeId: string, challengeTitle: string) {
    try {
      const ideas = await this.prisma.idea.findMany({
        where: { challengeId, deletedAt: null },
        select: { authorId: true },
      });
      const authorIds = Array.from(new Set(ideas.map((idea) => idea.authorId)));

      for (const authorId of authorIds) {
        await this.notificationService.createNotification(
          authorId,
          'EVALUATION_STARTED' as any,
          'Periodo de ideación finalizado',
          'El periodo de ideación ha finalizado. Tu propuesta se encuentra ahora bajo evaluación rigurosa del jurado.',
          challengeId,
          ReferenceType.CHALLENGE,
        );
      }
    } catch (error) {
      this.logger.error(`Error notifying evaluation started for challenge ${challengeId}:`, error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledChallenges() {
    this.logger.log('Ejecutando cron para activar retos agendados...');
    try {
      const now = new Date();
      const scheduledChallenges = await this.prisma.challenge.findMany({
        where: {
          status: 'SCHEDULED',
          submissionsOpenAt: { lte: now },
        },
      });

      if (scheduledChallenges.length > 0) {
        const ids = scheduledChallenges.map((c) => c.id);

        await this.prisma.challenge.updateMany({
          where: {
            id: { in: ids },
          },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
          },
        });

        this.logger.log(
          `Cron: Se activaron automáticamente ${scheduledChallenges.length} retos programados: [${ids.join(', ')}]`,
        );

        await this.redisService.delByPrefix('public:').catch((err) => {
          this.logger.error(`Error al invalidar caché de retos en Redis: ${err.message}`);
        });
      }
    } catch (error) {
      this.logger.error('Error al actualizar retos programados en el cron:', error);
    }
  }

  async getChallengeStats(id: string) {
    const stats = await this.challengeRepository.getChallengeImpactStats(id);
    return {
      challengeId: id,
      ...stats,
    };
  }

  async getInnovationStats(uid: string, challengeId?: string) {
    const user = await this.userService.findByUid(uid);
    if (!user) throw new Error('Usuario no encontrado');
    if (challengeId) {
      return this.challengeRepository.getInnovationStatsByChallenge(
        challengeId,
        user.id,
      );
    }
    return this.challengeRepository.getInnovationStats(user.id);
  }

  async getCompanyChallenges(uid: string) {
    const user = await this.userService.findByUid(uid);
    if (!user) throw new Error('Usuario no encontrado');
    return this.challengeRepository.getCompanyChallenges(user.id);
  }

  async searchJudges(query: string) {
    return this.challengeRepository.searchJudges(query?.trim() || '');
  }

  async getAssignedJudges(challengeId: string) {
    return this.challengeRepository.getAssignedJudges(challengeId);
  }

  async assignJudges(
    challengeId: string,
    dto: import('./dtos/assign-judges.dto').AssignJudgesDto,
    firebaseUid: string,
  ) {
    const user = await this.userService.findByUid(firebaseUid);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) throw new NotFoundException('Reto no encontrado');

    if (
      challenge.authorId !== user.id &&
      (user.role as any) !== 'admin' &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'No tienes permisos para asignar jueces a este reto.',
      );
    }

    if (dto.judgeIds.length > 5) {
      throw new ForbiddenException(
        'No se pueden asignar más de 5 jueces a un reto.',
      );
    }

    const result = await this.challengeRepository.assignJudges(
      challengeId,
      dto.judgeIds,
      user.id,
    );

    for (const judgeId of dto.judgeIds) {
      try {
        await this.notificationService.notifyJudgeAssigned(
          judgeId,
          challengeId,
          challenge.title,
        );
      } catch (err) {
        this.logger.error(
          `Error notifying assigned judge ${judgeId} for challenge ${challengeId}: ${err.message}`,
        );
      }
    }

    return result;
  }

  // ─── Judge Inbox: Assigned Challenges (E3.2) ───────────────────────────────

  async getAssignedChallengesForJudge(firebaseUid: string) {
    const user = await this.userService.findByUid(firebaseUid);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.challengeRepository.getAssignedChallengesForJudge(user.id);
  }

  // ─── Judge Inbox: Finalist Ideas (E3.1) ────────────────────────────────────

  async getFinalistIdeasForJudge(firebaseUid: string) {
    const user = await this.userService.findByUid(firebaseUid);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.challengeRepository.getFinalistIdeasForJudge(user.id);
  }

  // ─── Judge Eval Form: Criteria for a challenge (E3.1) ──────────────────────

  async getCriteriaForChallenge(challengeId: string) {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) throw new NotFoundException('Reto no encontrado');
    return this.challengeRepository.getCriteriaForChallenge(challengeId);
  }

  async getPodiumStatus(challengeId: string, firebaseUid: string) {
    const user = await this.userService.findByUid(firebaseUid);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) throw new NotFoundException('Reto no encontrado');

    if (challenge.authorId !== user.id) {
      throw new ForbiddenException(
        'No tienes permisos para consultar el estado del podio de este reto.',
      );
    }

    const stats = await this.challengeRepository.getPodiumStatus(challengeId);

    let phase: 'SELECT_FINALISTS' | 'AWAITING_JUDGES' | 'COMPLETED' =
      'SELECT_FINALISTS';
    if (challenge.status === 'CLOSED') {
      phase = 'COMPLETED';
    } else if (challenge.status === 'EVALUATING') {
      phase = 'AWAITING_JUDGES';
    }

    return {
      challengeId,
      status: challenge.status,
      phase,
      podiumSize: challenge.podiumSize,
      ...stats,
      canGenerateResults:
        challenge.status === 'EVALUATING' && stats.evaluationCount > 0,
    };
  }

  async getPodiumIdeas(challengeId: string, firebaseUid: string) {
    const user = await this.userService.findByUid(firebaseUid);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) throw new NotFoundException('Reto no encontrado');

    if (challenge.authorId !== user.id) {
      throw new ForbiddenException(
        'No tienes permisos para consultar las ideas del podio de este reto.',
      );
    }

    return this.challengeRepository.getPodiumIdeas(challengeId);
  }

  async finalizePodium(
    challengeId: string,
    dto: FinalizePodiumDto,
    firebaseUid: string,
  ) {
    const user = await this.userService.findByUid(firebaseUid);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) throw new NotFoundException('Reto no encontrado');

    if (challenge.authorId !== user.id) {
      throw new ForbiddenException(
        'No tienes permisos para finalizar este reto.',
      );
    }

    const ideas =
      await this.challengeRepository.getIdeasByChallenge(challengeId);
    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new ForbiddenException('No hay ideas en este reto para finalizar.');
    }

    const isGeneratingResults = dto.category === RankingCategory.VOTES;
    const isEvaluationPhase = challenge.status === 'EVALUATING';

    if (isGeneratingResults && !isEvaluationPhase) {
      throw new ForbiddenException(
        'Primero debes enviar el lote de finalistas a jueces antes de generar resultados técnicos.',
      );
    }

    if (!isGeneratingResults && isEvaluationPhase) {
      throw new ForbiddenException(
        'Este reto ya está en evaluación. Ahora corresponde generar resultados con las rúbricas de los jueces.',
      );
    }

    let scoreSummary: Awaited<
      ReturnType<typeof this.recalculateFinalScores>
    > | null = null;
    let sortedIdeas: Awaited<
      ReturnType<ChallengeRepository['getRankedIdeasByFinalScore']>
    > = [];

    if (isGeneratingResults) {
      scoreSummary = await this.recalculateFinalScores(challengeId);
      if (scoreSummary.evaluationsCount === 0) {
        throw new ForbiddenException(
          'Todavía no hay evaluaciones de jueces para calcular el puntaje técnico.',
        );
      }

      sortedIdeas = await this.challengeRepository.getRankedIdeasByFinalScore(
        challengeId,
        [IdeaStatus.FINALIST],
      );

      if (sortedIdeas.length === 0) {
        sortedIdeas = await this.challengeRepository.getRankedIdeasByFinalScore(
          challengeId,
          [IdeaStatus.FINALIST, IdeaStatus.PUBLISHED, IdeaStatus.WINNER],
        );
      }
    } else {
      sortedIdeas = [...ideas] as any;
      sortedIdeas.sort((a: any, b: any) => {
        let valA = 0;
        let valB = 0;

        if (dto.category === RankingCategory.LIKES) {
          valA = a.likesCount || 0;
          valB = b.likesCount || 0;
        } else if (dto.category === RankingCategory.COMMENTS) {
          valA = a.commentsCount || 0;
          valB = b.commentsCount || 0;
        }

        return valB - valA;
      });
    }

    const totalIdeasCount = sortedIdeas.length;
    const finalLimit = Math.min(dto.limit, totalIdeasCount);
    const rankedWinners = sortedIdeas.slice(0, finalLimit);
    const finalistIds = rankedWinners.map((idea) => idea.id);
    const officialPodium = isGeneratingResults
      ? sortedIdeas.slice(0, Math.min(3, sortedIdeas.length))
      : [];

    if (isGeneratingResults) {
      await this.prisma.$transaction([
        this.prisma.challengeWinner.deleteMany({ where: { challengeId } }),
        ...officialPodium.map((idea, index) =>
          this.prisma.challengeWinner.create({
            data: {
              challengeId,
              ideaId: idea.id,
              category: WinnerCategory.GENERAL,
              position: index + 1,
            },
          }),
        ),
        this.prisma.idea.updateMany({
          where: {
            challengeId,
            status: IdeaStatus.WINNER,
          },
          data: { status: IdeaStatus.FINALIST },
        }),
        this.prisma.idea.updateMany({
          where: { id: { in: finalistIds } },
          data: { status: IdeaStatus.WINNER },
        }),
        this.prisma.challenge.update({
          where: { id: challengeId },
          data: { podiumSize: finalLimit },
        }),
      ]);
    } else {
      await this.prisma.$transaction(async (tx) => {
        await tx.challenge.update({
          where: { id: challengeId },
          data: { status: 'EVALUATING', podiumSize: finalLimit },
        });

        await tx.idea.updateMany({
          where: { id: { in: finalistIds } },
          data: { status: IdeaStatus.FINALIST },
        });
      });
    }

    await this.redisService.delByPrefix('public:').catch((err) => {
      this.logger.error(
        `Failed to invalidate public ideas cache: ${err.message}`,
      );
    });

    if (isGeneratingResults && officialPodium.length > 0) {
      const winnersToNotify = officialPodium.map(idea => ({
        userId: idea.authorId,
        ideaId: idea.id,
      }));
      await this.notificationService.notifyWinners(winnersToNotify, challenge.id, challenge.title);
    }

    return {
      success: true,
      podiumSize: finalLimit,
      finalistCount: finalistIds.length,
      evaluationsProcessed: scoreSummary?.evaluationsCount ?? 0,
      ideasScored: scoreSummary?.ideasScored ?? 0,
      phase: isGeneratingResults ? 'RESULTS_GENERATED' : 'FINALISTS_SENT',
      winners: isGeneratingResults
        ? officialPodium.map((idea, index) => ({
            ideaId: idea.id,
            position: index + 1,
            category: WinnerCategory.GENERAL,
            finalScore: idea.finalScore,
          }))
        : [],
    };
  }

  private async recalculateFinalScores(challengeId: string) {
    const [challengeIdeas, evaluations] = await Promise.all([
      this.prisma.idea.findMany({
        where: { challengeId },
        select: { id: true },
      }),
      this.prisma.evaluation.findMany({
        where: {
          idea: { challengeId },
        },
        select: {
          ideaId: true,
          judgeId: true,
          scores: {
            select: {
              score: true,
              criterion: {
                select: {
                  weight: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const judgeScoresByIdeaId = new Map<string, number[]>();

    evaluations.forEach((evaluation) => {
      const judgeScore = evaluation.scores.reduce((sum, item) => {
        const weight = item.criterion?.weight ?? 0;
        return sum + item.score * (weight / 100);
      }, 0);

      const current = judgeScoresByIdeaId.get(evaluation.ideaId) ?? [];
      current.push(judgeScore);
      judgeScoresByIdeaId.set(evaluation.ideaId, current);
    });

    const finalScoresByIdeaId = new Map<string, number>();
    const updateOperations = challengeIdeas.map((idea) => {
      const judgeScores = judgeScoresByIdeaId.get(idea.id) ?? [];
      const finalScore =
        judgeScores.length > 0
          ? judgeScores.reduce((sum, score) => sum + score, 0) /
            judgeScores.length
          : 0;

      finalScoresByIdeaId.set(idea.id, finalScore);

      return this.prisma.idea.update({
        where: { id: idea.id },
        data: { finalScore },
      });
    });

    if (updateOperations.length > 0) {
      await this.prisma.$transaction(updateOperations);
    }

    return {
      evaluationsCount: evaluations.length,
      ideasScored: Array.from(finalScoresByIdeaId.values()).filter(
        (score) => score > 0,
      ).length,
      finalScoresByIdeaId,
    };
  }

  private async resolveFacultyId(facultyId: any): Promise<string | null> {
    if (!facultyId) return null;

    const LEGACY_MAP: Record<number, string> = {
      1: 'Ingeniería',
      2: 'Ciencias',
      3: 'Humanidades',
      4: 'Medicina',
      5: 'Derecho',
      6: 'Arquitectura',
    };

    const numericId =
      typeof facultyId === 'number' ? facultyId : Number(facultyId);

    if (!isNaN(numericId) && numericId >= 1 && numericId <= 6) {
      const faculties = await this.userService.getAllFaculties(false);
      const targetName = LEGACY_MAP[numericId]?.toLowerCase();
      this.logger.log(
        `Resolving legacy faculty ID ${facultyId} → name "${targetName}"`,
      );

      const matched = faculties.find(
        (f) =>
          f.name.toLowerCase().includes(targetName) ||
          targetName.includes(f.name.toLowerCase()),
      );

      if (matched) {
        this.logger.log(`Resolved to: ${matched.name} (UUID: ${matched.id})`);
        return matched.id;
      }
      this.logger.warn(
        `No match for legacy ID ${facultyId}. DB faculties: ${faculties.map((f) => f.name).join(', ')}`,
      );
      return null;
    }

    if (typeof facultyId === 'string' && facultyId.length > 10) {
      const faculties = await this.userService.getAllFaculties(false);
      const exists = faculties.find((f) => f.id === facultyId);
      if (exists) {
        this.logger.log(`Faculty UUID verified: ${exists.name} (${exists.id})`);
        return exists.id;
      }
      this.logger.warn(`Faculty UUID ${facultyId} not found in DB`);
      return null;
    }

    return null;
  }

  // ─── E3.3: Generate Excel with raw evaluation data ──────────────────────
  async generateEvaluationExcel(
    challengeId: string,
    ownerUid: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    // 1. Verify ownership
    const user = await this.getUserByUid(ownerUid);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) throw new NotFoundException('Reto no encontrado.');
    if (challenge.authorId !== user.id) {
      throw new ForbiddenException('No tienes acceso a este reto.');
    }

    // 2. Fetch deep data
    const ideas =
      await this.challengeRepository.getEvaluationDataForExport(challengeId);

    // 3. Build workbook

    const ExcelJS = require('exceljs');
    const workbook = new (ExcelJS.Workbook || ExcelJS.default?.Workbook)();
    workbook.creator = 'Pista8';
    workbook.created = new Date();

    // 1. Extract dynamic criteria names
    const criteriaNames = new Set<string>();
    ideas.forEach((idea) => {
      idea.evaluations.forEach((evaluation) => {
        evaluation.scores.forEach((sc) => {
          if (sc.criterion?.name) criteriaNames.add(sc.criterion.name);
        });
      });
    });
    const dynamicCriteria = Array.from(criteriaNames).sort();

    // ── Sheet 1: Evaluaciones Detalladas ──
    const detailSheet = workbook.addWorksheet('Evaluaciones Detalladas');

    // Base columns
    const columns: any[] = [
      { header: 'Posición', key: 'position', width: 10 },
      { header: 'Título Idea', key: 'ideaTitle', width: 30 },
      { header: 'Autor', key: 'author', width: 22 },
      { header: 'Email Autor', key: 'authorEmail', width: 28 },
      { header: 'Estado', key: 'status', width: 14 },
      { header: 'Puntaje Final Idea', key: 'finalScore', width: 16 },
      { header: 'Nombre Juez', key: 'judgeName', width: 22 },
      { header: 'Email Juez', key: 'judgeEmail', width: 28 },
    ];

    // Dynamic criteria columns
    dynamicCriteria.forEach((cName) => {
      columns.push({
        header: `Nota: ${cName}`,
        key: `crit_${cName}`,
        width: 18,
      });
    });

    columns.push(
      { header: 'Total Juez (Ponderado)', key: 'judgeTotalScore', width: 22 },
      { header: 'Feedback General', key: 'feedback', width: 50 },
      { header: 'Fecha Evaluación', key: 'evaluationDate', width: 20 },
    );
    detailSheet.columns = columns;

    // Style header
    detailSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFE410A' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    detailSheet.getRow(1).height = 24;

    const STATUS_LABELS: Record<string, string> = {
      PUBLISHED: 'Publicada',
      FINALIST: 'Finalista',
      WINNER: 'Ganadora',
    };

    const IMPACT_LABELS: Record<string, string> = {
      TEAM: 'Equipo',
      PRODUCT: 'Producto',
      SERVICE: 'Servicio',
      PROCESS: 'Procesos',
      BUSINESS_MODEL: 'Modelo de Negocio',
      PRODUCTIVITY: 'Productividad',
    };

    const IMPROV_LABELS: Record<string, string> = {
      ENHANCES: 'Potencia',
      TRANSFORMS: 'Transforma',
      EXPANDS: 'Expande',
    };

    const EFFORT_LABELS: Record<string, string> = {
      DEVELOPMENT: 'Requiere Desarrollo',
      COORDINATION: 'Coordinación',
      FUNDING: 'Requiere Fondos',
      ADAPTATION: 'Adaptación',
    };

    for (const [idx, idea] of ideas.entries()) {
      const currentPosition = idx + 1;

      if (idea.evaluations.length === 0) {
        // Ideas without evaluations still appear
        const rowData: any = {
          position: currentPosition,
          ideaTitle: idea.title,
          author: idea.author?.displayName || '—',
          authorEmail: idea.author?.email || '—',
          status: STATUS_LABELS[idea.status] || idea.status,
          finalScore: idea.finalScore ?? 0,
          judgeName: '—',
          judgeEmail: '—',
          judgeTotalScore: '—',
          feedback: 'Sin evaluaciones',
          evaluationDate: '—',
        };
        dynamicCriteria.forEach((cName) => {
          rowData[`crit_${cName}`] = '—';
        });
        detailSheet.addRow(rowData);
        continue;
      }

      for (const evaluation of idea.evaluations) {
        let judgeTotalScore = 0;
        const criterionScores: Record<string, number> = {};

        for (const sc of evaluation.scores) {
          const cName = sc.criterion?.name;
          if (cName) {
            criterionScores[`crit_${cName}`] = sc.score;
            const weighted = (sc.score * (sc.criterion?.weight ?? 0)) / 100;
            judgeTotalScore += weighted;
          }
        }

        const rowData: any = {
          position: currentPosition,
          ideaTitle: idea.title,
          author: idea.author?.displayName || '—',
          authorEmail: idea.author?.email || '—',
          status: STATUS_LABELS[idea.status] || idea.status,
          finalScore: idea.finalScore ?? 0,
          judgeName: evaluation.judge?.displayName || '—',
          judgeEmail: evaluation.judge?.email || '—',
          judgeTotalScore:
            evaluation.scores.length > 0
              ? Math.round(judgeTotalScore * 100) / 100
              : '—',
          feedback: evaluation.feedback || '—',
          evaluationDate: evaluation.createdAt
            ? new Date(evaluation.createdAt).toLocaleDateString('es')
            : '—',
        };

        dynamicCriteria.forEach((cName) => {
          rowData[`crit_${cName}`] = criterionScores[`crit_${cName}`] ?? '—';
        });

        detailSheet.addRow(rowData);
      }
    }

    // Style data rows and add borders
    detailSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'top', wrapText: true };
          if (rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' },
            };
          }
        }
      });
    });

    // ── Sheet 2: Resumen por Idea ──
    const summarySheet = workbook.addWorksheet('Resumen por Idea');
    summarySheet.columns = [
      { header: 'Posición', key: 'position', width: 10 },
      { header: 'Título', key: 'title', width: 30 },
      { header: 'Autor', key: 'author', width: 22 },
      { header: 'Estado', key: 'status', width: 14 },
      { header: 'Puntaje Final', key: 'finalScore', width: 14 },
      { header: 'N° Evaluaciones', key: 'evalCount', width: 16 },
      { header: 'Área de Impacto', key: 'impactArea', width: 20 },
      { header: 'Tipo de Mejora', key: 'improvementType', width: 20 },
      { header: 'Nivel de Esfuerzo', key: 'effortLevel', width: 18 },
      { header: 'Problema', key: 'problem', width: 60 },
    ];

    summarySheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFE410A' }, // Naranja Pista8
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    summarySheet.getRow(1).height = 24;

    ideas.forEach((idea, idx) => {
      summarySheet.addRow({
        position: idx + 1,
        title: idea.title,
        author: idea.author?.displayName || '—',
        status: STATUS_LABELS[idea.status] || idea.status,
        finalScore: idea.finalScore ?? 0,
        evalCount: idea.evaluations.length,
        impactArea: idea.impactArea
          ? IMPACT_LABELS[idea.impactArea] || idea.impactArea
          : '—',
        improvementType: idea.improvementType
          ? IMPROV_LABELS[idea.improvementType] || idea.improvementType
          : '—',
        effortLevel: idea.effortLevel
          ? EFFORT_LABELS[idea.effortLevel] || idea.effortLevel
          : '—',
        problem: idea.problem || '—',
      });
    });

    summarySheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'top', wrapText: true };
          if (rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' },
            };
          }
        }
      });
    });

    // 4. Return buffer
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeTitle = (challenge.title || 'reto')
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40);

    return {
      buffer,
      fileName: `evaluaciones_${safeTitle}.xlsx`,
    };
  }

  async closeChallenge(id: string, firebaseUid: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      throw new NotFoundException('Reto no encontrado');
    }

    const user = await this.getUserByUid(firebaseUid);
    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }

    if (user.role !== 'ADMIN') {
      if (challenge.authorId !== user.id) {
        throw new ForbiddenException('No tienes permiso para cerrar este reto');
      }
    }

    if (challenge.status === 'CLOSED') {
      throw new BadRequestException('El reto ya se encuentra cerrado');
    }

    const updated = await this.prisma.challenge.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    await this.redisService.delByPrefix('public:').catch((err) => {
      this.logger.error(
        `Failed to invalidate public ideas cache: ${err.message}`,
      );
    });

    return updated;
  }
}
