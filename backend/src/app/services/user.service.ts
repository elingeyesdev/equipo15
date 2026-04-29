import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { User, Role } from '@prisma/client';
import { extractFacultyFromEmail } from '../utils/email-parser.util';
import {
  getRoleFromEmail,
  isAuthorizedEmail,
} from '../utils/user-metadata.util';
import { EventsGateway } from '../gateways/events.gateway';

export type UserWithRole = User & { role?: Role | null };

export interface UserResponse extends Omit<User, 'roleId'> {
  role: string;
  roleInfo?: Role | null;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private async ensureUserCanWrite(firebaseUid: string): Promise<UserWithRole> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Tu cuenta está en modo solo lectura durante la sanción.',
      );
    }

    return user as UserWithRole;
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

    let user = await this.userRepository.findByUid(firebaseUid);

    if (!user && email) {
      user = await this.userRepository.findByEmail(email);
      if (user) {
        await this.userRepository.updateByEmail(email, { firebaseUid });
      }
    }

    if (user && !forceUpdate) {
      user = await this.clearExpiredPenalties(user as UserWithRole);
      return this.formatUserResponse(user as UserWithRole);
    }

    if (!user && preventCreation) {
      throw new NotFoundException('No existe cuenta asociada a este correo.');
    }

    if (!email) {
      return null;
    }

    if (!isAuthorizedEmail(email)) {
      throw new ForbiddenException(
        'Acceso restringido a cuentas institucionales autorizadas.',
      );
    }

    const roleName = getRoleFromEmail(email);
    const roleDoc = await this.roleRepository.findByName(roleName);

    if (!roleDoc) {
      throw new NotFoundException(`Rol ${roleName} no encontrado.`);
    }

    const userData = {
      firebaseUid,
      email,
      displayName: createUserDto.displayName,
      avatarUrl: createUserDto.avatarUrl,
      roleId: roleDoc.id,
      facultyId: undefined as number | undefined,
    };

    const detectedFacultyId = extractFacultyFromEmail(email);
    if (detectedFacultyId !== null) {
      userData.facultyId = detectedFacultyId;
    }

    user = await this.userRepository.upsert(firebaseUid, userData, {
      displayName: createUserDto.displayName,
      avatarUrl: createUserDto.avatarUrl,
    });

    return this.formatUserResponse(user as UserWithRole);
  }

  private formatUserResponse(user: UserWithRole | null): UserResponse | null {
    if (!user) return null;

    const { roleId: _, ...userData } = user;
    return {
      ...userData,
      role: user.role?.name || 'student',
      roleInfo: user.role,
    };
  }

  private async clearExpiredPenalties(
    user: UserWithRole | null,
  ): Promise<UserWithRole | null> {
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
    user = await this.clearExpiredPenalties(user as UserWithRole);
    return this.formatUserResponse(user as UserWithRole);
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
      this.eventsGateway.server.emit('user:profile_updated', {
        userId: updatedUser.id,
        displayName,
        nickname: updatedUser.nickname,
      });
    }

    return this.formatUserResponse(updatedUser as UserWithRole);
  }

  async updateFaculty(
    firebaseUid: string,
    data: { facultyId?: number },
  ): Promise<UserResponse | null> {
    await this.ensureUserCanWrite(firebaseUid);

    const updatedUser = await this.userRepository.updateByUid(
      firebaseUid,
      data,
    );
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.formatUserResponse(updatedUser as UserWithRole);
  }
}
