import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Providers/database.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async create(data: any): Promise<Role> {
    return this.prisma.role.create({
      data,
    });
  }
}
