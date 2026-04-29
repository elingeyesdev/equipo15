import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { IdeaRepository } from '../repositories/idea.repository';
import { ChallengeRepository } from '../repositories/challenge.repository';
import { UserRepository } from '../repositories/user.repository';
import { Idea } from '@prisma/client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectDetails } from '../../database/schemas/project-details.schema';
import { CreateIdeaDto } from '../dtos/create-idea.dto';
import { CreateDraftIdeaDto } from '../dtos/create-draft-idea.dto';
import { UpdateIdeaDto } from '../dtos/update-idea.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EventsGateway } from '../gateways/events.gateway';
import { VisibilityStrategy, UserRoleName } from '../utils/visibility.strategy';
import {
  IDEA_WORD_RULES,
  assertWordRange,
  ensureActiveChallengeStatus,
} from '../utils/idea-validation.util';
import { ModerationService } from './moderation.service';

@Injectable()
export class IdeaService {
  private readonly logger = new Logger(IdeaService.name);

  private readonly publicCache = new Map<
    string,
    { data: any; expiry: number }
  >();
  private readonly CACHE_TTL_MS = 30_000;

  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly userRepository: UserRepository,
    @InjectModel(ProjectDetails.name)
    private projectDetailsModel: Model<ProjectDetails>,
    private readonly eventsGateway: EventsGateway,
    private readonly moderationService: ModerationService,
  ) {}

  private async resolveAuthorId(firebaseUid: string): Promise<string> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new BadRequestException({
        message:
          'No encontramos un usuario interno asociado a la sesión actual.',
      });
    }
    return user.id;
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

  private async persistProjectDetails(data: {
    projectId: string;
    problem?: string;
    solution?: string;
    tags?: string[];
    multimediaLinks?: string[];
  }): Promise<void> {
    try {
      await this.projectDetailsModel.create({
        projectId: data.projectId,
        description: `${data.problem ?? ''}\n${data.solution ?? ''}`.trim(),
        tags: data.tags || [],
        multimediaLinks: data.multimediaLinks || [],
      });
    } catch (error) {
      this.logger.warn(
        `No se pudo guardar ProjectDetails para idea ${data.projectId}: ${(error as Error).message}`,
      );
    }
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

    if (challenge.endDate && new Date() > new Date(challenge.endDate)) {
      this.logger.warn(
        `Intento de creación de idea en reto expirado: ${challenge.title}`,
      );
      throw new BadRequestException(
        'El reto ha expirado y ya no acepta más propuestas.',
      );
    }

    const createdIdea = await this.ideaRepository.create({
      title: createIdeaDto.title,
      problem: createIdeaDto.problem,
      solution: createIdeaDto.solution,
      status: createIdeaDto.status || 'public',
      tags: createIdeaDto.tags || [],
      isAnonymous: createIdeaDto.isAnonymous ?? false,
      authorId,
      challengeId: createIdeaDto.challengeId,
    });

    await this.persistProjectDetails({
      projectId: createdIdea.id,
      problem: createIdeaDto.problem,
      solution: createIdeaDto.solution,
      tags: createIdeaDto.tags,
      multimediaLinks: createIdeaDto.multimediaLinks,
    });

    this.logger.log(
      `Nueva idea creada (Híbrida): "${createdIdea.title}" para el reto: ${challenge.title}`,
    );
    this.invalidateCache();
    if (createdIdea.status === 'public') {
      const ideaWithRelations = await this.ideaRepository.findById(
        createdIdea.id,
      );
      if (ideaWithRelations) {
        this.eventsGateway.server.emit('idea_created', ideaWithRelations);
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

    const draftPayload = {
      title: createIdeaDraftDto.title || 'Borrador sin titulo',
      problem:
        createIdeaDraftDto.problem || 'Pendiente de descripcion del problema.',
      solution:
        createIdeaDraftDto.solution ||
        'Pendiente de descripcion de la solucion propuesta.',
      tags: createIdeaDraftDto.tags || [],
      isAnonymous: createIdeaDraftDto.isAnonymous ?? false,
      authorId,
      challengeId: createIdeaDraftDto.challengeId,
      status: 'draft',
    };
    const createdDraft = await this.ideaRepository.create(draftPayload);

    await this.persistProjectDetails({
      projectId: createdDraft.id,
      problem: createIdeaDraftDto.problem,
      solution: createIdeaDraftDto.solution,
      tags: createIdeaDraftDto.tags,
    });

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
        if ((user as any).role?.name) {
          userRole = (user as any).role.name as UserRoleName;
        }
      }
    }

    const cacheKey = `public:${userId || 'anon'}:${paginationDto?.challengeId || 'all'}:${paginationDto?.page || 1}:${paginationDto?.limit || 20}:${paginationDto?.search || ''}:${paginationDto?.sort || 'newest'}`;

    let rawResult;
    const cached = this.publicCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      rawResult = cached.data;
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

      this.publicCache.set(cacheKey, {
        data: rawResult,
        expiry: Date.now() + this.CACHE_TTL_MS,
      });
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
    const updatedIdea = await this.ideaRepository.update(id, { status });
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

    if (existingIdea.authorId !== authorId) {
      throw new ForbiddenException('Solo el autor de la idea puede editarla.');
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
      tags: updateIdeaDto.tags,
      isAnonymous: updateIdeaDto.isAnonymous,
    });

    this.invalidateCache();
    this.logger.log(`Idea ${ideaId} editada por su autor.`);
    return updatedIdea;
  }

  private invalidateCache() {
    this.publicCache.clear();
  }

  async addLike(ideaId: string, firebaseUid: string): Promise<Idea | any> {
    const [userId, idea] = await Promise.all([
      this.resolveAuthorId(firebaseUid),
      this.ideaRepository.findById(ideaId),
    ]);

    if (!idea) {
      throw new BadRequestException('La idea no existe.');
    }

    if (idea.authorId === userId) {
      throw new ForbiddenException({
        message:
          'No puedes votar por tu propia idea. ¡Tu avión ya tiene su propio impulso!',
        code: 'AUTOLIKE_FORBIDDEN',
      });
    }

    const hasVoted = await this.ideaRepository.checkUserLike(ideaId, userId);

    if (hasVoted) {
      await this.ideaRepository.removeLikeAndDecrement(ideaId, userId);
      this.invalidateCache();

      this.moderationService.trackUnlike(userId).catch((err) => {
        this.logger.error(`Error in trackUnlike for user ${userId}:`, err);
      });

      const optimisticLikes = Math.max(0, idea.likesCount - 1);
      this.eventsGateway.server.emit('idea:unvoted', {
        ideaId: idea.id,
        likesCount: optimisticLikes,
        challengeId: idea.challengeId,
      });

      return {
        ...idea,
        likesCount: optimisticLikes,
        hasVoted: false,
      };
    } else {
      await this.ideaRepository.registerLikeAndIncrement(ideaId, userId);
      this.invalidateCache();

      const optimisticLikes = idea.likesCount + 1;
      this.eventsGateway.server.emit('idea:voted', {
        ideaId: idea.id,
        likesCount: optimisticLikes,
        challengeId: idea.challengeId,
      });

      return {
        ...idea,
        likesCount: optimisticLikes,
        hasVoted: true,
      };
    }
  }

  async addComment(ideaId: string): Promise<Idea | null> {
    const updated = await this.ideaRepository.incrementComments(ideaId);
    if (updated) {
      this.invalidateCache();
      this.eventsGateway.server.emit('idea_commented', {
        challengeId: updated.challengeId,
        ideaId: updated.id,
      });
    }
    return updated;
  }

  async toggleFavorite(ideaId: string, firebaseUid: string): Promise<Idea | any> {
    const [userId, idea] = await Promise.all([
      this.resolveAuthorId(firebaseUid),
      this.ideaRepository.findById(ideaId),
    ]);

    if (!idea) {
      throw new BadRequestException('La idea no existe.');
    }

    const hasFavorited = await this.ideaRepository.checkUserFavorite(ideaId, userId);

    if (hasFavorited) {
      await this.ideaRepository.removeFavorite(ideaId, userId);
      this.invalidateCache();
      return {
        ...idea,
        hasFavorited: false,
      };
    }

    await this.ideaRepository.registerFavorite(ideaId, userId);
    this.invalidateCache();
    return {
      ...idea,
      hasFavorited: true,
    };
  }
}
