import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../modules/user/user.repository';
import type { AuthenticatedRequest } from '../types/authenticated-request.interface';

const ROLE_MAP: Record<string, string> = {
  ADMIN: 'admin',
  COMPANY: 'company',
  JUDGE: 'judge',
  USER: 'student',
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository,
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

    const user = await this.userRepository.findByUid(firebaseUser.uid);
    const prismaRole = String(user?.role ?? '');
    const roleName = (ROLE_MAP[prismaRole] ?? prismaRole).toLowerCase();
    const allowedRoles = requiredRoles.map((role) => role.toLowerCase());

    if (!user || !roleName || !allowedRoles.includes(roleName)) {
      throw new ForbiddenException(
        'Acceso Restringido: No tienes permisos para esta sección.',
      );
    }

    return true;
  }
}
