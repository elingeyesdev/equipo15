import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository, UserWithProfile } from './user.repository';
import { Prisma, User, UserStatus } from '@prisma/client';
import { extractFacultyFromEmail } from './utils/email-parser.util';
import { getRoleFromEmail } from './utils/user-metadata.util';
import { EventsGateway } from '../../infrastructure/events/events.gateway';
import { normalizeEmail } from '../../common/utils/email-domain.util';
import { RedisService } from '../../infrastructure/redis/redis.module';

export interface UserResponse extends Omit<User, 'role'> {
  role: string;
  roleName: string;
  facultyName?: string | null;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventsGateway: EventsGateway,
    private readonly redisService: RedisService,
  ) {}

  private handlePrismaError(err: any): never {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const target = err.meta?.target;
      const isPhone = Array.isArray(target)
        ? target.includes('phone')
        : typeof target === 'string'
        ? target.includes('phone')
        : false;

      if (isPhone || err.message?.includes('phone')) {
        throw new ConflictException(
          'El número de teléfono ya se encuentra registrado.',
        );
      }
    }
    throw err;
  }

  private async ensureUserCanWrite(
    firebaseUid: string,
  ): Promise<UserWithProfile> {
    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status !== UserStatus.ACTIVE) {
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
      phone?: string;
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
        try {
          await this.userRepository.updateByEmail(normalizedEmail, {
            firebaseUid,
          });
        } catch (err: any) {
          this.handlePrismaError(err);
        }
      }
    }

    if (user) {
      user = await this.syncUserStatus(user);

      if (forceUpdate) {
        const updateData: Record<string, any> = {
          displayName: createUserDto.displayName,
          avatarUrl: createUserDto.avatarUrl,
        };
        if (createUserDto.phone !== undefined) {
          updateData.phone = createUserDto.phone;
        }
        try {
          await this.userRepository.updateByUid(firebaseUid, updateData);
        } catch (err: any) {
          this.handlePrismaError(err);
        }
        const refreshed = await this.userRepository.findByUid(firebaseUid);
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

    if (!createUserDto.phone || createUserDto.phone.trim() === '') {
      throw new BadRequestException('El número de teléfono es obligatorio para el registro.');
    }

    const allowed = await this.userRepository.isEmailAllowed(normalizedEmail);
    if (!allowed) {
      throw new ForbiddenException(
        'Acceso restringido a cuentas institucionales autorizadas.',
      );
    }

    const role = getRoleFromEmail(normalizedEmail);

    const userData: Prisma.UserCreateInput | Prisma.UserUncheckedCreateInput = {
      firebaseUid,
      email: normalizedEmail,
      displayName: createUserDto.displayName || '',
      avatarUrl: createUserDto.avatarUrl,
      role,
      phone: createUserDto.phone || null,
    };

    try {
      await this.userRepository.upsert(firebaseUid, userData, {
        displayName: createUserDto.displayName,
        avatarUrl: createUserDto.avatarUrl,
      });
    } catch (err: any) {
      this.handlePrismaError(err);
    }
    user = await this.userRepository.findByUid(firebaseUid);

    const detectedFacultyId = extractFacultyFromEmail(normalizedEmail);
    if (detectedFacultyId !== null && user) {
      const mappedId = await this.mapLegacyFacultyId(detectedFacultyId);
      if (mappedId) {
        await this.userRepository.updateStudentProfile(user.id, {
          facultyId: mappedId,
        });
        user = await this.userRepository.findByUid(firebaseUid);
      }
    }
    if (user && user.role === 'USER') {
      const existingNotif = await (this.userRepository as any).prisma.notification.findFirst({
        where: { userId: user.id, type: 'ROLE_UPDATED', title: '¡Bienvenido a Pista 8!' },
      });

      if (!existingNotif) {
        await (this.userRepository as any).prisma.notification.create({
          data: {
            userId: user.id,
            type: 'ROLE_UPDATED',
            title: '¡Bienvenido a Pista 8!',
            body: 'Lo primero que debes hacer para poder ver retos y participar es ir al apartado de "Mi perfil" y completar tu información institucional.',
          },
        });
      }
    }

    return this.formatUserResponse(user);
  }

  private formatUserResponse(
    user: UserWithProfile | null,
  ): UserResponse | null {
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
      role: mappedRole,
      roleName: mappedRole,
      facultyName: user.studentProfile?.faculty?.name || null,
    };
  }

  private async syncUserStatus(
    user: User | null,
  ): Promise<UserWithProfile | null> {
    if (!user) return null;
    await this.userRepository.syncUserStatusFromPenalties(user.id);
    return this.userRepository.findByUid(user.firebaseUid);
  }

  async findByUid(firebaseUid: string): Promise<UserResponse | null> {
    let user = await this.userRepository.findByUid(firebaseUid);
    user = await this.syncUserStatus(user);
    return this.formatUserResponse(user);
  }

  async updateProfile(
    firebaseUid: string,
    data: {
      bio?: string;
      nickname?: string;
      phone?: string;
      studentCode?: string;
      enrollmentYear?: number;
      institucion_educativa?: string;
      ocupacion_laboral?: string;
      codigo_estudiantil?: string | null;
    },
  ): Promise<UserResponse | null> {
    await this.ensureUserCanWrite(firebaseUid);

    const existingUser = await this.userRepository.findByUid(firebaseUid);
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const ocupacion = data.ocupacion_laboral !== undefined 
      ? data.ocupacion_laboral 
      : (existingUser as any).ocupacion_laboral;

    if (ocupacion === 'Estudiante') {
      const codigo = data.codigo_estudiantil !== undefined
        ? data.codigo_estudiantil
        : (existingUser as any).codigo_estudiantil;
      if (!codigo || codigo.trim() === '') {
        throw new BadRequestException(
          'El código estudiantil es obligatorio cuando la ocupación es Estudiante.',
        );
      }
    } else if (ocupacion !== undefined && ocupacion !== null) {
      data.codigo_estudiantil = null;
    }

    const { studentCode, enrollmentYear, ...userData } = data;

    let updatedUser;
    try {
      updatedUser = await this.userRepository.updateByUid(
        firebaseUid,
        userData,
      );
    } catch (err: any) {
      this.handlePrismaError(err);
    }
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (studentCode !== undefined || enrollmentYear !== undefined) {
      await this.userRepository.updateStudentProfile(updatedUser.id, {
        ...(studentCode !== undefined ? { studentCode } : {}),
        ...(enrollmentYear !== undefined ? { enrollmentYear } : {}),
      });
    }

    if (data.nickname !== undefined) {
      const displayName =
        data.nickname && data.nickname.trim().length > 0
          ? data.nickname
          : updatedUser.displayName;
      this.eventsGateway.server
        .to(`user:${updatedUser.firebaseUid}`)
        .emit('user:profile_updated', {
          userId: updatedUser.id,
          displayName,
          nickname: updatedUser.nickname,
        });
    }

    const updatedUserWithProfile = await this.userRepository.findByUid(firebaseUid);
    
    await this.redisService.delByPrefix('public:').catch((err) => {
      console.warn('Failed to clear public cache:', err);
    });
    
    return this.formatUserResponse(updatedUserWithProfile!);
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

    const user = await this.userRepository.findByUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.userRepository.updateStudentProfile(user.id, {
      facultyId,
    });

    await this.redisService.delByPrefix('public:').catch((err) => {
      console.warn('Failed to clear public cache:', err);
    });

    const updatedUser = await this.userRepository.findByUid(firebaseUid);
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
