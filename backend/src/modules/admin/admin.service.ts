import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { createImpersonationToken } from './impersonation-token.util';
import { CreateAllowedDomainDto } from './dto/create-allowed-domain.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Injectable()
export class AdminService {
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

  async getAllowedDomains() {
    return this.adminRepository.getAllowedDomains();
  }

  async addAllowedDomain(dto: CreateAllowedDomainDto) {
    // repository handles unique constraint errors
    return this.adminRepository.createAllowedDomain(dto.domain.toLowerCase());
  }

  async updateAllowedDomainStatus(id: string, isActive: boolean) {
    return this.adminRepository.updateAllowedDomainStatus(id, isActive);
  }

  async removeAllowedDomain(id: string) {
    return this.adminRepository.deleteAllowedDomain(id);
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
}
