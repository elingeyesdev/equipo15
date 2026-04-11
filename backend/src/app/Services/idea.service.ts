import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { IdeaRepository } from '../Repositories/idea.repository';
import { ChallengeRepository } from '../Repositories/challenge.repository';
import { Idea } from '@prisma/client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectDetails } from '../../database/schemas/project-details.schema';
import { CreateIdeaDto } from '../DTOs/create-idea.dto';
import { CreateDraftIdeaDto } from '../DTOs/create-draft-idea.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EventsGateway } from '../Gateways/events.gateway';

@Injectable()
export class IdeaService {
  private readonly logger = new Logger(IdeaService.name);

  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly challengeRepository: ChallengeRepository,
    @InjectModel(ProjectDetails.name)
    private projectDetailsModel: Model<ProjectDetails>,
    private readonly eventsGateway: EventsGateway,
  ) { }

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

  async create(createIdeaDto: CreateIdeaDto): Promise<Idea> {
    const challenge = await this.challengeRepository.findById(
      createIdeaDto.challengeId,
    );
    if (!challenge) {
      throw new BadRequestException('El reto vinculado no existe.');
    }

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
      isAnonymous: createIdeaDto.isAnonymous || false,
      authorId: createIdeaDto.author,
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
    return createdIdea;
  }

  async createDraft(createIdeaDraftDto: CreateDraftIdeaDto): Promise<Idea> {
    if (!createIdeaDraftDto.challengeId) {
      throw new BadRequestException(
        'Selecciona un reto antes de guardar el borrador.',
      );
    }

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
      isAnonymous: createIdeaDraftDto.isAnonymous || false,
      authorId: createIdeaDraftDto.author,
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

  async findAllPublic(paginationDto?: PaginationDto) {
    const limit = paginationDto?.limit
      ? Number(paginationDto.limit)
      : undefined;
    const skip =
      paginationDto?.page && limit
        ? (Number(paginationDto.page) - 1) * limit
        : undefined;

    const { data, total } = await this.ideaRepository.findPublic(skip, limit, paginationDto?.challengeId);
    return {
      data,
      meta: {
        total,
        page: paginationDto?.page || 1,
        limit,
      },
    };
  }

  async updateStatus(id: string, status: string) {
    const updatedIdea = await this.ideaRepository.update(id, { status });
    this.logger.log(`Estado de idea con ID ${id} cambiado a: ${status}`);
    return updatedIdea;
  }

  async addLike(ideaId: string): Promise<Idea | null> {
    const updated = await this.ideaRepository.incrementLikes(ideaId);
    if (updated) {
      this.eventsGateway.server.emit('idea_liked', { challengeId: updated.challengeId, ideaId: updated.id });
    }
    return updated;
  }

  async addComment(ideaId: string): Promise<Idea | null> {
    const updated = await this.ideaRepository.incrementComments(ideaId);
    if (updated) {
      this.eventsGateway.server.emit('idea_commented', { challengeId: updated.challengeId, ideaId: updated.id });
    }
    return updated;
  }
}
