import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { createImpersonationToken } from './impersonation-token.util';
import type { UserRoleEnum } from './dto/update-user-role.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { CreateAllowedDomainDto } from './dto/create-allowed-domain.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly adminRepository: AdminRepository) {}

  async getGlobalAnalytics() {
    return this.adminRepository.getGlobalAnalytics();
  }

  async getCompanies() {
    return this.adminRepository.getCompanies();
  }

  async createCompanyImpersonation(
    companyId: string,
    adminUid: string,
    adminEmail?: string | null,
  ) {
    const company = await this.adminRepository.findCompanyById(companyId);

    if (!company) {
      throw new NotFoundException('Empresa no encontrada.');
    }

    const session = createImpersonationToken({
      uid: company.firebaseUid,
      email: company.email,
      role: 'COMPANY',
      roleName: 'company',
      companyId: company.id,
      companyName: company.displayName,
      originalAdminUid: adminUid,
      originalAdminEmail: adminEmail,
    });

    return {
      company: {
        id: company.id,
        firebaseUid: company.firebaseUid,
        email: company.email,
        displayName: company.displayName,
        status: company.status,
        activeChallenges: 0,
        closedChallenges: 0,
      },
      token: session.token,
      expiresAt: session.expiresAt,
      readOnly: true,
      sessionMode: 'READ_ONLY' as const,
    };
  }

  async createFaculty(dto: CreateFacultyDto) {
    return this.adminRepository.createFaculty(dto.name.trim());
  }

  async updateFaculty(id: string, dto: UpdateFacultyDto) {
    return this.adminRepository.updateFaculty(id, dto.name.trim());
  }

  async updateFacultyStatus(id: string, isActive: boolean) {
    return this.adminRepository.updateFacultyStatus(id, isActive);
  }

  async removeFaculty(id: string) {
    return this.adminRepository.removeFaculty(id);
  }

  async searchUsers(query?: string, roleFilter?: string, page = 1, limit = 20) {
    return this.adminRepository.searchUsers(query, roleFilter, page, limit);
  }

  async updateUserRole(userId: string, newRole: UserRoleEnum) {
    const result = await this.adminRepository.updateUserRole(userId, newRole);

    if (!result) {
      throw new NotFoundException(`Usuario con id "${userId}" no encontrado.`);
    }

    if (result.changed) {
      this.logger.log(
        `[ROLE_CHANGE] Usuario "${result.user.email}" (${userId}): ${result.previousRole} → ${result.newRole}`,
      );
    } else {
      this.logger.log(
        `[ROLE_CHANGE_NOOP] Usuario "${result.user.email}" (${userId}): ya tenía rol ${result.newRole}`,
      );
    }

    return result.user;
  }

  async getUserReputation(userId: string) {
    const result = await this.adminRepository.getUserReputation(userId);

    if (!result) {
      throw new NotFoundException(`Usuario con id "${userId}" no encontrado.`);
    }

    const totalIdeas = result.ideas.length;
    const finalistIdeas = result.ideas.filter((i) => i.status === 'FINALIST').length;
    const winnerIdeas = result.ideas.filter((i) => i.status === 'WINNER').length;
    const avgFireScore =
      totalIdeas > 0
        ? result.ideas.reduce((sum, i) => sum + i.fireScore, 0) / totalIdeas
        : 0;
    const now = new Date();
    const activePenalties = result.penalties.filter(
      (p) => p.expiresAt === null || p.expiresAt > now,
    ).length;

    return {
      user: {
        id: result.id,
        displayName: result.displayName,
        email: result.email,
        avatarUrl: result.avatarUrl,
        role: result.role,
        status: result.status,
        totalPoints: result.totalPoints,
        faculty: result.studentProfile?.faculty?.name || null,
        createdAt: result.createdAt,
      },
      metrics: {
        totalIdeas,
        finalistIdeas,
        winnerIdeas,
        avgFireScore,
        activePenalties,
      },
      ideas: result.ideas.map((idea) => ({
        ...idea,
        tags: idea.tags.map((t) => t.tag.name),
      })),
      penalties: result.penalties,
    };
  }

  async getAllowedDomains() {
    return this.adminRepository.getAllowedDomains();
  }

  async addAllowedDomain(dto: CreateAllowedDomainDto) {
    return this.adminRepository.createAllowedDomain(dto.domain);
  }

  async updateAllowedDomainStatus(id: string, isActive: boolean) {
    return this.adminRepository.updateAllowedDomainStatus(id, isActive);
  }

  async removeAllowedDomain(id: string) {
    return this.adminRepository.deleteAllowedDomain(id);
  }

  async getChallengeAuditIdeas(challengeId: string) {
    const result = await this.adminRepository.getChallengeAuditIdeas(challengeId);
    if (!result) {
      throw new NotFoundException('Reto no encontrado');
    }
    return result;
  }
}
