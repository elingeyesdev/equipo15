import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { User } from '@prisma/client';
import { WHITELISTED_EMAILS, BLOCKED_EMAIL_DOMAINS } from '../../common/constants/email-domains';
import { extractEmailDomain, normalizeEmail } from '../../common/utils/email-domain.util';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUid(firebaseUid: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { faculty: true },
    });
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { faculty: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateByUid(firebaseUid: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { firebaseUid },
      data,
    });
  }

  async updateByEmail(email: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { email },
      data,
    });
  }

  async upsert(
    firebaseUid: string,
    createData: any,
    updateData: any,
  ): Promise<User> {
    try {
      return await this.prisma.user.upsert({
        where: { firebaseUid },
        update: updateData,
        create: createData,
      });
    } catch (err: any) {
      // Handle unique constraint on email: try to find existing user by email
      // and attach the firebaseUid instead of failing the request.
      if (err?.code === 'P2002' && createData?.email) {
        const existing = await this.prisma.user.findUnique({
          where: { email: createData.email },
        });
        if (existing) {
          const merged = {
            ...(updateData || {}),
            firebaseUid,
          } as any;
          return this.prisma.user.update({ where: { id: existing.id }, data: merged });
        }
      }
      throw err;
    }
  }
  async updateStatus(
    id: string,
    status: any,
    penaltyExpiresAt: Date,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { status, penaltyExpiresAt },
    });
  }

  async findFacultyByName(name: string) {
    return this.prisma.faculty.findFirst({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
  }

  async getAllFaculties(onlyActive = true) {
    return this.prisma.faculty.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async isDomainListedButInactive(domain: string): Promise<boolean> {
    if (!domain) return false;

    const normalized =
      normalizeEmail(domain).split('@').pop() || domain.toLowerCase();
    const found = await this.prisma.allowedDomain.findFirst({
      where: {
        domain: normalized,
        isActive: false,
      },
    });
    return !!found;
  }

  async isEmailAllowed(email: string): Promise<boolean> {
    if (!email) return false;
    const normalized = normalizeEmail(email);

    if (
      WHITELISTED_EMAILS.includes(
        normalized as (typeof WHITELISTED_EMAILS)[number],
      )
    ) {
      return true;
    }

    const domain = extractEmailDomain(normalized);
    if (!domain) return false;

    // Check explicit allowed domains first — these should override the blocked list
    const found = await this.prisma.allowedDomain.findFirst({ where: { domain, isActive: true } });
    if (found) return true;

    // Then check blocked domains (public providers)
    const isBlocked = BLOCKED_EMAIL_DOMAINS.some((b) => normalized.endsWith(b));
    if (isBlocked) return false;

    return false;
  }
}
