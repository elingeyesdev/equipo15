import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './entities/role.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Roles Seed...');
    await this.seedRoles();
  }

  private async seedRoles() {
    const rolesToSeed = [
      { name: 'student', description: 'Alumno / Innovador' },
      { name: 'judge', description: 'Juez / Experto Pista 8' },
      { name: 'admin', description: 'Administrador del Sistema' },
    ];

    for (const roleData of rolesToSeed) {
      const exists = await this.roleModel.findOne({ name: roleData.name });
      if (!exists) {
        await this.roleModel.create(roleData);
        this.logger.log(`Role created: ${roleData.name}`);
      }
    }
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name });
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find();
  }
}
