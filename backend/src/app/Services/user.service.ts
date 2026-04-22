import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../Repositories/user.repository';
import { RoleRepository } from '../Repositories/role.repository';
import { User, Role } from '@prisma/client';
import { extractFacultyFromEmail } from '../Utils/email-parser.util';
import { getRoleFromEmail, isAuthorizedEmail } from '../Utils/user-metadata.util';

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
  ) { }

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

  async findByUid(firebaseUid: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findByUid(firebaseUid);
    return this.formatUserResponse(user as UserWithRole);
  }

  async updateProfile(
    firebaseUid: string,
    data: { bio?: string; nickname?: string; phone?: string; studentCode?: string },
  ): Promise<UserResponse | null> {
    const updatedUser = await this.userRepository.updateByUid(firebaseUid, data);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.formatUserResponse(updatedUser as UserWithRole);
  }

  async updateFaculty(
    firebaseUid: string,
    data: { facultyId?: number },
  ): Promise<UserResponse | null> {
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
