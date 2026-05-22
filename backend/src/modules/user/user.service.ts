import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';
import { extractFacultyFromEmail } from './utils/email-parser.util';
import {
  getRoleFromEmail,
  isAuthorizedEmail,
} from './utils/user-metadata.util';
import { EventsGateway } from '../../infrastructure/events/events.gateway';
import {
  extractEmailDomain,
  normalizeEmail,
} from '../../common/utils/email-domain.util';

export interface UserResponse extends User {
  roleName: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private async ensureUserCanWrite(firebaseUid: string): Promise<User> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Tu cuenta está en modo solo lectura durante la sanción.',
      );
    }

    return user;
  }

  async findOrCreate(
    createUserDto: {
      firebaseUid: string;
      email: string;
      displayName: string;
      avatarUrl?: string;
    },
    forceUpdate = false,
    preventCreation = false,
  ): Promise<UserResponse | null> {
    const { firebaseUid, email } = createUserDto;
    const normalizedEmail = email ? normalizeEmail(email) : '';

    let user = await this.userRepository.findByUid(firebaseUid);

    if (!user && normalizedEmail) {
      user = await this.userRepository.findByEmail(normalizedEmail);
      if (user) {
        await this.userRepository.updateByEmail(normalizedEmail, { firebaseUid });
      }
    }

    if (user) {
      user = await this.clearExpiredPenalties(user);

      if (forceUpdate) {
        const refreshed = await this.userRepository.updateByUid(firebaseUid, {
          displayName: createUserDto.displayName,
          avatarUrl: createUserDto.avatarUrl,
        });
        return this.formatUserResponse(refreshed ?? user);
      }

      return this.formatUserResponse(user);
    }

    if (preventCreation) {
      throw new NotFoundException('No existe cuenta asociada a este correo.');
    }

    if (!normalizedEmail) {
      return null;
    }

    const allowed = await this.userRepository.isEmailAllowed(normalizedEmail);
    if (!allowed) {
      const domain = extractEmailDomain(normalizedEmail);
      const domainPaused =
        domain &&
        (await this.userRepository.isDomainListedButInactive(domain));

      throw new ForbiddenException(
        domainPaused
          ? 'Los registros con este dominio están pausados. Si ya tenías cuenta, inicia sesión con el mismo correo con el que te registraste.'
          : 'Acceso restringido a cuentas institucionales autorizadas.',
      );
    }

    const role = getRoleFromEmail(normalizedEmail);

    const userData: any = {
      firebaseUid,
      email: normalizedEmail,
      displayName: createUserDto.displayName,
      avatarUrl: createUserDto.avatarUrl,
      role,
    };

    const detectedFacultyId = extractFacultyFromEmail(normalizedEmail);
    if (detectedFacultyId !== null) {
      const mappedId = await this.mapLegacyFacultyId(detectedFacultyId);
      if (mappedId) {
        userData.facultyId = mappedId;
      }
    }

    user = await this.userRepository.upsert(firebaseUid, userData, {
      displayName: createUserDto.displayName,
      avatarUrl: createUserDto.avatarUrl,
    });

    return this.formatUserResponse(user);
  }

  private formatUserResponse(user: any | null): UserResponse | null {
    if (!user) return null;

    const roleMapping: Record<string, string> = {
      ADMIN: 'admin',
      COMPANY: 'company',
      JUDGE: 'judge',
      USER: 'student',
    };

    const mappedRole = roleMapping[user.role] || 'student';

    return {
      ...user,
      role: mappedRole as any,
      roleName: mappedRole,
      facultyName: user.faculty?.name || null,
    };
  }

  private async clearExpiredPenalties(user: User | null): Promise<User | null> {
    if (!user) return null;

    if (user.status !== 'ACTIVE' && user.penaltyExpiresAt) {
      if (new Date() > new Date(user.penaltyExpiresAt)) {
        const updated = await this.userRepository.updateStatus(
          user.id,
          'ACTIVE',
          null as any,
        );
        return {
          ...user,
          status: updated.status,
          penaltyExpiresAt: updated.penaltyExpiresAt,
        };
      }
    }
    return user;
  }

  async findByUid(firebaseUid: string): Promise<UserResponse | null> {
    let user = await this.userRepository.findByUid(firebaseUid);
    user = await this.clearExpiredPenalties(user);
    return this.formatUserResponse(user);
  }

  async updateProfile(
    firebaseUid: string,
    data: {
      bio?: string;
      nickname?: string;
      phone?: string;
      studentCode?: string;
    },
  ): Promise<UserResponse | null> {
    await this.ensureUserCanWrite(firebaseUid);

    const updatedUser = await this.userRepository.updateByUid(
      firebaseUid,
      data,
    );
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (data.nickname !== undefined) {
      const displayName =
        data.nickname && data.nickname.trim().length > 0
          ? data.nickname
          : updatedUser.displayName;
      // Emit only to the affected user's room to avoid broadcasting private updates
      this.eventsGateway.server
        .to(`user:${updatedUser.firebaseUid}`)
        .emit('user:profile_updated', {
          userId: updatedUser.id,
          displayName,
          nickname: updatedUser.nickname,
        });
    }

    return this.formatUserResponse(updatedUser);
  }

  async updateFaculty(
    firebaseUid: string,
    data: { facultyId?: string | number },
  ): Promise<UserResponse | null> {
    await this.ensureUserCanWrite(firebaseUid);

    if (
      data.facultyId === undefined ||
      data.facultyId === null ||
      data.facultyId === ''
    ) {
      throw new BadRequestException('Debes seleccionar una facultad válida.');
    }

    const facultyId = await this.mapLegacyFacultyId(data.facultyId);
    if (!facultyId) {
      throw new BadRequestException('Facultad inválida o no encontrada.');
    }

    const updatedUser = await this.userRepository.updateByUid(firebaseUid, {
      facultyId,
    });
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.formatUserResponse(updatedUser);
  }

  private async mapLegacyFacultyId(
    legacyId: string | number,
  ): Promise<string | null> {
    const numericId = Number(legacyId);

    if (isNaN(numericId)) {
      if (typeof legacyId === 'string' && legacyId.length > 10) {
        const faculties = await this.userRepository.getAllFaculties(false);
        const exists = faculties.find((f) => f.id === legacyId);
        if (exists) return exists.id;
      }
      return null;
    }

    const facultyMapping: Record<number, string> = {
      1: 'Ingeniería',
      2: 'Ciencias',
      3: 'Humanidades',
      4: 'Medicina',
      5: 'Derecho',
      6: 'Arquitectura',
    };

    const targetName = facultyMapping[numericId]?.toLowerCase();
    if (targetName) {
      const faculties = await this.userRepository.getAllFaculties(false);
      const matched = faculties.find(
        (f) =>
          f.name.toLowerCase().includes(targetName) ||
          targetName.includes(f.name.toLowerCase()),
      );
      return matched?.id || null;
    }
    return null;
  }

  async getAllFaculties(onlyActive = true) {
    return this.userRepository.getAllFaculties(onlyActive);
  }
}
