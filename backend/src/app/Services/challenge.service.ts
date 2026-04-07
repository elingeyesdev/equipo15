import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ChallengeRepository } from '../Repositories/challenge.repository';
import { Challenge } from '@prisma/client';
import { CreateChallengeDto } from '../DTOs/create-challenge.dto';
import { UpdateChallengeDto } from '../DTOs/update-challenge.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserService } from './user.service';

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);

  constructor(
    private readonly challengeRepository: ChallengeRepository,
    private readonly userService: UserService,
  ) {}

  async getUserByUid(uid: string) {
    return this.userService.findByUid(uid);
  }

  async create(createChallengeDto: CreateChallengeDto, authorId: string): Promise<Challenge> {
    const payload: any = { ...createChallengeDto };
    
    // Auto-set publicationDate if created as Activo
    if (payload.status === 'Activo' && !payload.publicationDate) {
      payload.publicationDate = new Date().toISOString();
    }

    const createdChallenge = await this.challengeRepository.create({
      ...payload,
      authorId
    });
    this.logger.log(`Nuevo reto creado: "${createdChallenge.title}" con ID: ${createdChallenge.id} por autor: ${authorId}`);
    return createdChallenge;
  }

  async findAll(paginationDto?: PaginationDto, status?: string) {
    const limit = paginationDto?.limit ? Number(paginationDto.limit) : undefined;
    const skip = paginationDto?.page && limit ? (Number(paginationDto.page) - 1) * limit : undefined;
    const normalizedStatus = status?.trim();
    
    const { data, total } = await this.challengeRepository.findAll(skip, limit, normalizedStatus);

    return {
      data,
      meta: {
        total,
        page: paginationDto?.page || 1,
        limit,
      }
    };
  }

  async findOne(id: string) {
    const challenge = await this.challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException(`El reto con ID ${id} no existe.`);
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

  async update(id: string, updateChallengeDto: UpdateChallengeDto) {
    const payload: any = { ...updateChallengeDto };

    // If publishing for the first time, set publicationDate
    if (payload.status === 'Activo') {
      const existing = await this.challengeRepository.findById(id);
      if (existing && !existing.publicationDate) {
        payload.publicationDate = new Date().toISOString();
      }
    }

    const updatedChallenge = await this.challengeRepository.update(id, payload);
    this.logger.log(`Reto actualizado: "${updatedChallenge.title}" con ID: ${id}`);
    return updatedChallenge;
  }

  async delete(id: string) {
    const deletedChallenge = await this.challengeRepository.delete(id);
    this.logger.log(`Reto eliminado: "${deletedChallenge.title}" con ID: ${id}`);
    return deletedChallenge;
  }

  async getGlobalStats() {
    const [totalChallenges, totalIdeas, totalParticipants] = await Promise.all([
      this.challengeRepository.countChallengesByStatus('Activo'),
      this.challengeRepository.countTotalIdeas(),
      this.challengeRepository.countStudentUsers(),
    ]);

    return {
      totalChallenges,
      activeChallenges: totalChallenges,
      totalParticipants,
      totalIdeas,
      statsByFaculty: [],
    };
  }

  async getChallengeStats(id: string) {
    const ideasCount = await this.challengeRepository.countIdeasByChallenge(id);
    return {
      challengeId: id,
      participantsCount: 0,
      ideasCount,
      averageScore: 0,
      statusDistribution: {
        draft: 0,
        submitted: ideasCount,
        approved: 0,
        rejected: 0,
      },
    };
  }
}
