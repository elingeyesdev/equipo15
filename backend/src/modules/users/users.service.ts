import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { extractFacultyFromEmail } from './utils/email-parser.util';
import { getRoleFromEmail, DOMAIN_FACULTY_MAP } from './utils/user-metadata.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findOrCreate(createUserDto: CreateUserDto): Promise<User | null> {
    const { firebaseUid, email } = createUserDto;
    let user = await this.userModel.findOne({ firebaseUid });

    if (!user && email) {
      const role = getRoleFromEmail(email);
      createUserDto.role = role;

      const detectedFacultyId = extractFacultyFromEmail(email);
      if (detectedFacultyId !== null) {
        createUserDto.facultyId = detectedFacultyId;
        createUserDto.isFacultyVerified = true;
      }

      user = new this.userModel(createUserDto);
      await user.save();
    }
    return user;
  }

  async findByUid(firebaseUid: string): Promise<User | null> {
    return await this.userModel.findOne({ firebaseUid });
  }

  async updateRole(id: string, role: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).exec();
    
    if (!updatedUser) {
      throw new NotFoundException();
    }
    
    return updatedUser;
  }

  async updateFaculty(firebaseUid: string, facultyId: number): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { facultyId: facultyId, isFacultyVerified: false }, // Se marca como false porque es selección manual
      { new: true }
    ).exec();
    
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    return updatedUser;
  }
}
