import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@WebSocketGateway({
  cors: {
    origin: [
      /^http:\/\/localhost:\d+$/,
      'https://pista8-f8e6e.web.app',
      'https://pista8.com'
    ],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
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
      await admin.auth().verifyIdToken(token);
      this.logger.log(`Client authenticated and connected: ${client.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Websocket connection rejected (Client: ${client.id}): ${message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
