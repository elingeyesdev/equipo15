import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma, User, UserStatus } from '@prisma/client';

export type UserWithProfile = Prisma.UserGetPayload<{
  include: { studentProfile: { include: { faculty: true } } };
}>;
import {
  WHITELISTED_EMAILS,
  BLOCKED_EMAIL_DOMAINS,
  ALLOWED_EMAIL_DOMAINS,
} from '../../common/constants/email-domains';
import {
  extractEmailDomain,
  normalizeEmail,
} from '../../common/utils/email-domain.util';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUid(firebaseUid: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { studentProfile: { include: { faculty: true } } },
    });
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { studentProfile: { include: { faculty: true } } },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.UserCreateInput | Prisma.UserUncheckedCreateInput,
  ): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput | Prisma.UserUncheckedUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateByUid(
    firebaseUid: string,
    data: Prisma.UserUpdateInput | Prisma.UserUncheckedUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { firebaseUid },
      data,
    });
  }

  async updateByEmail(
    email: string,
    data: Prisma.UserUpdateInput | Prisma.UserUncheckedUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { email },
      data,
    });
  }

  async upsert(
    firebaseUid: string,
    createData: Prisma.UserCreateInput | Prisma.UserUncheckedCreateInput,
    updateData: Prisma.UserUpdateInput | Prisma.UserUncheckedUpdateInput,
  ): Promise<User> {
    try {
      return await this.prisma.user.upsert({
        where: { firebaseUid },
        update: updateData,
        create: createData,
      });
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        createData &&
        typeof createData === 'object' &&
        'email' in createData
      ) {
        const email = createData.email;
        if (email) {
          const existing = await this.prisma.user.findUnique({
            where: { email },
          });
          if (existing) {
            const merged = {
              ...(updateData || {}),
              firebaseUid,
            };
            return this.prisma.user.update({
              where: { id: existing.id },
              data: merged,
            });
          }
        }
      }
      throw err;
    }
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    if (status === UserStatus.DELETED || status === UserStatus.SUSPENDED) {
      await this.prisma.userDevice.updateMany({
        where: { userId: id },
        data: { isActive: false },
      });
    }

    return updatedUser;
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

  isDomainListedButInactive(domain: string): boolean {
    if (!domain) return false;

    const normalized =
      normalizeEmail(domain).split('@').pop() || domain.toLowerCase();

    const isAllowed = ALLOWED_EMAIL_DOMAINS.some((d) =>
      normalized.endsWith(d.replace('@', '')),
    );

    return !isAllowed;
  }

  async createStudentProfile(
    userId: string,
    data: { studentCode?: string; facultyId?: string; enrollmentYear?: number },
  ) {
    return this.prisma.studentProfile.create({
      data: { userId, ...data },
    });
  }

  async updateStudentProfile(
    userId: string,
    data: { studentCode?: string; facultyId?: string; enrollmentYear?: number },
  ) {
    return this.prisma.studentProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async findActivePenalties(userId: string) {
    const now = new Date();
    return this.prisma.penalty.findMany({
      where: {
        userId,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
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

    const isAllowed = ALLOWED_EMAIL_DOMAINS.some((d) => normalized.endsWith(d));
    if (isAllowed) return true;

    const found = await this.prisma.allowedDomain.findFirst({
      where: { domain, isActive: true },
    });
    if (found) return true;

    const isBlocked = BLOCKED_EMAIL_DOMAINS.some((b) => normalized.endsWith(b));
    if (isBlocked) return false;

    return false;
  }

  async syncUserStatusFromPenalties(userId: string): Promise<void> {
    const now = new Date();
    const activePenalties = await this.prisma.penalty.findMany({
      where: {
        userId,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (activePenalties.length === 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });
      return;
    }

    const hasSuspension = activePenalties.some(
      (p) =>
        p.reason === 'ADMIN_MANUAL' ||
        p.reason === 'COMMENT_ABUSE' ||
        p.reason === 'SPAM',
    );

    const newStatus = hasSuspension ? 'SUSPENDED' : 'SOFT_BLOCK';

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });
  }
}
