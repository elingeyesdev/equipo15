import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ChallengeRepository } from './challenge.repository';
import { Challenge } from '@prisma/client';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { FinalizePodiumDto, RankingCategory } from './dtos/finalize-podium.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserService, UserResponse } from '../user/user.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);

  constructor(
    private readonly challengeRepository: ChallengeRepository,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserByUid(uid: string): Promise<UserResponse | null> {
    return this.userService.findByUid(uid);
  }

  async create(
    createChallengeDto: CreateChallengeDto,
    authorId: string,
  ): Promise<Challenge> {
    const { submissionsOpenAt, submissionsCloseAt, publishedAt, ...rest } =
      createChallengeDto;

    const payload: Record<string, any> = {
      ...rest,
      submissionsOpenAt: submissionsOpenAt
        ? new Date(submissionsOpenAt)
        : undefined,
      submissionsCloseAt: submissionsCloseAt
        ? new Date(submissionsCloseAt)
        : undefined,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    };

    if (payload.status === 'PUBLISHED' && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    payload.facultyId = await this.resolveFacultyId(payload.facultyId);

    const createdChallenge = await this.challengeRepository.create({
      ...payload,
      authorId,
    } as any);
    this.logger.log(
      `Nuevo reto creado: "${createdChallenge.title}" con ID: ${createdChallenge.id} por autor: ${authorId}`,
    );
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

  async update(id: string, updateChallengeDto: UpdateChallengeDto) {
    const { submissionsOpenAt, submissionsCloseAt, publishedAt, ...rest } =
      updateChallengeDto;

    const payload: Record<string, any> = {
      ...rest,
      submissionsOpenAt: submissionsOpenAt
        ? new Date(submissionsOpenAt)
        : undefined,
      submissionsCloseAt: submissionsCloseAt
        ? new Date(submissionsCloseAt)
        : undefined,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    };

    payload.facultyId = await this.resolveFacultyId(payload.facultyId);

    if (payload.status === 'PUBLISHED') {
      const existing = await this.challengeRepository.findById(id);
      if (existing && !(existing as any).publishedAt) {
        payload.publishedAt = new Date();
      }
    }

    const updatedChallenge = await this.challengeRepository.update(id, payload);
    this.logger.log(
      `Reto actualizado: "${updatedChallenge.title}" con ID: ${id}`,
    );
    return updatedChallenge;
  }

  async delete(id: string) {
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

  async getChallengeStats(id: string) {
    const stats = await this.challengeRepository.getChallengeImpactStats(id);
    return {
      challengeId: id,
      ...stats,
    };
  }

  // ─── Innovation Stats for Company Dashboard (E1.4) ───────────────────────────
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

  // ─── Judge Management (E2.3) ───────────────────────────────────────────────

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

    if (challenge.authorId !== user.id && (user.role as any) !== 'admin' && user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para asignar jueces a este reto.');
    }

    if (dto.judgeIds.length > 5) {
      throw new ForbiddenException('No se pueden asignar más de 5 jueces a un reto.');
    }

    return this.challengeRepository.assignJudges(
      challengeId,
      dto.judgeIds,
      user.id,
    );
  }

  // ─── Finalize Podium (Company Control) ──────────────────────────────────────
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

    const sortedIdeas = [...ideas].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (dto.category === RankingCategory.LIKES) {
        valA = a.likesCount || 0;
        valB = b.likesCount || 0;
      } else if (dto.category === RankingCategory.COMMENTS) {
        valA = a.commentsCount || 0;
        valB = b.commentsCount || 0;
      } else if (dto.category === RankingCategory.VOTES) {
        valA = a.finalScore || 0;
        valB = b.finalScore || 0;
      }

      return valB - valA;
    });

    const totalIdeasCount = sortedIdeas.length;
    const finalLimit = Math.min(dto.limit, totalIdeasCount);
    const finalistIdeas = sortedIdeas.slice(0, finalLimit);
    const finalistIds = finalistIdeas.map((idea) => idea.id);

    await this.challengeRepository.update(challengeId, {
      status: 'EVALUATING',
      podiumSize: finalLimit,
    } as any);

    await this.prisma.idea.updateMany({
      where: { id: { in: finalistIds } },
      data: { status: 'FINALIST' },
    });

    this.logger.log(
      `Reto ${challengeId} finalizado. ${finalLimit} finalistas seleccionados basándose en ${dto.category}.`,
    );

    return {
      success: true,
      podiumSize: finalLimit,
      finalistCount: finalistIds.length,
    };
  }

  /**
   * Resolve any incoming facultyId to a valid UUID or null.
   * Handles: null/undefined, valid UUID strings, numeric IDs, and string-encoded numbers like "4".
   */
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
}
