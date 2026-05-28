import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../modules/user/user.repository';
import { RedisService } from '../../infrastructure/redis/redis.module';
import type { AuthenticatedRequest } from '../types/authenticated-request.interface';

const ROLE_MAP: Record<string, string> = {
  ADMIN: 'admin',
  COMPANY: 'company',
  JUDGE: 'judge',
  USER: 'student',
};

const ROLE_CACHE_TTL_MS = 300_000;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const firebaseUser = request.user;

    const cacheKey = `role:${firebaseUser.uid}`;
    let prismaRole = await this.redisService.get(cacheKey);

    if (!prismaRole) {
      const user = await this.userRepository.findByUid(firebaseUser.uid);
      prismaRole = String(user?.role ?? '');
      await this.redisService.set(cacheKey, prismaRole, ROLE_CACHE_TTL_MS);
    }

    const roleName = (ROLE_MAP[prismaRole] ?? prismaRole).toLowerCase();
    const allowedRoles = requiredRoles.map((role) => role.toLowerCase());

    if (!roleName || !allowedRoles.includes(roleName)) {
      throw new ForbiddenException(
        'Acceso Restringido: No tienes permisos para esta sección.',
      );
    }

    return true;
  }
}
