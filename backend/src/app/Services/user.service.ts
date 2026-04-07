import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { UserRepository } from '../Repositories/user.repository';
import { RoleRepository } from '../Repositories/role.repository';
import { User } from '@prisma/client';
import { extractFacultyFromEmail } from '../Utils/email-parser.util';
import { getRoleFromEmail } from '../Utils/user-metadata.util';

@Injectable()
export class UserService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async findOrCreate(createUserDto: any, forceUpdate = false): Promise<User | null> {
    const { firebaseUid, email } = createUserDto;

    let user = await this.userRepository.findByUid(firebaseUid);
    if (user && !forceUpdate) {
      return this.formatUserResponse(user);
    }

    if (!email) {
       return null;
    }

    const roleName = getRoleFromEmail(email);
    const roleDoc = await this.roleRepository.findByName(roleName);
    
    if (!roleDoc) {
      throw new NotFoundException(`Rol ${roleName} no encontrado.`);
    }

    const userData: any = {
      firebaseUid,
      email,
      displayName: createUserDto.displayName,
      avatarUrl: createUserDto.avatarUrl,
      roleId: roleDoc.id,
    };

    const detectedFacultyId = extractFacultyFromEmail(email);
    if (detectedFacultyId !== null) {
      userData.facultyId = detectedFacultyId;
    }

    user = await this.userRepository.upsert(firebaseUid, userData, {
        displayName: createUserDto.displayName,
        avatarUrl: createUserDto.avatarUrl,
    });
    
    return this.formatUserResponse(user);
  }

  private formatUserResponse(user: any): any {
    if (!user) return null;
    
    return {
      ...user,
      role: user.role?.name || 'student',
      roleInfo: user.role
    };
  }

  async findByUid(firebaseUid: string): Promise<any> {
    const user = await this.userRepository.findByUid(firebaseUid);
    return this.formatUserResponse(user);
  }

  async updateBio(firebaseUid: string, bio: string): Promise<any> {
    const updatedUser = await this.userRepository.updateByUid(firebaseUid, { bio });
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.formatUserResponse(updatedUser);
  }

  async updateFaculty(firebaseUid: string, data: { facultyId?: number }): Promise<any> {
    const updatedUser = await this.userRepository.updateByUid(firebaseUid, data);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.formatUserResponse(updatedUser);
  }
}
