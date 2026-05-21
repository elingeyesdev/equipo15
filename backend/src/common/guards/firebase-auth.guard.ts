import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN_TOKEN } from '../../infrastructure/firebase/firebase-admin.module';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';
import { verifyImpersonationToken } from '../../modules/admin/impersonation-token.util';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    @Inject(FIREBASE_ADMIN_TOKEN) private readonly firebaseAdmin: admin.app.App,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

    try {
      const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(token);
      request.user = decodedToken;

      return true;
    } catch (firebaseError: any) {
      try {
        const impersonationToken = verifyImpersonationToken(token);
        request.user = impersonationToken as unknown as AuthenticatedRequest['user'];

        if (unsafeMethods.has((request.method || '').toUpperCase())) {
          throw new ForbiddenException(
            'La sesión en espejo está en modo solo lectura. Esta acción está bloqueada.',
          );
        }

        return true;
      } catch (impersonationError: any) {
        if (impersonationError instanceof ForbiddenException) {
          throw impersonationError;
        }

        const message =
          impersonationError instanceof Error
            ? impersonationError.message
            : firebaseError instanceof Error
              ? firebaseError.message
              : 'Error desconocido';
        this.logger.error(
          `[FirebaseAuthGuard] Error verificando token: ${message}`,
        );
        throw new UnauthorizedException('Token inválido');
      }
    }
  }
}
