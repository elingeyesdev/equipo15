import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN_TOKEN } from '../../config/firebase-admin.module';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    @Inject(FIREBASE_ADMIN_TOKEN) private readonly firebaseAdmin: admin.app.App,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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
      this.logger.error(`[FirebaseAuthGuard] Error verificando token: ${error.message}`);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
