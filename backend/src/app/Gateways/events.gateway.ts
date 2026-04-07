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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  afterInit(server: Server) {
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        this.logger.warn(`Websocket auth failed: No token provided (Client: ${client.id})`);
        client.disconnect();
        return;
      }
      await admin.auth().verifyIdToken(token);
      this.logger.log(`Client authenticated and connected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Websocket connection rejected (Client: ${client.id})`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
