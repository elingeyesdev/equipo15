import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CORS_ORIGINS } from '../../common/cors';

@WebSocketGateway({
  cors: {
    origin: CORS_ORIGINS,
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(EventsGateway.name);

  afterInit() {
    this.logger.log('EventsGateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth as { token?: string } | undefined;
      const token = auth?.token;

      if (!token) {
        this.logger.warn(
          `Websocket auth failed: No token provided (Client: ${client.id})`,
        );
        client.disconnect();
        return;
      }
      const decodedToken = await admin.auth().verifyIdToken(token);
      client.join(`user:${decodedToken.uid}`);
      this.logger.log(
        `Client authenticated and connected: ${client.id} to room user:${decodedToken.uid}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Websocket connection rejected (Client: ${client.id}): ${message}`,
      );
      client.disconnect();
    }
  }

  @SubscribeMessage('join_challenge')
  handleJoinChallenge(client: Socket, challengeId: string) {
    const room = `challenge:${challengeId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leave_challenge')
  handleLeaveChallenge(client: Socket, challengeId: string) {
    const room = `challenge:${challengeId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
