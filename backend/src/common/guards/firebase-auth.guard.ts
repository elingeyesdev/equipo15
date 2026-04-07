import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN_TOKEN } from '../../config/firebase-admin.module';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';

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

    try {
      const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `[FirebaseAuthGuard] Error verificando token: ${message}`,
      );
      throw new UnauthorizedException('Token inválido');
    }
  }
}
