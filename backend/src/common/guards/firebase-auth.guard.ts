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

    // 1. Check for impersonation token first
    const impToken = request.headers['x-impersonation-token'] as string;
    if (impToken) {
      try {
        const impersonationToken = verifyImpersonationToken(impToken);
        request.user =
          impersonationToken as unknown as AuthenticatedRequest['user'];

        const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
        if (unsafeMethods.has((request.method || '').toUpperCase())) {
          throw new ForbiddenException(
            'La sesión en espejo está en modo solo lectura. Esta acción está bloqueada.',
          );
        }
        return true;
      } catch (error) {
        if (error instanceof ForbiddenException) throw error;
        throw new UnauthorizedException('Token de impersonación inválido');
      }
    }

    // 2. Standard Firebase Auth
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[FirebaseAuthGuard] Error verificando token: ${errorMessage}`,
      );
      throw new UnauthorizedException('Token inválido');
    }
  }
}
