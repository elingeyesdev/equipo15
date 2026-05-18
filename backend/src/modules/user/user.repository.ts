import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
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
    try {
      return await this.prisma.user.upsert({
        where: { firebaseUid },
        update: updateData,
        create: createData,
      });
    } catch (err: any) {
      // Handle unique constraint on email: try to find existing user by email
      // and attach the firebaseUid instead of failing the request.
      if (err?.code === 'P2002' && createData?.email) {
        const existing = await this.prisma.user.findUnique({
          where: { email: createData.email },
        });
        if (existing) {
          const merged = {
            ...(updateData || {}),
            firebaseUid,
          } as any;
          return this.prisma.user.update({ where: { id: existing.id }, data: merged });
        }
      }
      throw err;
    }
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

  async getAllFaculties() {
    return this.prisma.faculty.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
