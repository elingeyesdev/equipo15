import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { createImpersonationToken } from './impersonation-token.util';

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
        facultyName: company.faculty?.name || null,
      },
      token: session.token,
      expiresAt: session.expiresAt,
      readOnly: true,
      sessionMode: 'READ_ONLY' as const,
    };
  }
}
