import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { IdeaRepository } from '../Repositories/idea.repository';
import { ChallengeRepository } from '../Repositories/challenge.repository';
import { UserRepository } from '../Repositories/user.repository';
import { Idea } from '@prisma/client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectDetails } from '../../database/schemas/project-details.schema';
import { CreateIdeaDto } from '../DTOs/create-idea.dto';
import { CreateDraftIdeaDto } from '../DTOs/create-draft-idea.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EventsGateway } from '../Gateways/events.gateway';
import {
  IDEA_WORD_RULES,
  assertWordRange,
  ensureActiveChallengeStatus,
} from '../Utils/idea-validation.util';

@Injectable()
export class IdeaService {
  private readonly logger = new Logger(IdeaService.name);
  
  private readonly publicCache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL_MS = 30_000;

  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly userRepository: UserRepository,
    @InjectModel(ProjectDetails.name)
    private projectDetailsModel: Model<ProjectDetails>,
    private readonly eventsGateway: EventsGateway,
  ) { }

  private async resolveAuthorId(firebaseUid: string): Promise<string> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new BadRequestException({
        message: 'No encontramos un usuario interno asociado a la sesión actual.',
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

  async create(createIdeaDto: CreateIdeaDto, firebaseUid: string): Promise<Idea> {
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
    if (createdIdea.status === 'public') {
      const ideaWithRelations = await this.ideaRepository.findById(createdIdea.id);
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
      problem: createIdeaDraftDto.problem || 'Pendiente de descripcion del problema.',
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

    const { data, total } = await this.ideaRepository.findAll(skip, limit, paginationDto?.challengeId);
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
    
    const cacheKey = `public:${paginationDto?.challengeId || 'all'}:${paginationDto?.page || 1}:${paginationDto?.limit || 20}:${paginationDto?.search || ''}:${paginationDto?.sort || 'newest'}`;

    
    const cached = this.publicCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      this.logger.log(`⚡ Cache HIT: ${cacheKey}`);
      return cached.data;
    }

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
      undefined,
      paginationDto?.search,
      paginationDto?.sort,
    );

    const result = {
      data,
      meta: {
        total,
        page: paginationDto?.page || 1,
        limit,
      },
    };

    
    this.publicCache.set(cacheKey, { data: result, expiry: Date.now() + this.CACHE_TTL_MS });
    this.logger.log(`🔄 Cache MISS → stored: ${cacheKey}`);

    return result;
  }

  async updateStatus(id: string, status: string) {
    const updatedIdea = await this.ideaRepository.update(id, { status });
    this.logger.log(`Estado de idea con ID ${id} cambiado a: ${status}`);
    return updatedIdea;
  }

  async addLike(ideaId: string, firebaseUid: string): Promise<Idea | null> {
    const userId = await this.resolveAuthorId(firebaseUid);
    try {
      const updated = await this.ideaRepository.registerLikeAndIncrement(ideaId, userId);
      this.eventsGateway.server.emit('idea:voted', {
        ideaId: updated.id,
        likesCount: updated.likesCount,
        challengeId: updated.challengeId,
      });
      return updated;
    } catch (error: unknown) {
      const isPrismaUniqueViolation =
        error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002';
      if (isPrismaUniqueViolation) {
        throw new ConflictException('Ya has votado por esta idea');
      }
      throw error;
    }
  }

  async addComment(ideaId: string): Promise<Idea | null> {
    const updated = await this.ideaRepository.incrementComments(ideaId);
    if (updated) {
      this.eventsGateway.server.emit('idea_commented', { challengeId: updated.challengeId, ideaId: updated.id });
    }
    return updated;
  }
}
