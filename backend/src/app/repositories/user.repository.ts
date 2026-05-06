import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/database.service';
import { User } from '@prisma/client';

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
    return this.prisma.user.upsert({
      where: { firebaseUid },
      update: updateData,
      create: createData,
    });
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
}
