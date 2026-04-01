import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findOrCreate(createUserDto: CreateUserDto): Promise<User> {
    const { firebaseUid } = createUserDto;
    let user = await this.userModel.findOne({ firebaseUid });

    if (!user) {
      user = new this.userModel(createUserDto);
      await user.save();
    }
    return user;
  }

  async findByUid(firebaseUid: string): Promise<User> {
    const user = await this.userModel.findOne({ firebaseUid });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
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
}
