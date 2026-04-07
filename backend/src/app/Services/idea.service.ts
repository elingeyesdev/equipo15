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

@Injectable()
export class IdeaService {
  private readonly logger = new Logger(IdeaService.name);

  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly challengeRepository: ChallengeRepository,
    @InjectModel(ProjectDetails.name) private projectDetailsModel: Model<ProjectDetails>,
  ) {}

  async create(createIdeaDto: CreateIdeaDto): Promise<Idea> {
    const challenge = await this.challengeRepository.findById(createIdeaDto.challengeId);
    if (!challenge) {
      throw new BadRequestException('El reto vinculado no existe.');
    }

    if (challenge.endDate && new Date() > new Date(challenge.endDate)) {
      this.logger.warn(`Intento de creación de idea en reto expirado: ${challenge.title}`);
      throw new BadRequestException('El reto ha expirado y ya no acepta más propuestas.');
    }

    const createdIdea = await this.ideaRepository.create(createIdeaDto);
    
    await this.projectDetailsModel.create({
      projectId: createdIdea.id,
      description: createIdeaDto.problem + ' \n ' + createIdeaDto.solution,
      tags: createIdeaDto.tags || [],
      multimediaLinks: createIdeaDto.multimediaLinks || [],
    });

    this.logger.log(`Nueva idea creada (Híbrida): "${createdIdea.title}" para el reto: ${challenge.title}`);
    return createdIdea;
  }

  async createDraft(createIdeaDraftDto: CreateDraftIdeaDto): Promise<Idea> {
    const draftPayload = {
      ...createIdeaDraftDto,
      status: 'draft',
    };
    const createdDraft = await this.ideaRepository.create(draftPayload);

    await this.projectDetailsModel.create({
      projectId: createdDraft.id,
      description: createIdeaDraftDto.problem || '' + ' \n ' + createIdeaDraftDto.solution || '',
      tags: createIdeaDraftDto.tags || [],
    });

    this.logger.log(`Borrador de idea creado (Híbrido): "${createdDraft.title}"`);
    return createdDraft;
  }

  async findAll(paginationDto?: PaginationDto) {
    const limit = paginationDto?.limit ? Number(paginationDto.limit) : undefined;
    const skip = paginationDto?.page && limit ? (Number(paginationDto.page) - 1) * limit : undefined;
    
    const { data, total } = await this.ideaRepository.findAll(skip, limit);
    return {
      data,
      meta: {
        total,
        page: paginationDto?.page || 1,
        limit,
      }
    };
  }

  async findAllPublic(paginationDto?: PaginationDto) {
    const limit = paginationDto?.limit ? Number(paginationDto.limit) : undefined;
    const skip = paginationDto?.page && limit ? (Number(paginationDto.page) - 1) * limit : undefined;
    
    const { data, total } = await this.ideaRepository.findPublic(skip, limit);
    return {
      data,
      meta: {
        total,
        page: paginationDto?.page || 1,
        limit,
      }
    };
  }

  async updateStatus(id: string, status: string) {
    const updatedIdea = await this.ideaRepository.update(id, { status });
    this.logger.log(`Estado de idea con ID ${id} cambiado a: ${status}`);
    return updatedIdea;
  }

  async addLike(ideaId: string): Promise<Idea | null> {
    return this.ideaRepository.incrementLikes(ideaId);
  }

  async addComment(ideaId: string): Promise<Idea | null> {
    return this.ideaRepository.incrementComments(ideaId);
  }
}
