import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventBus {
  constructor(private readonly eventsGateway: EventsGateway) {}

  emit(event: string, payload: any): void {
    this.eventsGateway.server.emit(event, payload);
  }

  emitToRoom(room: string, event: string, payload: any): void {
    this.eventsGateway.server.to(room).emit(event, payload);
  }
}
