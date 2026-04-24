import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Providers/database.service';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { role: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async create(data: any): Promise<User> {
    return this.prisma.user.create({
      data,
      include: { role: true },
    });
  }

  async update(id: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async updateByUid(firebaseUid: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { firebaseUid },
      data,
      include: { role: true },
    });
  }

  async updateByEmail(email: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { email },
      data,
      include: { role: true },
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
      include: { role: true },
    });
  }
  async updateStatus(id: string, status: any, penaltyExpiresAt: Date): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { status, penaltyExpiresAt },
    });
  }
}
