import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IdeaRepository } from './idea.repository';
import { ChallengeRepository } from '../challenge/challenge.repository';
import { UserRepository } from '../user/user.repository';
import { Idea, Prisma } from '@prisma/client';
import { CreateIdeaDto } from './dtos/create-idea.dto';
import { CreateDraftIdeaDto } from './dtos/create-draft-idea.dto';
import { UpdateIdeaDto } from './dtos/update-idea.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EventBus } from '../../infrastructure/events/event-bus';
import { RedisService } from '../../infrastructure/redis/redis.module';
import { VisibilityStrategy, UserRoleName } from './utils/visibility.strategy';
import {
  IDEA_WORD_RULES,
  assertWordRange,
  ensureActiveChallengeStatus,
} from './utils/idea-validation.util';
import { ModerationService } from '../moderation/moderation.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class IdeaService {
  private readonly logger = new Logger(IdeaService.name);

  private readonly CACHE_TTL_MS = 30_000;

  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly redisService: RedisService,
    private readonly moderationService: ModerationService,
    private readonly notificationService: NotificationService,
  ) {}

  private async resolveAuthorId(firebaseUid: string): Promise<string> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new BadRequestException({
        message:
          'No encontramos un usuario interno asociado a la sesión actual.',
      });
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Tu cuenta está en modo solo lectura durante la sanción.',
      );
    }
    return user.id;
  }

  private async ensureChallengeNotClosed(challengeId: string): Promise<void> {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (challenge?.status === 'CLOSED') {
      throw new ForbiddenException(
        'Operación denegada. El reto ya ha finalizado y se encuentra en la biblioteca histórica',
      );
    }
  }

  private validateIdeaWords(createIdeaDto: CreateIdeaDto): void {
    assertWordRange(
      'ideaName',
      'El título',
      createIdeaDto.title,
      IDEA_WORD_RULES.title.min,
      IDEA_WORD_RULES.title.max,
    );
    assertWordRange(
      'ideaProblem',
      'El problema',
      createIdeaDto.problem,
      IDEA_WORD_RULES.problem.min,
      IDEA_WORD_RULES.problem.max,
    );
    assertWordRange(
      'ideaSolution',
      'La solución',
      createIdeaDto.solution,
      IDEA_WORD_RULES.solution.min,
      IDEA_WORD_RULES.solution.max,
    );
  }

  async create(
    createIdeaDto: CreateIdeaDto,
    firebaseUid: string,
  ): Promise<Idea> {
    this.validateIdeaWords(createIdeaDto);
    const authorId = await this.resolveAuthorId(firebaseUid);

    const challenge = await this.challengeRepository.findById(
      createIdeaDto.challengeId,
    );
    if (!challenge) {
      throw new BadRequestException('El reto vinculado no existe.');
    }

    ensureActiveChallengeStatus(challenge.status);
    await this.ensureChallengeNotClosed(challenge.id);

    if (
      challenge.submissionsCloseAt &&
      new Date() > new Date(challenge.submissionsCloseAt)
    ) {
      this.logger.warn(
        `Intento de creación de idea en reto expirado: ${challenge.title}`,
      );
      throw new BadRequestException(
        'El reto ha expirado y ya no acepta más propuestas.',
      );
    }

    const mappedStatus =
      createIdeaDto.status === 'public'
        ? 'PUBLISHED'
        : createIdeaDto.status === 'draft'
          ? 'DRAFT'
          : 'PUBLISHED';

    const createdIdea = await this.ideaRepository.create({
      title: createIdeaDto.title,
      problem: createIdeaDto.problem,
      solution: createIdeaDto.solution,
      status: mappedStatus as any,
      isAnonymous: createIdeaDto.isAnonymous ?? false,
      multimediaLinks: createIdeaDto.multimediaLinks || undefined,
      impactArea: createIdeaDto.impactArea || null,
      improvementType: createIdeaDto.improvementType || null,
      effortLevel: createIdeaDto.effortLevel || null,
      authorId,
      challengeId: createIdeaDto.challengeId,
    } as any);

    this.logger.log(
      `Nueva idea creada (Híbrida): "${createdIdea.title}" para el reto: ${challenge.title}`,
    );
    this.invalidateCache();
    if (createdIdea.status === 'PUBLISHED') {
      const ideaWithRelations = await this.ideaRepository.findById(
        createdIdea.id,
      );
      if (ideaWithRelations) {
        this.eventBus.emitToRoom(
          `challenge:${createdIdea.challengeId}`,
          'idea_created',
          ideaWithRelations,
        );
      }
    }

    return createdIdea;
  }

  async createDraft(
    createIdeaDraftDto: CreateDraftIdeaDto,
    firebaseUid: string,
  ): Promise<Idea> {
    if (!createIdeaDraftDto.challengeId) {
      throw new BadRequestException(
        'Selecciona un reto antes de guardar el borrador.',
      );
    }

    const authorId = await this.resolveAuthorId(firebaseUid);

    const challenge = await this.challengeRepository.findById(
      createIdeaDraftDto.challengeId,
    );
    if (!challenge) {
      throw new BadRequestException('El reto vinculado no existe.');
    }

    await this.ensureChallengeNotClosed(challenge.id);

    const draftPayload: any = {
      title: createIdeaDraftDto.title || 'Borrador sin titulo',
      problem:
        createIdeaDraftDto.problem || 'Pendiente de descripcion del problema.',
      solution:
        createIdeaDraftDto.solution ||
        'Pendiente de descripcion de la solucion propuesta.',
      isAnonymous: createIdeaDraftDto.isAnonymous ?? false,
      multimediaLinks: createIdeaDraftDto.multimediaLinks || undefined,
      impactArea: createIdeaDraftDto.impactArea || null,
      improvementType: createIdeaDraftDto.improvementType || null,
      effortLevel: createIdeaDraftDto.effortLevel || null,
      authorId,
      challengeId: createIdeaDraftDto.challengeId,
      status: 'DRAFT',
    };
    const createdDraft = await this.ideaRepository.create(draftPayload);

    this.logger.log(
      `Borrador de idea creado (Híbrido): "${createdDraft.title}"`,
    );
    this.invalidateCache();
    return createdDraft;
  }

  async findAll(paginationDto?: PaginationDto) {
    const limit = paginationDto?.limit
      ? Number(paginationDto.limit)
      : undefined;
    const skip =
      paginationDto?.page && limit
        ? (Number(paginationDto.page) - 1) * limit
        : undefined;

    const { data, total } = await this.ideaRepository.findAll(
      skip,
      limit,
      paginationDto?.challengeId,
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

  async findAllPublic(paginationDto?: PaginationDto, firebaseUid?: string) {
    let userRole: UserRoleName = 'guest';
    let userId: string | undefined;
    if (firebaseUid) {
      const user = await this.userRepository.findByUid(firebaseUid);
      if (user) {
        userId = user.id;
        const roleMap: Record<string, UserRoleName> = {
          ADMIN: 'admin',
          COMPANY: 'company',
          JUDGE: 'judge',
          USER: 'student',
        };
        userRole = roleMap[user.role] || 'student';
      }
    }

    const cacheKey = `public:${userId || 'anon'}:${paginationDto?.challengeId || 'all'}:${paginationDto?.page || 1}:${paginationDto?.limit || 20}:${paginationDto?.search || ''}:${paginationDto?.sort || 'newest'}`;

    let rawResult;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      rawResult = cached;
    } else {
      const limit = paginationDto?.limit
        ? Number(paginationDto.limit)
        : undefined;
      const skip =
        paginationDto?.page && limit
          ? (Number(paginationDto.page) - 1) * limit
          : undefined;

      const { data, total } = await this.ideaRepository.findPublic(
        skip,
        limit,
        paginationDto?.challengeId,
        userId,
        paginationDto?.search,
        paginationDto?.sort,
      );

      rawResult = {
        data,
        meta: {
          total,
          page: paginationDto?.page || 1,
          limit,
        },
      };

      await this.redisService.set(cacheKey, rawResult, this.CACHE_TTL_MS);
    }

    const projectedData = rawResult.data.map((idea: any) =>
      VisibilityStrategy.applyToIdea(idea, userRole, idea.challenge?.status),
    );

    return {
      ...rawResult,
      data: projectedData,
    };
  }

  async updateStatus(id: string, status: string) {
    const updatedIdea = await this.ideaRepository.update(id, { status } as any);
    this.invalidateCache();
    this.logger.log(`Estado de idea con ID ${id} cambiado a: ${status}`);
    return updatedIdea;
  }

  async updateIdea(
    ideaId: string,
    updateIdeaDto: UpdateIdeaDto,
    firebaseUid: string,
  ): Promise<Idea> {
    const authorId = await this.resolveAuthorId(firebaseUid);
    const existingIdea = await this.ideaRepository.findById(ideaId);

    if (!existingIdea) {
      throw new BadRequestException('La idea que intentas editar no existe.');
    }

    await this.ensureChallengeNotClosed(existingIdea.challengeId);

    if (existingIdea.authorId !== authorId) {
      throw new ForbiddenException('Solo el autor de la idea puede editarla.');
    }

    const now = new Date();
    const createdAt = new Date(existingIdea.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours > 24) {
      throw new ForbiddenException('No puedes editar una propuesta después de 24 horas de haber sido publicada.');
    }

    const challengeStatus = (existingIdea as any).challenge?.status;
    if (challengeStatus === 'EVALUATING' || challengeStatus === 'CLOSED') {
      throw new ForbiddenException('No puedes editar una propuesta si el reto está en evaluación o cerrado.');
    }

    if (updateIdeaDto.challengeId || updateIdeaDto.status) {
      throw new BadRequestException(
        'No está permitido cambiar el reto o estado desde esta edición.',
      );
    }

    const nextTitle = updateIdeaDto.title?.trim();
    const nextProblem = updateIdeaDto.problem?.trim();
    const nextSolution = updateIdeaDto.solution?.trim();

    if (nextTitle !== undefined) {
      assertWordRange(
        'ideaName',
        'El título',
        nextTitle,
        IDEA_WORD_RULES.title.min,
        IDEA_WORD_RULES.title.max,
      );
    }

    if (nextProblem !== undefined) {
      assertWordRange(
        'ideaProblem',
        'El problema',
        nextProblem,
        IDEA_WORD_RULES.problem.min,
        IDEA_WORD_RULES.problem.max,
      );
    }

    if (nextSolution !== undefined) {
      assertWordRange(
        'ideaSolution',
        'La solución',
        nextSolution,
        IDEA_WORD_RULES.solution.min,
        IDEA_WORD_RULES.solution.max,
      );
    }

    const updatedIdea = await this.ideaRepository.update(ideaId, {
      title: nextTitle,
      problem: nextProblem,
      solution: nextSolution,
      isAnonymous: updateIdeaDto.isAnonymous,
    } as any);

    this.invalidateCache();
    this.logger.log(`Idea ${ideaId} editada por su autor.`);
    return updatedIdea;
  }

  private invalidateCache() {
    this.redisService.delByPrefix('public:').catch((err) => {
      this.logger.warn(`Cache invalidation warning: ${(err as Error).message}`);
    });
  }

  async addLike(
    ideaId: string,
    firebaseUid: string,
    rawType?: string | null,
  ): Promise<Idea | any> {
    const [userId, idea] = await Promise.all([
      this.resolveAuthorId(firebaseUid),
      this.ideaRepository.findById(ideaId),
    ]);

    if (!idea) {
      throw new BadRequestException('La idea no existe.');
    }

    await this.ensureChallengeNotClosed(idea.challengeId);

    if (idea.authorId === userId) {
      throw new ForbiddenException({
        message:
          'No puedes votar por tu propia idea. ¡Tu avión ya tiene su propio impulso!',
        code: 'AUTOLIKE_FORBIDDEN',
      });
    }

    const reactionMap: Record<string, 'GOOD' | 'FUTURE' | 'COMPLEX'> = {
      good: 'GOOD',
      future: 'FUTURE',
      complex: 'COMPLEX',
    };
    const targetReaction =
      rawType && reactionMap[rawType] ? reactionMap[rawType] : null;

    try {
      const { updatedIdea, hasVoted, isModified } = await this.ideaRepository.upsertLike(
        ideaId,
        userId,
        targetReaction,
      );
      this.invalidateCache();

      if (!hasVoted) {
        this.moderationService.trackUnlike(userId, ideaId).catch((err) => {
          this.logger.error(`Error in trackUnlike for user ${userId}:`, err);
        });

        this.eventBus.emitToRoom(
          `challenge:${idea.challengeId}`,
          'idea:unvoted',
          {
            ideaId: idea.id,
            likesCount: updatedIdea.likesCount,
            fireScore: updatedIdea.fireScore,
            challengeId: idea.challengeId,
            authorId: userId,
          },
        );
      } else {
        if (isModified) {
          this.moderationService.trackUnlike(userId, ideaId).catch((err) => {
            this.logger.error(`Error in trackUnlike (due to modification) for user ${userId}:`, err);
          });
        }

        this.eventBus.emitToRoom(
          `challenge:${idea.challengeId}`,
          'idea:voted',
          {
            ideaId: idea.id,
            likesCount: updatedIdea.likesCount,
            fireScore: updatedIdea.fireScore,
            challengeId: idea.challengeId,
            authorId: userId,
          },
        );

        if (idea.authorId !== userId) {
          const challengeTitle = (idea as any).challenge?.title || 'un reto';
          await this.notificationService.notifyIdeaReaction(
            idea.authorId,
            idea.id,
            challengeTitle,
          );
        }
      }

      return {
        ...updatedIdea,
        hasVoted,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Reacción ya registrada o en proceso concurrente',
        );
      }
      throw error;
    }
  }

  async addComment(ideaId: string): Promise<Idea | null> {
    const updated = await this.ideaRepository.incrementComments(ideaId);
    if (updated) {
      this.invalidateCache();
      this.eventBus.emitToRoom(
        `challenge:${updated.challengeId}`,
        'idea_commented',
        {
          challengeId: updated.challengeId,
          ideaId: updated.id,
          commentsCount: updated.commentsCount,
        },
      );
    }
    return updated;
  }

  async toggleFavorite(
    ideaId: string,
    firebaseUid: string,
  ): Promise<Idea | any> {
    const [userId, idea] = await Promise.all([
      this.resolveAuthorId(firebaseUid),
      this.ideaRepository.findById(ideaId),
    ]);

    if (!idea) {
      throw new BadRequestException('La idea no existe.');
    }

    const hasFavorited = await this.ideaRepository.toggleFavoriteAtomic(
      ideaId,
      userId,
    );
    this.invalidateCache();

    return {
      ...idea,
      hasFavorited,
      favoritesCount: idea.favoritesCount + (hasFavorited ? 1 : -1),
    };
  }

  async findMyIdeas(firebaseUid: string) {
    const authorId = await this.resolveAuthorId(firebaseUid);
    return this.ideaRepository.findByAuthorId(authorId);
  }

  private mapDraftRecord(draft: any) {
    return {
      ...draft,
      tags: draft.tags?.map((t: { tag: { name: string } }) => t.tag.name) ?? [],
    };
  }

  async findMyDrafts(firebaseUid: string) {
    const authorId = await this.resolveAuthorId(firebaseUid);
    const drafts = await this.ideaRepository.findDraftsByAuthorId(authorId);
    return drafts.map((draft) => this.mapDraftRecord(draft));
  }

  async updateDraft(
    ideaId: string,
    updateDraftDto: CreateDraftIdeaDto,
    firebaseUid: string,
  ): Promise<Idea> {
    const authorId = await this.resolveAuthorId(firebaseUid);
    const existingIdea = await this.ideaRepository.findById(ideaId);

    if (!existingIdea || existingIdea.deletedAt) {
      throw new BadRequestException(
        'El borrador que intentas editar no existe.',
      );
    }

    if (existingIdea.authorId !== authorId) {
      throw new ForbiddenException('Solo el autor puede editar este borrador.');
    }

    if (existingIdea.status !== 'DRAFT') {
      throw new BadRequestException(
        'Solo puedes editar ideas en estado borrador.',
      );
    }

    if (updateDraftDto.challengeId) {
      const challenge = await this.challengeRepository.findById(
        updateDraftDto.challengeId,
      );
      if (!challenge) {
        throw new BadRequestException('El reto vinculado no existe.');
      }
    }

    const updatedDraft = await this.ideaRepository.update(ideaId, {
      title: updateDraftDto.title ?? existingIdea.title,
      problem: updateDraftDto.problem ?? existingIdea.problem,
      solution: updateDraftDto.solution ?? existingIdea.solution,
      isAnonymous: updateDraftDto.isAnonymous ?? existingIdea.isAnonymous,
      multimediaLinks: updateDraftDto.multimediaLinks ?? undefined,
      impactArea: updateDraftDto.impactArea ?? existingIdea.impactArea,
      improvementType:
        updateDraftDto.improvementType ?? existingIdea.improvementType,
      effortLevel: updateDraftDto.effortLevel ?? existingIdea.effortLevel,
      challengeId: updateDraftDto.challengeId ?? existingIdea.challengeId,
    } as any);

    this.logger.log(`Borrador de idea actualizado: "${updatedDraft.title}"`);
    this.invalidateCache();
    return updatedDraft;
  }

  async deleteDraft(
    ideaId: string,
    firebaseUid: string,
  ): Promise<{ id: string }> {
    const authorId = await this.resolveAuthorId(firebaseUid);
    const existingIdea = await this.ideaRepository.findById(ideaId);

    if (!existingIdea || existingIdea.deletedAt) {
      throw new BadRequestException(
        'El borrador que intentas eliminar no existe.',
      );
    }

    if (existingIdea.authorId !== authorId) {
      throw new ForbiddenException(
        'Solo el autor puede eliminar este borrador.',
      );
    }

    if (existingIdea.status !== 'DRAFT') {
      throw new BadRequestException(
        'Solo puedes eliminar ideas en estado borrador.',
      );
    }

    await this.ideaRepository.softDeleteDraft(ideaId);
    this.logger.log(`Borrador de idea eliminado: ${ideaId}`);
    this.invalidateCache();
    return { id: ideaId };
  }

  async deleteIdea(ideaId: string, firebaseUid: string): Promise<{ id: string }> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) throw new ForbiddenException('Usuario no encontrado.');

    const idea = await this.ideaRepository.findById(ideaId);
    if (!idea || idea.deletedAt) {
      throw new NotFoundException('La idea no existe o ya fue eliminada.');
    }

    const isAuthor = idea.authorId === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'ORGANIZATION';

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para eliminar o auditar esta idea.');
    }

    if (isAuthor && !isAdmin) {
      const now = new Date();
      const createdAt = new Date(idea.createdAt);
      const diffMs = now.getTime() - createdAt.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 24) {
        throw new ForbiddenException('No puedes eliminar una propuesta después de 24 horas de haber sido publicada.');
      }

      const challengeStatus = (idea as any).challenge?.status;
      if (challengeStatus === 'EVALUATING' || challengeStatus === 'CLOSED') {
        throw new ForbiddenException('No puedes eliminar una propuesta si el reto está en evaluación o cerrado.');
      }
    }

    await this.ideaRepository.softDeleteIdea(ideaId, user.id);
    this.logger.log(`Idea eliminada/auditada: ${ideaId} por usuario ${user.id}`);
    this.invalidateCache();
    
    if (idea.status !== 'DRAFT') {
      this.eventBus.emitToRoom(`challenge:${idea.challengeId}`, 'idea:deleted', { ideaId });
    }

    if (!isAuthor && isAdmin) {
      try {
        const challengeTitle = (idea as any).challenge?.title || 'un reto';
        await this.notificationService.createNotification(
          idea.authorId,
          'ROLE_UPDATED',
          'Idea eliminada por el administrador',
          `Tu propuesta "${idea.title}" en el reto "${challengeTitle}" fue eliminada por moderación.`,
          undefined,
          undefined,
          idea.challengeId,
        );
      } catch (notifErr) {
        this.logger.error('Error creating moderation notification for idea:', notifErr);
      }
    }

    return { id: ideaId };
  }

  async findMyFavorites(firebaseUid: string) {
    const userId = await this.resolveAuthorId(firebaseUid);
    return this.ideaRepository.findFavoritedByUser(userId);
  }

  async findOne(id: string) {
    const idea = await this.ideaRepository.findById(id);
    if (!idea) {
      throw new NotFoundException('Idea no encontrada.');
    }
    return idea;
  }
}
