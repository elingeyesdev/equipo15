import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { extractFacultyFromEmail } from './utils/email-parser.util';
import { getRoleFromEmail } from './utils/user-metadata.util';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly rolesService: RolesService
  ) {}

  async findOrCreate(createUserDto: CreateUserDto): Promise<User | null> {
    const { firebaseUid, email } = createUserDto;
    let user = await this.userModel.findOne({ firebaseUid }).populate('roleId');

    if (!user && email) {
      const roleName = getRoleFromEmail(email);
      const roleDoc = await this.rolesService.findByName(roleName);
      
      if (!roleDoc) {
        throw new NotFoundException(`Rol ${roleName} no encontrado en la DB. Asegúrate de correr la semilla.`);
      }

      const userData: any = {
        ...createUserDto,
        roleId: roleDoc._id
      };
      delete userData.role;

      const detectedFacultyId = extractFacultyFromEmail(email);
      if (detectedFacultyId !== null) {
        userData.facultyId = detectedFacultyId;
        userData.isFacultyVerified = true;
      }

      user = new this.userModel(userData);
      try {
        await user.save();
        await user.populate('roleId');
      } catch (error: any) {
        if (error.code === 11000) {
          user = await this.userModel.findOne({ firebaseUid }).populate('roleId');
        } else {
          throw error;
        }
      }
    }
    return user;
  }

  async findByUid(firebaseUid: string): Promise<User | null> {
    return await this.userModel.findOne({ firebaseUid }).populate('roleId');
  }

  async updateRole(id: string, roleName: string): Promise<User> {
    const roleDoc = await this.rolesService.findByName(roleName);
    if (!roleDoc) {
       throw new NotFoundException(`Rol ${roleName} no existe.`);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { roleId: roleDoc._id },
      { new: true }
    ).populate('roleId').exec();
    
    if (!updatedUser) {
      throw new NotFoundException();
    }
    
    return updatedUser;
  }

  async updateFaculty(firebaseUid: string, facultyId: number): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { facultyId: facultyId, isFacultyVerified: false },
      { new: true }
    ).populate('roleId').exec();
    
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    return updatedUser;
  }

  async updateBio(firebaseUid: string, bio: string): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { bio },
      { new: true }
    ).populate('roleId').exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return updatedUser;
  }
}
