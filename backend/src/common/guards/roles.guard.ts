import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../app/Services/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
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

    const user = await this.userService.findByUid(firebaseUser.uid);
    const roleName = user?.roleInfo?.name || user?.role;

    if (!user || !roleName || !requiredRoles.includes(roleName)) {
      throw new ForbiddenException(
        'Acceso Restringido: Solo las empresas vinculadas pueden lanzar y gestionar retos en Pista 8.'
      );
    }

    return true;
  }
}
