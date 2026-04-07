import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Socket } from 'socket.io';

@Injectable()
export class WsFirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsFirebaseAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const auth = client.handshake.auth as { token?: string } | undefined;
    const token = auth?.token;

    if (!token) {
      this.logger.warn(
        `Websocket Connection Refused: Missing auth token (ID: ${client.id})`,
      );
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      client.data.user = decodedToken;
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Websocket Connection Refused: Invalid token (ID: ${client.id}): ${message}`,
      );
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
