import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
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
    const token = client.handshake.auth?.token;

    if (!token) {
      this.logger.warn(`Websocket Connection Refused: Missing auth token (ID: ${client.id})`);
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      // Attach the decoded token/user to the socket context if needed later
      client.data.user = decodedToken;
      return true;
    } catch (error) {
      this.logger.error(`Websocket Connection Refused: Invalid token (ID: ${client.id})`, error);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
