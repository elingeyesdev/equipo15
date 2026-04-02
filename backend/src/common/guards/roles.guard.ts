import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const firebaseUser = request.user;

    const user = await this.usersService.findByUid(firebaseUser.uid);
    const roleName = (user?.roleId as any)?.name;

    if (!user || !roleName || !requiredRoles.includes(roleName)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
